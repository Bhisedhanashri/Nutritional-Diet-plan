import { Router } from "express";
import { db, profilesTable, eq } from "@workspace/db";
import { CreateOrUpdateProfileBody } from "@workspace/api-zod";
import { requireAuth, AuthRequest } from "../lib/auth.js";
import { logger } from "../lib/logger.js";

const router = Router();

router.use(requireAuth);

router.get("/", async (req: AuthRequest, res) => {
  try {
    const [profile] = await db.select().from(profilesTable).where(eq(profilesTable.userId, req.userId!)).limit(1);
    if (!profile) {
      res.status(404).json({ error: "Profile not found" });
      return;
    }
    res.json(profile);
  } catch (err) {
    logger.error({ err, userId: req.userId }, "Failed to fetch profile");
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});

router.post("/", async (req: AuthRequest, res) => {
  try {
    const parse = CreateOrUpdateProfileBody.safeParse(req.body);
    if (!parse.success) {
      logger.warn({ userId: req.userId, errors: parse.error.errors }, "Invalid profile data");
      res.status(400).json({ error: "Invalid profile data", details: parse.error.errors });
      return;
    }
    const data = parse.data;

    // Calculate BMR and daily calorie target
    const bmr = data.gender === "male"
      ? 10 * data.weightKg + 6.25 * data.heightCm - 5 * data.age + 5
      : 10 * data.weightKg + 6.25 * data.heightCm - 5 * data.age - 161;

    const activityMultipliers: Record<string, number> = {
      sedentary: 1.2,
      lightly_active: 1.375,
      moderately_active: 1.55,
      very_active: 1.725,
      extra_active: 1.9,
    };
    const tdee = bmr * (activityMultipliers[data.activityLevel] || 1.55);
    const goalAdjustments: Record<string, number> = {
      weight_loss: -500,
      muscle_gain: 300,
      maintenance: 0,
      improve_health: 0,
    };
    const dailyCalorieTarget = Math.round(tdee + (goalAdjustments[data.goal] || 0));

    const existing = await db.select().from(profilesTable).where(eq(profilesTable.userId, req.userId!)).limit(1);

    let profile;
    if (existing.length > 0) {
      const result = await db
        .update(profilesTable)
        .set({ ...data, dailyCalorieTarget, updatedAt: new Date() })
        .where(eq(profilesTable.userId, req.userId!))
        .returning();
      
      if (!result || result.length === 0) {
        logger.error({ userId: req.userId }, "Profile update returned no rows");
        res.status(500).json({ error: "Failed to update profile" });
        return;
      }
      [profile] = result;
      logger.info({ userId: req.userId, profileId: profile.id }, "Profile updated successfully");
    } else {
      const result = await db
        .insert(profilesTable)
        .values({ ...data, userId: req.userId!, dailyCalorieTarget })
        .returning();
      
      if (!result || result.length === 0) {
        logger.error({ userId: req.userId }, "Profile insert returned no rows");
        res.status(500).json({ error: "Failed to create profile" });
        return;
      }
      [profile] = result;
      logger.info({ userId: req.userId, profileId: profile.id }, "Profile created successfully");
    }

    res.json(profile);
  } catch (err) {
    logger.error({ err, userId: req.userId, body: req.body }, "Failed to save profile");
    
    // Provide more specific error messages
    if (err instanceof Error) {
      if (err.message.includes("UNIQUE constraint")) {
        res.status(409).json({ error: "Profile already exists for this user" });
      } else if (err.message.includes("FOREIGN KEY")) {
        res.status(400).json({ error: "Invalid user reference" });
      } else {
        res.status(500).json({ error: "Failed to save profile", message: err.message });
      }
    } else {
      res.status(500).json({ error: "Failed to save profile" });
    }
  }
});

export default router;
