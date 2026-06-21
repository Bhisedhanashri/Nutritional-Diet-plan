import { Router } from "express";
import { db, profilesTable, dietPlansTable, eq } from "@workspace/db";
import { GenerateDietPlanBody, CheckFoodCaloriesBody } from "@workspace/api-zod";
import { openai, aiModel } from "@workspace/integrations-openai-ai-server";
import { requireAuth, AuthRequest } from "../lib/auth.js";

const router = Router();

function cleanJson(str: string): string {
  let clean = str.trim();
  
  // Try to find a JSON block between ```json and ```
  const jsonBlockRegex = /```(?:json)?\s*([\s\S]*?)\s*```/;
  const match = clean.match(jsonBlockRegex);
  if (match && match[1]) {
    return match[1].trim();
  }
  
  // If no block with backticks, try to find the first '{' and last '}'
  const firstBrace = clean.indexOf('{');
  const lastBrace = clean.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    return clean.substring(firstBrace, lastBrace + 1).trim();
  }
  
  return clean;
}

router.use(requireAuth);

router.post("/generate-plan", async (req: AuthRequest, res) => {
  const parse = GenerateDietPlanBody.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ error: parse.error.message });
    return;
  }

  const [profile] = await db.select().from(profilesTable).where(eq(profilesTable.userId, req.userId!)).limit(1);
  if (!profile) {
    res.status(404).json({ error: "Profile not found. Please complete your profile first." });
    return;
  }

  const prompt = `You are a professional nutritionist specializing in Indian and Maharashtrian cuisine. Create a detailed, culturally relevant 7-day personalized meal plan for an Indian user with:
- Age: ${profile.age}, Gender: ${profile.gender}
- Height: ${profile.heightCm}cm, Weight: ${profile.weightKg}kg
- Activity Level: ${profile.activityLevel.replace(/_/g, " ")}
- Diet Preference: ${profile.dietPreference.replace(/_/g, " ")}
- Goal: ${profile.goal.replace(/_/g, " ")}
- Daily Calorie Target: ${profile.dailyCalorieTarget} kcal

Please include traditional, healthy Indian and Maharashtrian dishes (such as Poha, Upma, Roti, Daal, Chawal, Subji, Khichdi, Idli, Dosa, Paneer, Sprouted Matki Usal, etc.) that match the daily target and diet preference. Make sure the meal names are clear, descriptive, and appetizing.

IMPORTANT: You MUST generate a different, varied, and unique menu for each of the 7 days (Monday through Sunday). Do NOT repeat the exact same meals on consecutive days or use the same menu for the entire week. Provide dietary variety with different grains (wheat, oats, rice, jowar, ragi) and proteins (sprouts, lentils, curd, paneer, chicken/fish if not veg) for each day. Each day should have a distinct breakfast, lunch, dinner, and snacks.

Respond in this EXACT JSON format (no markdown, just JSON):
{
  "title": "Personalized Diet Plan for ${profile.goal.replace(/_/g, " ")}",
  "dailyCalories": ${profile.dailyCalorieTarget},
  "proteinGrams": <calculated>,
  "carbsGrams": <calculated>,
  "fatGrams": <calculated>,
  "days": [
    {
      "day": "Monday",
      "breakfast": { "name": "", "calories": 0, "protein": 0, "carbs": 0, "fat": 0 },
      "lunch": { "name": "", "calories": 0, "protein": 0, "carbs": 0, "fat": 0 },
      "dinner": { "name": "", "calories": 0, "protein": 0, "carbs": 0, "fat": 0 },
      "snacks": [{ "name": "", "calories": 0, "protein": 0, "carbs": 0, "fat": 0 }],
      "totalCalories": 0
    }
  ],
  "groceryList": ["item1", "item2", ...]
}`;

  let planData: Record<string, unknown>;
  
  try {
    const completion = await openai.chat.completions.create({
      model: aiModel,
      messages: [{ role: "user", content: prompt }],
    });
    const content = completion.choices[0]?.message?.content ?? "{}";
    try {
      planData = JSON.parse(cleanJson(content));
    } catch {
      planData = { days: [], groceryList: [] };
    }
  } catch (error) {
    // Fallback to sample diet plan when AI service is unavailable
    console.log("AI service unavailable, using sample diet plan:", error);
    planData = {
      title: `Personalized Diet Plan - ${profile.goal.replace(/_/g, " ")}`,
      dailyCalories: profile.dailyCalorieTarget || 2000,
      proteinGrams: Math.round((profile.dailyCalorieTarget || 2000) * 0.3 / 4),
      carbsGrams: Math.round((profile.dailyCalorieTarget || 2000) * 0.45 / 4),
      fatGrams: Math.round((profile.dailyCalorieTarget || 2000) * 0.25 / 9),
      days: [
        {
          day: "Monday",
          breakfast: { name: "Vegetable Poha with roasted peanuts & green tea", calories: 350, protein: 10, carbs: 52, fat: 8 },
          lunch: { name: "Wheat Roti (2) with Toor Dal Tadka & Bhindi Masala", calories: 500, protein: 16, carbs: 68, fat: 12 },
          dinner: { name: "Sprouted Matki Usal (Sprout curry) with Khichdi & Fresh Curd", calories: 550, protein: 22, carbs: 74, fat: 10 },
          snacks: [{ name: "Roasted Makhana (Foxnuts) with Buttermilk (Taak)", calories: 150, protein: 6, carbs: 22, fat: 2 }],
          totalCalories: 1550
        },
        {
          day: "Tuesday",
          breakfast: { name: "Oats Upma with mixed vegetables and lemon", calories: 330, protein: 9, carbs: 48, fat: 7 },
          lunch: { name: "Multigrain Jowar Bhakri (1) with Methi (Fenugreek) Sabji & Masoor Dal", calories: 480, protein: 18, carbs: 62, fat: 14 },
          dinner: { name: "Grilled Paneer Tikka (100g) with Sautéed Broccoli & Bell Peppers", calories: 530, protein: 24, carbs: 15, fat: 22 },
          snacks: [{ name: "One fresh Apple with a small handful of raw Walnuts (4-5)", calories: 180, protein: 4, carbs: 20, fat: 10 }],
          totalCalories: 1520
        },
        {
          day: "Wednesday",
          breakfast: { name: "Steamed Idli (3) with Sambar & Mint-Coconut Chutney", calories: 340, protein: 11, carbs: 58, fat: 5 },
          lunch: { name: "Wheat Roti (2) with Chana Masala (Chickpea curry) & Cucumber Raita", calories: 510, protein: 19, carbs: 70, fat: 11 },
          dinner: { name: "Palak (Spinach) Khichdi with Roasted Urad Papad & Curd", calories: 530, protein: 18, carbs: 75, fat: 9 },
          snacks: [{ name: "Boiled Kala Chana Chaat (Spiced brown chickpeas) & Green Tea", calories: 160, protein: 8, carbs: 24, fat: 2 }],
          totalCalories: 1540
        },
        {
          day: "Thursday",
          breakfast: { name: "Multigrain Thalipeeth (1) with a dollop of fresh Curd", calories: 360, protein: 12, carbs: 46, fat: 11 },
          lunch: { name: "Brown Rice (1.5 cups) with Rajma (Red Kidney Beans) Curry & Cabbage Sabji", calories: 520, protein: 17, carbs: 78, fat: 12 },
          dinner: { name: "Moong Dal Khichdi with Maharashtrian Kadhi (Yogurt curry)", calories: 500, protein: 16, carbs: 70, fat: 8 },
          snacks: [{ name: "Mixed Fruit Salad (Papaya & Pomegranate)", calories: 120, protein: 2, carbs: 28, fat: 1 }],
          totalCalories: 1500
        },
        {
          day: "Friday",
          breakfast: { name: "Methi Thepla (2) with Tomato Chutney & Roasted Chana", calories: 350, protein: 11, carbs: 50, fat: 9 },
          lunch: { name: "Wheat Roti (2) with Paneer Bhurji & Lauki (Bottle gourd) Dal", calories: 520, protein: 22, carbs: 60, fat: 16 },
          dinner: { name: "Sprouted Moong Usal with Steamed Rice (1 cup) & Tomato Salad", calories: 510, protein: 20, carbs: 72, fat: 8 },
          snacks: [{ name: "Roasted Chana (1/2 cup) & warm Buttermilk", calories: 140, protein: 7, carbs: 20, fat: 2 }],
          totalCalories: 1520
        },
        {
          day: "Saturday",
          breakfast: { name: "Moong Dal Dosa (Pesarattu) (1) with Coconut Chutney", calories: 330, protein: 13, carbs: 45, fat: 8 },
          lunch: { name: "Wheat Roti (2) with Baingan Bharta (Mashed eggplant) & Chana Dal", calories: 490, protein: 15, carbs: 64, fat: 13 },
          dinner: { name: "Soya Chunks Masala Curry with Multigrain Roti (1) & Cucumber Salad", calories: 530, protein: 25, carbs: 55, fat: 11 },
          snacks: [{ name: "Roasted Peanuts (small handful) & Green Tea", calories: 160, protein: 6, carbs: 8, fat: 12 }],
          totalCalories: 1510
        },
        {
          day: "Sunday",
          breakfast: { name: "Rava Idli (2) or Vegetable Semolina Upma with Chutney", calories: 320, protein: 10, carbs: 52, fat: 6 },
          lunch: { name: "Jeera Rice (1 cup) with Dal Tadka & Bhindi (Okra) Fry", calories: 470, protein: 12, carbs: 68, fat: 11 },
          dinner: { name: "Mix Sprout Khichdi with Kadhi and Curd", calories: 520, protein: 18, carbs: 70, fat: 9 },
          snacks: [{ name: "Almonds (10) & Walnuts (3) with warm Green Tea", calories: 170, protein: 5, carbs: 6, fat: 15 }],
          totalCalories: 1480
        }
      ],
      groceryList: [
        "Poha", "Moong dal", "Wheat flour", "Mixed vegetables", "Toor dal", "Rice",
        "Sprouted Matki", "Curd", "Makhana", "Chana", "Buttermilk", "Oats", "Jowar flour",
        "Methi leaves", "Masoor dal", "Paneer", "Broccoli", "Apples", "Walnuts", "Idli rava",
        "Sambar powder", "Coconut", "Rajma", "Cabbage", "Kadhi ingredients", "Papaya",
        "Pomegranate", "Thepla ingredients", "Lauki", "Baingan", "Soya chunks", "Bhindi", "Almonds"
      ]
    };
  }

  const [saved] = await db.insert(dietPlansTable).values({
    userId: req.userId!,
    title: (planData.title as string) || `Diet Plan - ${new Date().toLocaleDateString()}`,
    dailyCalories: (planData.dailyCalories as number) || profile.dailyCalorieTarget || 2000,
    proteinGrams: (planData.proteinGrams as number) || 0,
    carbsGrams: (planData.carbsGrams as number) || 0,
    fatGrams: (planData.fatGrams as number) || 0,
    planData: JSON.stringify(planData.days || []),
    groceryList: JSON.stringify(planData.groceryList || []),
  }).returning();

  res.json(saved);
});

