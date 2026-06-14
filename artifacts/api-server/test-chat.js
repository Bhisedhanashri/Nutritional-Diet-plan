import "dotenv/config";
import OpenAI from "openai";

const apiKey = "AIzaSyC7u9TomVNNDvpGCCrRFQPQ1MJMK5haWbE";
const baseURL = "https://generativelanguage.googleapis.com/v1beta/openai/";
const model = "gemini-2.5-flash";

const openai = new OpenAI({
  apiKey,
  baseURL,
});

async function run() {
  try {
    console.log("Testing streaming chat completions...");
    const stream = await openai.chat.completions.create({
      model: model,
      messages: [
        { role: "system", content: "You are NutriAI, an expert AI diet assistant." },
        { role: "user", content: "provide me a sujjestions related to health" }
      ],
      stream: true,
    });

    for await (const chunk of stream) {
      process.stdout.write(chunk.choices[0]?.delta?.content || "");
      if (chunk.choices[0]?.finish_reason) {
        console.log(`\n\nFinish reason: ${chunk.choices[0].finish_reason}`);
      }
    }
  } catch (error) {
    console.error("Error streaming:", error);
  }
}

run();
