import topicsData from './topics.json';
import { Topic, StudentMastery, FocusLog, Assessment, UserProfile, ChatMessage } from './types';
import * as actions from './actions';

// For the initial MVP, we will use individual localStorage keys or a unified JSON object.
// This mock DB handler provides an abstraction layer for later migration to Supabase/PostgreSQL.

// Client-side in-memory cache to prevent redundant fetches during navigation
let cache: {
    topics: Topic[] | null;
    mastery: StudentMastery[] | null;
    profile: UserProfile | null;
    focusLogs: FocusLog[] | null;
} = {
    topics: null,
    mastery: null,
    profile: null,
    focusLogs: null
};

export const db = {
    getProfile: async (userId?: string): Promise<UserProfile | null> => {
        if (!userId) return null;
        if (cache.profile && cache.profile.email === userId) return cache.profile;

        const profile = await actions.getProfile(userId);
        if (profile) {
            cache.profile = {
                ...profile,
                lastLogin: profile.lastLogin.toISOString()
            } as UserProfile;
            return cache.profile;
        }

        // Fallback or default profile logic
        const defaultProfile: UserProfile = {
            id: userId,
            name: 'JEE Master User',
            username: 'jee_master_2026',
            phoneNumber: '+91 98765 43210',
            email: userId,
            targetYear: 2026,
            targetRank: 1000,
            dailyHourLimit: 8,
            currentXP: 1250,
            streakCount: 5,
            lastLogin: new Date().toISOString(),
            badges: ['Early Bird', 'Consistency King'],
            activeStreak: true
        };
        cache.profile = defaultProfile;
        return defaultProfile;
    },

    saveProfile: async (profile: UserProfile, userId?: string) => {
        await actions.saveProfile(profile);
        cache.profile = null; // Invalidate
    },

    getTopics: async (userId?: string): Promise<Topic[]> => {
        if (cache.topics) return cache.topics;

        const dbTopics = await actions.getTopics(userId || '');
        if (dbTopics && dbTopics.length > 0) {
            cache.topics = dbTopics as Topic[];
            return cache.topics;
        }
        return topicsData as Topic[];
    },

    saveTopics: async (topics: Topic[], userId?: string) => {
        if (!userId) return;
        await actions.saveTopics(topics, userId);
        cache.topics = null; // Invalidate
    },

    deleteTopic: async (topicId: string, userId?: string) => {
        if (!userId) return;
        await actions.deleteTopic(topicId, userId);
        cache.topics = null; // Invalidate
    },

    getMastery: async (userId?: string): Promise<StudentMastery[]> => {
        if (!userId) return [];
        if (cache.mastery) return cache.mastery;

        const mastery = await actions.getMastery(userId);
        cache.mastery = mastery.map(m => ({
            ...m,
            completedAt: m.completedAt?.toISOString()
        })) as StudentMastery[];
        return cache.mastery;
    },

    saveMastery: async (mastery: StudentMastery[], userId?: string) => {
        if (!userId) return;
        await actions.saveMastery(mastery, userId);
        cache.mastery = null; // Invalidate
    },

    getFocusLogs: async (userId?: string): Promise<FocusLog[]> => {
        if (!userId) return [];
        if (cache.focusLogs) return cache.focusLogs;

        const logs = await actions.getFocusLogs(userId);
        cache.focusLogs = logs.map(l => ({
            ...l,
            startTime: l.startTime.toISOString(),
            endTime: l.endTime?.toISOString()
        })) as FocusLog[];
        return cache.focusLogs;
    },

    saveFocusLog: async (log: FocusLog, userId?: string) => {
        if (!userId) return;
        await actions.saveFocusLog(log, userId);
        cache.focusLogs = null; // Invalidate
    },

    getTestResults: async (userId?: string): Promise<any[]> => {
        return [];
    },

    saveTestResult: async (result: any, userId?: string) => {
    },

    getChatHistory: async (userId?: string): Promise<ChatMessage[]> => {
        if (!userId) return [];
        const history = await actions.getChatHistory(userId);
        return history.map(h => ({
            role: h.role as 'user' | 'model',
            text: h.text
        }));
    },

    saveChatHistory: async (messages: ChatMessage[], userId?: string) => {
        if (!userId) return;
        await actions.saveChatHistory(messages, userId);
    }
};
