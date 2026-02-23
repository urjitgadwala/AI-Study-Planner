'use server';

import prisma from './prisma';
import { UserProfile, Topic, StudentMastery, FocusLog, ChatMessage } from './types';

export async function getProfile(userId: string) {
    return await prisma.user.findUnique({
        where: { email: userId }
    });
}

export async function saveProfile(profile: UserProfile) {
    return await prisma.user.upsert({
        where: { email: profile.email || profile.id },
        update: {
            name: profile.name,
            username: profile.username,
            phoneNumber: profile.phoneNumber,
            targetYear: profile.targetYear,
            targetRank: profile.targetRank,
            dailyHourLimit: profile.dailyHourLimit,
            currentXP: profile.currentXP,
            streakCount: profile.streakCount,
            badges: profile.badges,
            activeStreak: profile.activeStreak,
            lastLogin: new Date(profile.lastLogin)
        },
        create: {
            id: profile.id,
            email: profile.email || profile.id,
            name: profile.name,
            username: profile.username,
            phoneNumber: profile.phoneNumber,
            targetYear: profile.targetYear,
            targetRank: profile.targetRank,
            dailyHourLimit: profile.dailyHourLimit,
            currentXP: profile.currentXP,
            streakCount: profile.streakCount,
            badges: profile.badges,
            activeStreak: profile.activeStreak,
            lastLogin: new Date(profile.lastLogin)
        }
    });
}

export async function getTopics(userId: string) {
    return await prisma.topic.findMany();
}

export async function saveTopics(topics: Topic[], userId: string) {
    const user = await prisma.user.findUnique({ where: { email: userId } });
    if (!user) return;

    return await prisma.$transaction(
        topics.map((t) =>
            prisma.topic.upsert({
                where: { id: t.id },
                update: {
                    name: t.name,
                    subject: t.subject,
                    weightage: t.weightage,
                    parentSubject: t.parentSubject
                },
                create: {
                    id: t.id,
                    name: t.name,
                    subject: t.subject,
                    weightage: t.weightage,
                    parentSubject: t.parentSubject
                }
            })
        )
    );
}

export async function deleteTopic(topicId: string, userId: string) {
    return await prisma.topic.delete({
        where: { id: topicId }
    });
}

export async function getMastery(userId: string) {
    return await prisma.studentMastery.findMany({
        where: { user: { email: userId } }
    });
}

export async function saveMastery(mastery: StudentMastery[], userId: string) {
    const user = await prisma.user.findUnique({ where: { email: userId } });
    if (!user) return;

    // Use a transaction to update all mastery records
    return await prisma.$transaction(
        mastery.map((m) =>
            prisma.studentMastery.upsert({
                where: { userId_topicId: { userId: user.id, topicId: m.topicId } },
                update: {
                    currentTier: m.currentTier,
                    isCompleted: m.isCompleted,
                    confidenceScore: m.confidenceScore,
                    completedAt: m.completedAt ? new Date(m.completedAt) : null
                },
                create: {
                    userId: user.id,
                    topicId: m.topicId,
                    currentTier: m.currentTier,
                    isCompleted: m.isCompleted,
                    confidenceScore: m.confidenceScore,
                    completedAt: m.completedAt ? new Date(m.completedAt) : null
                }
            })
        )
    );
}

export async function getFocusLogs(userId: string) {
    return await prisma.focusLog.findMany({
        where: { user: { email: userId } },
        orderBy: { startTime: 'desc' }
    });
}

export async function saveFocusLog(log: FocusLog, userId: string) {
    const user = await prisma.user.findUnique({ where: { email: userId } });
    if (!user) return;

    return await prisma.focusLog.create({
        data: {
            userId: user.id,
            sessionId: log.sessionId,
            startTime: new Date(log.startTime),
            endTime: log.endTime ? new Date(log.endTime) : null,
            actualMinutes: log.actualMinutes,
            distractionCount: log.distractionCount,
            focusScore: log.focusScore
        }
    });
}

export async function getChatHistory(userId: string) {
    return await prisma.chatMessage.findMany({
        where: { user: { email: userId } },
        orderBy: { createdAt: 'asc' }
    });
}

export async function saveChatHistory(messages: ChatMessage[], userId: string) {
    const user = await prisma.user.findUnique({ where: { email: userId } });
    if (!user) return;

    // For chat history, we might want to only save the new messages
    // But for now, let's keep it simple
    return await prisma.chatMessage.createMany({
        data: messages.map(m => ({
            userId: user.id,
            role: m.role,
            text: m.text
        }))
    });
}
