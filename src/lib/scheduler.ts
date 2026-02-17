import { Topic, StudentMastery, UserProfile } from './types';

export interface TimeSlot {
    startTime: string;
    endTime: string;
    topicId: string;
    topicName: string;
    subject: string;
    isCompleted: boolean;
}

/**
 * Time Sync Formula: Ta = Tbase * (1.5 - (n * 0.2))
 * n = Tier (1-5)
 */
export const calculateAllocatedTime = (baseTime: number, tier: number): number => {
    return baseTime * (1.5 - (tier * 0.2));
};

export const generateDailyTimetable = (
    userProfile: UserProfile,
    topics: Topic[],
    mastery: StudentMastery[],
    startHour: number = 9 // Default start time 9 AM
): TimeSlot[] => {
    const dailyLimitMinutes = userProfile.dailyHourLimit * 60;

    // Filter for incomplete topics or topics that need review (Tier < 5)
    const availableTopicsRaw = topics.filter(t => {
        const m = mastery.find(m => m.topicId === t.id);
        return !m || !m.isCompleted || m.currentTier < 5;
    });

    if (availableTopicsRaw.length === 0) return [];

    // Improve distribution: Interleave subjects (P, C, M, P, C, M...)
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
        const tier = m ? m.currentTier : 1;
        totalWeight += calculateAllocatedTime(t.weightage, tier);
    });

    const timetable: TimeSlot[] = [];
    let currentMinutes = startHour * 60;

    availableTopics.forEach(t => {
        const m = mastery.find(m => m.topicId === t.id);
        const tier = m ? m.currentTier : 1;
        const allocatedWeight = calculateAllocatedTime(t.weightage, tier);

        // Distribute the daily limit based on relative weight
        const durationMinutes = Math.floor((allocatedWeight / totalWeight) * dailyLimitMinutes);

        if (durationMinutes < 15 || currentMinutes + durationMinutes > (startHour + userProfile.dailyHourLimit) * 60) {
            return; // Skip if too small or exceeds daily limit
        }

        const startH = Math.floor(currentMinutes / 60);
        const startM = currentMinutes % 60;
        const endMinutes = currentMinutes + durationMinutes;
        const endH = Math.floor(endMinutes / 60);
        const endM = endMinutes % 60;

        timetable.push({
            startTime: `${startH.toString().padStart(2, '0')}:${startM.toString().padStart(2, '0')}`,
            endTime: `${endH.toString().padStart(2, '0')}:${endM.toString().padStart(2, '0')}`,
            topicId: t.id,
            topicName: t.name,
            subject: t.subject,
            isCompleted: m?.isCompleted || false,
        });

        currentMinutes = endMinutes;
    });

    return timetable;
};
