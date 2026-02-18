/**
 * IDEA Engine integration for IDEA Master Chat
 */

export async function chatWithIdeaEngine(
    message: string,
    history: { role: 'user' | 'model'; text: string }[],
    context: string
): Promise<string> {
    const API_KEY = process.env.NEXT_PUBLIC_CHAT_KEY;

    if (!API_KEY || API_KEY === 'your_groq_api_key_here') {
        return "AI API Key is missing. Please add the required Key to your .env file to enable the chatbot!";
    }

    try {
        const messages = [
            { role: "system", content: context },
            ...history.map(m => ({
                role: m.role === 'model' ? 'assistant' : 'user',
                content: m.text
            })),
            { role: "user", content: message }
        ];

        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                messages: messages,
                temperature: 0.7,
                max_tokens: 2048
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || `AI Engine error: ${response.status}`);
        }

        const data = await response.json();
        return data.choices[0].message.content;
    } catch (error: any) {
        console.error("AI Chat Error:", error);
        return "I'm having trouble connecting to the IDEA Engine right now. Please check your API key and connection.";
    }
}
