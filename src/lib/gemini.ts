/**
 * Analytical Engine integration for JEE Master
 */
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Topic } from './types';
import topicsData from './topics.json';

export interface AnalysisResult {
    summary: string;
    advice: string;
    categories: Record<string, 'Silly' | 'Conceptual' | 'Time Pressure'>;
}

export interface DiagnosticQuestion {
    id: string;
    text: string;
    type: 'choice' | 'text';
    options?: string[];
    correctAnswer?: string;
}

export interface AssessmentResult {
    tier: number;
    feedback: string;
    strengths: string[];
    weaknesses: string[];
}

const API_KEY = process.env.NEXT_PUBLIC_ANALYTICS_KEY || "";
const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;

/**
 * Robust runner for AI calls with multi-model retries
 */
async function runWithRetry<T>(
    fn: (model: any) => Promise<T>,
    fallback: T,
    context: string
): Promise<T> {
    if (!genAI) {
        console.warn(`AI API Key missing for ${context}. Falling back to mock data.`);
        return fallback;
    }

    // Comprehensive list of models to try, ordered by likelihood of support in 2026
    const modelsToTry = [
        "gemini-2.5-flash",
        "gemini-2.0-flash",
        "gemini-1.5-flash",
        "gemini-1.5-flash-latest",
        "gemini-1.5-flash-8b",
        "gemini-pro",
        "gemini-1.5-pro"
    ];

    let lastError = null;

    for (const modelId of modelsToTry) {
        // Try v1beta first as it's often more permissive for experimental/flash models
        const apiVersions = ["v1beta", "v1"];

        for (const apiVer of apiVersions) {
            try {
                const model = genAI.getGenerativeModel({ model: modelId }, { apiVersion: apiVer });
                const result = await fn(model);
                console.info(`✅ Success using ${modelId} (${apiVer}) for ${context}`);
                return result;
            } catch (err) {
                lastError = err;
                // Only log if it's not a 404 (discovery is expected to hit 404s)
                const errorText = err instanceof Error ? err.message : String(err);
                if (!errorText.includes("404")) {
                    console.warn(`⚠️ ${context} error with ${modelId} (${apiVer}): ${errorText.substring(0, 100)}...`);
                }
                continue;
            }
        }
    }

    console.warn(`🔥 ${context} all AI paths failed. Using safety fallback.`, lastError);
    return fallback;
}

export async function analyzeTestPerformance(
    testData: any,
    answers: Record<string, string>
): Promise<AnalysisResult> {
    const mockSilly = Object.values(answers).filter(v => v === 'Silly').length;
    const mockConceptual = Object.values(answers).filter(v => v === 'Conceptual').length;

    const fallback: AnalysisResult = {
        summary: `(MOCK) You had ${mockSilly} silly errors and ${mockConceptual} conceptual gaps.`,
        advice: "The AI is currently setting up. Review your mistakes to identify conceptual gaps!",
        categories: answers as any
    };

    return runWithRetry(async (model) => {
        const prompt = `
            Analyze this JEE preparation test result and provide study advice.
            Test Data: ${JSON.stringify(testData)}
            User's Self-Reported Mistake Categories: ${JSON.stringify(answers)}
            
            Return a JSON object with:
            {
                "summary": "Short 1-sentence summary of performance",
                "advice": "3-4 sentences of actionable study advice",
                "categories": { "questionId": "Category" }
            }
        `;

        const result = await model.generateContent(prompt);
        const text = (await result.response).text();
        const cleanText = text.replace(/```json|```/g, "").trim();
        return JSON.parse(cleanText);
    }, fallback, "Analyze Performance");
}

