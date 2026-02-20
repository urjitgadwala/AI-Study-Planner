const { GoogleGenerativeAI } = require("@google/generative-ai");
const API_KEY = "AIzaSyATJIkIOnjsYioaci6l06DphUZjUFGY0cQ";

async function main() {
    try {
        const genAI = new GoogleGenerativeAI(API_KEY);
        // The SDK doesn't have a direct listModels exposed on the GenAI class in this version easily
        // but we can use the rest endpoint to list them
        const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;
        const res = await fetch(url);
        const data = await res.json();

        if (data.models) {
            console.log("--- AVAILABLE MODELS ---");
            data.models.forEach(m => {
                console.log(`${m.name} - ${m.supportedGenerationMethods.join(',')}`);
            });
        } else {
            console.log("No models returned:", JSON.stringify(data));
        }
    } catch (e) {
        console.error("Error listing models:", e);
    }
}

main();
