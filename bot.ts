import { Telegraf, Context, Markup } from "telegraf";
import type { Update } from "telegraf/types";
import {
  findOrCreateTelegramUser,
  getUserProfile,
  createOrUpdateProfile,
  getOrCreateDailyLog,
  updateDailyLog,
  addMeal,
  addMeasurement,
  getLatestMeasurement,
  getTodayMeals,
  getCurrentWorkoutPlan,
  createWorkoutPlan,
  addWorkoutDay,
  addWorkoutExercise,
  getExercisesByCategory,
  addConversationMessage,
  getRecentConversations,
  getUserStats,
  addReminder,
  addProgressPhoto,
} from "./queries";
import {
  mainMenuKeyboard,
  dailyLogKeyboard,
  workoutMenuKeyboard,
  nutritionMenuKeyboard,
  progressMenuKeyboard,
  settingsKeyboard,
  goalKeyboard,
  experienceKeyboard,
  daysPerWeekKeyboard,
  budgetKeyboard,
  genderKeyboard,
  mealTypeKeyboard,
  waterAmountKeyboard,
  sleepQualityKeyboard,
  backKeyboard,
  confirmKeyboard,
} from "./keyboards";
import { calculateCaloriesAndMacros } from "./services/nutrition";
import { suggestSplitType, getDefaultPlanName, getMuscleGroupsForDay } from "./services/workout";
import { coachChat, generateMealPlan, generateWorkoutPlan, analyzeProgress, generateMotivation } from "./services/ai";

// Session state management
const userStates = new Map<number, { step: string; data: Record<string, any> }>();

function setState(userId: number, step: string, data: Record<string, any> = {}) {
  userStates.set(userId, { step, data });
}

function getState(userId: number) {
  return userStates.get(userId);
}

function clearState(userId: number) {
  userStates.delete(userId);
}

