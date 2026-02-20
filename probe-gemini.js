const models = [
    "gemini-2.0-flash",
    "gemini-2.0-flash-exp",
    "gemini-1.5-flash",
    "gemini-1.5-flash-8b",
    "gemini-1.5-pro",
    "gemini-1.0-pro",
    "gemini-pro"
];
const versions = ["v1", "v1beta"];
const API_KEY = "AIzaSyATJIkIOnjsYioaci6l06DphUZjUFGY0cQ";

async function probeGemini() {
    console.log("💎 Starting Exhaustive Gemini Model Probe...");
    for (const ver of versions) {
        console.log(`--- Testing ${ver} ---`);
        for (const m of models) {
            const url = `https://generativelanguage.googleapis.com/${ver}/models/${m}:generateContent?key=${API_KEY}`;
            try {
                const res = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ contents: [{ parts: [{ text: "hi" }] }] })
                });
                const data = await res.json();
                if (res.ok) {
                    console.log(`✅ ${m}: WORKS!`);
                    return; // Stop at first success
                } else {
                    const msg = data.error?.message || "";
                    if (msg.includes("not found")) {
                        console.log(`❌ ${m}: Not Found (404)`);
                    } else {
                        console.log(`❌ ${m}: ${res.status} - ${msg.substring(0, 50)}...`);
                    }
                }
            } catch (e) {
                console.log(`❌ ${m}: ERROR - ${e.message}`);
            }
        }
    }
}

probeGemini();
