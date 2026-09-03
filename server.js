import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();

// ===============================
// SOZLAMALAR
// ===============================

const PORT = process.env.PORT || 3000;

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.error("❌ GEMINI_API_KEY topilmadi!");
  console.error("👉 .env faylingizni tekshiring.");
  process.exit(1);
}

// Gemini AI
const ai = new GoogleGenAI({
  apiKey: GEMINI_API_KEY
});

// ===============================
// MIDDLEWARE
// ===============================

app.use(cors());

app.use(express.json());

app.use(express.urlencoded({
  extended: true
}));

// public papkadagi HTML/CSS/JS fayllarni chiqaradi
app.use(express.static("public"));

// ===============================
// TEST ROUTE
// ===============================

app.get("/api/test", (req, res) => {
  res.json({
    success: true,
    message: "UZ AI server ishlayapti! 🚀"
  });
});

// ===============================
// CHAT API
// ===============================

app.post("/api/chat", async (req, res) => {

  try {

    // Foydalanuvchi yuborgan xabar
    const { message } = req.body;

    // Xabar kelgan-kelmaganini tekshirish
    if (!message) {

      return res.status(400).json({
        success: false,
        reply: "Iltimos, savol yozing."
      });

    }

    console.log("👤 Siz:", message);

    // ===============================
    // GEMINI SO'ROVI
    // ===============================

    const response = await ai.models.generateContent({

    model: "gemini-3.5-flash",

      contents: message,

      config: {

        systemInstruction: `
Sizning ismingiz UZ AI.

Siz o'zbek tilida yordam beradigan aqlli AI yordamchisiz.

Asosan o'zbek tilida javob bering.

Foydalanuvchi boshqa tilda yozsa,
o'sha tilida javob berishingiz mumkin.

Javoblaringiz:
- tushunarli
- foydali
- qisqa va aniq
- do'stona
bo'lsin.

Agar foydalanuvchi oddiy salomlashsa,
iliq salomlashing.

Agar foydalanuvchi dasturlash haqida so'rasa,
kod bilan yordam bering.

Agar foydalanuvchi xatolik yuborsa,
xatoni tahlil qilib, bosqichma-bosqich yechim bering.
        `,

        temperature: 0.7,

        maxOutputTokens: 1000

      }

    });

    // ===============================
    // JAVOBNI OLISH
    // ===============================

    const reply = response.text;

    // Javob mavjudligini tekshirish
    if (!reply) {

      console.error("❌ Gemini bo'sh javob qaytardi.");

      return res.status(500).json({
        success: false,
        reply: "AI javob bera olmadi."
      });

    }

    console.log("🤖 UZ AI:", reply);

    // ===============================
    // JAVOBNI FRONTENDGA YUBORISH
    // ===============================

    res.json({

      success: true,

      reply: reply

    });

  } catch (error) {

    // ===============================
    // XATOLIK
    // ===============================

    console.error("");
    console.error("================================");
    console.error("❌ AI XATOSI");
    console.error("================================");
    console.error(error);
    console.error("================================");
    console.error("");

    let errorMessage = "AI bilan bog'lanishda xatolik yuz berdi.";

    // API key xatosi
    if (
      error.message &&
      (
        error.message.includes("API key") ||
        error.message.includes("API_KEY") ||
        error.message.includes("401")
      )
    ) {

      errorMessage =
        "Gemini API key noto'g'ri yoki topilmadi.";

    }

    // Limit xatosi
    else if (
      error.message &&
      (
        error.message.includes("429") ||
        error.message.includes("quota") ||
        error.message.includes("RESOURCE_EXHAUSTED")
      )
    ) {

      errorMessage =
        "Gemini API limitiga yetildi. Birozdan keyin qayta urinib ko'ring.";

    }

    // Model xatosi
    else if (
      error.message &&
      (
        error.message.includes("model") ||
        error.message.includes("Model")
      )
    ) {

      errorMessage =
        "AI modeli bilan bog'liq xatolik yuz berdi.";

    }

    // Internet xatosi
    else if (
      error.message &&
      (
        error.message.includes("fetch") ||
        error.message.includes("network") ||
        error.message.includes("ECONN")
      )
    ) {

      errorMessage =
        "Internet yoki Google AI serveriga ulanishda muammo.";

    }

    // Boshqa xato
    else if (error.message) {

      errorMessage = error.message;

    }

    res.status(500).json({

      success: false,

      reply: errorMessage

    });

  }

});

// ===============================
// 404
// ===============================

app.use((req, res, next) => {

  if (req.path.startsWith("/api/")) {

    return res.status(404).json({

      success: false,

      reply: "API manzili topilmadi."

    });

  }

  next();

});

// ===============================
// SERVERNI ISHGA TUSHIRISH
// ===============================

app.listen(PORT, "0.0.0.0", () => {

  console.log("");
  console.log("========================================");
  console.log("🚀 UZ AI SERVER ISHLAYAPTI");
  console.log("========================================");
  console.log(`🌐 http://localhost:${PORT}`);
  console.log("🤖 Gemini AI ulangan");
  console.log("💬 /api/chat tayyor");
  console.log("========================================");
  console.log("");

});