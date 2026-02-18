import { Topic, StudentMastery, UserProfile } from './types';

export interface TimeSlot {
    startTime: string;
    endTime: string;
    topicId: string;
    topicName: string;
    subject: string;
    tier: number;           // Assessment tier (1-5)
    confidenceScore: number; // 0-100 from assessment
    isCompleted: boolean;
}

/**
 * Time allocation per tier (in minutes):
 * Tier 1 (Beginner)     → 90 min  (needs most work)
 * Tier 2 (Basic)        → 75 min
 * Tier 3 (Intermediate) → 60 min
 * Tier 4 (Advanced)     → 45 min
 * Tier 5 (Expert)       → 30 min  (just revision)
 */
export const TIER_MINUTES: Record<number, number> = {
    1: 90,
    2: 75,
    3: 60,
    4: 45,
    5: 30,
};

export const calculateAllocatedTime = (baseTime: number, tier: number): number => {
    return baseTime * (1.5 - (tier * 0.2));
};

export const generateDailyTimetable = (
    userProfile: UserProfile,
    topics: Topic[],
    mastery: StudentMastery[],
    startHour: number = 9,
    endHour: number = 17
): TimeSlot[] => {
    const endMinutesLimit = endHour * 60;

    // ONLY include topics that have been assessed (have a mastery record)
    // and are not yet fully mastered (tier < 5 or not completed)
    const assessedTopics = topics.filter(t => {
        const m = mastery.find(m => m.topicId === t.id);
        return m !== undefined && (!m.isCompleted || m.currentTier < 5);
    });

    if (assessedTopics.length === 0) return [];

    // Sort: interleave subjects (P, C, M) and within each subject sort by tier ascending
    // (weakest topics first so they get scheduled when energy is highest)
    const bySubject: Record<string, Topic[]> = { Physics: [], Chemistry: [], Math: [] };
    assessedTopics.forEach(t => {
        if (bySubject[t.subject]) bySubject[t.subject].push(t);
    });

    // Sort each subject by tier ascending (lower tier = needs more work = schedule first)
    Object.keys(bySubject).forEach(subj => {
        bySubject[subj].sort((a, b) => {
            const ma = mastery.find(m => m.topicId === a.id)!;
            const mb = mastery.find(m => m.topicId === b.id)!;
            return ma.currentTier - mb.currentTier;
        });
    });

    // Interleave subjects
    const orderedTopics: Topic[] = [];
    const maxLen = Math.max(...Object.values(bySubject).map(a => a.length));
    for (let i = 0; i < maxLen; i++) {
        if (bySubject.Physics[i]) orderedTopics.push(bySubject.Physics[i]);
        if (bySubject.Chemistry[i]) orderedTopics.push(bySubject.Chemistry[i]);
        if (bySubject.Math[i]) orderedTopics.push(bySubject.Math[i]);
    }

    const timetable: TimeSlot[] = [];
    let currentMinutes = startHour * 60;

    for (const t of orderedTopics) {
        if (currentMinutes >= endMinutesLimit) break;

        const m = mastery.find(m => m.topicId === t.id)!;
        const tier = m.currentTier;

        // Fixed time per tier — adjusted by confidence score
        // Lower confidence within a tier → add up to 15 extra minutes
        const baseMins = TIER_MINUTES[tier] ?? 60;
        const confidenceBonus = Math.round((1 - (m.confidenceScore / 100)) * 15);
        const durationMinutes = Math.min(baseMins + confidenceBonus, 90);

        const slotEnd = Math.min(currentMinutes + durationMinutes, endMinutesLimit);
        const actualDuration = slotEnd - currentMinutes;
        if (actualDuration < 15) break; // Not enough time left

        const startH = Math.floor(currentMinutes / 60);
        const startM = currentMinutes % 60;
        const endH = Math.floor(slotEnd / 60);
        const endM = slotEnd % 60;

        timetable.push({
            startTime: `${startH.toString().padStart(2, '0')}:${startM.toString().padStart(2, '0')}`,
            endTime: `${endH.toString().padStart(2, '0')}:${endM.toString().padStart(2, '0')}`,
            topicId: t.id,
            topicName: t.name,
            subject: t.subject,
            tier,
            confidenceScore: m.confidenceScore,
            isCompleted: m.isCompleted,
        });

        currentMinutes = slotEnd;
    }

    return timetable;
};

