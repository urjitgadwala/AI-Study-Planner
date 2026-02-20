const API_KEY = "AIzaSyATJIkIOnjsYioaci6l06DphUZjUFGY0cQ";
const models = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro", "gemini-1.0-pro"];
const versions = ["v1", "v1beta"];

async function test() {
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
                    console.log(`✅ ${m}: SUCCESS`);
                } else {
                    console.log(`❌ ${m}: ${res.status} - ${data.error?.message || JSON.stringify(data)}`);
                }
            } catch (e) {
                console.log(`❌ ${m}: FETCH ERROR - ${e.message}`);
            }
        }
    }
}

test();
