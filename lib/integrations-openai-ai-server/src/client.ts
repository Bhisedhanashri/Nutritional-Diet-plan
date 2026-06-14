import OpenAI from "openai";

const useOllama = process.env.USE_OLLAMA === "true" || (!process.env.GEMINI_API_KEY && !process.env.AI_INTEGRATIONS_OPENAI_API_KEY);

const apiKey = useOllama 
  ? "ollama" 
  : (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "YOUR_NEW_GEMINI_API_KEY"
    ? process.env.GEMINI_API_KEY 
    : (process.env.AI_INTEGRATIONS_OPENAI_API_KEY || "dummy-key"));

const baseURL = useOllama
  ? process.env.OLLAMA_BASE_URL || "http://localhost:11434/v1"
  : (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "YOUR_NEW_GEMINI_API_KEY"
    ? "https://generativelanguage.googleapis.com/v1beta/openai/"
    : process.env.AI_INTEGRATIONS_OPENAI_BASE_URL || "https://api.openai.com/v1");

export const aiModel = useOllama
  ? process.env.OLLAMA_MODEL || "llama3"
  : (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "YOUR_NEW_GEMINI_API_KEY"
    ? "gemini-2.5-flash"
    : "gpt-4o-mini");

if (useOllama) {
  console.log(`ℹ️  [NutriAI] Configured to use Ollama Local API at ${baseURL} with model: ${aiModel}`);
} else if (apiKey === "dummy-key" || apiKey === "YOUR_NEW_GEMINI_API_KEY" || apiKey === "AIzaSyBe-MpTB104cC2xaAz5qdsGfZ9xqE-ZAtc") {
  console.warn("\n⚠️  [NutriAI Warning] No valid Gemini/OpenAI API key configured. The template's default key was flagged as leaked and disabled by Google. Please generate a new free Gemini API key from Google AI Studio (https://aistudio.google.com/) and update your 'artifacts/api-server/.env' file by setting GEMINI_API_KEY=your_key.\n");
}

export const openai = new OpenAI({
  apiKey,
  baseURL,
});


