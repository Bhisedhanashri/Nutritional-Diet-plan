import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-direct";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, AlertCircle, Sparkles, CheckCircle, ChevronRight, Shield } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getAuthHeaders } from "@/lib/auth";

const HEALTH_CONDITIONS = [
  { id: "diabetes_type2", label: "Type 2 Diabetes", icon: "🩸", color: "border-red-200 bg-red-50/40 text-red-800 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300" },
  { id: "diabetes_type1", label: "Type 1 Diabetes", icon: "💉", color: "border-red-200 bg-red-50/40 text-red-800 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300" },
  { id: "hypertension", label: "Hypertension (High BP)", icon: "❤️", color: "border-pink-200 bg-pink-50/40 text-pink-850 dark:border-pink-500/20 dark:bg-pink-500/10 dark:text-pink-300" },
  { id: "heart_disease", label: "Heart Disease", icon: "🫀", color: "border-pink-200 bg-pink-50/40 text-pink-850 dark:border-pink-500/20 dark:bg-pink-500/10 dark:text-pink-300" },
  { id: "high_cholesterol", label: "High Cholesterol", icon: "🫁", color: "border-orange-200 bg-orange-50/40 text-orange-800 dark:border-orange-500/20 dark:bg-orange-500/10 dark:text-orange-300" },
  { id: "thyroid", label: "Thyroid Issues", icon: "🦋", color: "border-purple-200 bg-purple-50/40 text-purple-800 dark:border-purple-500/20 dark:bg-purple-500/10 dark:text-purple-300" },
  { id: "pcos", label: "PCOS", icon: "🌸", color: "border-pink-200 bg-pink-50/40 text-pink-850 dark:border-pink-500/20 dark:bg-pink-500/10 dark:text-pink-300" },
  { id: "ibs", label: "IBS / Gut Issues", icon: "🫃", color: "border-yellow-200 bg-yellow-50/40 text-yellow-850 dark:border-yellow-500/20 dark:bg-yellow-500/10 dark:text-yellow-300" },
  { id: "gerd", label: "GERD / Acid Reflux", icon: "🔥", color: "border-orange-200 bg-orange-50/40 text-orange-850 dark:border-orange-500/20 dark:bg-orange-500/10 dark:text-orange-300" },
  { id: "celiac", label: "Celiac / Gluten Issue", icon: "🌾", color: "border-amber-200 bg-amber-50/40 text-amber-850 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300" },
  { id: "lactose", label: "Lactose Intolerance", icon: "🥛", color: "border-blue-200 bg-blue-50/40 text-blue-800 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-300" },
  { id: "gout", label: "Gout", icon: "🦴", color: "border-slate-200 bg-slate-50/40 text-slate-800 dark:border-slate-500/20 dark:bg-slate-500/10 dark:text-slate-300" },
  { id: "kidney_disease", label: "Kidney Disease", icon: "🫘", color: "border-indigo-200 bg-indigo-50/40 text-indigo-850 dark:border-indigo-500/20 dark:bg-indigo-500/10 dark:text-indigo-300" },
  { id: "anemia", label: "Anemia (Low Iron)", icon: "🩺", color: "border-red-200 bg-red-50/40 text-red-800 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300" },
  { id: "osteoporosis", label: "Osteoporosis", icon: "🦷", color: "border-slate-200 bg-slate-50/40 text-slate-850 dark:border-slate-500/20 dark:bg-slate-500/10 dark:text-slate-300" },
];

interface DietPlan { condition: string; foods_to_eat: string[]; foods_to_avoid: string[]; meal_timing: string[]; key_nutrients: string[]; sample_day: { breakfast: string; lunch: string; dinner: string; snacks: string[] }; tips: string[]; }

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

