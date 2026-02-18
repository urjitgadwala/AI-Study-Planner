import { Topic, StudentMastery, UserProfile } from './types';

export interface TimeSlot {
    startTime: string;
    endTime: string;
    topicId: string;
    topicName: string;
    subject: string;
    tier: number;        // Assessment tier (1-5)
    isCompleted: boolean;
}

/**
 * Time Sync Formula: Ta = Tbase * (1.5 - (n * 0.2))
 * n = Tier (1-5) — higher tier = more mastery = less time needed
 */
export const calculateAllocatedTime = (baseTime: number, tier: number): number => {
    return baseTime * (1.5 - (tier * 0.2));
};

export const generateDailyTimetable = (
    userProfile: UserProfile,
    topics: Topic[],
    mastery: StudentMastery[],
    startHour: number = 9,
    endHour: number = 17  // Default end time 5 PM
): TimeSlot[] => {
    const windowMinutes = Math.max((endHour - startHour) * 60, 60); // At least 1 hour window

    // Include ALL topics that are not fully mastered (tier < 5 or no mastery record)
    const availableTopicsRaw = topics.filter(t => {
        const m = mastery.find(m => m.topicId === t.id);
        // Include if: no mastery record, not completed, or tier < 5
        return !m || !m.isCompleted || m.currentTier < 5;
    });

    if (availableTopicsRaw.length === 0) return [];

    // Interleave subjects (P, C, M, P, C, M...) for balanced study
    const physics = availableTopicsRaw.filter(t => t.subject === 'Physics').sort((a, b) => b.weightage - a.weightage);
    const chemistry = availableTopicsRaw.filter(t => t.subject === 'Chemistry').sort((a, b) => b.weightage - a.weightage);
    const math = availableTopicsRaw.filter(t => t.subject === 'Math').sort((a, b) => b.weightage - a.weightage);

    const availableTopics: Topic[] = [];
    const maxLen = Math.max(physics.length, chemistry.length, math.length);
    for (let i = 0; i < maxLen; i++) {
        if (physics[i]) availableTopics.push(physics[i]);
        if (chemistry[i]) availableTopics.push(chemistry[i]);
        if (math[i]) availableTopics.push(math[i]);
    }

    // Calculate total weight for normalization
    let totalWeight = 0;
    availableTopics.forEach(t => {
        const m = mastery.find(m => m.topicId === t.id);
        const tier = m ? m.currentTier : 1; // Default tier 1 for unassessed topics
        totalWeight += calculateAllocatedTime(t.weightage, tier);
    });

    if (totalWeight === 0) return [];

    const timetable: TimeSlot[] = [];
    let currentMinutes = startHour * 60;
    const endMinutesLimit = endHour * 60;

    // Target Multiplier: High rank goals require more intense study
    const targetRank = userProfile.targetRank || 50000;
    const targetMultiplier = targetRank < 1000 ? 1.5 : targetRank < 5000 ? 1.2 : 1.0;

    availableTopics.forEach(t => {
        if (currentMinutes >= endMinutesLimit) return; // Stop if we've hit the end time

        const m = mastery.find(m => m.topicId === t.id);
        const tier = m ? m.currentTier : 1;
        const allocatedWeight = calculateAllocatedTime(t.weightage, tier);

        // Distribute the window based on relative weight
        const rawDuration = Math.floor((allocatedWeight / totalWeight) * windowMinutes * targetMultiplier);
        // Clamp: minimum 10 mins, maximum 90 mins per slot
        const durationMinutes = Math.min(Math.max(rawDuration, 10), 90);

        // Don't exceed end time
        const slotEnd = Math.min(currentMinutes + durationMinutes, endMinutesLimit);
        const actualDuration = slotEnd - currentMinutes;
        if (actualDuration < 10) return; // Skip if less than 10 mins remain

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
            isCompleted: m?.isCompleted || false,
        });

        currentMinutes = slotEnd;
    });

    return timetable;
};
