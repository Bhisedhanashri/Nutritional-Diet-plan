import { useState, useEffect } from "react";
import {
  useGetProfile,
  useCreateOrUpdateProfile,
  UserProfileBody,
  getGetProfileQueryKey,
} from "@workspace/api-client-react";
import { getAuthHeaders } from "@/lib/auth";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Activity, Target, UserCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function Profile() {
  const { toast } = useToast();
  const headers = { request: { headers: getAuthHeaders() } };

  const {
    data: profile,
    isLoading,
    error,
  } = useGetProfile({
    ...headers,
    query: {
      queryKey: getGetProfileQueryKey(),
      retry: false
    },
  });

  const updateProfile = useCreateOrUpdateProfile(headers);

  const [formData, setFormData] = useState<Partial<UserProfileBody>>({
    age: 30,
    gender: "male",
    heightCm: 175,
    weightKg: 70,
    activityLevel: "moderately_active",
    dietPreference: "non_vegetarian",
    goal: "maintenance",
  });

  useEffect(() => {
    if (profile && typeof profile === "object") {
      setFormData({
        age: profile.age ?? 30,
        gender: profile.gender ?? "male",
        heightCm: profile.heightCm ?? 175,
        weightKg: profile.weightKg ?? 70,
        activityLevel: profile.activityLevel ?? "moderately_active",
        dietPreference: profile.dietPreference ?? "non_vegetarian",
        goal: profile.goal ?? "maintenance",
      });
    }
  }, [profile]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    updateProfile.mutate(
      { data: formData as UserProfileBody },
      {
        onSuccess: () => {
          toast({
            title: "Profile updated",
            description: "Your physical profile has been saved.",
          });
        },
        onError: () => {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to save profile.",
          });
        },
      }
    );
  };

  const handleChange = (field: keyof UserProfileBody, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value ?? "",
    }));
  };

  if (error) {
    console.log("Profile API error:", error);
  }

  if (isLoading)
    return <div className="animate-pulse h-96 bg-muted rounded-2xl"></div>;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-3xl mx-auto space-y-6"
    >
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-primary/10 text-primary rounded-xl">
          <UserCircle className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-3xl font-display font-bold">My Profile</h1>
          <p className="text-muted-foreground">
            Set your physical details to personalize your AI diet plan.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* PHYSICAL DETAILS */}
        <Card className="border-0 shadow-lg shadow-black/5 overflow-hidden">
          <div className="h-2 w-full bg-gradient-to-r from-primary to-accent" />
          <CardHeader>
            <CardTitle>Physical Details</CardTitle>
            <CardDescription>
              Basic metrics for calorie calculations
            </CardDescription>
          </CardHeader>

          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* AGE */}
            <div className="space-y-2">
              <Label>Age</Label>
              <Input
                type="number"
                value={formData.age ?? ""}
                onChange={(e) =>
                  handleChange(
                    "age",
                    e.target.value ? Number(e.target.value) : ""
                  )
                }
                min={1}
                max={120}
                required
              />
            </div>

            {/* GENDER */}
            <div className="space-y-2">
              <Label>Gender</Label>
              <select
                className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                value={formData.gender ?? "male"}
                onChange={(e) => handleChange("gender", e.target.value)}
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* HEIGHT */}
            <div className="space-y-2">
              <Label>Height (cm)</Label>
              <Input
                type="number"
                value={formData.heightCm ?? ""}
                onChange={(e) =>
                  handleChange(
                    "heightCm",
                    e.target.value ? Number(e.target.value) : ""
                  )
                }
                min={50}
                max={300}
                required
              />
            </div>

            {/* WEIGHT */}
            <div className="space-y-2">
              <Label>Weight (kg)</Label>
              <Input
                type="number"
                value={formData.weightKg ?? ""}
                onChange={(e) =>
                  handleChange(
                    "weightKg",
                    e.target.value ? Number(e.target.value) : ""
                  )
                }
                min={10}
                max={500}
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* LIFESTYLE */}
        <Card className="border-0 shadow-lg shadow-black/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Lifestyle & Goals
            </CardTitle>
          </CardHeader>

          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* ACTIVITY */}
            <div className="space-y-2">
              <Label>Activity Level</Label>
              <select
                className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                value={formData.activityLevel ?? ""}
                onChange={(e) =>
                  handleChange("activityLevel", e.target.value)
                }
              >
                <option value="sedentary">Sedentary</option>
                <option value="lightly_active">Lightly Active</option>
                <option value="moderately_active">Moderately Active</option>
                <option value="very_active">Very Active</option>
                <option value="extra_active">Extra Active</option>
              </select>
            </div>

            {/* DIET */}
            <div className="space-y-2">
              <Label>Diet Preference</Label>
              <select
                className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                value={formData.dietPreference ?? ""}
                onChange={(e) =>
                  handleChange("dietPreference", e.target.value)
                }
              >
                <option value="non_vegetarian">Non-Veg</option>
                <option value="vegetarian">Vegetarian</option>
                <option value="vegan">Vegan</option>
                <option value="keto">Keto</option>
              </select>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={updateProfile.isPending}>
            {updateProfile.isPending ? "Saving..." : "Save Profile"}
          </Button>
        </div>
      </form>
    </motion.div>
  );
}
