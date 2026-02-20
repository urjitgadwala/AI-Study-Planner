/**
 * Hugging Face API integration for IDEA Master Chat
 */

export async function chatWithHuggingFace(
    message: string,
    history: { role: 'user' | 'model'; text: string }[],
    context: string
): Promise<string> {
    const TOKEN = process.env.NEXT_PUBLIC_HUGGINGFACE_TOKEN;

    if (!TOKEN || TOKEN === 'your_huggingface_token_here') {
        return "Hugging Face Token is missing. Please add NEXT_PUBLIC_HUGGINGFACE_TOKEN to your .env file to enable the chatbot!";
    }

    try {
        // Format the prompt for Llama-3 style chat
        let prompt = `<|begin_of_text|><|start_header_id|>system<|end_header_id|>\n\n${context}<|eot_id|>`;

        for (const msg of history) {
            const role = msg.role === 'model' ? 'assistant' : 'user';
            prompt += `\n<|start_header_id|>${role}<|end_header_id|>\n\n${msg.text}<|eot_id|>`;
        }

        prompt += `\n<|start_header_id|>user<|end_header_id|>\n\n${message}<|eot_id|>\n<|start_header_id|>assistant<|end_header_id|>\n\n`;

        const response = await fetch(
            "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2",
            {
                headers: {
                    Authorization: `Bearer ${TOKEN}`,
                    "Content-Type": "application/json",
                },
                method: "POST",
                body: JSON.stringify({
                    inputs: prompt,
                    parameters: {
                        max_new_tokens: 1024,
                        temperature: 0.7,
                        return_full_text: false,
                    }
                }),
            }
        );

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `Hugging Face error: ${response.status}`);
        }

        const result = await response.json();
        // Hugging Face returns an array or a single object depending on the model/endpoint
        const text = Array.isArray(result) ? result[0].generated_text : result.generated_text;

        if (!text) throw new Error("Empty response from Hugging Face");

        return text.trim();
    } catch (error: any) {
        console.error("Hugging Face Chat Error:", error);
        return "I'm having trouble connecting to the Hugging Face hub right now. Please check your token and connection.";
    }
}
