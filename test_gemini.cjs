const fs = require('fs');
const env = fs.readFileSync('.env', 'utf8');
const key = env.split('\n').find(l => l.startsWith('VITE_GEMINI_API_KEY=')).split('=')[1].trim();

fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=' + key, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    contents: [{ parts: [{ text: 'test' }] }]
  })
})
.then(res => res.json())
.then(json => console.log(JSON.stringify(json, null, 2)))
.catch(e => console.error(e));
