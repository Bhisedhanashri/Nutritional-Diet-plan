import { useState } from "react";
import { 
  useLogMeal, 
  useLogWater, 
  useLogWeight,
  LogMealBodyMealType,
  getGetTodayLogQueryKey
} from "@workspace/api-client-react";
import { getAuthHeaders } from "@/lib/auth";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Utensils, Droplets, Scale, Plus, Sparkles, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export default function Tracker() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const headers = { request: { headers: getAuthHeaders() } };
  
  const [activeTab, setActiveTab] = useState<'meal' | 'water' | 'weight'>('meal');

  const logMeal = useLogMeal(headers);
  const logWater = useLogWater(headers);
  const logWeight = useLogWeight(headers);

  // Meal state
  const [mealType, setMealType] = useState<LogMealBodyMealType>("lunch");
  const [foodName, setFoodName] = useState("");
  const [portion, setPortion] = useState("");
  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fat, setFat] = useState("");

  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<{ tips: string; healthScore: number } | null>(null);

  const handleAiEstimate = async () => {
    if (!foodName.trim() || !portion.trim()) {
      toast({ title: "Fields required", description: "Please enter Food Name and Portion Size first.", variant: "destructive" });
      return;
    }
    setAiLoading(true);
    setAiResult(null);
    try {
      const response = await fetch("/api/diet/check-food", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify({ foodName, portionSize: portion }),
      });
      if (!response.ok) throw new Error("AI service error");
      const data = await response.json();
      
      setCalories(String(data.calories || 0));
      setProtein(String(data.proteinGrams || 0));
      setCarbs(String(data.carbsGrams || 0));
      setFat(String(data.fatGrams || 0));
      setAiResult({
        tips: data.tips || "",
        healthScore: data.healthScore || 5
      });
      toast({ title: "AI Estimation complete!", description: "Nutrients automatically populated." });
    } catch (e) {
      toast({ title: "AI Estimation failed", description: "Please enter details manually.", variant: "destructive" });
    } finally {
      setAiLoading(false);
    }
  };

  const handleLogMeal = (e: React.FormEvent) => {
    e.preventDefault();
    logMeal.mutate({
      data: {
        mealType,
        foodName,
        portionSize: portion,
        calories: parseInt(calories),
        proteinGrams: protein ? parseInt(protein) : undefined,
        carbsGrams: carbs ? parseInt(carbs) : undefined,
        fatGrams: fat ? parseInt(fat) : undefined,
      }
    }, {
      onSuccess: () => {
        toast({ title: "Meal logged!", description: `${foodName} added to today's log.` });
        setFoodName(""); setPortion(""); setCalories(""); setProtein(""); setCarbs(""); setFat("");
        setAiResult(null);
        queryClient.invalidateQueries({ queryKey: getGetTodayLogQueryKey() });
      }
    });
  };

  const [weight, setWeight] = useState("");
  const handleLogWeight = (e: React.FormEvent) => {
    e.preventDefault();
    logWeight.mutate({ data: { weightKg: parseFloat(weight) } }, {
      onSuccess: () => {
        toast({ title: "Weight logged!" });
        setWeight("");
      }
    });
  };

  const handleQuickWater = (ml: number) => {
    logWater.mutate({ data: { amountMl: ml } }, {
      onSuccess: () => {
        toast({ title: "Water logged!", description: `+${ml}ml added.` });
        queryClient.invalidateQueries({ queryKey: getGetTodayLogQueryKey() });
      }
    });
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-display font-bold mb-8">Daily Tracker</h1>

      <div className="flex p-1 bg-secondary rounded-2xl mb-8 border border-border/50">
        {[
          { id: 'meal', label: 'Food', icon: Utensils },
          { id: 'water', label: 'Water', icon: Droplets },
          { id: 'weight', label: 'Weight', icon: Scale },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-all ${
                isActive ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive && tab.id === 'water' ? 'text-blue-500' : isActive ? 'text-primary' : ''}`} />
              {tab.label}
            </button>
          )
        })}
      </div>

      <motion.div
        key={activeTab}
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.2 }}
      >
        {activeTab === 'meal' && (
          <Card className="border-0 shadow-xl shadow-black/5">
            <CardHeader>
              <CardTitle>Log a Meal</CardTitle>
              <CardDescription>Keep track of your daily intake</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogMeal} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2 col-span-2">
                    <Label>Meal Type</Label>
                    <div className="flex gap-2">
                      {(["breakfast", "lunch", "dinner", "snack"] as const).map(type => (
                        <button
                          key={type} type="button"
                          onClick={() => setMealType(type)}
                          className={`flex-1 py-2 text-xs font-semibold rounded-lg capitalize border transition-all ${
                            mealType === type ? 'bg-primary text-primary-foreground border-primary' : 'bg-background hover:bg-secondary'
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label>Food Name</Label>
                    <Input value={foodName} onChange={e => setFoodName(e.target.value)} required placeholder="e.g. Grilled Chicken Salad" />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label>Portion Size</Label>
                    <Input value={portion} onChange={e => setPortion(e.target.value)} required placeholder="e.g. 1 bowl, 200g" />
                  </div>

                  <div className="col-span-2 pt-1">
                    <Button 
                      type="button" 
                      onClick={handleAiEstimate} 
                      disabled={aiLoading || !foodName.trim() || !portion.trim()}
                      variant="outline" 
                      className="w-full border-dashed border-primary/40 hover:bg-primary/5 text-primary text-xs font-semibold gap-1.5 py-5"
                    >
                      {aiLoading ? (
                        <>
                          <Loader2 className="w-4.5 h-4.5 animate-spin" />
                          Analyzing nutrition with AI...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          Auto-Fill Nutrition with AI
                        </>
                      )}
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Label>Calories</Label>
                    <Input type="number" value={calories} onChange={e => setCalories(e.target.value)} required placeholder="kcal" />
                  </div>
                  <div className="space-y-2">
                    <Label>Protein (optional, grams)</Label>
                    <Input type="number" value={protein} onChange={e => setProtein(e.target.value)} placeholder="g" />
                  </div>
                  <div className="space-y-2">
                    <Label>Carbohydrates (optional, grams)</Label>
                    <Input type="number" value={carbs} onChange={e => setCarbs(e.target.value)} placeholder="g" />
                  </div>
                  <div className="space-y-2">
                    <Label>Fat (optional, grams)</Label>
                    <Input type="number" value={fat} onChange={e => setFat(e.target.value)} placeholder="g" />
                  </div>
                </div>

                {aiResult && (
                  <div className="mt-3 p-4 rounded-xl bg-primary/5 border border-primary/20 space-y-2">
                    <p className="text-xs font-bold text-primary uppercase tracking-widest flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" /> AI Nutrition Insight
                    </p>
                    <p className="text-sm text-foreground/80 leading-relaxed font-medium">
                      {aiResult.tips}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground">Health Score:</span>
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400">
                        {aiResult.healthScore} / 10
                      </span>
                    </div>
                  </div>
                )}

                <Button type="submit" className="w-full mt-4" disabled={logMeal.isPending}>
                  <Plus className="w-4 h-4 mr-2" /> {logMeal.isPending ? "Logging..." : "Log Meal"}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {activeTab === 'water' && (
          <Card className="border-0 shadow-xl shadow-black/5 overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <Droplets className="w-32 h-32" />
            </div>
            <CardHeader>
              <CardTitle>Hydration</CardTitle>
              <CardDescription>Quick log your water intake</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { ml: 250, label: "1 Glass" },
                  { ml: 500, label: "1 Bottle" },
                  { ml: 1000, label: "1 Liter" },
                ].map(item => (
                  <button
                    key={item.ml}
                    onClick={() => handleQuickWater(item.ml)}
                    disabled={logWater.isPending}
                    className="flex flex-col items-center justify-center p-6 rounded-2xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-950 dark:hover:bg-blue-900 transition-colors border border-blue-100 dark:border-blue-900 group"
                  >
                    <div className="w-12 h-12 rounded-full bg-blue-500/20 text-blue-500 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                      <Droplets className="w-6 h-6" />
                    </div>
                    <span className="font-bold text-lg text-blue-600 dark:text-blue-400">+{item.ml}</span>
                    <span className="text-xs text-blue-500/80 mt-1">{item.label}</span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'weight' && (
          <Card className="border-0 shadow-xl shadow-black/5">
            <CardHeader>
              <CardTitle>Log Weight</CardTitle>
              <CardDescription>Keep track of your body weight changes</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogWeight} className="flex gap-4">
                <div className="flex-1">
                  <Input 
                    type="number" step="0.1" required
                    value={weight} onChange={e => setWeight(e.target.value)}
                    placeholder="Enter current weight in kg"
                    className="text-lg py-6"
                  />
                </div>
                <Button type="submit" size="lg" className="h-auto" disabled={logWeight.isPending}>
                  Save
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </motion.div>
    </div>
  );
}
