import topicsData from './topics.json';
import { Topic, StudentMastery, FocusLog, Assessment, UserProfile, ChatMessage } from './types';

// For the initial MVP, we will use individual localStorage keys or a unified JSON object.
// This mock DB handler provides an abstraction layer for later migration to Supabase/PostgreSQL.

const getScopedKey = (key: string, userId?: string) => {
    if (!userId) return key;
    return `${key}_${userId}`;
};

export const db = {
    getProfile: (userId?: string): UserProfile | null => {
        if (typeof window === 'undefined') return null;
        const key = getScopedKey('je_master_profile', userId);
        const data = localStorage.getItem(key);
        if (!data) {
            // Return a default profile if none exists
            const defaultProfile: UserProfile = {
                id: userId || 'user_1',
                name: 'JEE Master User',
                username: 'jee_master_2026',
                phoneNumber: '+91 98765 43210',
                email: userId || 'user@example.com',
                targetYear: 2026,
                targetRank: 1000,
                dailyHourLimit: 8,
                currentXP: 1250,
                streakCount: 5,
                lastLogin: new Date().toISOString(),
                badges: ['Early Bird', 'Consistency King'],
                activeStreak: true
            };
            localStorage.setItem(key, JSON.stringify(defaultProfile));
            return defaultProfile;
        }
        return JSON.parse(data);
    },

    saveProfile: (profile: UserProfile, userId?: string) => {
        const key = getScopedKey('je_master_profile', userId || profile.id);
        localStorage.setItem(key, JSON.stringify(profile));
    },

    getTopics: (userId?: string): Topic[] => {
        const seedTopics = topicsData as Topic[];
        if (typeof window === 'undefined') return seedTopics;

        // Filter out deleted seed topics
        const deletedKey = getScopedKey('je_master_deleted_seed_topics', userId);
        const deletedData = localStorage.getItem(deletedKey);
        const deletedIds: string[] = deletedData ? JSON.parse(deletedData) : [];
        const activeSeedTopics = seedTopics.filter(t => !deletedIds.includes(t.id));

        const key = getScopedKey('je_master_user_topics', userId);
        const userTopicsData = localStorage.getItem(key);
        const userTopics = userTopicsData ? JSON.parse(userTopicsData) : [];
        return [...activeSeedTopics, ...userTopics];
    },

    saveTopics: (topics: Topic[], userId?: string) => {
        const key = getScopedKey('je_master_user_topics', userId);
        localStorage.setItem(key, JSON.stringify(topics));
    },

    deleteTopic: (topicId: string, userId?: string) => {
        if (typeof window === 'undefined') return;

        // Handle user topics
        if (topicId.startsWith('u_')) {
            const key = getScopedKey('je_master_user_topics', userId);
            const userTopicsData = localStorage.getItem(key);
            if (userTopicsData) {
                const userTopics: Topic[] = JSON.parse(userTopicsData);
                const updated = userTopics.filter(t => t.id !== topicId);
                localStorage.setItem(key, JSON.stringify(updated));
            }
        } else {
            // Handle seed topics by storing them in a 'deleted' list
            const key = getScopedKey('je_master_deleted_seed_topics', userId);
            const data = localStorage.getItem(key);
            const deletedIds: string[] = data ? JSON.parse(data) : [];
            if (!deletedIds.includes(topicId)) {
                deletedIds.push(topicId);
                localStorage.setItem(key, JSON.stringify(deletedIds));
            }
        }
    },

    getMastery: (userId?: string): StudentMastery[] => {
        if (typeof window === 'undefined') return [];
        const key = getScopedKey('je_master_mastery', userId);
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : [];
    },

    saveMastery: (mastery: StudentMastery[], userId?: string) => {
        const key = getScopedKey('je_master_mastery', userId);
        localStorage.setItem(key, JSON.stringify(mastery));
    },

    getFocusLogs: (userId?: string): FocusLog[] => {
        if (typeof window === 'undefined') return [];
        const key = getScopedKey('je_master_focus_logs', userId);
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : [];
    },

    saveFocusLog: (log: FocusLog, userId?: string) => {
        const logs = db.getFocusLogs(userId);
        const newLogs = [...logs, log];
        const key = getScopedKey('je_master_focus_logs', userId);
        localStorage.setItem(key, JSON.stringify(newLogs));
    },

    getTestResults: (userId?: string): any[] => {
        if (typeof window === 'undefined') return [];
        const key = getScopedKey('je_master_test_results', userId);
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : [];
    },

    saveTestResult: (result: any, userId?: string) => {
        const results = db.getTestResults(userId);
        const newResults = [...results, result];
        const key = getScopedKey('je_master_test_results', userId);
        localStorage.setItem(key, JSON.stringify(newResults));
    },

    getChatHistory: (userId?: string): ChatMessage[] => {
        if (typeof window === 'undefined') return [];
        const key = getScopedKey('je_master_chat_history', userId);
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : [];
    },

    saveChatHistory: (messages: ChatMessage[], userId?: string) => {
        const key = getScopedKey('je_master_chat_history', userId);
        localStorage.setItem(key, JSON.stringify(messages));
    }
};
