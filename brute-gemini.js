const API_KEY = "AIzaSyATJIkIOnjsYioaci6l06DphUZjUFGY0cQ";
async function testAll() {
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`);
    const d = await r.json();
    if (!d.models) { console.log("Error:", d); return; }

    const selectable = d.models
        .filter(m => m.supportedGenerationMethods.includes('generateContent'))
        .map(m => m.name);

    console.log(`Testing ${selectable.length} models...`);

    for (const modelPath of selectable) {
        try {
            const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/${modelPath}:generateContent?key=${API_KEY}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: [{ text: "hi" }] }] })
            });
            const data = await res.json();
            if (data.candidates) {
                console.log(`✅ SUCCESS: ${modelPath}`);
                return; // found it!
            } else {
                console.log(`❌ FAILED: ${modelPath} - ${data.error?.message || 'Unknown error'}`);
            }
        } catch (e) {
            console.log(`💥 CRASH: ${modelPath} - ${e.message}`);
        }
    }
}
testAll();
