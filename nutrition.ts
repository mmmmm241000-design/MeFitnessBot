export function calculateCaloriesAndMacros(params: {
  gender: "male" | "female";
  age: number;
  heightCm: number;
  weightKg: number;
  activityLevel: string;
  goal: string;
  bodyFat?: number;
}) {
  const { gender, age, heightCm, weightKg, activityLevel, goal, bodyFat } = params;

  // Calculate BMR using Mifflin-St Jeor Equation
  let bmr: number;
  if (bodyFat && bodyFat > 0) {
    // Katch-McArdle if body fat known
    const lbm = weightKg * (1 - bodyFat / 100);
    bmr = 370 + 21.6 * lbm;
  } else {
    bmr = 10 * weightKg + 6.25 * heightCm - 5 * age + (gender === "male" ? 5 : -161);
  }

  // Activity multipliers
  const activityMultipliers: Record<string, number> = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    high: 1.725,
    very_high: 1.9,
  };

  const tdee = Math.round(bmr * (activityMultipliers[activityLevel] || 1.55));

  // Adjust based on goal
  let targetCalories = tdee;
  let proteinRatio = 0.3;
  let fatRatio = 0.25;
  let carbRatio = 0.45;

  switch (goal) {
    case "bulking":
      targetCalories = tdee + 300;
      proteinRatio = 0.25;
      fatRatio = 0.25;
      carbRatio = 0.5;
      break;
    case "cutting":
      targetCalories = tdee - 500;
      proteinRatio = 0.4;
      fatRatio = 0.3;
      carbRatio = 0.3;
      break;
    case "recomp":
      targetCalories = tdee;
      proteinRatio = 0.35;
      fatRatio = 0.25;
      carbRatio = 0.4;
      break;
    case "maintenance":
      targetCalories = tdee;
      break;
  }

  // Protein: 1.6-2.2g per kg depending on goal
  let proteinGrams: number;
  if (goal === "cutting") {
    proteinGrams = Math.round(weightKg * 2.2);
  } else if (goal === "bulking") {
    proteinGrams = Math.round(weightKg * 1.8);
  } else {
    proteinGrams = Math.round(weightKg * 2.0);
  }

  const proteinCals = proteinGrams * 4;
  const fatCals = Math.round(targetCalories * fatRatio);
  const fatGrams = Math.round(fatCals / 9);
  const carbCals = targetCalories - proteinCals - fatCals;
  const carbGrams = Math.round(carbCals / 4);

  return {
    bmr: Math.round(bmr),
    tdee,
    targetCalories,
    protein: proteinGrams,
    carbs: carbGrams,
    fats: fatGrams,
    proteinRatio,
    fatRatio,
    carbRatio,
  };
}

export function getMealSuggestions(goal: string, budget: string) {
  const budgetMultiplier = budget === "low" ? 1 : budget === "medium" ? 1.2 : 1.5;

  const meals: Record<string, Array<{ name: string; items: string[]; approxCals: number; approxProtein: number }>> = {
    bulking: [
      {
        name: "وجبة صباحية للضخامة",
        items: ["شوفان مع حليب وموز", "بيضتان + 3 بياض بيض", "فول سوداني"],
        approxCals: 800,
        approxProtein: 40,
      },
      {
        name: "غداء بناء",
        items: ["200g أرز", "200g صدر دجاج", "زيت زيتون + خضروات"],
        approxCals: 700,
        approxProtein: 50,
      },
      {
        name: "وجبة ما بعد التمرين",
        items: ["موزة", " whey protein", "حليب"],
        approxCals: 400,
        approxProtein: 30,
      },
    ],
    cutting: [
      {
        name: "إفطار تنشيف",
        items: ["بياض بيض (4-5)", "خضروات", "شريحة توست كامل"],
        approxCals: 300,
        approxProtein: 25,
      },
      {
        name: "غداء خفيف",
        items: ["سلطة دجاج", "خضروات كثيرة", "ملعقة زيت زيتون"],
        approxCals: 400,
        approxProtein: 35,
      },
    ],
    recomp: [
      {
        name: "وجبة متوازنة",
        items: ["150g أرز بني", "150g سمك أو دجاج", "خضروات", "مكسرات"],
        approxCals: 550,
        approxProtein: 40,
      },
    ],
  };

  return meals[goal] || meals.bulking;
}

export function getBudgetAlternatives(foodName: string): string {
  const alternatives: Record<string, string> = {
    "salmon": "تونة معلبة أو سردين",
    "beef": "كبدة دجاج أو لحم مفروم قليل الدهن",
    "whey": "بيض أو جبنة قريش أو عدس",
    "quinoa": "أرز بني أو شعير",
    "avocado": "زيت زيتون أو مكسرات",
    "greek yogurt": "زبادي عادي + بياض بيض",
  };

  const key = Object.keys(alternatives).find((k) =>
    foodName.toLowerCase().includes(k)
  );

  return key ? alternatives[key] : "لا توجد بدائل معروفة";
}
