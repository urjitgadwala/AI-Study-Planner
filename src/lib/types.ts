export interface Topic {
  id: string;
  name: string;
  subject: 'Physics' | 'Chemistry' | 'Math';
  weightage: number; // 1-10
  parentSubject: string;
}

export interface StudentMastery {
  userId: string;
  topicId: string;
  currentTier: number; // 1-5
  isCompleted: boolean;
  confidenceScore: number; // 0-100
  completedAt?: string;
}

export interface FocusLog {
  id: string;
  userId: string;
  sessionId: string;
  startTime: string;
  endTime?: string;
  actualMinutes: number;
  distractionCount: number;
  focusScore: number;
}

export interface Assessment {
  id: string;
  userId: string;
  testDate: string;
  topicsCovered: string[]; // topic IDs
  score: number;
  incorrectTopics: {
    topicId: string;
    mistakeCategory: 'Silly' | 'Conceptual' | 'Time Pressure' | 'Unknown';
  }[];
}


export interface UserProfile {
  id: string;
  name?: string;
  username?: string;
  phoneNumber?: string;
  email?: string;
  targetYear: number;
  targetRank?: number;
  dailyHourLimit: number;
  currentXP: number;
  streakCount: number;
  lastLogin: string;
  badges: string[];
  activeStreak: boolean;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}
