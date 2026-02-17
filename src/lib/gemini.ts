/**
 * Gemini API integration for JEE Master
 */
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Topic } from './types';

export interface AnalysisResult {
    summary: string;
    advice: string;
    categories: Record<string, 'Silly' | 'Conceptual' | 'Time Pressure'>;
}

const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;

export async function analyzeTestPerformance(
    testData: any,
    answers: Record<string, string>
): Promise<AnalysisResult> {
    if (!genAI) {
        console.warn("Gemini API Key missing. Falling back to mock analysis.");
        // Simulating API Latency
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Mock analysis logic based on self-reported categories
        const mockSilly = Object.values(answers).filter(v => v === 'Silly').length;
        const mockConceptual = Object.values(answers).filter(v => v === 'Conceptual').length;

        return {
            summary: `(MOCK) You had ${mockSilly} silly errors and ${mockConceptual} conceptual gaps.`,
            advice: "Please add your NEXT_PUBLIC_GEMINI_API_KEY to .env to see real AI-powered insights!",
            categories: answers as any
        };
    }

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

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
        const response = await result.response;
        const text = response.text();

        // Clean up JSON if LLM returned markdown
        const cleanText = text.replace(/```json|```/g, "").trim();
        return JSON.parse(cleanText);
    } catch (error) {
        console.error("Gemini Analysis Error:", error);
        return {
            summary: "Error connecting to Gemini API.",
            advice: "Check your API key and network connection.",
            categories: answers as any
        };
    }
}

export async function parseSyllabusFromText(text: string): Promise<Topic[]> {
    if (!genAI) {
        console.warn("Gemini API Key missing. Mocking syllabus extraction.");
        return [
            { id: `u_${Math.random().toString(36).substr(2, 9)}`, name: "Mock Physics Topic", subject: "Physics", weightage: 5, parentSubject: "Physics" },
            { id: `u_${Math.random().toString(36).substr(2, 9)}`, name: "Mock Chemistry Topic", subject: "Chemistry", weightage: 5, parentSubject: "Chemistry" }
        ];
    }

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const prompt = `
            Extract a list of specific syllabus topics from the following text.
            Categorize each topic into "Physics", "Chemistry", or "Math".
            Ignore introductory text, headers, and copyright info. Focus only on the actual academic topics.
            
            Return ONLY a valid JSON array of objects with this structure:
            [
                { "id": "u_uniqueid", "name": "Topic Name", "subject": "Physics|Chemistry|Math", "weightage": 5, "parentSubject": "Physics|Chemistry|Math" }
            ]
            
            Text to parse:
            ${text.substring(0, 10000)} // Limit text length for prompt limits
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const responseText = response.text();

        const cleanText = responseText.replace(/```json|```/g, "").trim();
        const parsed = JSON.parse(cleanText);

        // Ensure unique IDs
        return parsed.map((t: any) => ({
            ...t,
            id: `u_${Math.random().toString(36).substr(2, 9)}`
        }));
    } catch (error) {
        console.error("Syllabus Parsing Error:", error);
        return [];
    }
}
