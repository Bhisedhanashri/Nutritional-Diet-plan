import { 
  useGetTodayLog, 
  useGetProfile, 
  useListWeightLogs,
  useLogWater,
  getGetTodayLogQueryKey,
  useListDietPlans,
  useGetDietPlan
} from "@workspace/api-client-react";
import { getAuthHeaders } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Activity, Flame, Droplets, UtensilsCrossed, 
  Plus, MessageSquare, Timer, Shield, Search, Sparkles,
  Hash, Utensils, Scale, Salad, Stethoscope, MessageSquareMore, Check
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { format, parseISO } from "date-fns";
import { useUser } from "@clerk/react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { api } from "@/lib/api-direct";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

function AnimatedNumber({ value }: { value: number }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let start = displayValue;
    const end = value;
    if (start === end) return;
    const duration = 800; // ms
    let startTime: number | null = null;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setDisplayValue(Math.floor(progress * (end - start) + start));
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [value]);

  return <>{displayValue.toLocaleString()}</>;
}

export default function Dashboard() {
  const { user } = useUser();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const headers = { request: { headers: getAuthHeaders() } };

  interface Recipe {
    foodName: string;
    prepTime: string;
    cookTime: string;
    servings: string;
    difficulty: string;
    calories: number;
    ingredients: { name: string; amount: string }[];
    instructions: string[];
    nutritionalBenefits: string;
  }

  const [recipeOpen, setRecipeOpen] = useState(false);
  const [recipeLoading, setRecipeLoading] = useState(false);
  const [recipeData, setRecipeData] = useState<Recipe | null>(null);

  const handleFetchRecipe = async (foodName: string) => {
    setRecipeLoading(true);
    setRecipeOpen(true);
    setRecipeData(null);
    try {
      const response = await api.post("/api/diet/recipe", { foodName });
      setRecipeData(response as any);
    } catch (err) {
      console.error("Failed to fetch recipe", err);
      toast({ title: "Error", description: "Failed to load recipe.", variant: "destructive" });
      setRecipeOpen(false);
    } finally {
      setRecipeLoading(false);
    }
  };

  const { data: log, isLoading: logLoading } = useGetTodayLog(headers);
  const { data: profile, isLoading: profileLoading } = useGetProfile(headers);
  const { data: weights, isLoading: weightsLoading } = useListWeightLogs(headers);
  const { data: plans, isLoading: plansLoading } = useListDietPlans(headers);

  const safePlans = Array.isArray(plans) ? plans : [];
  const recentPlanId = safePlans.length > 0 ? safePlans[0].id : null;

  const { data: activePlan, isLoading: planLoading } = useGetDietPlan(
    recentPlanId ?? 0,
    {
      ...headers,
      query: {
        enabled: !!recentPlanId
      } as any
    }
  );

  // Parse today's diet plan recommendation
  let todayDietMeals: any = null;
  const todayWeekdayName = format(new Date(), "EEEE");
  
  if (activePlan && (activePlan as any).planData) {
    let rawData = (activePlan as any).planData;
    if (typeof rawData === "string") {
      try {
        rawData = JSON.parse(rawData);
      } catch (e) {
        console.error("Failed to parse diet planData", e);
      }
    }
    
    if (Array.isArray(rawData)) {
      const dayData = rawData.find((d: any) => d && d.day === todayWeekdayName);
      if (dayData) {
        const { day, ...meals } = dayData;
        todayDietMeals = meals;
      }
    } else if (rawData && typeof rawData === "object" && rawData[todayWeekdayName]) {
      todayDietMeals = rawData[todayWeekdayName];
    }
  }
  
  const logWater = useLogWater(headers);
  const [waterSplashes, setWaterSplashes] = useState<{ id: number }[]>([]);

  const isLoading = logLoading || profileLoading || weightsLoading;

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-8">
        <div className="h-10 w-48 bg-muted rounded-lg"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-64 bg-muted rounded-2xl"></div>
          <div className="h-64 bg-muted rounded-2xl"></div>
          <div className="h-64 bg-muted rounded-2xl"></div>
        </div>
      </div>
    );
  }

  const displayName = user?.firstName || user?.fullName || user?.emailAddresses?.[0]?.emailAddress?.split("@")[0] || "User";

  // Greetings logic
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return { text: "Good morning", emoji: "🌅" };
    if (hour < 17) return { text: "Good afternoon", emoji: "👏" };
    if (hour < 22) return { text: "Good evening", emoji: "🌇" };
    return { text: "Good night", emoji: "🌙" };
  };
  const greeting = getGreeting();

  const targetCalories = profile?.dailyCalorieTarget || 2000;
  const consumedCalories = log?.totalCalories || 0;
  const percentage = Math.min(100, Math.round((consumedCalories / targetCalories) * 100));
  
  const targetProtein = 120;
  const targetCarbs = 250;
  const targetFat = 65;

  const macros = [
    { label: "Protein", value: log?.totalProteinGrams || 0, target: targetProtein, color: "bg-blue-500" },
    { label: "Carbs", value: log?.totalCarbsGrams || 0, target: targetCarbs, color: "bg-emerald-500" },
    { label: "Fat", value: log?.totalFatGrams || 0, target: targetFat, color: "bg-amber-500" },
  ];

  const targetWater = log?.waterTarget || 2500;
  const currentWater = log?.totalWaterMl || 0;
  const waterPercentage = Math.min(100, Math.round((currentWater / targetWater) * 100));

  const weightData = (Array.isArray(weights) ? weights : [])
    .slice(0, 7)
    .reverse()
    .map(w => ({
      date: format(parseISO(w.loggedAt), "MMM dd"),
      weight: w.weightKg,
    }));

  const handleQuickWater = () => {
    const newId = Date.now();
    setWaterSplashes(prev => [...prev, { id: newId }]);
    setTimeout(() => {
      setWaterSplashes(prev => prev.filter(w => w.id !== newId));
    }, 1000);

    logWater.mutate({ data: { amountMl: 250 } }, {
      onSuccess: () => {
        toast({ title: "Water logged!", description: "+250ml added to today's log." });
        queryClient.invalidateQueries({ queryKey: getGetTodayLogQueryKey() });
      }
    });
  };

  const formattedDate = format(new Date(), "EEEE, MMMM d");

  return (
    <div className="space-y-8 pb-12">
      {/* Welcome Header */}
      <div className="space-y-1">
        <p className="text-sm font-bold text-muted-foreground flex items-center gap-1.5 uppercase tracking-wider">
          🌤️ {formattedDate}
        </p>
        <h1 className="text-3xl font-display font-bold">
          {greeting.text}, <span className="text-green-500">{displayName}</span> 👋
        </h1>
        <p className="text-muted-foreground">Here's your nutrition overview for today.</p>
      </div>

      {/* Overview Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Calories Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="h-full border border-border/30 hover:border-amber-500/20 shadow-lg shadow-black/5 bg-gradient-to-br from-card to-card/50 border-t-4 border-t-amber-500 overflow-hidden hover:-translate-y-1 hover:shadow-xl transition-all duration-300 ease-out cursor-default">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg text-foreground/80 font-semibold">
                <Flame className="w-5 h-5 text-orange-500" /> Calories
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center pb-6 pt-2">
              <div className="relative w-40 h-40 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" className="stroke-muted fill-none" strokeWidth="7" />
                  <motion.circle 
                    cx="50" cy="50" r="40" 
                    className="stroke-primary fill-none" 
                    strokeWidth="7" 
                    initial={{ strokeDashoffset: 251 }}
                    animate={{ strokeDashoffset: 251 - (percentage / 100) * 251 }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                    strokeDasharray="251" 
                    strokeLinecap="round" 
                  />
                </svg>
                <div className="absolute text-center">
                  <span className="text-4xl font-display font-bold text-foreground">
                    <AnimatedNumber value={consumedCalories} />
                  </span>
                  <span className="text-xs block text-muted-foreground mt-0.5">/ {targetCalories} kcal</span>
                </div>
              </div>
              <p className="mt-4 text-sm font-medium text-muted-foreground">
                {targetCalories - consumedCalories > 0 
                  ? `${targetCalories - consumedCalories} kcal remaining`
                  : "Daily goal reached!"}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Macronutrients Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="h-full border border-border/30 hover:border-indigo-500/20 shadow-lg shadow-black/5 border-t-4 border-t-indigo-500 overflow-hidden hover:-translate-y-1 hover:shadow-xl transition-all duration-300 ease-out cursor-default">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg text-foreground/80 font-semibold">
                <Activity className="w-5 h-5 text-indigo-500" /> Macronutrients
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5 pt-3">
              {macros.map(m => (
                <div key={m.label} className="space-y-1.5">
                  <div className="flex justify-between text-sm">
                    <span className="font-semibold text-foreground/80">{m.label}</span>
                    <span className="text-muted-foreground">{m.value}g / {m.target}g</span>
                  </div>
                  <div className="h-2.5 bg-secondary rounded-full overflow-hidden">
                    <motion.div 
                      className={`h-full ${m.color} rounded-full`} 
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, (m.value / m.target) * 100)}%` }}
                      transition={{ duration: 1.2, ease: "easeOut" }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Hydration Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="h-full border border-border/30 hover:border-blue-500/20 shadow-lg shadow-black/5 border-t-4 border-t-blue-500 overflow-hidden relative hover:-translate-y-1 hover:shadow-xl transition-all duration-300 ease-out cursor-default">
            <div className="absolute inset-0 bg-blue-500/5 -z-10" />
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg text-foreground/80 font-semibold">
                <Droplets className="w-5 h-5 text-blue-500" /> Hydration
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center pt-2 pb-6 relative">
              <div className="text-5xl font-display font-bold text-blue-500">
                <AnimatedNumber value={currentWater} /> <span className="text-xl text-blue-400 font-semibold">ml</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1 mb-4">Target: {targetWater} ml/day</p>
              
              <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 text-xs font-bold mb-5 shadow-sm">
                {waterPercentage}% hydrated
              </div>
              
              <div className="relative">
                <Button 
                  variant="link" 
                  onClick={handleQuickWater}
                  className="text-blue-500 hover:text-blue-600 hover:no-underline font-semibold flex items-center gap-1.5 p-0 h-auto"
                >
                  <Plus className="w-4 h-4" /> Log water
                </Button>
                <AnimatePresence>
                  {waterSplashes.map(splash => (
                    <motion.span
                      key={splash.id}
                      initial={{ opacity: 1, y: -5, scale: 0.8, x: 20 }}
                      animate={{ opacity: 0, y: -55, scale: 1.4, x: 30 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      className="absolute text-blue-500 font-bold text-sm pointer-events-none select-none whitespace-nowrap"
                    >
                      +250ml 💧
                    </motion.span>
                  ))}
                </AnimatePresence>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* QUICK ACTIONS Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground tracking-widest uppercase">
          <Hash className="w-4 h-4" /> Quick Actions
        </div>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          {[
            { href: "/tracker", label: "Log Meal", icon: Utensils, bg: "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/50 hover:bg-emerald-100/50", text: "text-emerald-500" },
            { href: "/diet-plan", label: "Diet Plan", icon: Salad, bg: "bg-green-50/50 dark:bg-green-950/20 border-green-100 dark:border-green-900/50 hover:bg-green-100/50", text: "text-green-500" },
            { href: "/disease-diet", label: "Disease Diet", icon: Stethoscope, bg: "bg-rose-50/50 dark:bg-rose-950/20 border-rose-100 dark:border-rose-900/50 hover:bg-rose-100/50", text: "text-rose-500" },
            { href: "/food-checker", label: "Food Check", icon: Search, bg: "bg-blue-50/50 dark:bg-blue-950/20 border-blue-100 dark:border-blue-900/50 hover:bg-blue-100/50", text: "text-blue-500" },
            { href: "/fasting", label: "Fasting", icon: Timer, bg: "bg-amber-50/50 dark:bg-amber-950/20 border-amber-100 dark:border-amber-900/50 hover:bg-amber-100/50", text: "text-amber-500" },
            { href: "/voice-agent", label: "AI Coach", icon: MessageSquareMore, bg: "bg-violet-50/50 dark:bg-violet-950/20 border-violet-100 dark:border-violet-900/50 hover:bg-violet-100/50", text: "text-violet-500" },
          ].map(act => (
            <Link key={act.label} href={act.href}>
              <div className={`flex flex-col items-center justify-center p-4 border rounded-2xl cursor-pointer transition-all hover:scale-105 hover:-translate-y-0.5 active:scale-95 duration-200 ease-out shadow-sm hover:shadow group ${act.bg}`}>
                <div className={`w-10 h-10 rounded-full bg-background flex items-center justify-center mb-2.5 ${act.text} shadow-sm group-hover:scale-110 group-hover:rotate-6 transition-transform duration-200`}>
                  <act.icon className="w-5 h-5" />
                </div>
                <span className="text-sm font-semibold text-foreground/80">{act.label}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Bottom Row - Meals, AI Diet Plan & Weight Chart */}
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Today's Meals */}
          <Card className="border-0 shadow-lg shadow-black/5">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-xl font-bold">Today's Meals</CardTitle>
                <CardDescription className="text-sm">{log?.meals?.length || 0} meals logged</CardDescription>
              </div>
              <Link href="/tracker">
                <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-full px-4 font-semibold shadow-sm flex items-center gap-1">
                  <Plus className="w-4 h-4" /> Log Meal
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {log?.meals && log.meals.length > 0 ? (
                <div className="space-y-3.5">
                  {log.meals.map(meal => (
                    <div key={meal.id} className="flex justify-between items-center p-3 rounded-xl hover:bg-secondary/40 transition-colors border border-transparent hover:border-border">
                      <div>
                        <p className="font-semibold capitalize text-foreground/80">{meal.foodName}</p>
                        <p className="text-xs text-muted-foreground capitalize">{meal.mealType} • {meal.portionSize}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-emerald-600 dark:text-emerald-400">{meal.calories} kcal</p>
                        <p className="text-xs text-muted-foreground">P: {meal.proteinGrams}g • C: {meal.carbsGrams}g</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 flex flex-col items-center">
                  <div className="w-14 h-14 rounded-full bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/50 flex items-center justify-center text-emerald-500 shadow-sm">
                    <Utensils className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-foreground mt-3.5">No meals logged yet</h3>
                  <p className="text-xs text-muted-foreground mt-1 mb-5">Start by describing what you ate</p>
                  <Link href="/tracker">
                    <Button variant="outline" size="sm" className="rounded-full shadow-sm hover:bg-secondary/50 font-semibold gap-1.5 border border-border/80 text-xs">
                      <Sparkles className="w-3.5 h-3.5 text-primary" /> AI Meal Analyzer
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Today's Recommended AI Menu */}
          <Card className="border-0 shadow-lg shadow-black/5 relative overflow-hidden bg-gradient-to-br from-card to-emerald-500/5">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-emerald-500 animate-pulse" />
                  Today's AI Diet Menu
                </CardTitle>
                <CardDescription className="text-sm">Based on your active plan</CardDescription>
              </div>
              <Link href="/diet-plan">
                <Button size="sm" variant="outline" className="rounded-full px-4 font-semibold shadow-sm text-xs">
                  View Full Week
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {plansLoading || planLoading ? (
                <div className="space-y-4 animate-pulse">
                  <div className="h-12 bg-muted rounded-xl"></div>
                  <div className="h-12 bg-muted rounded-xl"></div>
                  <div className="h-12 bg-muted rounded-xl"></div>
                </div>
              ) : todayDietMeals ? (
                <div className="space-y-3.5">
                  {Object.entries(todayDietMeals).map(([mealType, details]: [string, any]) => {
                    const mealName = typeof details === "string" ? details : details?.name;
                    const calories = typeof details === "string" ? null : details?.calories;
                    if (!mealName) return null;
                    return (
                      <div 
                        key={mealType} 
                        onClick={() => handleFetchRecipe(mealName)}
                        className="flex justify-between items-center p-3 rounded-xl bg-background/50 border border-border/50 hover:border-primary/30 hover:bg-background hover:scale-[1.01] transition-all duration-200 cursor-pointer group/meal shadow-sm"
                        title="Click to view recipe"
                      >
                        <div>
                          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{mealType}</p>
                          <p className="font-semibold text-foreground/80 mt-0.5 group-hover/meal:text-primary transition-colors">{mealName}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {calories && (
                            <span className="text-sm bg-primary/10 text-primary px-2.5 py-1 rounded-full font-bold">
                              {calories} kcal
                            </span>
                          )}
                          <span className="text-[10px] font-bold text-muted-foreground group-hover/meal:text-primary transition-colors border border-border/80 rounded-md px-2 py-0.5 bg-background shadow-xs shrink-0">
                            Recipe 🍳
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-10 flex flex-col items-center">
                  <div className="w-14 h-14 rounded-full bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/50 flex items-center justify-center text-emerald-500 shadow-sm">
                    <Salad className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-foreground mt-3.5">No active diet plan</h3>
                  <p className="text-xs text-muted-foreground mt-1 mb-5">Generate a plan to see today's recommendations</p>
                  <Link href="/diet-plan">
                    <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-full px-5 font-semibold shadow-sm">
                      Generate AI Plan
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Weight Trend */}
        <Card className="border-0 shadow-lg shadow-black/5">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-xl font-bold">Weight Trend</CardTitle>
              <CardDescription className="text-sm">Last 7 entries</CardDescription>
            </div>
            <Link href="/tracker">
              <Button variant="outline" size="sm" className="rounded-full px-4 border border-border/80 text-foreground/80 hover:bg-secondary/50 font-semibold shadow-sm flex items-center gap-1">
                <Scale className="w-4 h-4 opacity-75" /> Log Weight
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="h-[250px]">
            {weightData.length > 1 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weightData}>
                  <XAxis dataKey="date" stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis domain={['auto', 'auto']} stroke="#888888" fontSize={11} tickLine={false} axisLine={false} width={30} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="weight" 
                    stroke="var(--color-primary)" 
                    strokeWidth={2.5} 
                    dot={{ r: 3.5, fill: "var(--color-primary)", strokeWidth: 1.5, stroke: "#fff" }} 
                    activeDot={{ r: 5.5, strokeWidth: 0 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-center flex-col py-10">
                <div className="w-14 h-14 rounded-full bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/50 flex items-center justify-center text-emerald-500 shadow-sm">
                  <Scale className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-foreground mt-3.5">No weight data yet</h3>
                <p className="text-xs text-muted-foreground mt-1 mb-5">Log your weight daily to see trends</p>
                <Link href="/tracker">
                  <Button variant="outline" size="sm" className="rounded-full shadow-sm hover:bg-secondary/50 font-semibold gap-1.5 border border-border/80 text-xs">
                    <Scale className="w-3.5 h-3.5 opacity-75" /> Log Weight
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recipe Dialog */}
      <Dialog open={recipeOpen} onOpenChange={setRecipeOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl border-0 shadow-2xl p-6 sm:p-8 bg-card">
          {recipeLoading ? (
            <div className="space-y-6 py-4 animate-pulse">
              <div className="h-7 bg-muted rounded-lg w-2/3"></div>
              <div className="flex gap-4">
                <div className="h-10 bg-muted rounded-xl w-24"></div>
                <div className="h-10 bg-muted rounded-xl w-24"></div>
                <div className="h-10 bg-muted rounded-xl w-24"></div>
              </div>
              <div className="space-y-3 pt-4 border-t">
                <div className="h-6 bg-muted rounded w-1/4"></div>
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-4 bg-muted rounded w-5/6"></div>
              </div>
              <div className="space-y-3 pt-4 border-t">
                <div className="h-6 bg-muted rounded w-1/3"></div>
                <div className="h-16 bg-muted rounded w-full"></div>
              </div>
            </div>
          ) : recipeData ? (
            <div className="space-y-6">
              <DialogHeader className="text-left border-b pb-4">
                <DialogTitle className="text-2xl font-display font-bold text-foreground">
                  {recipeData.foodName}
                </DialogTitle>
                <DialogDescription className="text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
                  ~{recipeData.calories} Calories • Healthy Indian Recipe
                </DialogDescription>
              </DialogHeader>

              {/* Recipe Meta Info */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-secondary/30 p-4 rounded-xl border border-border/50">
                <div className="text-center sm:text-left">
                  <div className="text-xs text-muted-foreground font-semibold">Prep Time</div>
                  <div className="font-bold text-sm text-foreground mt-0.5">{recipeData.prepTime}</div>
                </div>
                <div className="text-center sm:text-left">
                  <div className="text-xs text-muted-foreground font-semibold">Cook Time</div>
                  <div className="font-bold text-sm text-foreground mt-0.5">{recipeData.cookTime}</div>
                </div>
                <div className="text-center sm:text-left">
                  <div className="text-xs text-muted-foreground font-semibold">Servings</div>
                  <div className="font-bold text-sm text-foreground mt-0.5">{recipeData.servings}</div>
                </div>
                <div className="text-center sm:text-left">
                  <div className="text-xs text-muted-foreground font-semibold">Difficulty</div>
                  <div className="font-bold text-sm text-foreground mt-0.5">{recipeData.difficulty}</div>
                </div>
              </div>

              {/* Ingredients */}
              <div className="space-y-3">
                <h4 className="font-bold text-lg text-foreground flex items-center gap-2">
                  <Check className="w-5 h-5 text-primary" /> Ingredients
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {recipeData.ingredients?.map((ing, idx) => (
                    <div key={idx} className="flex justify-between items-center p-2.5 rounded-lg bg-secondary/20 border border-border/30 text-sm">
                      <span className="font-medium text-foreground">{ing.name}</span>
                      <span className="text-muted-foreground font-semibold bg-background px-2 py-0.5 rounded-md border text-xs">{ing.amount}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Instructions */}
              <div className="space-y-3 border-t pt-5">
                <h4 className="font-bold text-lg text-foreground flex items-center gap-2">
                  Instructions
                </h4>
                <div className="space-y-4">
                  {recipeData.instructions?.map((step, idx) => (
                    <div key={idx} className="flex gap-4 items-start">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0 mt-0.5 border border-primary/20">
                        {idx + 1}
                      </span>
                      <p className="text-sm text-muted-foreground leading-relaxed">{step}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Nutritional Benefits */}
              {recipeData.nutritionalBenefits && (
                <div className="bg-primary/5 border border-primary/10 rounded-xl p-4 mt-2">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-primary mb-1">Nutritional Benefits</h5>
                  <p className="text-sm text-muted-foreground leading-relaxed">{recipeData.nutritionalBenefits}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Failed to load recipe content.
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
