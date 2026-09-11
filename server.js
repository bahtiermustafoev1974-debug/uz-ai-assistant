import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use(express.static("public"));

if (!process.env.GEMINI_API_KEY) {
  console.error("❌ GEMINI_API_KEY topilmadi!");
} else {
  console.log("✅ Gemini API key topildi");
}

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

const systemInstruction = `
Sen UZ AI nomli o‘zbek tilidagi AI yordamchisan.

Foydalanuvchining ismi Maruf.
Unga murojaat qilganda "Maruf" deb murojaat qil.

Asosiy qoidalar:
- Foydalanuvchi bilan asosan o‘zbek tilida gaplash.
- Javoblarni sodda, tushunarli va foydali qil.
- Dasturlash savollarida kodni aniq va tartibli ber.
- Maktab fanlari bo‘yicha oddiy misollar ishlat.
- Foydalanuvchi tushunmagan joyini yana sodda qilib tushuntir.
- Keraksiz uzun javoblardan qoch.
- Hurmat bilan va do‘stona javob ber.
- Kerakli joylarda foydalanuvchiga "Maruf" deb murojaat qil.
`;

app.get("/api/test", (req, res) => {
  res.json({
    success: true,
    message: "UZ AI server ishlayapti 🚀"
  });
});

app.post("/api/chat", async (req, res) => {
  try {
    const message = String(req.body?.message || "").trim();

    if (!message) {
      return res.status(400).json({
        success: false,
        error: "Xabar bo'sh."
      });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        success: false,
        error: "GEMINI_API_KEY sozlanmagan."
      });
    }

    console.log("📩 Savol:", message);

    const interaction = await ai.interactions.create({
      model: "gemini-3.6-flash",
      input: message,
      system_instruction: systemInstruction
    });

    const answer =
      interaction.output_text ||
      "Kechirasiz, javob olishning iloji bo'lmadi.";

    console.log("🤖 Javob olindi");

    res.json({
      success: true,
      answer
    });

  } catch (error) {
    console.error("❌ AI XATOSI:", error);

    res.status(500).json({
      success: false,
      error: "AI bilan bog'lanishda xatolik yuz berdi.",
      details: error?.message || "Noma'lum xatolik"
    });
  }
});

app.listen(PORT, () => {
  console.log("");
  console.log("================================");
  console.log("🚀 UZ AI SERVER ISHLAYAPTI");
  console.log(`🌐 http://localhost:${PORT}`);
  console.log("================================");
})