export default function DiseaseDiet() {
  const [selected, setSelected] = useState<string[]>([]);
  const [plan, setPlan] = useState<DietPlan | null>(null);
  const [loading, setLoading] = useState(false);

  const { data: profile } = useQuery({ queryKey: ["profile-disease"], queryFn: () => api.get<any>("/api/profile") });

  function toggle(id: string) {
    setSelected(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
  }

  async function generatePlan() {
    if (selected.length === 0) return;
    setLoading(true);
    setPlan(null);
    try {
      const conditionNames = selected.map(s => HEALTH_CONDITIONS.find(c => c.id === s)?.label ?? s);
      const resp = await fetch(`${BASE}/api/diet/disease-plan`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify({
          conditions: selected,
          conditionNames,
          dietPreference: profile?.dietPreference,
          goal: profile?.goal,
        }),
      });
      const data = await resp.json();
      setPlan(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-display font-bold flex items-center gap-3">
          <Shield className="w-8 h-8 text-primary" /> Disease-Specific Diet
        </h1>
        <p className="text-muted-foreground mt-1">Get an AI-powered diet plan tailored to your health conditions.</p>
      </div>

      {/* Condition selector */}
      <Card className="border-0 shadow-xl">
        <CardHeader>
          <CardTitle>Select Your Health Conditions</CardTitle>
          <CardDescription>Choose all that apply — the AI will create a plan that manages all of them together.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {HEALTH_CONDITIONS.map(c => {
              const isSelected = selected.includes(c.id);
              return (
                <button key={c.id} onClick={() => toggle(c.id)} className={`p-3 rounded-xl border-2 text-left transition-all flex items-center gap-2.5 ${isSelected ? "border-primary bg-primary/5 shadow-sm" : `${c.color} hover:border-primary/40`}`}>
                  <span className="text-xl flex-shrink-0">{c.icon}</span>
                  <span className="text-sm font-medium">{c.label}</span>
                  {isSelected && <CheckCircle className="w-4 h-4 text-primary ml-auto flex-shrink-0" />}
                </button>
              );
            })}
          </div>
          <div className="mt-4 flex items-center gap-3">
            <Button onClick={generatePlan} disabled={selected.length === 0 || loading} className="gap-2">
              <Sparkles className="w-4 h-4" />
              {loading ? "Generating Plan..." : `Generate Plan for ${selected.length || 0} Condition${selected.length !== 1 ? "s" : ""}`}
            </Button>
            {selected.length > 0 && <div className="flex flex-wrap gap-1">{selected.map(s => <Badge key={s} variant="secondary" className="text-xs">{HEALTH_CONDITIONS.find(c => c.id === s)?.label}</Badge>)}</div>}
          </div>
        </CardContent>
      </Card>

      {/* Loading */}
      {loading && (
        <div className="text-center py-12">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">AI is creating your personalized disease diet plan...</p>
        </div>
      )}

      {/* Plan */}
      <AnimatePresence>
        {plan && !loading && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Foods to Eat */}
              <Card className="border-0 shadow-lg border-l-4 border-l-green-400">
                <CardHeader className="pb-3"><CardTitle className="text-base text-green-700 flex items-center gap-2"><CheckCircle className="w-4 h-4" />Foods to Eat</CardTitle></CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {plan.foods_to_eat?.map((f, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm"><span className="text-green-500 mt-0.5">✓</span>{f}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Foods to Avoid */}
              <Card className="border-0 shadow-lg border-l-4 border-l-red-400">
                <CardHeader className="pb-3"><CardTitle className="text-base text-red-700 flex items-center gap-2"><AlertCircle className="w-4 h-4" />Foods to Avoid</CardTitle></CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {plan.foods_to_avoid?.map((f, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm"><span className="text-red-400 mt-0.5">✗</span>{f}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Key Nutrients */}
              <Card className="border-0 shadow-lg">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Heart className="w-4 h-4 text-primary" />
                    Key Nutrients to Focus On
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-3">
                    {plan.key_nutrients?.map((n, i) => {
                      const parts = n.split(/ - |: /);
                      if (parts.length > 1) {
                        const title = parts[0];
                        const desc = parts.slice(1).join(" - ");
                        return (
                          <div key={i} className="p-3 rounded-xl bg-secondary/40 border border-border/50 flex flex-col gap-1 transition-all hover:bg-secondary/60">
                            <span className="font-semibold text-sm text-foreground flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                              {title}
                            </span>
                            <span className="text-xs text-muted-foreground pl-3.5 leading-relaxed">{desc}</span>
                          </div>
                        );
                      }
                      return (
                        <div key={i} className="p-3 rounded-xl bg-secondary/40 border border-border/50 flex items-center gap-2 transition-all hover:bg-secondary/60">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                          <span className="font-semibold text-sm text-foreground">{n}</span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Meal Timing */}
              <Card className="border-0 shadow-lg">
                <CardHeader className="pb-3"><CardTitle className="text-base">Meal Timing Guidelines</CardTitle></CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {plan.meal_timing?.map((t, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm"><ChevronRight className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />{t}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Sample Day */}
            {plan.sample_day && (
              <Card className="border-0 shadow-xl">
                <CardHeader><CardTitle>Sample Day Meal Plan</CardTitle><CardDescription>A practical example day based on your conditions</CardDescription></CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { label: "☀️ Breakfast", content: plan.sample_day.breakfast },
                      { label: "🌤️ Lunch", content: plan.sample_day.lunch },
                      { label: "🌙 Dinner", content: plan.sample_day.dinner },
                      { label: "🍎 Snacks", content: plan.sample_day.snacks?.join(", ") },
                    ].map(meal => (
                      <div key={meal.label} className="p-4 rounded-xl bg-secondary/50">
                        <p className="font-semibold text-sm mb-1">{meal.label}</p>
                        <p className="text-sm text-muted-foreground">{meal.content}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Tips */}
            {plan.tips?.length > 0 && (
              <Card className="border-0 shadow-md bg-primary/5">
                <CardContent className="p-5">
                  <p className="font-semibold mb-3 flex items-center gap-2"><Sparkles className="w-4 h-4 text-primary" />AI Tips for Your Conditions</p>
                  <ul className="space-y-2">
                    {plan.tips.map((t, i) => <li key={i} className="text-sm flex gap-2"><span className="text-primary">•</span>{t}</li>)}
                  </ul>
                </CardContent>
              </Card>
            )}

            <p className="text-xs text-muted-foreground text-center flex items-center justify-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5" />
              This AI-generated plan is for informational purposes only. Always consult your healthcare provider before making dietary changes.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
