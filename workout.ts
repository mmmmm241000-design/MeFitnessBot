export function suggestSplitType(daysPerWeek: number, experience: string, goal: string): string {
  if (daysPerWeek <= 2) return "full_body";
  if (daysPerWeek === 3) {
    if (experience === "advanced") return "push_pull_legs";
    return "full_body";
  }
  if (daysPerWeek === 4) return "upper_lower";
  if (daysPerWeek >= 5) {
    if (goal === "bulking" && experience !== "beginner") return "bro_split";
    return "push_pull_legs";
  }
  return "full_body";
}

export function getDefaultPlanName(splitType: string): string {
  const names: Record<string, string> = {
    full_body: "تمرين كامل الجسم",
    upper_lower: "تقسيم علوي/سفلي",
    push_pull_legs: "تقسيم دفع/سحب/أرجل",
    bro_split: "تقسيم عضلة/يوم",
    custom: "خطة مخصصة",
  };
  return names[splitType] || "خطة تمرين";
}

export function getPlanDescription(splitType: string, days: number): string {
  const descriptions: Record<string, string> = {
    full_body: `تمرين كل عضلة في كل جلسة. مثالي للمبتدئين ومن لديهم وقت محدود (${days} أيام/أسبوع).`,
    upper_lower: `تقسيم العلوي والسفلي. يوم علوي (صدر، ظهر، كتف، ذراع) ويوم سفلي (أرجل، بطن).`,
    push_pull_legs: `دفع (صدر+كتف+تراي)، سحب (ظهر+بايسبس)، أرجل. من أفضل التقسيمات المتقدمة.`,
    bro_split: `كل يوم عضلة واحدة. مثالي للضخامة المتقدمة مع أيام كافية للتعافي.`,
  };
  return descriptions[splitType] || "خطة تمرين مخصصة";
}

export function getMuscleGroupsForDay(splitType: string, dayNumber: number, totalDays: number): string[] {
  switch (splitType) {
    case "full_body":
      return ["chest", "back", "legs", "shoulders", "arms"];
    case "upper_lower":
      return dayNumber % 2 === 1
        ? ["chest", "back", "shoulders", "arms"]
        : ["legs", "core"];
    case "push_pull_legs":
      if (dayNumber % 3 === 1) return ["chest", "shoulders", "triceps"];
      if (dayNumber % 3 === 2) return ["back", "biceps", "rear delts"];
      return ["quads", "hamstrings", "calves", "glutes"];
    case "bro_split":
      const broDays = [
        ["chest"],
        ["back"],
        ["shoulders"],
        ["legs"],
        ["arms"],
        ["core", "cardio"],
      ];
      return broDays[dayNumber - 1] || ["chest"];
    default:
      return ["chest", "back", "legs"];
  }
}

export function estimateOneRepMax(weight: number, reps: number): number {
  // Epley formula
  return Math.round(weight * (1 + reps / 30));
}

export function suggestWeightIncrease(currentWeight: number, reps: number, targetReps: number): string {
  if (reps >= targetReps + 2) {
    const increase = currentWeight * 0.025; // 2.5%
    const newWeight = Math.ceil((currentWeight + increase) / 2.5) * 2.5;
    return `⬆️ زِد الوزن إلى ${newWeight}kg في الجلسة القادمة`;
  }
  if (reps >= targetReps) {
    return `✅ احتفظ بالوزن الحالي ${currentWeight}kg وحاول المجموعة القادمة`;
  }
  return `📉 حاول ${Math.max(currentWeight - 2.5, 0)}kg إذا فشلت في الوصول للتكرارات المطلوبة`;
}