router.get("/plans", async (req: AuthRequest, res) => {
  const plans = await db.select({
    id: dietPlansTable.id,
    title: dietPlansTable.title,
    dailyCalories: dietPlansTable.dailyCalories,
    createdAt: dietPlansTable.createdAt,
  }).from(dietPlansTable).where(eq(dietPlansTable.userId, req.userId!)).orderBy(dietPlansTable.createdAt);
  res.json(plans);
});

router.get("/plans/:id", async (req: AuthRequest, res) => {
  const id = parseInt(String(req.params.id));
  const [plan] = await db.select().from(dietPlansTable).where(eq(dietPlansTable.id, id)).limit(1);
  if (!plan || plan.userId !== req.userId!) {
    res.status(404).json({ error: "Plan not found" });
    return;
  }
  res.json(plan);
});

router.post("/check-food", async (req: AuthRequest, res) => {
  const parse = CheckFoodCaloriesBody.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ error: parse.error.message });
    return;
  }
  const { foodName, portionSize } = parse.data;

  const prompt = `You are a nutrition expert. Provide accurate nutritional information for:
Food: ${foodName}
Portion: ${portionSize}

Respond in this EXACT JSON format (no markdown):
{
  "foodName": "${foodName}",
  "portionSize": "${portionSize}",
  "calories": <integer>,
  "proteinGrams": <number>,
  "carbsGrams": <number>,
  "fatGrams": <number>,
  "fiberGrams": <number>,
  "healthScore": <integer 1-10>,
  "alternatives": ["alternative1", "alternative2", "alternative3"],
  "tips": "Brief tip about this food"
}`;

  let nutrition: Record<string, unknown> = {};
  try {
    const completion = await openai.chat.completions.create({
      model: aiModel,
      messages: [{ role: "user", content: prompt }],
    });

    const content = completion.choices[0]?.message?.content ?? "{}";
    try {
      console.log(`[NutriAI Debug] Raw AI response for food check:`, content);
      const cleaned = cleanJson(content);
      console.log(`[NutriAI Debug] Cleaned JSON content:`, cleaned);
      nutrition = JSON.parse(cleaned);
    } catch (parseError) {
      console.error(`[NutriAI Error] Failed to parse AI JSON response:`, parseError);
      nutrition = { foodName, portionSize, calories: 0, proteinGrams: 0, carbsGrams: 0, fatGrams: 0, fiberGrams: 0, healthScore: 5, alternatives: [], tips: "" };
    }
  } catch (error) {
    console.log("AI service unavailable for food check, using fallback:", error);
    // Fallback nutrition data based on common foods
    const commonFoods: Record<string, Record<string, unknown>> = {
      "chicken": { calories: 165, proteinGrams: 31, carbsGrams: 0, fatGrams: 3.6, fiberGrams: 0, healthScore: 9, alternatives: ["turkey", "fish", "lean beef"], tips: "Excellent protein source, low in fat" },
      "rice": { calories: 206, proteinGrams: 4.3, carbsGrams: 45, fatGrams: 0.3, fiberGrams: 0.6, healthScore: 6, alternatives: ["quinoa", "oats", "whole wheat pasta"], tips: "Carb source, choose brown rice for more fiber" },
      "apple": { calories: 52, proteinGrams: 0.3, carbsGrams: 14, fatGrams: 0.2, fiberGrams: 2.4, healthScore: 8, alternatives: ["banana", "orange", "pear"], tips: "High in fiber, great for digestion" },
      "salmon": { calories: 208, proteinGrams: 22, carbsGrams: 0, fatGrams: 13, fiberGrams: 0, healthScore: 9, alternatives: ["mackerel", "sardines", "trout"], tips: "Rich in omega-3 fatty acids" }
    };
    
    let found = false;
    for (const [key, value] of Object.entries(commonFoods)) {
      if (foodName.toLowerCase().includes(key)) {
        nutrition = { foodName, portionSize, ...value };
        found = true;
        break;
      }
    }
    
    if (!found) {
      nutrition = { 
        foodName, 
        portionSize, 
        calories: 100, 
        proteinGrams: 5, 
        carbsGrams: 15, 
        fatGrams: 2, 
        fiberGrams: 2, 
        healthScore: 5, 
        alternatives: ["balanced alternative 1", "balanced alternative 2"], 
        tips: "Check nutrition labels for accurate information" 
      };
    }
  }

  res.json(nutrition);
});

