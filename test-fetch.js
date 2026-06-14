async function run() {
  const apiKey = "AIzaSyC7u9TomVNNDvpGCCrRFQPQ1MJMK5haWbE";
  const url = "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions";

  try {
    console.log("Sending test request with gemini-2.5-flash...");
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gemini-2.5-flash",
        messages: [{ role: "user", content: "Say hello!" }]
      })
    });

    console.log("Response status:", response.status);
    const text = await response.text();
    console.log("Raw response body:", text);
  } catch (error) {
    console.error("Fetch error:", error);
  }
}

run();
