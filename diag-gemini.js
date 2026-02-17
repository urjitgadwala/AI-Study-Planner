const API_KEY = "AIzaSyATJIkIOnjsYioaci6l06DphUZjUFGY0cQ";
async function list() {
    const r = await fetch(`https://generativelanguage.googleapis.com/v1/models?key=${API_KEY}`);
    const d = await r.json();
    if (d.models) {
        console.log(d.models.map(m => m.name.replace('models/', '')).join('\n'));
    } else {
        console.log("Error v1:", d);
    }
}
list();