router.post("/disease-plan", async (req: AuthRequest, res) => {
  try {
    const { conditionNames, dietPreference, goal } = req.body;
    if (!conditionNames?.length) { 
      res.status(400).json({ error: "Select at least one condition." }); 
      return; 
    }
    const prompt = `You are a medical nutritionist specializing in therapeutic diets. Create a comprehensive diet plan for someone with: ${conditionNames.join(", ")}.
Diet preference: ${dietPreference?.replace(/_/g, " ") || "balanced"}. Goal: ${goal?.replace(/_/g, " ") || "improve health"}.
Respond ONLY in this JSON format (no markdown):
{
  "condition": "${conditionNames.join(" + ")}",
  "foods_to_eat": ["food 1 - reason", "food 2 - reason", "food 3 - reason", "food 4 - reason", "food 5 - reason", "food 6 - reason"],
  "foods_to_avoid": ["food 1 - reason", "food 2 - reason", "food 3 - reason", "food 4 - reason", "food 5 - reason"],
  "key_nutrients": ["Nutrient 1", "Nutrient 2", "Nutrient 3", "Nutrient 4", "Nutrient 5"],
  "meal_timing": ["Tip 1", "Tip 2", "Tip 3", "Tip 4"],
  "sample_day": {
    "breakfast": "Detailed breakfast description",
    "lunch": "Detailed lunch description",
    "dinner": "Detailed dinner description",
    "snacks": ["Snack 1", "Snack 2"]
  },
  "tips": ["Specific tip 1", "Specific tip 2", "Specific tip 3", "Specific tip 4"]
}`;
    const completion = await openai.chat.completions.create({ 
      model: aiModel, 
      messages: [{ role: "user", content: prompt }] 
    });

    const content = completion.choices[0]?.message?.content ?? "{}";
    
    // Clean up Markdown formatting if any
    let cleanContent = content.trim();
    if (cleanContent.startsWith("```")) {
      cleanContent = cleanContent.replace(/^```[a-zA-Z]*\n?/, "");
      cleanContent = cleanContent.replace(/```$/, "");
      cleanContent = cleanContent.trim();
    }

    try {
      const result = JSON.parse(cleanContent);
      res.json(result);
    } catch (e) {
      console.error("Failed to parse JSON response from LLM:", content, e);
      res.status(500).json({ error: "Failed to parse generated disease diet plan." });
    }
  } catch (error) {
    console.error("Error in disease-plan route:", error);
    res.status(500).json({ error: "Failed to generate disease diet plan." });
  }
});

