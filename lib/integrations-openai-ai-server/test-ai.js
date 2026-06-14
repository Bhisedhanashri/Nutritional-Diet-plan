const apiKey = "AIzaSyC7u9TomVNNDvpGCCrRFQPQ1MJMK5haWbE";
const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

async function run() {
  try {
    console.log("Listing available Gemini models...");
    const response = await fetch(url);
    const data = await response.json();
    if (data.models) {
      console.log("Models:", data.models.map(m => m.name));
    } else {
      console.log("Response:", JSON.stringify(data));
    }
  } catch (error) {
    console.error("Fetch failed:", error);
  }
}

run();
