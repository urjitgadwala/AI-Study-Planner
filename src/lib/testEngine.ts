import { Topic, StudentMastery } from './types';

export interface GeneratedTest {
    id: string;
    date: string;
    questions: {
        id: string;
        topicId: string;
        topicName: string;
        subject: string;
        difficulty: number;
    }[];
}

export function generateSundayTest(
    topics: Topic[],
    mastery: StudentMastery[]
): GeneratedTest {
    const completedMastery = mastery.filter(m => m.isCompleted);

    // Sort completed topics by date
    const sortedMastery = [...completedMastery].sort((a, b) => {
        const dateA = a.completedAt ? new Date(a.completedAt).getTime() : 0;
        const dateB = b.completedAt ? new Date(b.completedAt).getTime() : 0;
        return dateB - dateA;
    });

    // 80/20 Mixed Logic
    // Recent: Last 7 days or first 80%
    // Flashback: Older or remaining 20%

    const recentCount = Math.ceil(sortedMastery.length * 0.8);
    const recentMastery = sortedMastery.slice(0, recentCount);
    const flashbackMastery = sortedMastery.slice(recentCount);

    // Limit to 10 questions for now
    const MAX_QUESTIONS = 10;
    const recentLimit = Math.ceil(MAX_QUESTIONS * 0.8);
    const flashbackLimit = MAX_QUESTIONS - recentLimit;

    const selectedMastery = [
        ...recentMastery.slice(0, recentLimit),
        ...flashbackMastery.slice(0, flashbackLimit)
    ];

    const questions = selectedMastery.map(m => {
        const topic = topics.find(t => t.id === m.topicId);
        return {
            id: `q_${Math.random().toString(36).substr(2, 9)}`,
            topicId: m.topicId,
            topicName: topic?.name || 'Unknown Topic',
            subject: topic?.subject || 'Unknown',
            difficulty: m.currentTier
        };
    });

    return {
        id: `test_${new Date().getTime()}`,
        date: new Date().toISOString(),
        questions
    };
}