router.post("/swap-meal", async (req: AuthRequest, res) => {
  const { planId, day, mealType, dietPreference } = req.body;
  if (!planId || !day || !mealType) {
    res.status(400).json({ error: "planId, day, and mealType are required." });
    return;
  }
  const [plan] = await db.select().from(dietPlansTable).where(eq(dietPlansTable.id, parseInt(planId))).limit(1);
  if (!plan || plan.userId !== req.userId!) {
    res.status(404).json({ error: "Plan not found" });
    return;
  }
  const days = JSON.parse(plan.planData);
  const dayData = days.find((d: any) => d.day === day);
  if (!dayData) { res.status(404).json({ error: "Day not found" }); return; }
  const currentMeal = dayData[mealType];
  const prompt = `You are a nutritionist specializing in Indian/Maharashtrian diets. Replace this meal with a different, culturally relevant ${dietPreference?.replace(/_/g, " ") || "balanced"} Indian/Maharashtrian meal with similar calories (${currentMeal?.calories || 400} kcal). 
Current meal: ${currentMeal?.name || mealType}.
Respond ONLY in JSON format (no markdown):
{ "name": "New Meal Name (e.g., Sprouted Matki Usal with Roti, Vegetable Poha, Veg Upma, etc.)", "calories": <integer>, "protein": <number>, "carbs": <number>, "fat": <number> }`;

  let newMeal: Record<string, unknown>;
  try {
    const completion = await openai.chat.completions.create({
      model: aiModel,
      messages: [{ role: "user", content: prompt }],
    });
    try {
      newMeal = JSON.parse(cleanJson(completion.choices[0]?.message?.content ?? "{}"));
    } catch {
      newMeal = { name: "Grilled chicken with vegetables", calories: 400, protein: 35, carbs: 30, fat: 10 };
    }
  } catch (error) {
    console.log("AI service unavailable for meal swap, using fallback:", error);
    // Fallback meal suggestions
    const mealSwaps: Record<string, Record<string, unknown>> = {
      breakfast: { name: "Oatmeal with berries and almonds", calories: 350, protein: 12, carbs: 45, fat: 8 },
      lunch: { name: "Grilled chicken with quinoa salad", calories: 500, protein: 35, carbs: 55, fat: 10 },
      dinner: { name: "Baked salmon with roasted vegetables", calories: 550, protein: 40, carbs: 40, fat: 18 },
      snacks: { name: "Greek yogurt with honey", calories: 150, protein: 15, carbs: 20, fat: 2 }
    };
    newMeal = mealSwaps[mealType] || { name: "Healthy balanced meal", calories: 400, protein: 25, carbs: 45, fat: 10 };
  }

  try {
    const updatedDays = days.map((d: any) => d.day === day ? { ...d, [mealType]: newMeal } : d);
    const updatedGroceries = JSON.parse(plan.groceryList || "[]");
    if ((newMeal.name as string)?.length) updatedGroceries.push(newMeal.name);
    const [updated] = await db.update(dietPlansTable).set({
      planData: JSON.stringify(updatedDays),
      groceryList: JSON.stringify(updatedGroceries),
    }).where(eq(dietPlansTable.id, plan.id)).returning();
    res.json({ meal: newMeal, plan: updated });
  } catch {
    res.status(500).json({ error: "Failed to update meal swap." });
  }
});