export function createBot(token: string) {
  const bot = new Telegraf<Context<Update>>(token);

  // ─── Middleware ───
  bot.use(async (ctx, next) => {
    if (ctx.from) {
      await findOrCreateTelegramUser(ctx.from.id, ctx.from.username, ctx.from.first_name, ctx.from.last_name);
    }
    return next();
  });

  // ─── /start Command ───
  bot.start(async (ctx) => {
    const userId = ctx.from.id;
    const profile = await getUserProfile(userId);

    if (!profile || !profile.setupComplete) {
      setState(userId, "setup_age");
      await ctx.reply(
        `👋 أهلاً بك في *IronCoach Pro* - مدربك الشخصي الذكي!\n\n` +
        `سأساعدك في بناء كتلة عضلية قوية بأفضل شكل ممكن. 💪\n\n` +
        `لنبدأ بإنشاء ملفك الشخصي...\n\n` +
        `📅 ما هو عمرك؟ (أرقام فقط)`,
        { parse_mode: "Markdown" }
      );
    } else {
      await sendMainMenu(ctx);
    }
  });

  // ─── Main Menu ───
  async function sendMainMenu(ctx: Context) {
    await ctx.reply(
      `🏠 *القائمة الرئيسية*\n\n` +
      `اختر ما تريد من الأزرار أدناه:`,
      { parse_mode: "Markdown", ...mainMenuKeyboard() }
    );
  }

  // ─── Callback Queries ───
  bot.action("back_main", async (ctx) => {
    await ctx.answerCbQuery();
    await sendMainMenu(ctx);
  });

  bot.action("back_settings", async (ctx) => {
    await ctx.answerCbQuery();
    await ctx.reply("⚙️ *الإعدادات*", { parse_mode: "Markdown", ...settingsKeyboard() });
  });

  bot.action("back_daily", async (ctx) => {
    await ctx.answerCbQuery();
    await ctx.reply("📝 *التسجيل اليومي*", { parse_mode: "Markdown", ...dailyLogKeyboard() });
  });

  // Menu callbacks
  bot.action("menu_daily", async (ctx) => {
    await ctx.answerCbQuery();
    await ctx.reply("📝 *التسجيل اليومي*\n\nماذا تريد تسجيله اليوم؟", { parse_mode: "Markdown", ...dailyLogKeyboard() });
  });

  bot.action("menu_workout", async (ctx) => {
    await ctx.answerCbQuery();
    await ctx.reply("🏋️ *نظام التمرين*", { parse_mode: "Markdown", ...workoutMenuKeyboard() });
  });

  bot.action("menu_nutrition", async (ctx) => {
    await ctx.answerCbQuery();
    await ctx.reply("🍎 *التغذية والنظام الغذائي*", { parse_mode: "Markdown", ...nutritionMenuKeyboard() });
  });

  bot.action("menu_progress", async (ctx) => {
    await ctx.answerCbQuery();
    await ctx.reply("📊 *متابعة التقدم*", { parse_mode: "Markdown", ...progressMenuKeyboard() });
  });

  bot.action("menu_coach", async (ctx) => {
    await ctx.answerCbQuery();
    setState(ctx.from!.id, "coach_chat");
    await ctx.reply(
      `🤖 *المدرب الذكي*\n\n` +
      `اسألني أي شيء عن التمرين، التغذية، التحفيز، أو التعافي...\n` +
      `أنا هنا لمساعدتك 24/7!\n\n` +
      `اكتب رسالتك:`
      , { parse_mode: "Markdown" });
  });

  bot.action("menu_settings", async (ctx) => {
    await ctx.answerCbQuery();
    await ctx.reply("⚙️ *الإعدادات*", { parse_mode: "Markdown", ...settingsKeyboard() });
  });

  // ─── Profile Setup Flow ───
  bot.on("text", async (ctx) => {
    const userId = ctx.from.id;
    const text = ctx.message.text;
    const state = getState(userId);

    if (!state) return; // No active state, ignore

    // Setup: Age
    if (state.step === "setup_age") {
      const age = parseInt(text);
      if (isNaN(age) || age < 10 || age > 100) {
        return ctx.reply("❌ عمر غير صالح. أدخل رقماً بين 10 و 100:");
      }
      state.data.age = age;
      setState(userId, "setup_gender", state.data);
      return ctx.reply("🚻 اختر جنسك:", genderKeyboard());
    }

    // Setup: Height
    if (state.step === "setup_height") {
      const height = parseInt(text);
      if (isNaN(height) || height < 100 || height > 250) {
        return ctx.reply("❌ طول غير صالح. أدخل بالسنتيمتر (مثال: 175):");
      }
      state.data.heightCm = height;
      setState(userId, "setup_weight", state.data);
      return ctx.reply("⚖️ ما هو وزنك الحالي بالكيلوغرام؟");
    }

    // Setup: Weight
    if (state.step === "setup_weight") {
      const weight = parseFloat(text);
      if (isNaN(weight) || weight < 30 || weight > 300) {
        return ctx.reply("❌ وزن غير صالح. أدخل بالكيلوغرام (مثال: 75):");
      }
      state.data.weightKg = weight;
      setState(userId, "setup_bodyfat", state.data);
      return ctx.reply(
        `📊 هل تعرف نسبة دهون جسمك؟\n` +
        `إذا لم تكن تعرف، اكتب "لا" أو "0":`
      );
    }

    // Setup: Body Fat
    if (state.step === "setup_bodyfat") {
      const bf = text.toLowerCase() === "لا" || text === "0" ? null : parseFloat(text);
      if (bf !== null && (isNaN(bf) || bf < 3 || bf > 60)) {
        return ctx.reply("❌ نسبة غير صالحة. أدخل رقماً بين 3 و 60 أو اكتب \"لا\":");
      }
      state.data.bodyFat = bf;
      setState(userId, "setup_experience", state.data);
      return ctx.reply("⭐ ما هو مستوى خبرتك في التمرين؟", experienceKeyboard());
    }

    // Setup: Target Weight
    if (state.step === "setup_target") {
      const target = parseFloat(text);
      if (isNaN(target) || target < 30 || target > 300) {
        return ctx.reply("❌ وزن غير صالح. أدخل هدفك بالكيلوغرام:");
      }
      state.data.targetWeight = target;
      setState(userId, "setup_days", state.data);
      return ctx.reply("📅 كم يوماً تستطيع التمرين أسبوعياً؟", daysPerWeekKeyboard());
    }

    // Setup: Budget
    if (state.step === "setup_budget") {
      // Handled by callback
      return;
    }

    // Daily: Log meal
    if (state.step === "log_meal_name") {
      state.data.foodName = text;
      setState(userId, "log_meal_calories", state.data);
      return ctx.reply("🔥 كم سعرة حرارية تقريباً؟ (أو اكتب \"لا أعرف\")");
    }

    if (state.step === "log_meal_calories") {
      const cals = text.includes("لا") ? null : parseInt(text);
      state.data.calories = cals || 0;
      setState(userId, "log_meal_protein", state.data);
      return ctx.reply("💪 كم غرام بروتين تقريباً؟ (أو 0)");
    }

    if (state.step === "log_meal_protein") {
      const protein = parseInt(text) || 0;
      state.data.protein = protein;
      setState(userId, "log_meal_carbs", state.data);
      return ctx.reply("🍞 كم غرام كارب تقريباً؟ (أو 0)");
    }

    if (state.step === "log_meal_carbs") {
      const carbs = parseInt(text) || 0;
      state.data.carbs = carbs;
      setState(userId, "log_meal_fats", state.data);
      return ctx.reply("🥑 كم غرام دهون تقريباً؟ (أو 0)");
    }

    if (state.step === "log_meal_fats") {
      const fats = parseInt(text) || 0;
      state.data.fats = fats;
      const today = new Date().toISOString().split("T")[0];
      const log = await getOrCreateDailyLog(userId, today);

      await addMeal(log!.id, userId, {
        mealType: state.data.mealType,
        foodName: state.data.foodName,
        calories: state.data.calories,
        protein: state.data.protein,
        carbs: state.data.carbs,
        fats: state.data.fats,
      });

      // Update daily log totals
      await updateDailyLog(userId, today, {
        caloriesConsumed: (log?.caloriesConsumed || 0) + state.data.calories,
        proteinConsumed: (log?.proteinConsumed || 0) + state.data.protein,
        carbsConsumed: (log?.carbsConsumed || 0) + state.data.carbs,
        fatsConsumed: (log?.fatsConsumed || 0) + state.data.fats,
      });

      clearState(userId);
      await ctx.reply(`✅ تم تسجيل الوجبة!\n\n🍽️ ${state.data.foodName}\n🔥 ${state.data.calories} سعرة\n💪 ${state.data.protein}g بروتين`, backKeyboard("back_daily"));
    }

    // Log weight
    if (state.step === "log_weight") {
      const weight = parseFloat(text);
      if (isNaN(weight) || weight < 30 || weight > 300) {
        return ctx.reply("❌ وزن غير صالح. أدخل بالكيلوغرام:");
      }
      const today = new Date().toISOString().split("T")[0];
      await addMeasurement(userId, {
        date: new Date(today),
        weightKg: weight.toFixed(2),
      });
      await createOrUpdateProfile(userId, { weightKg: weight.toFixed(2) });
      clearState(userId);
      await ctx.reply(`✅ تم تسجيل الوزن: ${weight}kg`, backKeyboard("back_daily"));
    }

    // Log steps
    if (state.step === "log_steps") {
      const steps = parseInt(text);
      if (isNaN(steps) || steps < 0 || steps > 100000) {
        return ctx.reply("❌ رقم غير صالح. أدخل عدد الخطوات:");
      }
      const today = new Date().toISOString().split("T")[0];
      const log = await getOrCreateDailyLog(userId, today);
      await updateDailyLog(userId, today, { steps });
      clearState(userId);
      await ctx.reply(`✅ تم تسجيل ${steps.toLocaleString()} خطوة`, backKeyboard("back_daily"));
    }

    // Log sleep hours
    if (state.step === "log_sleep_hours") {
      const hours = parseFloat(text);
      if (isNaN(hours) || hours < 0 || hours > 24) {
        return ctx.reply("❌ رقم غير صالح. أدخل عدد الساعات (مثال: 7.5):");
      }
      state.data.sleepHours = hours;
      setState(userId, "log_sleep_quality", state.data);
      return ctx.reply("😴 كيف كان جودة النوم؟", sleepQualityKeyboard());
    }

    // Coach chat
    if (state.step === "coach_chat") {
      const profile = await getUserProfile(userId);
      const userContext = profile
        ? `عمر: ${profile.age}, وزن: ${profile.weightKg}kg, طول: ${profile.heightCm}cm, هدف: ${profile.goal}, خبرة: ${profile.experienceLevel}`
        : "مستخدم جديد";

      const history = await getRecentConversations(userId, 5);
      const historyMessages = history.map((h: { role: string; content: string }) => ({
        role: h.role as string,
        content: h.content,
      }));

      await ctx.reply("🤔 يفكر المدرب...");

      const response = await coachChat({
        message: text,
        userContext,
        history: historyMessages,
      });

      await addConversationMessage(userId, "user", text);
      await addConversationMessage(userId, "assistant", response);

      await ctx.reply(response, { parse_mode: "Markdown" });
    }

    // Settings: Update profile
    if (state.step === "settings_update") {
      // Handled by specific flows
    }
  });

  // ─── Callback Handlers: Setup ───
  bot.action(/gender_(.+)/, async (ctx) => {
    const gender = ctx.match[1] as "male" | "female";
    const userId = ctx.from!.id;
    const state = getState(userId);
    if (!state || state.step !== "setup_gender") return;

    state.data.gender = gender;
    setState(userId, "setup_height", state.data);
    await ctx.answerCbQuery();
    await ctx.editMessageText("📏 ما هو طولك بالسنتيمتر؟ (مثال: 175)");
  });

  bot.action(/exp_(.+)/, async (ctx) => {
    const exp = ctx.match[1];
    const userId = ctx.from!.id;
    const state = getState(userId);
    if (!state || state.step !== "setup_experience") return;

    state.data.experienceLevel = exp;
    setState(userId, "setup_target", state.data);
    await ctx.answerCbQuery();
    await ctx.editMessageText("🎯 ما هو وزنك المستهدف بالكيلوغرام؟ (أو اكتب وزنك الحالي)");
  });

  bot.action(/days_(\d+)/, async (ctx) => {
    const days = parseInt(ctx.match[1]);
    const userId = ctx.from!.id;
    const state = getState(userId);
    if (!state || state.step !== "setup_days") return;

    state.data.trainingDaysPerWeek = days;
    setState(userId, "setup_goal", state.data);
    await ctx.answerCbQuery();
    await ctx.editMessageText("🎯 ما هو هدفك الرئيسي؟", goalKeyboard());
  });

  bot.action(/goal_(.+)/, async (ctx) => {
    const goal = ctx.match[1];
    const userId = ctx.from!.id;
    const state = getState(userId);
    if (!state || state.step !== "setup_goal") return;

    state.data.goal = goal;
    setState(userId, "setup_budget", state.data);
    await ctx.answerCbQuery();
    await ctx.editMessageText("💰 ما هي ميزانيتك للأكل الشهري؟", budgetKeyboard());
  });

  bot.action(/budget_(.+)/, async (ctx) => {
    const budget = ctx.match[1];
    const userId = ctx.from!.id;
    const state = getState(userId);
    if (!state || state.step !== "setup_budget") return;

    state.data.budgetLevel = budget;
    await ctx.answerCbQuery();

    // Calculate nutrition needs
    const macros = calculateCaloriesAndMacros({
      gender: state.data.gender,
      age: state.data.age,
      heightCm: state.data.heightCm,
      weightKg: state.data.weightKg,
      activityLevel: "moderate",
      goal: state.data.goal,
      bodyFat: state.data.bodyFat,
    });

    // Save profile
    await createOrUpdateProfile(userId, {
      ...state.data,
      dailyCalories: macros.targetCalories,
      dailyProtein: macros.protein,
      dailyCarbs: macros.carbs,
      dailyFats: macros.fats,
      bmr: macros.bmr,
      tdee: macros.tdee,
      setupComplete: true,
    });

    clearState(userId);

    // Generate initial workout plan
    const splitType = suggestSplitType(state.data.trainingDaysPerWeek, state.data.experienceLevel, state.data.goal);
    const planName = getDefaultPlanName(splitType);

    const plan = await createWorkoutPlan(userId, {
      name: planName,
      splitType: splitType as "full_body" | "upper_lower" | "push_pull_legs" | "bro_split" | "custom",
      daysPerWeek: state.data.trainingDaysPerWeek,
      description: `خطة ${planName} - ${state.data.goal === "bulking" ? "ضخامة" : state.data.goal === "cutting" ? "تنشيف" : "إعادة تركيب"}`,
    });

    // Add days to plan
    if (plan) {
      for (let i = 1; i <= state.data.trainingDaysPerWeek; i++) {
        const muscleGroups = getMuscleGroupsForDay(splitType, i, state.data.trainingDaysPerWeek);
        const dayName = muscleGroups.map((g: string) => {
          const names: Record<string, string> = {
            chest: "صدر", back: "ظهر", legs: "أرجل", shoulders: "كتف",
            arms: "ذراع", core: "بطن", cardio: "كارديو", triceps: "تراي",
            biceps: "بايسبس", "rear delts": "خلفي كتف", quads: "أمامية رجل",
            hamstrings: "خلفية رجل", calves: "سمانة", glutes: "أرداف",
          };
          return names[g] || g;
        }).join(" + ");

        const day = await addWorkoutDay(plan.id, {
          dayNumber: i,
          dayName: `يوم ${i}: ${dayName}`,
          focusMuscle: muscleGroups.join(","),
        });

        if (day) {
          // Add default exercises for each muscle group
          for (const muscle of muscleGroups) {
            const categoryMap: Record<string, string> = {
              chest: "chest", back: "back", legs: "legs", shoulders: "shoulders",
              arms: "arms", core: "core", cardio: "cardio", triceps: "arms",
              biceps: "arms", quads: "legs", hamstrings: "legs", calves: "legs",
              glutes: "legs",
            };

            const category = categoryMap[muscle] || muscle;
            const exs = await getExercisesByCategory(category);
            if (exs.length > 0) {
              const ex = exs[Math.floor(Math.random() * Math.min(3, exs.length))];
              await addWorkoutExercise(day.id, ex.id, {
                sets: 3,
                repsMin: 8,
                repsMax: 12,
                restSeconds: 60,
                order: i,
              });
            }
          }
        }
      }
    }

    // Send completion message
    await ctx.editMessageText(
      `🎉 *تم إنشاء ملفك الشخصي بنجاح!*\n\n` +
      `📊 *احتياجاتك اليومية:*\n` +
      `• السعرات: ${macros.targetCalories} kcal\n` +
      `• البروتين: ${macros.protein}g\n` +
      `• الكارب: ${macros.carbs}g\n` +
      `• الدهون: ${macros.fats}g\n\n` +
      `🏋️ *تم إنشاء جدول التمرين:* ${planName}\n` +
      `(${state.data.trainingDaysPerWeek} أيام/أسبوع)\n\n` +
      `🚀 جاهز للبدء!`,
      { parse_mode: "Markdown" }
    );

    await sendMainMenu(ctx);
  });

  // ─── Daily Log Callbacks ───
  bot.action("log_meal", async (ctx) => {
    await ctx.answerCbQuery();
    setState(ctx.from!.id, "log_meal_select", {});
    await ctx.reply("🍽️ اختر نوع الوجبة:", mealTypeKeyboard());
  });

  bot.action(/meal_(.+)/, async (ctx) => {
    const type = ctx.match[1];
    const userId = ctx.from!.id;
    const state = getState(userId);
    if (!state) return;

    state.data.mealType = type;
    setState(userId, "log_meal_name", state.data);
    await ctx.answerCbQuery();
    await ctx.editMessageText("🍽️ ما هو اسم الطعام/الوجبة؟");
  });

  bot.action("log_water", async (ctx) => {
    await ctx.answerCbQuery();
    await ctx.reply("💧 اختر كمية الماء:", waterAmountKeyboard());
  });

  bot.action(/water_(.+)/, async (ctx) => {
    const amount = parseFloat(ctx.match[1]);
    const userId = ctx.from!.id;
    const today = new Date().toISOString().split("T")[0];
    const log = await getOrCreateDailyLog(userId, today);
    const currentWater = parseFloat(log?.waterLiters?.toString() || "0");
    const newWater = currentWater + amount;

    await updateDailyLog(userId, today, { waterLiters: newWater.toFixed(2) });
    await ctx.answerCbQuery(`✅ ${amount} لتر`);
    await ctx.editMessageText(`💧 إجمالي الماء اليوم: ${newWater.toFixed(2)} لتر`, backKeyboard("back_daily"));
  });

  bot.action("log_sleep", async (ctx) => {
    await ctx.answerCbQuery();
    setState(ctx.from!.id, "log_sleep_hours", {});
    await ctx.reply("😴 كم ساعة نمت الليلة؟ (مثال: 7.5)");
  });

  bot.action(/sleep_(.+)/, async (ctx) => {
    const quality = ctx.match[1];
    const userId = ctx.from!.id;
    const state = getState(userId);
    if (!state || state.step !== "log_sleep_quality") return;

    const qualityMap: Record<string, number> = { bad: 2, ok: 5, good: 7.5, great: 9.5 };
    const today = new Date().toISOString().split("T")[0];

    await updateDailyLog(userId, today, {
      sleepHours: state.data.sleepHours.toFixed(2),
      sleepQuality: qualityMap[quality] || 5,
    });

    clearState(userId);
    await ctx.answerCbQuery("✅ تم");
    await ctx.editMessageText(
      `😴 تم تسجيل النوم:\n` +
      `• المدة: ${state.data.sleepHours} ساعة\n` +
      `• الجودة: ${qualityMap[quality] || 5}/10`,
      backKeyboard("back_daily")
    );
  });

  bot.action("log_weight", async (ctx) => {
    await ctx.answerCbQuery();
    setState(ctx.from!.id, "log_weight", {});
    await ctx.reply("⚖️ ما هو وزنك اليوم بالكيلوغرام؟");
  });

  bot.action("log_steps", async (ctx) => {
    await ctx.answerCbQuery();
    setState(ctx.from!.id, "log_steps", {});
    await ctx.reply("🚶 كم خطوة مشيت اليوم؟");
  });

  // ─── Workout Callbacks ───
  bot.action("workout_today", async (ctx) => {
    await ctx.answerCbQuery();
    const userId = ctx.from!.id;
    const plan = await getCurrentWorkoutPlan(userId);

    if (!plan) {
      return ctx.reply("❌ ليس لديك خطة تمرين نشطة. استخدم \"تغيير الخطة\" لإنشاء واحدة.");
    }

    const dayOfWeek = new Date().getDay(); // 0 = Sunday
    const dayNumber = dayOfWeek === 0 ? 7 : dayOfWeek;
    const todayDay = plan.days.find((d: any) => d.dayNumber === dayNumber) || plan.days[0];

    if (!todayDay || todayDay.restDay) {
      return ctx.reply("🛌 اليوم يوم راحة! خذ قسطاً من الراحة للتعافي. 💤", backKeyboard("menu_workout"));
    }

    let message = `🏋️ *${todayDay.dayName}*\n\n`;
    todayDay.exercises.forEach((ex: any, i: number) => {
      message += `${i + 1}. *${ex.exercise.nameAr || ex.exercise.name}*\n`;
      message += `   ${ex.sets} مجموعات × ${ex.repsMin}-${ex.repsMax} تكرار\n`;
      message += `   راحة: ${ex.restSeconds} ثانية\n\n`;
    });

    await ctx.reply(message, { parse_mode: "Markdown", ...backKeyboard("menu_workout") });
  });

  bot.action("workout_start", async (ctx) => {
    await ctx.answerCbQuery("🚀 ابدأ التمرين!");
    await ctx.reply(
      `💡 *نصائح قبل التمرين:*\n` +
      `• حضّن عضلاتك 5-10 دقائق\n` +
      `• ابدأ بأوزان خفيفة في المجموعة الأولى\n` +
      `• ركّز على التقنية وليس الوزن فقط\n\n` +
      `📝 بعد كل تمرين، سجّل:\n` +
      `الوزن المستخدم × عدد التكرارات\n\n` +
      `بالتوفيق! 💪`,
      { parse_mode: "Markdown", ...backKeyboard("menu_workout") }
    );
  });

  bot.action("workout_schedule", async (ctx) => {
    await ctx.answerCbQuery();
    const userId = ctx.from!.id;
    const plan = await getCurrentWorkoutPlan(userId);

    if (!plan) {
      return ctx.reply("❌ لا يوجد خطة نشطة.");
    }

    let message = `📅 *${plan.name}*\n\n`;
    plan.days.forEach((day) => {
      if (day.restDay) {
        message += `🛌 يوم ${day.dayNumber}: راحة\n`;
      } else {
        message += `💪 يوم ${day.dayNumber}: ${day.dayName}\n`;
      }
    });

    await ctx.reply(message, { parse_mode: "Markdown", ...backKeyboard("menu_workout") });
  });

  bot.action("workout_history", async (ctx) => {
    await ctx.answerCbQuery();
    await ctx.reply(
      `📊 سجل التمارين متاح في لوحة التحكم.\n\n` +
      `سيتم إضافة عرض تفصيلي قريباً!`,
      backKeyboard("menu_workout")
    );
  });

  bot.action("workout_change", async (ctx) => {
    await ctx.answerCbQuery();
    const userId = ctx.from!.id;
    const profile = await getUserProfile(userId);

    if (!profile) {
      return ctx.reply("❌ أكمل ملفك الشخصي أولاً.");
    }

    const splitType = suggestSplitType(profile.trainingDaysPerWeek || 4, profile.experienceLevel || "intermediate", profile.goal || "bulking");

    await ctx.reply(
      `🔄 *تغيير خطة التمرين*\n\n` +
      `سيتم إنشاء خطة جديدة:\n` +
      `• النوع: ${getDefaultPlanName(splitType)}\n` +
      `• الأيام: ${profile.trainingDaysPerWeek}\n` +
      `• الهدف: ${profile.goal}\n\n` +
      `هل تريد المتابعة؟`,
      { parse_mode: "Markdown", ...confirmKeyboard("change_plan") }
    );
  });

  bot.action("change_plan_confirm", async (ctx) => {
    const userId = ctx.from!.id;
    const profile = await getUserProfile(userId);
    if (!profile) return;

    const splitType = suggestSplitType(profile.trainingDaysPerWeek || 4, profile.experienceLevel || "intermediate", profile.goal || "bulking");
    const planName = getDefaultPlanName(splitType);

    const plan = await createWorkoutPlan(userId, {
      name: planName,
      splitType: splitType as "full_body" | "upper_lower" | "push_pull_legs" | "bro_split" | "custom",
      daysPerWeek: profile.trainingDaysPerWeek || 4,
      description: `خطة جديدة - ${profile.goal}`,
    });

    for (let i = 1; i <= (profile.trainingDaysPerWeek || 4); i++) {
      const muscleGroups = getMuscleGroupsForDay(splitType, i, profile.trainingDaysPerWeek || 4);
      const dayName = muscleGroups.map((g: string) => {
        const names: Record<string, string> = {
          chest: "صدر", back: "ظهر", legs: "أرجل", shoulders: "كتف",
          arms: "ذراع", core: "بطن", cardio: "كارديو", triceps: "تراي",
          biceps: "بايسبس", "rear delts": "خلفي كتف", quads: "أمامية رجل",
          hamstrings: "خلفية رجل", calves: "سمانة", glutes: "أرداف",
        };
        return names[g] || g;
      }).join(" + ");

      if (!plan) return;

      for (let i = 1; i <= (profile.trainingDaysPerWeek || 4); i++) {
        const muscleGroups = getMuscleGroupsForDay(splitType, i, profile.trainingDaysPerWeek || 4);
        const dayName = muscleGroups.map((g: string) => {
          const names: Record<string, string> = {
            chest: "صدر", back: "ظهر", legs: "أرجل", shoulders: "كتف",
            arms: "ذراع", core: "بطن", cardio: "كارديو", triceps: "تراي",
            biceps: "بايسبس", "rear delts": "خلفي كتف", quads: "أمامية رجل",
            hamstrings: "خلفية رجل", calves: "سمانة", glutes: "أرداف",
          };
          return names[g] || g;
        }).join(" + ");

        const day = await addWorkoutDay(plan.id, {
          dayNumber: i,
          dayName: `يوم ${i}: ${dayName}`,
          focusMuscle: muscleGroups.join(","),
        });

        if (day) {
          // Add default exercises for each muscle group
          for (const muscle of muscleGroups) {
            const categoryMap: Record<string, string> = {
              chest: "chest", back: "back", legs: "legs", shoulders: "shoulders",
              arms: "arms", core: "core", cardio: "cardio", triceps: "arms",
              biceps: "arms", quads: "legs", hamstrings: "legs", calves: "legs",
              glutes: "legs",
            };

            const category = categoryMap[muscle] || muscle;
            const exs = await getExercisesByCategory(category);
            if (exs.length > 0) {
              const ex = exs[Math.floor(Math.random() * Math.min(3, exs.length))];
              await addWorkoutExercise(day.id, ex.id, {
                sets: 3,
                repsMin: 8,
                repsMax: 12,
                restSeconds: 60,
                order: i,
              });
            }
          }
        }
      }
    }

    await ctx.answerCbQuery("✅ تم إنشاء الخطة");
    await ctx.editMessageText(`✅ تم إنشاء خطة *${planName}* بنجاح!`, { parse_mode: "Markdown" });
    await ctx.reply("🏋️ اختر من القائمة:", workoutMenuKeyboard());
  });

  bot.action("change_plan_cancel", async (ctx) => {
    await ctx.answerCbQuery("❌ تم الإلغاء");
    await ctx.editMessageText("🚫 تم الإلغاء");
    await ctx.reply("🏋️ اختر من القائمة:", workoutMenuKeyboard());
  });

  // ─── Nutrition Callbacks ───
  bot.action("nutrition_meals", async (ctx) => {
    await ctx.answerCbQuery("🍳 جارٍ التحضير...");
    const userId = ctx.from!.id;
    const profile = await getUserProfile(userId);

    if (!profile) {
      return ctx.reply("❌ أكمل ملفك الشخصي أولاً.");
    }

    const mealPlan = await generateMealPlan({
      goal: profile.goal || "bulking",
      calories: profile.dailyCalories || 2500,
      protein: profile.dailyProtein || 150,
      carbs: profile.dailyCarbs || 300,
      fats: profile.dailyFats || 80,
      budget: profile.budgetLevel || "medium",
    });

    await ctx.reply(mealPlan, { parse_mode: "Markdown", ...backKeyboard("menu_nutrition") });
  });

  bot.action("nutrition_needs", async (ctx) => {
    await ctx.answerCbQuery();
    const userId = ctx.from!.id;
    const profile = await getUserProfile(userId);

    if (!profile) {
      return ctx.reply("❌ أكمل ملفك الشخصي أولاً.");
    }

    const today = new Date().toISOString().split("T")[0];
    const log = await getOrCreateDailyLog(userId, today);
    const meals = await getTodayMeals(userId, today);

    const remaining = {
      calories: (profile.dailyCalories || 0) - (log?.caloriesConsumed || 0),
      protein: (profile.dailyProtein || 0) - (log?.proteinConsumed || 0),
      carbs: (profile.dailyCarbs || 0) - (log?.carbsConsumed || 0),
      fats: (profile.dailyFats || 0) - (log?.fatsConsumed || 0),
    };

    await ctx.reply(
      `📊 *احتياجاتك اليومية*\n\n` +
      `🎯 الهدف:\n` +
      `• سعرات: ${profile.dailyCalories}\n` +
      `• بروتين: ${profile.dailyProtein}g\n` +
      `• كارب: ${profile.dailyCarbs}g\n` +
      `• دهون: ${profile.dailyFats}g\n\n` +
      `✅ تم تناوله:\n` +
      `• سعرات: ${log?.caloriesConsumed || 0}\n` +
      `• بروتين: ${log?.proteinConsumed || 0}g\n` +
      `• كارب: ${log?.carbsConsumed || 0}g\n` +
      `• دهون: ${log?.fatsConsumed || 0}g\n\n` +
      `⏳ المتبقي:\n` +
      `• سعرات: ${remaining.calories}\n` +
      `• بروتين: ${remaining.protein}g\n` +
      `• كارب: ${remaining.carbs}g\n` +
      `• دهون: ${remaining.fats}g`,
      { parse_mode: "Markdown", ...backKeyboard("menu_nutrition") }
    );
  });

  bot.action("nutrition_log", async (ctx) => {
    await ctx.answerCbQuery();
    await ctx.reply("📝 استخدم \"تسجيل يومي\" > \"تسجيل وجبة\" لتسجيل طعامك.", backKeyboard("menu_nutrition"));
  });

  bot.action("nutrition_recalc", async (ctx) => {
    await ctx.answerCbQuery();
    const userId = ctx.from!.id;
    const profile = await getUserProfile(userId);

    if (!profile) return;

    const macros = calculateCaloriesAndMacros({
      gender: profile.gender as "male" | "female",
      age: profile.age || 25,
      heightCm: parseFloat(profile.heightCm?.toString() || "175"),
      weightKg: parseFloat(profile.weightKg?.toString() || "75"),
      activityLevel: "moderate",
      goal: profile.goal || "bulking",
      bodyFat: profile.bodyFat ? parseFloat(profile.bodyFat.toString()) : undefined,
    });

    await createOrUpdateProfile(userId, {
      dailyCalories: macros.targetCalories,
      dailyProtein: macros.protein,
      dailyCarbs: macros.carbs,
      dailyFats: macros.fats,
      bmr: macros.bmr,
      tdee: macros.tdee,
    });

    await ctx.editMessageText(
      `🔄 *تم إعادة الحساب!*\n\n` +
      `• السعرات: ${macros.targetCalories}\n` +
      `• البروتين: ${macros.protein}g\n` +
      `• الكارب: ${macros.carbs}g\n` +
      `• الدهون: ${macros.fats}g`,
      { parse_mode: "Markdown", ...backKeyboard("menu_nutrition") }
    );
  });

  // ─── Progress Callbacks ───
  bot.action("progress_weight", async (ctx) => {
    await ctx.answerCbQuery();
    const userId = ctx.from!.id;
    const latest = await getLatestMeasurement(userId);

    if (!latest) {
      return ctx.reply("⚖️ لم يتم تسجيل أي وزن بعد. استخدم التسجيل اليومي.", backKeyboard("menu_progress"));
    }

    await ctx.reply(
      `⚖️ *آخر تسجيل للوزن*\n\n` +
      `التاريخ: ${latest.date}\n` +
      `الوزن: ${latest.weightKg}kg\n` +
      `${latest.bodyFat ? `نسبة الدهون: ${latest.bodyFat}%` : ""}\n\n` +
      `سجل يومياً لمتابعة التغيرات!`,
      { parse_mode: "Markdown", ...backKeyboard("menu_progress") }
    );
  });

  bot.action("progress_photos", async (ctx) => {
    await ctx.answerCbQuery();
    await ctx.reply(
      `📸 *صور التقدم*\n\n` +
      `أرسل صورة الآن وسأحفظها مع التاريخ.\n` +
      `نصائح للصور:\n` +
      `• إضاءة جيدة\n` +
      `• نفس الزاوية في كل مرة\n` +
      `• ملابس ضيقة أو بدون قميص\n` +
      `• خلفية بسيطة`,
      { parse_mode: "Markdown", ...backKeyboard("menu_progress") }
    );
  });

  bot.action("progress_measurements", async (ctx) => {
    await ctx.answerCbQuery();
    await ctx.reply(
      `📏 *القياسات*\n\n` +
      `سيتم إضافة تتبع القياسات (صدر، خصر، أرداف...) قريباً.\n\n` +
      ` meanwhile، استخدم التسجيل اليومي > تسجيل وزن.`,
      backKeyboard("menu_progress")
    );
  });

  bot.action("progress_weekly", async (ctx) => {
    await ctx.answerCbQuery("📊 جارٍ التحليل...");
    const userId = ctx.from!.id;
    const profile = await getUserProfile(userId);
    const stats = await getUserStats(userId);

    if (!profile) {
      return ctx.reply("❌ أكمل ملفك الشخصي أولاً.");
    }

    const weeklyData = `
الوزن الحالي: ${stats.latestMeasurement?.weightKg || profile.weightKg}kg
الهدف: ${profile.goal}
السعرات اليومية: ${profile.dailyCalories}
خبرة: ${profile.experienceLevel}
    `;

    const analysis = await analyzeProgress({
      weeklyData,
      userGoal: profile.goal || "bulking",
    });

    await ctx.reply(analysis, { parse_mode: "Markdown", ...backKeyboard("menu_progress") });
  });

  // ─── Settings Callbacks ───
  bot.action("settings_profile", async (ctx) => {
    await ctx.answerCbQuery();
    const userId = ctx.from!.id;
    const profile = await getUserProfile(userId);

    if (!profile) {
      return ctx.reply("❌ لا يوجد ملف شخصي.");
    }

    await ctx.reply(
      `👤 *ملفك الشخصي*\n\n` +
      `• العمر: ${profile.age}\n` +
      `• الجنس: ${profile.gender === "male" ? "ذكر" : "أنثى"}\n` +
      `• الطول: ${profile.heightCm}cm\n` +
      `• الوزن: ${profile.weightKg}kg\n` +
      `• الهدف: ${profile.goal}\n` +
      `• الخبرة: ${profile.experienceLevel}\n` +
      `• أيام التمرين: ${profile.trainingDaysPerWeek}\n\n` +
      `للتحديث، استخدم /start`,
      { parse_mode: "Markdown", ...backKeyboard("menu_settings") }
    );
  });

  bot.action("settings_goal", async (ctx) => {
    await ctx.answerCbQuery();
    await ctx.reply("🎯 اختر هدفك الجديد:", goalKeyboard());
  });

  bot.action(/goal_(bulking|cutting|recomp)/, async (ctx) => {
    const goal = ctx.match[1];
    const userId = ctx.from!.id;
    const profile = await getUserProfile(userId);

    if (!profile) return;

    await createOrUpdateProfile(userId, { goal: goal as "bulking" | "cutting" | "recomp" | "maintenance" });

    // Recalculate macros
    const macros = calculateCaloriesAndMacros({
      gender: profile.gender as "male" | "female",
      age: profile.age || 25,
      heightCm: parseFloat(profile.heightCm?.toString() || "175"),
      weightKg: parseFloat(profile.weightKg?.toString() || "75"),
      activityLevel: "moderate",
      goal,
      bodyFat: profile.bodyFat ? parseFloat(profile.bodyFat.toString()) : undefined,
    });

    await createOrUpdateProfile(userId, {
      dailyCalories: macros.targetCalories,
      dailyProtein: macros.protein,
      dailyCarbs: macros.carbs,
      dailyFats: macros.fats,
    });

    await ctx.answerCbQuery("✅ تم التحديث");
    await ctx.editMessageText(
      `✅ تم تغيير الهدف إلى: *${goal === "bulking" ? "ضخامة" : goal === "cutting" ? "تنشيف" : "إعادة تركيب"}*\n\n` +
      `📊 الاحتياجات الجديدة:\n` +
      `• سعرات: ${macros.targetCalories}\n` +
      `• بروتين: ${macros.protein}g\n` +
      `• كارب: ${macros.carbs}g\n` +
      `• دهون: ${macros.fats}g`,
      { parse_mode: "Markdown", ...backKeyboard("menu_settings") }
    );
  });

  bot.action("settings_reminders", async (ctx) => {
    await ctx.answerCbQuery();
    await ctx.reply(
      `🔔 *التذكيرات*\n\n` +
      `يمكنك ضبط تذكيرات يومية:\n` +
      `• تذكير الماء\n` +
      `• تذكير الوجبات\n` +
      `• تذكير التمرين\n` +
      `• تذكير النوم\n\n` +
      `لضبط تذكير، أرسل لي:\n` +
      `/remind [نوع] [وقت]\n` +
      `مثال: /remind water 10:00`,
      { parse_mode: "Markdown", ...backKeyboard("menu_settings") }
    );
  });

  bot.action("settings_language", async (ctx) => {
    await ctx.answerCbQuery();
    await ctx.reply("🌐 اللغة العربية هي اللغة الوحيدة المدعومة حالياً.", backKeyboard("menu_settings"));
  });

  bot.action("settings_help", async (ctx) => {
    await ctx.answerCbQuery();
    await ctx.reply(
      `❓ *المساعدة*\n\n` +
      `*/start* - بدء البوت وإنشاء الملف\n` +
      `*/menu* - القائمة الرئيسية\n` +
      `*/log* - تسجيل يومي سريع\n` +
      `*/coach* - المدرب الذكي\n` +
      `*/plan* - خطة التمرين\n` +
      `*/meals* - وجبات مقترحة\n` +
      `*/progress* - التقدم\n\n` +
      `للدعم: تواصل مع المسؤول`,
      { parse_mode: "Markdown", ...backKeyboard("menu_settings") }
    );
  });

  // ─── Photo Handler ───
  bot.on("photo", async (ctx) => {
    const userId = ctx.from.id;
    const photo = ctx.message.photo[ctx.message.photo.length - 1];
    const fileLink = await ctx.telegram.getFileLink(photo.file_id);

    const today = new Date().toISOString().split("T")[0];
    await addProgressPhoto(userId, fileLink.href, "front", today, "صورة تقدم");

    await ctx.reply(
      `📸 *تم حفظ صورة التقدم!*\n` +
      `التاريخ: ${today}\n\n` +
      `استمر في إرسال صورة كل أسبوع بنفس الزاوية.`,
      { parse_mode: "Markdown", ...backKeyboard("menu_progress") }
    );
  });

  // ─── Text Commands ───
  bot.command("menu", sendMainMenu);

  bot.command("log", async (ctx) => {
    await ctx.reply("📝 *التسجيل اليومي*", { parse_mode: "Markdown", ...dailyLogKeyboard() });
  });

  bot.command("coach", async (ctx) => {
    setState(ctx.from.id, "coach_chat", {});
    await ctx.reply(
      `🤖 *المدرب الذكي*\n\n` +
      `اسألني أي شيء...`,
      { parse_mode: "Markdown" }
    );
  });

  bot.command("plan", async (ctx) => {
    await ctx.reply("🏋️ *نظام التمرين*", { parse_mode: "Markdown", ...workoutMenuKeyboard() });
  });

  bot.command("meals", async (ctx) => {
    await ctx.reply("🍎 *التغذية*", { parse_mode: "Markdown", ...nutritionMenuKeyboard() });
  });

  bot.command("progress", async (ctx) => {
    await ctx.reply("📊 *التقدم*", { parse_mode: "Markdown", ...progressMenuKeyboard() });
  });

  bot.command("remind", async (ctx) => {
    const args = ctx.message.text.split(" ").slice(1);
    if (args.length < 2) {
      return ctx.reply("❌ استخدم: /remind [نوع] [وقت HH:MM]\nمثال: /remind water 10:00");
    }

    const type = args[0];
    const time = args[1];
    const userId = ctx.from.id;

    const typeAr: Record<string, string> = {
      water: "💧 شرب الماء",
      meal: "🍽️ وجبة",
      workout: "🏋️ تمرين",
      sleep: "😴 النوم",
      supplement: "💊 مكمل",
    };

    await addReminder(userId, {
      reminderType: type as any,
      time,
      message: typeAr[type] || `تذكير: ${type}`,
    });

    await ctx.reply(`✅ تم ضبط تذكير: ${typeAr[type] || type} الساعة ${time}`);
  });

  bot.command("motivate", async (ctx) => {
    const motivation = await generateMotivation(ctx.from.first_name);
    await ctx.reply(`💪 *رسالة تحفيزية*\n\n${motivation}`, { parse_mode: "Markdown" });
  });

  // ─── Error Handler ───
  bot.catch((err, ctx) => {
    console.error("Bot error:", err);
    ctx.reply("❌ عذراً، حدث خطأ. حاول مرة أخرى أو تواصل مع الدعم.").catch(console.error);
  });

  return bot;
}

export async function handleWebhook(bot: Telegraf<Context<Update>>, body: any) {
  await bot.handleUpdate(body);
}