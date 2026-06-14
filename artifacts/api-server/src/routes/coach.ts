import { Router } from "express";
import { db, profilesTable, mealEntriesTable, gamificationTable, eq, and, gte } from "@workspace/db";
import { openai, aiModel } from "@workspace/integrations-openai-ai-server";
import { requireAuth, AuthRequest } from "../lib/auth.js";

const router = Router();
router.use(requireAuth);

router.get("/message", async (req: AuthRequest, res) => {
  const [profile] = await db.select().from(profilesTable).where(eq(profilesTable.userId, req.userId!)).limit(1);
  const [gamification] = await db.select().from(gamificationTable).where(eq(gamificationTable.userId, req.userId!)).limit(1);

  const today = new Date().toISOString().split("T")[0];
  const meals = await db.select().from(mealEntriesTable).where(
    and(eq(mealEntriesTable.userId, req.userId!), gte(mealEntriesTable.loggedAt, today))
  );

  const totalCaloriesToday = meals.reduce((sum: number, m: any) => sum + m.calories, 0);
  const streak = gamification?.streakDays ?? 0;
  const goal = profile?.goal?.replace(/_/g, " ") ?? "stay healthy";
  const preference = profile?.dietPreference?.replace(/_/g, " ") ?? "balanced";

  const prompt = `You are NutriCoach, an encouraging and knowledgeable personal diet coach.
User info: Goal: ${goal}, Diet: ${preference}, Current streak: ${streak} days, Calories today: ${totalCaloriesToday} kcal.
Today is ${new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}.

Send a short, personalized daily coaching message (3-4 sentences max). Include:
1. A motivational line based on their goal/streak
2. One specific diet tip relevant to ${preference} diet
3. One actionable suggestion for today

Keep it warm, conversational, and encouraging. No lists, just natural text.`;

  try {
    const completion = await openai.chat.completions.create({
      model: aiModel,
      messages: [{ role: "user", content: prompt }],
    });
    res.json({ message: completion.choices[0]?.message?.content ?? "Keep up the great work today!" });
  } catch (error) {
    console.log("AI service unavailable for coach message:", error);
    const messages = [
      `Great job tracking your meals today! You're ${streak} days into your ${goal} journey. Keep going!`,
      `You're doing amazing on your ${preference} diet! Stay consistent and you'll reach your ${goal} goal.`,
      `Every meal logged brings you closer to your goal. Keep up the excellent work!`,
      `Your dedication to ${goal} is inspiring! Today is a perfect day to stay focused.`
    ];
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    res.json({ message: randomMessage });
  }
});

router.get("/health-risks", async (req: AuthRequest, res) => {
  const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString().split("T")[0];
  const meals = await db.select().from(mealEntriesTable).where(
    and(eq(mealEntriesTable.userId, req.userId!), gte(mealEntriesTable.loggedAt, sevenDaysAgo))
  );

  if (meals.length < 3) {
    res.json({ risks: [], suggestions: [] });
    return;
  }

  const avgCalories = meals.reduce((s: number, m: any) => s + m.calories, 0) / 7;
  const avgProtein = meals.reduce((s: number, m: any) => s + (m.proteinGrams ?? 0), 0) / 7;
  const avgCarbs = meals.reduce((s: number, m: any) => s + (m.carbsGrams ?? 0), 0) / 7;
  const avgFat = meals.reduce((s: number, m: any) => s + (m.fatGrams ?? 0), 0) / 7;

  const [profile] = await db.select().from(profilesTable).where(eq(profilesTable.userId, req.userId!)).limit(1);
  const target = profile?.dailyCalorieTarget ?? 2000;

  const prompt = `You are a nutrition expert. Analyze these 7-day average nutrition stats and identify potential health risks.

Daily averages: Calories: ${Math.round(avgCalories)} (target: ${target}), Protein: ${Math.round(avgProtein)}g, Carbs: ${Math.round(avgCarbs)}g, Fat: ${Math.round(avgFat)}g

Respond ONLY in this JSON format (no markdown):
{
  "risks": [
    { "type": "warning|danger|info", "title": "Short title", "description": "1-2 sentence description" }
  ],
  "suggestions": ["Actionable suggestion 1", "Actionable suggestion 2", "Actionable suggestion 3"]
}

Include 2-4 risks based on the data. If everything looks good, include one positive "info" type message.`;

  try {
    const completion = await openai.chat.completions.create({
      model: aiModel,
      messages: [{ role: "user", content: prompt }],
    });

    try {
      const result = JSON.parse(completion.choices[0]?.message?.content ?? "{}");
      res.json(result);
    } catch {
      res.json({ risks: [], suggestions: [] });
    }
  } catch (error) {
    console.log("AI service unavailable for health risks analysis:", error);
    // Fallback response based on calorie data
    const risks = [];
    const suggestions = [];
    
    if (avgCalories < target * 0.8) {
      risks.push({
        type: "warning",
        title: "Under-eating detected",
        description: `Your average daily intake (${Math.round(avgCalories)} kcal) is below your target (${target} kcal). This may slow your metabolism and energy levels.`
      });
      suggestions.push("Increase portion sizes slightly at meals");
    }
    if (avgCalories > target * 1.2) {
      risks.push({
        type: "warning",
        title: "Over-eating detected",
        description: `Your average daily intake (${Math.round(avgCalories)} kcal) exceeds your target (${target} kcal). Consider portion control.`
      });
      suggestions.push("Measure portions more carefully");
    }
    if (avgProtein < 50) {
      risks.push({
        type: "warning",
        title: "Low protein intake",
        description: `Your protein intake (${Math.round(avgProtein)}g) may be insufficient for muscle maintenance.`
      });
      suggestions.push("Add more protein sources: chicken, fish, eggs, legumes, or yogurt");
    }
    if (risks.length === 0) {
      risks.push({
        type: "info",
        title: "Great nutritional balance",
        description: "Your nutrition metrics look well-balanced. Keep maintaining this excellent habit!"
      });
    }
    
    suggestions.push("Continue logging meals consistently");
    suggestions.push("Drink plenty of water throughout the day");
    
    res.json({ risks, suggestions });
  }
});

export default router;