// Delete diet plan endpoint
router.delete("/plans/:id", async (req: AuthRequest, res) => {
  try {
    const id = parseInt(String(req.params.id));
    const [plan] = await db.select().from(dietPlansTable).where(eq(dietPlansTable.id, id)).limit(1);
    if (!plan || plan.userId !== req.userId!) {
      res.status(404).json({ error: "Plan not found" });
      return;
    }
    await db.delete(dietPlansTable).where(eq(dietPlansTable.id, id));
    res.status(204).send();
  } catch (err) {
    console.error("Failed to delete diet plan:", err);
    res.status(500).json({ error: "Failed to delete diet plan" });
  }
});

// Get recipe endpoint
router.post("/recipe", async (req: AuthRequest, res) => {
  const { foodName } = req.body;
  if (!foodName) {
    res.status(400).json({ error: "foodName is required." });
    return;
  }

  const prompt = `You are a professional chef and nutritionist specializing in healthy Indian and Maharashtrian food. Create a detailed, healthy recipe for:
Food Name: ${foodName}

Provide the response in this EXACT JSON format (no markdown, just JSON):
{
  "foodName": "${foodName}",
  "prepTime": "e.g. 10 mins",
  "cookTime": "e.g. 20 mins",
  "servings": "e.g. 2 servings",
  "difficulty": "e.g. Easy",
  "calories": 300,
  "ingredients": [
    { "name": "Ingredient 1", "amount": "1 cup" },
    { "name": "Ingredient 2", "amount": "2 tbsp" }
  ],
  "instructions": [
    "Step 1 details",
    "Step 2 details"
  ],
  "nutritionalBenefits": "Brief description of the health benefits of this meal."
}`;

  try {
    const completion = await openai.chat.completions.create({
      model: aiModel,
      messages: [{ role: "user", content: prompt }],
    });
    const content = completion.choices[0]?.message?.content ?? "{}";
    const cleanContent = cleanJson(content);
    const recipe = JSON.parse(cleanContent);
    res.json(recipe);
  } catch (error) {
    console.log("AI service unavailable for recipe, using fallback:", error);
    res.json({
      foodName: foodName,
      prepTime: "10 mins",
      cookTime: "15 mins",
      servings: "2 servings",
      difficulty: "Easy",
      calories: 300,
      ingredients: [
        { name: "Main ingredient for " + foodName, amount: "As needed" },
        { name: "Onion", amount: "1 medium, finely chopped" },
        { name: "Tomato", amount: "1 small, chopped" },
        { name: "Green chili & Ginger paste", amount: "1 tsp" },
        { name: "Mustard & Cumin seeds", amount: "1/2 tsp each" },
        { name: "Turmeric powder (Haldi)", amount: "1/4 tsp" },
        { name: "Oil or Ghee", amount: "1-2 tsp" },
        { name: "Coriander leaves & Lemon", amount: "For garnishing" }
      ],
      instructions: [
        `Clean and prepare the primary ingredients for ${foodName}.`,
        "Heat oil or ghee in a pan on medium heat. Add mustard seeds and cumin seeds, letting them splutter.",
        "Add green chilies, ginger paste, and chopped onions. Sauté until onions turn translucent.",
        "Add chopped tomatoes and spices (turmeric, salt). Cook until soft.",
        `Add the main ingredient for ${foodName}. Stir well to combine.`,
        "Cover and cook on low heat for 5-10 minutes. Garnish with fresh coriander and a squeeze of fresh lemon juice.",
        "Serve hot and enjoy your healthy meal!"
      ],
      nutritionalBenefits: "This traditional dish is rich in fiber, minerals, and healthy complex carbohydrates, making it easy to digest and perfect for sustained energy."
    });
  }
});

export default router;