export async function parseSyllabusFromText(text: string): Promise<Topic[]> {
    return runWithRetry(async (model) => {
        const prompt = `
            Extract a list of specific syllabus topics from the following text.
            Categorize each topic into "Physics", "Chemistry", or "Math".
            
            Return ONLY a valid JSON array of objects with this structure:
            [
                { "id": "u_uniqueid", "name": "Topic Name", "subject": "Physics|Chemistry|Math", "weightage": 5, "parentSubject": "Physics|Chemistry|Math" }
            ]
            
            Text to parse:
            ${text.substring(0, 5000)}
        `;

        const result = await model.generateContent(prompt);
        const responseText = (await result.response).text();
        const cleanText = responseText.replace(/```json|```/g, "").trim();
        const parsed = JSON.parse(cleanText);

        return parsed.map((t: any) => ({
            ...t,
            id: `u_${Math.random().toString(36).substr(2, 9)}`
        }));
    }, [], "Parse Syllabus");
}

import physicsQuestions from './physicsQuestions.json';
import chemistryQuestions from './chemistryQuestions.json';
import mathQuestions from './mathQuestions.json';

export async function generateDiagnosticQuestions(topicName: string): Promise<DiagnosticQuestion[]> {
    // Find the subject for this topic
    const topics = topicsData as Topic[];
    const topic = topics.find(t => t.name.toLowerCase() === topicName.toLowerCase());
    const subject = topic?.subject || 'Physics'; // Default to Physics if not found

    let subjectFallbacks: DiagnosticQuestion[] = [];
    if (subject === 'Physics') subjectFallbacks = physicsQuestions as DiagnosticQuestion[];
    else if (subject === 'Chemistry') subjectFallbacks = chemistryQuestions as DiagnosticQuestion[];
    else if (subject === 'Math') subjectFallbacks = mathQuestions as DiagnosticQuestion[];

    // Select 5 random questions from the subject fallbacks
    const shuffled = [...subjectFallbacks].sort(() => 0.5 - Math.random());
    const fallback = shuffled.slice(0, 5);

    // If no specific fallbacks found, use the generic ones
    const genericFallback: DiagnosticQuestion[] = [
        { id: 'f1', text: `Briefly explain the physical significance of ${topicName}.`, type: 'text' },
        { id: 'f2', text: `Which sub-concept of ${topicName} do you find most challenging?`, type: 'choice', options: ['Theoretical Foundations', 'Numerical Application', 'Interdisciplinary Links', 'Formula Derivation'] },
        { id: 'f3', text: `On a scale of 1-4, how confident are you with JEE Advanced level problems in ${topicName}?`, type: 'choice', options: ['1 - Basics only', '2 - Average', '3 - Above average', '4 - Expert'] },
        { id: 'f4', text: `Provide a quick summary of your current progress in ${topicName}.`, type: 'text' }
    ];

    const finalFallback = fallback.length > 0 ? fallback : genericFallback;

    return runWithRetry(async (model) => {
        const prompt = `
            Generate 5 diagnostic questions for a JEE aspirant to assess their mastery of the topic: "${topicName}" (${subject}).
            Return ONLY a JSON array:
            [
                { "id": "q1", "text": "Question?", "type": "choice", "options": ["A", "B", "C", "D"], "correctAnswer": "A" },
                { "id": "q2", "text": "Question?", "type": "text" }
            ]
        `;

        const result = await model.generateContent(prompt);
        const text = (await result.response).text();
        const cleanText = text.replace(/```json|```/g, "").trim();
        return JSON.parse(cleanText);
    }, finalFallback, "Generate Questions");
}

export async function evaluateDiagnosticPerformance(
    topicName: string,
    answers: Record<string, string>
): Promise<AssessmentResult> {
    const fallback: AssessmentResult = {
        tier: 2,
        feedback: "We recommend starting with Tier 2 study materials to solidify your foundations.",
        strengths: ["Diagnostic Completed"],
        weaknesses: ["AI Evaluation Offline"]
    };

    return runWithRetry(async (model) => {
        const prompt = `
            Evaluate these student answers for the topic: "${topicName}".
            Student Answers: ${JSON.stringify(answers)}
            
            Return ONLY a JSON object:
            {
                "tier": 3,
                "feedback": "Overall assessment",
                "strengths": ["list"],
                "weaknesses": ["list"]
            }
        `;

        const result = await model.generateContent(prompt);
        const text = (await result.response).text();
        const cleanText = text.replace(/```json|```/g, "").trim();
        return JSON.parse(cleanText);
    }, fallback, "Evaluate Performance");
}

