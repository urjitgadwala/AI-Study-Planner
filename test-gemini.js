const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

async function listModels() {
    const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!API_KEY) {
        console.error("No API key found in .env");
        return;
    }

    const genAI = new GoogleGenerativeAI(API_KEY);

    console.log("Probing available models and API versions...");

    const versions = ["v1", "v1beta"];
    for (const ver of versions) {
        console.log(`\n--- Testing API Version: ${ver} ---`);
        try {
            // Using the base fetch logic or internal SDK discovery if possible
            // Note: SDK doesn't have a direct listModels but we can try common ones
            const models = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro", "gemini-1.0-pro"];

            for (const m of models) {
                try {
                    const model = genAI.getGenerativeModel({ model: m }, { apiVersion: ver });
                    const result = await model.generateContent("hi");
                    console.log(`✅ [${ver}] ${m}: WORKS!`);
                } catch (e) {
                    console.log(`❌ [${ver}] ${m}: ${e.message.substring(0, 50)}...`);
                }
            }
        } catch (e) {
            console.log(`Failed version ${ver}: ${e.message}`);
        }
    }
}

listModels();
