export default async function handler(req: any, res: any) {
  if (req.method !== "POST") return res.status(405).end();
  
  const { character, playerMove, aiMove, boardState } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;
  
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: `Kamu adalah ${character.name} dalam game catur. Papan: ${boardState}. Player gerak: ${playerMove}. Kamu gerak: ${aiMove}. Balas singkat 1-2 kalimat bahasa gaul Indonesia sesuai karaktermu.` }]
          }]
        })
      }
    );
    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "Hmm menarik...";
    res.json({ text });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
}
