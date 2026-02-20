"use client";

import React, { useState, useEffect } from "react";
import SyllabusTracker from "@/components/SyllabusTracker";
import DailyRoadmap from "@/components/DailyRoadmap";
import MentalityAssessment from "@/components/MentalityAssessment";
import FocusTracker from "@/components/FocusTracker";
import TopicInput from "@/components/TopicInput";
import TestInterface from "@/components/TestInterface";
import SyllabusAnalysis from "@/components/SyllabusAnalysis";
import PdfImportModal from "@/components/PdfImportModal";
import TopicAssessment from "@/components/TopicAssessment";
import { db } from "@/lib/db";
import { generateDailyTimetable, TimeSlot } from "@/lib/scheduler";
import { Topic, StudentMastery, UserProfile, FocusLog } from "@/lib/types";
import { useSession } from "next-auth/react";
import confetti from 'canvas-confetti';
import { Info, Medal, Trophy } from "lucide-react";

export default function Dashboard() {
  const { data: session } = useSession();
  const userId = session?.user?.email || 'default_user';
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [mastery, setMastery] = useState<StudentMastery[]>([]);
  const [timetable, setTimetable] = useState<TimeSlot[]>([]);
  const [assessingTopic, setAssessingTopic] = useState<Topic | null>(null);
  const [focusTopic, setFocusTopic] = useState<{ topic: Topic, duration: number } | null>(null);
  const [focusLogs, setFocusLogs] = useState<FocusLog[]>([]);
  const [activeTest, setActiveTest] = useState<any>(null);

  useEffect(() => {
    const loadedProfile = db.getProfile(userId);
    const loadedTopics = db.getTopics(userId);
    const loadedMastery = db.getMastery(userId);
    const loadedFocusLogs = db.getFocusLogs(userId);

    setProfile(loadedProfile);
    setTopics(loadedTopics);
    setMastery(loadedMastery);
    setFocusLogs(loadedFocusLogs);

    if (loadedProfile) {
      const generated = generateDailyTimetable(loadedProfile, loadedTopics, loadedMastery);
      setTimetable(generated);
    }
  }, [userId]);

  const handleToggleComplete = (topicId: string) => {
    const topic = topics.find(t => t.id === topicId);
    if (!topic) return;

    const existingMastery = mastery.find(m => m.topicId === topicId);
    if (!existingMastery) {
      setAssessingTopic(topic);
    } else {
      const wasJustCompleted = !mastery.find(m => m.topicId === topicId)?.isCompleted;
      const newMastery = mastery.map(m =>
        m.topicId === topicId ? { ...m, isCompleted: !m.isCompleted, completedAt: !m.isCompleted ? new Date().toISOString() : undefined } : m
      );

      if (wasJustCompleted) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#4f46e5', '#10b981', '#f59e0b']
        });

        if (profile) {
          const updatedProfile = { ...profile, currentXP: profile.currentXP + 50 };
          setProfile(updatedProfile);
          db.saveProfile(updatedProfile, userId);
        }
      }

      setMastery(newMastery);
      db.saveMastery(newMastery, userId);
      if (profile) {
        setTimetable(generateDailyTimetable(profile, topics, newMastery));
      }
    }
  };

  const handleStartFocus = (topicId: string) => {
    const topic = topics.find(t => t.id === topicId);
    const slot = timetable.find(s => s.topicId === topicId);
    if (!topic || !slot) return;
    const [startH, startM] = slot.startTime.split(':').map(Number);
    const [endH, endM] = slot.endTime.split(':').map(Number);
    const duration = (endH * 60 + endM) - (startH * 60 + startM);
    setFocusTopic({ topic, duration });
  };

  const handleFocusComplete = (log: FocusLog) => {
    db.saveFocusLog(log, userId);
    setFocusLogs([...focusLogs, log]);
    setFocusTopic(null);
    if (profile) {
      const xpGain = Math.floor(log.actualMinutes * (log.focusScore / 100));
      const newProfile = { ...profile, currentXP: profile.currentXP + xpGain };
      setProfile(newProfile);
      db.saveProfile(newProfile, userId);
    }
  };

  const handleAssessmentComplete = (result: any) => {
    if (!assessingTopic) return;

    const newEntry: StudentMastery = {
      userId: profile?.id || 'user_1',
      topicId: assessingTopic.id,
      currentTier: result.tier,
      isCompleted: result.tier >= 4, // Auto-complete if they ace it
      confidenceScore: result.tier * 20,
      completedAt: result.tier >= 4 ? new Date().toISOString() : undefined
    };

    const newMastery = [...mastery.filter(m => m.topicId !== assessingTopic.id), newEntry];
    setMastery(newMastery);
    db.saveMastery(newMastery, userId);
    setAssessingTopic(null);

    if (profile) {
      setTimetable(generateDailyTimetable(profile, topics, newMastery));
    }

    confetti({
      particleCount: 150,
      spread: 100,
      origin: { y: 0.6 },
      colors: ['#4f46e5', '#10b981']
    });
  };

  if (!profile) return <div className="p-10 text-center">Loading Dashboard...</div>;

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Column */}
        <div className="lg:col-span-2 space-y-8">
          <SyllabusAnalysis
            topics={topics}
            mastery={mastery}
            onStartAssessment={(topic) => setAssessingTopic(topic)}
          />

          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">Your Daily Roadmap</h2>
            <DailyRoadmap
              slots={timetable}
              onToggleComplete={handleToggleComplete}
              onStartFocus={handleStartFocus}
            />
          </div>

          <div className="bg-card p-8 rounded-3xl border border-border shadow-sm">
            <h2 className="text-xl font-bold text-foreground mb-6">Focus Advice</h2>
            <div className="p-5 bg-primary/5 rounded-2xl border border-primary/10 flex gap-4">
              <div className="text-primary flex-shrink-0">
                <Info className="w-6 h-6" />
              </div>
              <p className="text-sm text-foreground/80 leading-relaxed">
                Based on your progress, <span className="font-bold text-primary">
                  {topics.find(t => !mastery.find(m => m.topicId === t.id && m.isCompleted))?.name || 'Inorganic Chemistry'}
                </span> is high priority today. Dedicate your first block to derivations and conceptual understanding.
              </p>
            </div>
          </div>
        </div>

        {/* Sidebar Column */}
        <div className="space-y-8">
          <div className="bg-card p-6 rounded-3xl border border-border shadow-sm">
            <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-6">ACHIEVEMENTS</h2>
            <div className="flex gap-4">
              <div className="bg-orange-100 dark:bg-orange-900/30 p-3 rounded-2xl">
                <Medal className="w-8 h-8 text-orange-500" />
              </div>
              <div className="bg-yellow-100 dark:bg-yellow-900/30 p-3 rounded-2xl">
                <Trophy className="w-8 h-8 text-yellow-500" />
              </div>
            </div>
          </div>

          <SyllabusTracker topics={topics} mastery={mastery} />
        </div>
      </div>

      {/* Modals & Overlays */}
      {
        assessingTopic && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-md z-[200] flex items-center justify-center p-6">
            <div className="w-full max-w-2xl">
              <TopicAssessment
                topicName={assessingTopic.name}
                onComplete={handleAssessmentComplete}
                onCancel={() => setAssessingTopic(null)}
              />
            </div>
          </div>
        )
      }

      {
        focusTopic && (
          <FocusTracker
            topic={focusTopic.topic}
            durationMinutes={focusTopic.duration}
            onComplete={handleFocusComplete}
            onCancel={() => setFocusTopic(null)}
          />
        )
      }

    </>
  );
}
