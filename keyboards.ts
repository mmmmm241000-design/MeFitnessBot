import { Markup } from "telegraf";

export const mainMenuKeyboard = () =>
  Markup.inlineKeyboard([
    [
      Markup.button.callback("📝 تسجيل يومي", "menu_daily"),
      Markup.button.callback("🏋️ التمرين", "menu_workout"),
    ],
    [
      Markup.button.callback("🍎 التغذية", "menu_nutrition"),
      Markup.button.callback("📊 التقدم", "menu_progress"),
    ],
    [
      Markup.button.callback("🤖 المدرب الذكي", "menu_coach"),
      Markup.button.callback("⚙️ الإعدادات", "menu_settings"),
    ],
  ]);

export const dailyLogKeyboard = () =>
  Markup.inlineKeyboard([
    [
      Markup.button.callback("🍽️ تسجيل وجبة", "log_meal"),
      Markup.button.callback("💧 تسجيل ماء", "log_water"),
    ],
    [
      Markup.button.callback("😴 تسجيل نوم", "log_sleep"),
      Markup.button.callback("⚖️ تسجيل وزن", "log_weight"),
    ],
    [
      Markup.button.callback("🚶 خطوات", "log_steps"),
      Markup.button.callback("🔙 رجوع", "back_main"),
    ],
  ]);

export const workoutMenuKeyboard = () =>
  Markup.inlineKeyboard([
    [
      Markup.button.callback("📋 خطتي اليوم", "workout_today"),
      Markup.button.callback("✅ بدء تمرين", "workout_start"),
    ],
    [
      Markup.button.callback("📅 جدولي", "workout_schedule"),
      Markup.button.callback("📈 سجل التمارين", "workout_history"),
    ],
    [
      Markup.button.callback("🔄 تغيير الخطة", "workout_change"),
      Markup.button.callback("🔙 رجوع", "back_main"),
    ],
  ]);

export const nutritionMenuKeyboard = () =>
  Markup.inlineKeyboard([
    [
      Markup.button.callback("🍳 وجبات مقترحة", "nutrition_meals"),
      Markup.button.callback("📊 احتياجاتي اليوم", "nutrition_needs"),
    ],
    [
      Markup.button.callback("📝 سجل الطعام", "nutrition_log"),
      Markup.button.callback("🔄 إعادة حساب", "nutrition_recalc"),
    ],
    [
      Markup.button.callback("🔙 رجوع", "back_main"),
    ],
  ]);

export const progressMenuKeyboard = () =>
  Markup.inlineKeyboard([
    [
      Markup.button.callback("📉 وزني", "progress_weight"),
      Markup.button.callback("📸 صور التقدم", "progress_photos"),
    ],
    [
      Markup.button.callback("📏 القياسات", "progress_measurements"),
      Markup.button.callback("📊 تقرير أسبوعي", "progress_weekly"),
    ],
    [
      Markup.button.callback("🔙 رجوع", "back_main"),
    ],
  ]);

export const settingsKeyboard = () =>
  Markup.inlineKeyboard([
    [
      Markup.button.callback("👤 ملفي الشخصي", "settings_profile"),
      Markup.button.callback("🎯 هدفي", "settings_goal"),
    ],
    [
      Markup.button.callback("🔔 التذكيرات", "settings_reminders"),
      Markup.button.callback("🌐 اللغة", "settings_language"),
    ],
    [
      Markup.button.callback("❓ المساعدة", "settings_help"),
      Markup.button.callback("🔙 رجوع", "back_main"),
    ],
  ]);

export const goalKeyboard = () =>
  Markup.inlineKeyboard([
    [
      Markup.button.callback("💪 ضخامة عضلية", "goal_bulking"),
    ],
    [
      Markup.button.callback("🔥 تنشيف وحرق", "goal_cutting"),
    ],
    [
      Markup.button.callback("⚖️ إعادة تركيب", "goal_recomp"),
    ],
    [
      Markup.button.callback("🔙 رجوع", "back_settings"),
    ],
  ]);

export const experienceKeyboard = () =>
  Markup.inlineKeyboard([
    [
      Markup.button.callback("🆕 مبتدئ (0-1 سنة)", "exp_beginner"),
    ],
    [
      Markup.button.callback("⭐ متوسط (1-3 سنوات)", "exp_intermediate"),
    ],
    [
      Markup.button.callback("🏆 متقدم (3+ سنوات)", "exp_advanced"),
    ],
  ]);

export const daysPerWeekKeyboard = () =>
  Markup.inlineKeyboard([
    [
      Markup.button.callback("3 أيام", "days_3"),
      Markup.button.callback("4 أيام", "days_4"),
    ],
    [
      Markup.button.callback("5 أيام", "days_5"),
      Markup.button.callback("6 أيام", "days_6"),
    ],
    [
      Markup.button.callback("7 أيام", "days_7"),
    ],
  ]);

export const budgetKeyboard = () =>
  Markup.inlineKeyboard([
    [
      Markup.button.callback("💰 ميزانية محدودة", "budget_low"),
    ],
    [
      Markup.button.callback("💰💰 متوسطة", "budget_medium"),
    ],
    [
      Markup.button.callback("💰💰💰 مفتوحة", "budget_high"),
    ],
  ]);

export const genderKeyboard = () =>
  Markup.inlineKeyboard([
    [
      Markup.button.callback("♂️ ذكر", "gender_male"),
      Markup.button.callback("♀️ أنثى", "gender_female"),
    ],
  ]);

export const mealTypeKeyboard = () =>
  Markup.inlineKeyboard([
    [
      Markup.button.callback("🌅 فطور", "meal_breakfast"),
      Markup.button.callback("☀️ غداء", "meal_lunch"),
    ],
    [
      Markup.button.callback("🌙 عشاء", "meal_dinner"),
      Markup.button.callback("🍿 وجبة خفيفة", "meal_snack"),
    ],
    [
      Markup.button.callback("🏋️ ما قبل التمرين", "meal_pre_workout"),
      Markup.button.callback("🏋️✅ ما بعد التمرين", "meal_post_workout"),
    ],
  ]);

export const confirmKeyboard = (action: string) =>
  Markup.inlineKeyboard([
    [
      Markup.button.callback("✅ تأكيد", `${action}_confirm`),
      Markup.button.callback("❌ إلغاء", `${action}_cancel`),
    ],
  ]);

export const backKeyboard = (callback: string) =>
  Markup.inlineKeyboard([
    [Markup.button.callback("🔙 رجوع", callback)],
  ]);

export const waterAmountKeyboard = () =>
  Markup.inlineKeyboard([
    [
      Markup.button.callback("💧 250 مل", "water_0.25"),
      Markup.button.callback("💧 500 مل", "water_0.5"),
    ],
    [
      Markup.button.callback("💧 750 مل", "water_0.75"),
      Markup.button.callback("💧 1 لتر", "water_1"),
    ],
    [
      Markup.button.callback("🔙 رجوع", "back_daily"),
    ],
  ]);

export const sleepQualityKeyboard = () =>
  Markup.inlineKeyboard([
    [
      Markup.button.callback("😫 سيء (1-3)", "sleep_bad"),
      Markup.button.callback("😐 متوسط (4-6)", "sleep_ok"),
    ],
    [
      Markup.button.callback("😊 جيد (7-8)", "sleep_good"),
      Markup.button.callback("🤩 ممتاز (9-10)", "sleep_great"),
    ],
  ]);
