import { GoogleGenAI } from "@google/genai";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") return res.status(405).end();
  
  const { character, playerMove, aiMove, boardState } = req.body;
  
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: `Kamu adalah ${character.name} dalam game catur. Papan: ${boardState}. Player gerak: ${playerMove}. Kamu gerak: ${aiMove}. Balas singkat 1-2 kalimat bahasa gaul Indonesia sesuai karaktermu.`,
    });
    res.json({ text: response.text });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
}
