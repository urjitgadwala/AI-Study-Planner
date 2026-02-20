const API_KEY = "AIzaSyATJIkIOnjsYioaci6l06DphUZjUFGY0cQ";
const model = "gemini-1.5-flash";
const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${API_KEY}`;

async function test() {
    console.log(`Testing Gemini with ${model} on v1beta...`);
    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: "hi" }] }] })
        });
        const data = await res.json();
        console.log(`Status: ${res.status}`);
        console.log(`Response: ${JSON.stringify(data).substring(0, 500)}`);
    } catch (e) {
        console.error(`Fetch Error: ${e.message}`);
    }
}

test();
