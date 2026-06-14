import OpenAI from "openai";

const apiKey = "AIzaSyC7u9TomVNNDvpGCCrRFQPQ1MJMK5haWbE";
const baseURL = "https://generativelanguage.googleapis.com/v1beta/openai/";
const model = "gemini-1.5-flash";

const openai = new OpenAI({
  apiKey,
  baseURL,
});

async function run() {
  try {
    console.log("Testing Gemini API Key...");
    const response = await openai.chat.completions.create({
      model: model,
      messages: [{ role: "user", content: "Say hello!" }],
      max_completion_tokens: 10,
    });
    console.log("Success! Response:", response.choices[0]?.message?.content);
  } catch (error) {
    console.error("Failed to connect to AI service:", error);
  }
}

run();
