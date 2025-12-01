import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

async function listModels() {
  const apiKey = process.env.GEMINI_API_KEY;

  try {
    const response = await axios.get(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
    );

    console.log("AVAILABLE MODELS:");
    response.data.models.forEach((m: any) => console.log("-", m.name));
  } catch (err: any) {
    console.error("ERROR LISTING MODELS:", err.response?.data || err.message);
  }
}

listModels();
