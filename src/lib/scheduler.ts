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
    isBreak?: boolean;
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
    endHour: number = 17,
    breakMinutes: number = 0
): TimeSlot[] => {
    const endMinutesLimit = endHour * 60;

    // Include topics that:
    // 1. Have been assessed and are not completed
    // 2. Have NOT been assessed (to provide a starting point)
    const eligibleTopics = topics.filter(t => {
        const m = mastery.find(m => m.topicId === t.id);
        if (!m) return true; // Unassessed is eligible
        return !m.isCompleted || m.currentTier < 5;
    });

    if (eligibleTopics.length === 0) return [];

    // Prioritize assessed topics first, then high-weightage unassessed topics
    const assessed = eligibleTopics.filter(t => mastery.some(m => m.topicId === t.id));
    const unassessed = eligibleTopics.filter(t => !mastery.some(m => m.topicId === t.id))
        .sort((a, b) => b.weightage - a.weightage);

    // Take all assessed, and fill up to 10 total topics with unassessed
    const studyPool = [...assessed, ...unassessed.slice(0, Math.max(0, 10 - assessed.length))];

    // Sort: interleave subjects (P, C, M)
    const bySubject: Record<string, Topic[]> = { Physics: [], Chemistry: [], Math: [] };
    studyPool.forEach(t => {
        if (bySubject[t.subject]) bySubject[t.subject].push(t);
    });

    // Sort each subject: assessed (by tier) then unassessed (by weightage)
    Object.keys(bySubject).forEach(subj => {
        bySubject[subj].sort((a, b) => {
            const ma = mastery.find(m => m.topicId === a.id);
            const mb = mastery.find(m => m.topicId === b.id);

            if (ma && mb) return ma.currentTier - mb.currentTier;
            if (ma) return -1; // Assessed comes first
            if (mb) return 1;
            return b.weightage - a.weightage; // Both unassessed: higher weightage first
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

        const m = mastery.find(m => m.topicId === t.id);
        const tier = m?.currentTier ?? 1;

        // Fixed time per tier — adjusted by confidence score
        // Lower confidence within a tier → add up to 15 extra minutes
        const baseMins = TIER_MINUTES[tier] ?? 60;
        const confidenceBonus = Math.round((1 - ((m?.confidenceScore ?? 0) / 100)) * 15);
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
            confidenceScore: m?.confidenceScore ?? 0,
            isCompleted: m?.isCompleted ?? false,
        });

        currentMinutes = slotEnd;

        // Add break if requested and not the last topic
        if (breakMinutes > 0 && currentMinutes < endMinutesLimit) {
            const breakEnd = Math.min(currentMinutes + breakMinutes, endMinutesLimit);
            if (breakEnd > currentMinutes) {
                const bStartH = Math.floor(currentMinutes / 60);
                const bStartM = currentMinutes % 60;
                const bEndH = Math.floor(breakEnd / 60);
                const bEndM = breakEnd % 60;

                timetable.push({
                    startTime: `${bStartH.toString().padStart(2, '0')}:${bStartM.toString().padStart(2, '0')}`,
                    endTime: `${bEndH.toString().padStart(2, '0')}:${bEndM.toString().padStart(2, '0')}`,
                    topicId: 'break',
                    topicName: 'Break',
                    subject: 'Break',
                    tier: 0,
                    confidenceScore: 0,
                    isCompleted: false,
                    isBreak: true,
                });
                currentMinutes = breakEnd;
            }
        }
    }

    return timetable;
};

