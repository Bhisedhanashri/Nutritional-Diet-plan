import { Router } from "express";
import { db, conversations, messages, eq } from "@workspace/db";
import { CreateOpenaiConversationBody, SendOpenaiMessageBody } from "@workspace/api-zod";
import { openai, aiModel } from "@workspace/integrations-openai-ai-server";
import { requireAuth, AuthRequest } from "../lib/auth.js";

const router = Router();

router.use(requireAuth);

const DIET_SYSTEM_PROMPT = `You are NutriAI, an expert AI diet and nutrition assistant specializing in Indian and Maharashtrian diets and ingredients. You help users with:
- Personalized diet and meal recommendations focusing on healthy Indian/Maharashtrian dishes (Poha, Roti, Subji, Daal, Khichdi, Paneer, Idli, Dosa, etc.)
- Nutritional information and calorie counts for common Indian foods (e.g., Chapati, Daal Tadka, Biryani, Poha, Samosa, Sabudana Khichdi)
- Healthy food alternatives and substitutions in an Indian household context
- Meal planning and recipe suggestions
- Weight management tips and strategies
- Exercise and nutrition synergy
- Dietary restrictions and preferences (vegetarian, vegan, Jain, fasting diets, etc.)

Be friendly, encouraging, and provide specific, actionable advice. Keep responses concise and practical.
Always remind users to consult healthcare professionals for medical nutrition advice.`;

router.get("/conversations", async (req: AuthRequest, res) => {
  const convs = await db.select().from(conversations).orderBy(conversations.createdAt);
  res.json(convs);
});

router.post("/conversations", async (req: AuthRequest, res) => {
  const parse = CreateOpenaiConversationBody.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ error: parse.error.message });
    return;
  }
  const [conv] = await db.insert(conversations).values({ title: parse.data.title }).returning();
  res.status(201).json(conv);
});

router.get("/conversations/:id", async (req: AuthRequest, res) => {
  const id = parseInt(String(req.params.id));
  const [conv] = await db.select().from(conversations).where(eq(conversations.id, id)).limit(1);
  if (!conv) {
    res.status(404).json({ error: "Conversation not found" });
    return;
  }
  const msgs = await db.select().from(messages).where(eq(messages.conversationId, id)).orderBy(messages.createdAt);
  res.json({ ...conv, messages: msgs });
});

router.delete("/conversations/:id", async (req: AuthRequest, res) => {
  const id = parseInt(String(req.params.id));
  const [conv] = await db.select().from(conversations).where(eq(conversations.id, id)).limit(1);
  if (!conv) {
    res.status(404).json({ error: "Conversation not found" });
    return;
  }
  await db.delete(conversations).where(eq(conversations.id, id));
  res.status(204).send();
});

router.get("/conversations/:id/messages", async (req: AuthRequest, res) => {
  const id = parseInt(String(req.params.id));
  const msgs = await db.select().from(messages).where(eq(messages.conversationId, id)).orderBy(messages.createdAt);
  res.json(msgs);
});

router.post("/conversations/:id/messages", async (req: AuthRequest, res) => {
  const id = parseInt(String(req.params.id));
  const parse = SendOpenaiMessageBody.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ error: parse.error.message });
    return;
  }

  const [conv] = await db.select().from(conversations).where(eq(conversations.id, id)).limit(1);
  if (!conv) {
    res.status(404).json({ error: "Conversation not found" });
    return;
  }

  // Save user message
  await db.insert(messages).values({
    conversationId: id,
    role: "user",
    content: parse.data.content,
  });

  // Get conversation history
  const history = await db.select().from(messages).where(eq(messages.conversationId, id)).orderBy(messages.createdAt);

  const chatMessages = [
    { role: "system" as const, content: DIET_SYSTEM_PROMPT },
    ...history.map((m: any) => ({ role: m.role as "user" | "assistant", content: m.content })),
  ];

  // Set SSE headers
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  let fullResponse = "";

  try {
    const stream = await openai.chat.completions.create({
      model: aiModel,
      messages: chatMessages,
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        fullResponse += content;
        res.write(`data: ${JSON.stringify({ content })}\n\n`);
      }
    }

    // Save assistant message
    await db.insert(messages).values({
      conversationId: id,
      role: "assistant",
      content: fullResponse,
    });

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (error) {
    req.log.error({ error }, "Error in OpenAI chat stream");
    
    // Provide a helpful fallback response
    const fallbackResponse = "I appreciate your question! While I'm currently experiencing technical difficulties with my AI service, I can still help you with general nutrition advice. " +
      "Try asking me about: (1) Calorie counting basics, (2) Common food nutrition values, (3) Meal planning principles, or (4) Diet types and their benefits. " +
      "For personalized advice, please try again in a moment.";
    
    fullResponse = fallbackResponse;
    
    // Save the fallback response
    try {
      await db.insert(messages).values({
        conversationId: id,
        role: "assistant",
        content: fullResponse,
      });
    } catch (dbError) {
      req.log.error({ dbError }, "Failed to save fallback response");
    }
    
    res.write(`data: ${JSON.stringify({ content: fallbackResponse })}\n\n`);
    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  }
});

export default router;
