import { useState } from "react";
import { useGetProfile, useListDietPlans, useGenerateDietPlan, useGetDietPlan } from "@workspace/api-client-react";
import { getAuthHeaders } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { CalendarRange, Sparkles, Check, ChevronRight, FileText, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format, parseISO } from "date-fns";
import { Link } from "wouter";
import { api } from "@/lib/api-direct";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

export default function DietPlan() {
  const { toast } = useToast();
  const headers = { request: { headers: getAuthHeaders() } };
  
  const { data: profile } = useGetProfile(headers);
  const { data: plans, isLoading: loadingPlans, refetch } = useListDietPlans(headers);
  const generatePlan = useGenerateDietPlan(headers);

  const [activePlanId, setActivePlanId] = useState<number | null>(null);
  const [selectedDay, setSelectedDay] = useState<string>(() => {
    const todayStr = format(new Date(), "EEEE");
    const validDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    return validDays.includes(todayStr) ? todayStr : "Monday";
  });
  const [deletingId, setDeletingId] = useState<number | null>(null);

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

  const handleDelete = async (e: React.MouseEvent, planId: number) => {
    e.stopPropagation();
    
    if (!confirm("Are you sure you want to delete this diet plan?")) {
      return;
    }

    setDeletingId(planId);
    try {
      await api.delete(`/api/diet/plans/${planId}`);
      toast({ title: "Plan deleted", description: "The diet plan has been removed from history." });
      
      if (planId === currentActivePlanId) {
        const remainingPlans = safePlans.filter(p => p.id !== planId);
        setActivePlanId(remainingPlans.length > 0 ? remainingPlans[0].id : null);
      }
      
      refetch();
    } catch (err) {
      console.error("Failed to delete plan", err);
      toast({ title: "Error", description: "Failed to delete diet plan.", variant: "destructive" });
    } finally {
      setDeletingId(null);
    }
  };

  const handleGenerate = () => {
    if (!profile?.id) {
      toast({ title: "Profile incomplete", description: "Please complete your profile first." });
      return;
    }
    generatePlan.mutate({ data: { profileId: profile.id } }, {
      onSuccess: (data) => {
        toast({ title: "Success!", description: "New 7-day AI plan generated." });
        refetch();
        setActivePlanId(data.id);
      }
    });
  };

  const safePlans = Array.isArray(plans) ? plans : [];

  const currentActivePlanId = activePlanId ?? (safePlans.length > 0 ? safePlans[0].id : null);

  const { data: fullActivePlan, isLoading: loadingFullPlan } = useGetDietPlan(
    currentActivePlanId ?? 0,
    {
      ...headers,
      query: {
        enabled: !!currentActivePlanId
      } as any
    }
  );

  const activePlan = fullActivePlan || null;
  
  // Safely parse and normalize the planData if it exists
  let parsedPlanData: any = null;
  if (activePlan && (activePlan as any).planData) {
    let rawData = (activePlan as any).planData;
    if (typeof rawData === "string") {
      try {
        rawData = JSON.parse(rawData);
      } catch(e) { 
        console.error("Failed to parse plan data string", e); 
      }
    }
    
    // Normalize rawData to a map of day -> meals
    if (Array.isArray(rawData)) {
      parsedPlanData = {};
      for (const item of rawData) {
        if (item && typeof item === "object" && item.day) {
          const { day, ...meals } = item;
          parsedPlanData[day] = meals;
        }
      }
    } else if (rawData && typeof rawData === "object") {
      parsedPlanData = rawData;
    }
  }

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold">Your Diet Plans</h1>
          <p className="text-muted-foreground mt-1">Personalized weekly meals designed by AI.</p>
        </div>
        <Button 
          onClick={handleGenerate} 
          disabled={generatePlan.isPending}
          size="lg"
          className="shadow-xl shadow-primary/20 bg-gradient-to-r from-primary to-accent border-0"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          {generatePlan.isPending ? "Generating..." : "Generate New Plan"}
        </Button>
      </div>

      {!loadingPlans && plans?.length === 0 && !generatePlan.isPending && (
        <Card className="border-dashed border-2 bg-transparent shadow-none mt-8 text-center py-16">
          <CalendarRange className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
          <h2 className="text-xl font-semibold mb-2">No Plans Yet</h2>
          <p className="text-muted-foreground mb-6">Generate your first AI-powered weekly meal plan based on your profile goals.</p>
          <Button onClick={handleGenerate} variant="outline">Generate First Plan</Button>
        </Card>
      )}

      {loadingPlans && <div className="animate-pulse h-96 bg-muted rounded-2xl mt-8"></div>}

      {(activePlanId || currentActivePlanId) && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Sidebar / List of Plans */}
          <div className="lg:col-span-1 space-y-4">
            <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground px-2">History</h3>
            <div className="space-y-2">
              {plans?.map(plan => (
                <div key={plan.id} className="relative group">
                  <button
                    onClick={() => setActivePlanId(plan.id)}
                    className={`w-full text-left p-4 pr-10 rounded-xl transition-all border ${
                      plan.id === currentActivePlanId
                        ? 'border-primary bg-primary/5 shadow-sm'
                        : 'border-transparent bg-card hover:border-border hover:bg-secondary/50'
                    }`}
                  >
                    <div className="font-semibold text-sm truncate pr-2">{plan.title}</div>
                    <div className="text-xs text-muted-foreground mt-1 flex justify-between">
                      <span>{format(parseISO(plan.createdAt), 'MMM dd, yyyy')}</span>
                      <span className="text-primary font-medium">{plan.dailyCalories} kcal</span>
                    </div>
                  </button>
                  <button
                    onClick={(e) => handleDelete(e, plan.id)}
                    disabled={deletingId === plan.id}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-muted-foreground hover:text-destructive rounded-lg hover:bg-secondary transition-all opacity-50 group-hover:opacity-100 focus:opacity-100 disabled:opacity-50"
                    title="Delete plan"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Active Plan Detail */}
          <div className="lg:col-span-3">
            <Card className="border-0 shadow-xl shadow-black/5 overflow-hidden">
              {loadingFullPlan ? (
                <div className="p-12 text-center">
                  <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-muted rounded w-1/3 mx-auto"></div>
                    <div className="h-4 bg-muted rounded w-1/4 mx-auto"></div>
                    <div className="h-64 bg-muted rounded mt-8"></div>
                  </div>
                </div>
              ) : activePlan ? (
                <>
                  <div className="bg-primary/10 p-6 sm:p-8 flex flex-col md:flex-row justify-between md:items-center gap-4 border-b border-primary/10">
                    <div>
                      <h2 className="text-2xl font-display font-bold text-primary">{activePlan.title}</h2>
                      <p className="text-sm font-medium mt-1 opacity-80">Created on {format(parseISO(activePlan.createdAt), 'MMMM dd, yyyy')}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex gap-4 bg-white/50 dark:bg-black/20 p-3 rounded-xl backdrop-blur-sm">
                        <div className="text-center px-2">
                          <div className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Calories</div>
                          <div className="font-bold text-lg">{activePlan.dailyCalories}</div>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={(e) => handleDelete(e, activePlan.id)}
                        disabled={deletingId === activePlan.id}
                        className="h-12 w-12 border-destructive/20 text-destructive/70 hover:text-destructive hover:bg-destructive/10 hover:border-destructive/40 transition-all rounded-xl backdrop-blur-sm"
                        title="Delete plan"
                      >
                        <Trash2 className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>

                  {parsedPlanData ? (
                    <div className="flex flex-col sm:flex-row h-full">
                      {/* Days Nav */}
                      <div className="sm:w-48 bg-secondary/30 p-4 border-r flex flex-row sm:flex-col gap-2 overflow-x-auto sm:overflow-visible">
                        {days.map(day => {
                          const isToday = format(new Date(), "EEEE") === day;
                          return (
                            <button
                              key={day}
                              onClick={() => setSelectedDay(day)}
                              className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap text-left flex justify-between items-center ${
                                selectedDay === day 
                                  ? 'bg-background shadow-sm text-primary font-semibold' 
                                  : 'text-muted-foreground hover:bg-background/50 hover:text-foreground'
                              }`}
                            >
                              <span>{day}</span>
                              {isToday && (
                                <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">
                                  Today
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {/* Meals for Day */}
                      <div className="flex-1 p-6 sm:p-8">
                        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                          <CalendarRange className="w-5 h-5 text-primary" /> {selectedDay}'s Menu
                        </h3>
                        
                        <div className="space-y-6">
                          {parsedPlanData[selectedDay] ? Object.entries(parsedPlanData[selectedDay]).map(([mealType, details]: [string, any]) => (
                            <motion.div 
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              key={mealType} 
                              className="relative pl-6 before:absolute before:left-0 before:top-2 before:bottom-0 before:w-0.5 before:bg-primary/20"
                            >
                              <div className="absolute left-[-5px] top-2 w-3 h-3 rounded-full bg-primary ring-4 ring-background" />
                              <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-1">{mealType}</h4>
                              {(() => {
                                const mealName = typeof details === 'string' ? details : details.name || JSON.stringify(details);
                                return (
                                  <div 
                                    onClick={() => handleFetchRecipe(mealName)}
                                    className="bg-secondary/30 rounded-xl p-4 border border-border/50 hover:border-primary/30 hover:bg-secondary/50 hover:scale-[1.01] transition-all duration-200 cursor-pointer group/meal relative overflow-hidden"
                                    title="Click to view recipe"
                                  >
                                    <div className="flex justify-between items-start gap-4">
                                      <div>
                                        <p className="font-medium text-lg leading-snug group-hover/meal:text-primary transition-colors">{mealName}</p>
                                        {typeof details !== 'string' && details.calories && (
                                          <p className="text-sm text-primary mt-2 font-semibold">~{details.calories} kcal</p>
                                        )}
                                      </div>
                                      <span className="text-xs font-bold text-muted-foreground group-hover/meal:text-primary transition-colors border border-border/80 rounded-lg px-2.5 py-1 bg-background flex items-center gap-1 shadow-sm shrink-0">
                                        Recipe 🍳
                                      </span>
                                    </div>
                                  </div>
                                );
                              })()}
                            </motion.div>
                          )) : (
                            <p className="text-muted-foreground">No specific meals defined for this format.</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-8 text-center text-muted-foreground">
                      <FileText className="w-12 h-12 mx-auto mb-4 opacity-20" />
                      <p>Plan data format is unsupported or loading.</p>
                    </div>
                  )}
                </>
              ) : (
                <div className="p-8 text-center text-muted-foreground">
                  <FileText className="w-12 h-12 mx-auto mb-4 opacity-20" />
                  <p>Plan data not found.</p>
                </div>
              )}
            </Card>
          </div>

        </div>
      )}

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
