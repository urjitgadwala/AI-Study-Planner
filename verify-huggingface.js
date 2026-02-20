const fs = require('fs');
const path = require('path');

async function verifyHuggingFace() {
    console.log("🔍 Starting Hugging Face Verification (New Network)...");

    const envPath = path.resolve(process.cwd(), '.env');
    let token = "";

    try {
        const envContent = fs.readFileSync(envPath, 'utf8');
        const match = envContent.match(/NEXT_PUBLIC_HUGGINGFACE_TOKEN=(.*)/);
        if (match && match[1]) {
            token = match[1].trim();
        }
    } catch (e) {
        console.error("❌ Could not read .env file:", e.message);
        return;
    }

    if (!token || token === 'your_huggingface_token_here') {
        console.error("❌ NEXT_PUBLIC_HUGGINGFACE_TOKEN is still the placeholder or empty in .env");
        return;
    }

    console.log(`📡 Sending test request to Hugging Face Hub (Token: ${token.substring(0, 8)}...)`);

    try {
        const response = await fetch(
            "https://api-inference.huggingface.co/v1/chat/completions",
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                method: "POST",
                body: JSON.stringify({
                    model: "mistralai/Mistral-7B-Instruct-v0.2",
                    messages: [
                        { role: "user", content: "hi" }
                    ],
                    max_tokens: 10
                }),
            }
        );

        const data = await response.json();

        if (response.ok) {
            console.log("✅ SUCCESS! Hugging Face is working perfectly on this network.");
            console.log("Response:", data.choices?.[0]?.message?.content);
        } else {
            console.error(`❌ API ERROR (${response.status}):`, data.error || JSON.stringify(data));
        }
    } catch (error) {
        console.error("❌ FETCH ERROR:", error.message);
    }
}

verifyHuggingFace();
