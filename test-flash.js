const API_KEY = "AIzaSyATJIkIOnjsYioaci6l06DphUZjUFGY0cQ";
async function test() {
    try {
        const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: "hi" }] }] })
        });
        const d = await r.json();
        if (d.candidates) {
            console.log("SUCCESS: gemini-2.0-flash works!");
        } else {
            console.log("FAILED:", JSON.stringify(d));
        }
    } catch (e) {
        console.log(e.message);
    }
}
test();
