const providers = [
    { name: "Hugging Face Hub", url: "https://api-inference.huggingface.co/v1/chat/completions" },
    { name: "Hugging Face Model", url: "https://api-inference.huggingface.co/models/gpt2" },
    { name: "Gemini V1", url: "https://generativelanguage.googleapis.com/v1/models?key=DUMMY" },
    { name: "Gemini V1beta", url: "https://generativelanguage.googleapis.com/v1beta/models?key=DUMMY" },
    { name: "OpenAI", url: "https://api.openai.com/v1/chat/completions" },
    { name: "Mistral", url: "https://api.mistral.ai/v1/chat/completions" },
    { name: "Groq", url: "https://api.groq.com/openai/v1/chat/completions" }
];

async function probe() {
    console.log("🌐 Starting Network Connectivity Probe...");
    for (const p of providers) {
        try {
            console.log(`📡 Probing ${p.name}...`);
            const res = await fetch(p.url, { method: 'HEAD' }).catch(e => ({ ok: false, status: e.message }));
            // HEAD might not be supported but it tests connectivity
            if (res.status === 404 || res.status === 401 || res.status === 405 || res.ok) {
                console.log(`✅ ${p.name}: REACHABLE (Status: ${res.status})`);
            } else {
                // Try a simple GET if HEAD failed
                const res2 = await fetch(p.url).catch(e => ({ ok: false, status: e.message }));
                if (res2.status === 404 || res2.status === 401 || res2.ok) {
                    console.log(`✅ ${p.name}: REACHABLE (Status: ${res2.status})`);
                } else {
                    console.log(`❌ ${p.name}: BLOCKED/REBALANCED (Status: ${res2.status})`);
                }
            }
        } catch (e) {
            console.log(`❌ ${p.name}: ERROR - ${e.message}`);
        }
    }
}

probe();
