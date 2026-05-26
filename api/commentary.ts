const FALLBACKS: Record<string, string[]> = {
  martin: [
    "Wkwkwk aduh bidakku kemana ya?",
    "Mantap langkahmu! Aku agak bingung nih hehe",
    "Yah, aku salah perhitungan lagi deh!",
    "Wah keren! Aku belum kepikiran itu",
    "Gas terus! Permainan seru banget ini!"
  ],
  nelson: [
    "Waspada! Ratu-ku siap menyerang!",
    "Hmm pertahananmu lumayan, tapi belum cukup!",
    "Jangan santai, aku sudah siapkan jebakan!",
    "Langkah bagus, tapi aku tidak gentar!",
    "Bersiaplah menghadapi serangan brutalku!"
  ],
  wally: [
    "Langkah solid. Posisi memang segalanya.",
    "Hmm menarik, struktur pionmu cukup kokoh.",
    "Kesabaran adalah kunci kemenangan, kawan.",
    "Pertahanan yang baik adalah serangan terbaik.",
    "Dad joke dulu: kenapa catur mirip hidup? Karena Raja butuh perlindungan! 😄"
  ],
  magnus: [
    "Langkah teoritis yang masuk akal.",
    "Celah kecil bisa menentukan hasil akhir.",
    "Koordinasi perwira masih bisa dioptimalkan.",
    "Interesting. Mari kita lihat kelanjutannya.",
    "Posisi ini familiar. Saya sudah siapkan responnya."
  ]
};

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") return res.status(405).end();
  
  const { character, playerMove, aiMove, boardState } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;
  
  const getFallback = (id: string) => {
    const list = FALLBACKS[id] || FALLBACKS.martin;
    return list[Math.floor(Math.random() * list.length)];
  };

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: `Kamu adalah ${character?.name || 'bot catur'} dalam game catur. Player gerak: ${playerMove}. Kamu gerak: ${aiMove}. Balas singkat 1-2 kalimat bahasa gaul Indonesia sesuai karaktermu.` }]
          }]
        })
      }
    );
    const data = await response.json();
    if (data.error?.code === 429 || !data.candidates) {
      return res.json({ text: getFallback(character?.id) });
    }
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || getFallback(character?.id);
    res.json({ text });
  } catch (e: any) {
    res.json({ text: getFallback(character?.id) });
  }
}
