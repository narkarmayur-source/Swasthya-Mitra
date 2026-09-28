// api/chat.js — Vercel Serverless Function (Free)
export default async function handler(req, res) {
  // CORS: Allow your GitHub Pages site to call this proxy
  res.setHeader('Access-Control-Allow-Origin', 'https://YOUR-USERNAME.github.io'); // <-- CHANGE THIS
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { message, systemPrompt } = req.body;

  // Basic validation
  if (!message || message.length > 1000) {
    return res.status(400).json({ error: 'Invalid message' });
  }

  try {
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': process.env.GEMINI_API_KEY  // Key is HIDDEN here
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `${systemPrompt || 'You are a helpful health assistant.'}\n\nUser: ${message}`
          }]
        }]
      })
    });

    const data = await response.json();
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response';
    res.status(200).json({ reply });

  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ error: 'Failed to get AI response' });
  }
}