import {
  mysqlTable,
  mysqlEnum,
  serial,
  varchar,
  text,
  timestamp,
  int,
  decimal,
  bigint,
  date,
  json,
  boolean,
} from "drizzle-orm/mysql-core";

// ─── OAuth Users (original auth system) ───
export const users = mysqlTable("users", {
  id: serial("id"),
  unionId: varchar("unionId", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 320 }),
  avatar: text("avatar"),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
  lastSignInAt: timestamp("lastSignInAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ─── Telegram Users ───
export const telegramUsers = mysqlTable("telegram_users", {
  id: serial("id"),
  telegramId: bigint("telegram_id", { mode: "number", unsigned: true }).notNull().unique(),
  username: varchar("username", { length: 255 }),
  firstName: varchar("first_name", { length: 255 }),
  lastName: varchar("last_name", { length: 255 }),
  language: varchar("language", { length: 10 }).default("ar"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
});

// ─── User Profiles ───
export const profiles = mysqlTable("profiles", {
  id: serial("id"),
  telegramUserId: bigint("telegram_user_id", { mode: "number", unsigned: true }).notNull().unique(),
  age: int("age"),
  gender: mysqlEnum("gender", ["male", "female"]),
  heightCm: decimal("height_cm", { precision: 5, scale: 2 }),
  weightKg: decimal("weight_kg", { precision: 5, scale: 2 }),
  bodyFat: decimal("body_fat", { precision: 4, scale: 2 }),
  experienceLevel: mysqlEnum("experience_level", ["beginner", "intermediate", "advanced"]),
  trainingDaysPerWeek: int("training_days_per_week"),
  goal: mysqlEnum("goal", ["bulking", "cutting", "recomp", "maintenance"]),
  targetWeight: decimal("target_weight", { precision: 5, scale: 2 }),
  budgetLevel: mysqlEnum("budget_level", ["low", "medium", "high"]),
  dailyCalories: int("daily_calories"),
  dailyProtein: int("daily_protein"),
  dailyCarbs: int("daily_carbs"),
  dailyFats: int("daily_fats"),
  bmr: int("bmr"),
  tdee: int("tdee"),
  setupComplete: boolean("setup_complete").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
});

// ─── Body Measurements ───
export const bodyMeasurements = mysqlTable("body_measurements", {
  id: serial("id"),
  telegramUserId: bigint("telegram_user_id", { mode: "number", unsigned: true }).notNull(),
  date: date("date").notNull(),
  weightKg: decimal("weight_kg", { precision: 5, scale: 2 }),
  bodyFat: decimal("body_fat", { precision: 4, scale: 2 }),
  chestCm: decimal("chest_cm", { precision: 5, scale: 2 }),
  waistCm: decimal("waist_cm", { precision: 5, scale: 2 }),
  hipsCm: decimal("hips_cm", { precision: 5, scale: 2 }),
  armsCm: decimal("arms_cm", { precision: 5, scale: 2 }),
  thighsCm: decimal("thighs_cm", { precision: 5, scale: 2 }),
  shouldersCm: decimal("shoulders_cm", { precision: 5, scale: 2 }),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Daily Logs ───
export const dailyLogs = mysqlTable("daily_logs", {
  id: serial("id"),
  telegramUserId: bigint("telegram_user_id", { mode: "number", unsigned: true }).notNull(),
  date: date("date").notNull(),
  caloriesConsumed: int("calories_consumed").default(0),
  proteinConsumed: int("protein_consumed").default(0),
  carbsConsumed: int("carbs_consumed").default(0),
  fatsConsumed: int("fats_consumed").default(0),
  waterLiters: decimal("water_liters", { precision: 4, scale: 2 }).default("0"),
  sleepHours: decimal("sleep_hours", { precision: 4, scale: 2 }).default("0"),
  sleepQuality: int("sleep_quality"), // 1-10
  activityLevel: mysqlEnum("activity_level", ["sedentary", "light", "moderate", "high", "very_high"]),
  steps: int("steps"),
  mood: int("mood"), // 1-10
  energyLevel: int("energy_level"), // 1-10
  sorenessLevel: int("soreness_level"), // 1-10
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
});

// ─── Meals ───
export const meals = mysqlTable("meals", {
  id: serial("id"),
  dailyLogId: bigint("daily_log_id", { mode: "number", unsigned: true }).notNull(),
  telegramUserId: bigint("telegram_user_id", { mode: "number", unsigned: true }).notNull(),
  mealType: mysqlEnum("meal_type", ["breakfast", "lunch", "dinner", "snack", "pre_workout", "post_workout"]),
  foodName: varchar("food_name", { length: 255 }).notNull(),
  calories: int("calories").default(0),
  protein: int("protein").default(0),
  carbs: int("carbs").default(0),
  fats: int("fats").default(0),
  quantity: varchar("quantity", { length: 100 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Exercises Database ───
export const exercises = mysqlTable("exercises", {
  id: serial("id"),
  name: varchar("name", { length: 255 }).notNull(),
  nameAr: varchar("name_ar", { length: 255 }),
  category: mysqlEnum("category", [
    "chest", "back", "shoulders", "legs", "arms", "core", "cardio", "full_body"
  ]),
  muscleGroup: varchar("muscle_group", { length: 255 }),
  equipment: mysqlEnum("equipment", [
    "barbell", "dumbbell", "machine", "cable", "bodyweight", "kettlebell", "smith_machine", "none", "other"
  ]),
  difficulty: mysqlEnum("difficulty", ["beginner", "intermediate", "advanced"]),
  instructions: text("instructions"),
  instructionsAr: text("instructions_ar"),
  tips: text("tips"),
  alternativeExercises: text("alternative_exercises"), // comma separated ids
  videoUrl: text("video_url"),
  isCompound: boolean("is_compound").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Workout Plans ───
export const workoutPlans = mysqlTable("workout_plans", {
  id: serial("id"),
  telegramUserId: bigint("telegram_user_id", { mode: "number", unsigned: true }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  splitType: mysqlEnum("split_type", [
    "full_body", "upper_lower", "push_pull_legs", "bro_split", "custom"
  ]),
  daysPerWeek: int("days_per_week").notNull(),
  current: boolean("current").default(false),
  startDate: date("start_date"),
  endDate: date("end_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
});

// ─── Workout Days ───
export const workoutDays = mysqlTable("workout_days", {
  id: serial("id"),
  planId: bigint("plan_id", { mode: "number", unsigned: true }).notNull(),
  dayNumber: int("day_number").notNull(),
  dayName: varchar("day_name", { length: 255 }), // e.g. "Chest & Triceps"
  focusMuscle: varchar("focus_muscle", { length: 255 }),
  restDay: boolean("rest_day").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Workout Exercises ───
export const workoutExercises = mysqlTable("workout_exercises", {
  id: serial("id"),
  workoutDayId: bigint("workout_day_id", { mode: "number", unsigned: true }).notNull(),
  exerciseId: bigint("exercise_id", { mode: "number", unsigned: true }).notNull(),
  order: int("order").default(0),
  sets: int("sets").default(3),
  repsMin: int("reps_min").default(8),
  repsMax: int("reps_max").default(12),
  restSeconds: int("rest_seconds").default(60),
  technique: varchar("technique", { length: 255 }), // drop set, super set, etc.
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Workout Sessions ───
export const workoutSessions = mysqlTable("workout_sessions", {
  id: serial("id"),
  telegramUserId: bigint("telegram_user_id", { mode: "number", unsigned: true }).notNull(),
  workoutDayId: bigint("workout_day_id", { mode: "number", unsigned: true }),
  date: date("date").notNull(),
  startTime: timestamp("start_time"),
  endTime: timestamp("end_time"),
  durationMinutes: int("duration_minutes"),
  feelingRating: int("feeling_rating"), // 1-10
  notes: text("notes"),
  completed: boolean("completed").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Session Sets ───
export const sessionSets = mysqlTable("session_sets", {
  id: serial("id"),
  sessionId: bigint("session_id", { mode: "number", unsigned: true }).notNull(),
  exerciseId: bigint("exercise_id", { mode: "number", unsigned: true }).notNull(),
  setNumber: int("set_number").notNull(),
  reps: int("reps"),
  weightKg: decimal("weight_kg", { precision: 6, scale: 2 }),
  rpe: int("rpe"), // Rate of Perceived Exertion 1-10
  completed: boolean("completed").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Progress Photos ───
export const progressPhotos = mysqlTable("progress_photos", {
  id: serial("id"),
  telegramUserId: bigint("telegram_user_id", { mode: "number", unsigned: true }).notNull(),
  date: date("date").notNull(),
  photoUrl: text("photo_url").notNull(),
  photoType: mysqlEnum("photo_type", ["front", "back", "side", "other"]),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── AI Conversations ───
export const aiConversations = mysqlTable("ai_conversations", {
  id: serial("id"),
  telegramUserId: bigint("telegram_user_id", { mode: "number", unsigned: true }).notNull(),
  role: mysqlEnum("role", ["user", "assistant", "system"]).notNull(),
  content: text("content").notNull(),
  context: json("context"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Reminders ───
export const reminders = mysqlTable("reminders", {
  id: serial("id"),
  telegramUserId: bigint("telegram_user_id", { mode: "number", unsigned: true }).notNull(),
  reminderType: mysqlEnum("reminder_type", [
    "meal", "workout", "water", "sleep", "supplement", "weigh_in", "progress_photo"
  ]),
  time: varchar("time", { length: 10 }).notNull(), // HH:MM format
  daysOfWeek: varchar("days_of_week", { length: 20 }).default("all"), // e.g. "1,2,3,4,5"
  message: text("message"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
});

// ─── Weekly Reports ───
export const weeklyReports = mysqlTable("weekly_reports", {
  id: serial("id"),
  telegramUserId: bigint("telegram_user_id", { mode: "number", unsigned: true }).notNull(),
  weekStart: date("week_start").notNull(),
  weekEnd: date("week_end").notNull(),
  avgWeight: decimal("avg_weight", { precision: 5, scale: 2 }),
  weightChange: decimal("weight_change", { precision: 5, scale: 2 }),
  totalWorkouts: int("total_workouts").default(0),
  totalCalories: int("total_calories").default(0),
  avgProtein: int("avg_protein").default(0),
  avgSleep: decimal("avg_sleep", { precision: 4, scale: 2 }),
  avgWater: decimal("avg_water", { precision: 4, scale: 2 }),
  adherenceScore: int("adherence_score"), // 1-100
  insights: text("insights"),
  recommendations: text("recommendations"),
  generatedAt: timestamp("generated_at").defaultNow().notNull(),
});

// ─── Food Items Database ───
export const foodItems = mysqlTable("food_items", {
  id: serial("id"),
  name: varchar("name", { length: 255 }).notNull(),
  nameAr: varchar("name_ar", { length: 255 }),
  category: mysqlEnum("food_category", [
    "protein", "carbs", "fats", "vegetables", "fruits", "dairy", "grains", "nuts", "other"
  ]),
  caloriesPer100g: int("calories_per_100g"),
  proteinPer100g: decimal("protein_per_100g", { precision: 5, scale: 2 }),
  carbsPer100g: decimal("carbs_per_100g", { precision: 5, scale: 2 }),
  fatsPer100g: decimal("fats_per_100g", { precision: 5, scale: 2 }),
  budgetLevel: mysqlEnum("budget_level", ["low", "medium", "high"]),
  isVegetarian: boolean("is_vegetarian").default(false),
  isVegan: boolean("is_vegan").default(false),
  commonServing: varchar("common_serving", { length: 100 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Type Exports ───
export type TelegramUser = typeof telegramUsers.$inferSelect;
export type InsertTelegramUser = typeof telegramUsers.$inferInsert;
export type Profile = typeof profiles.$inferSelect;
export type InsertProfile = typeof profiles.$inferInsert;
export type BodyMeasurement = typeof bodyMeasurements.$inferSelect;
export type DailyLog = typeof dailyLogs.$inferSelect;
export type Meal = typeof meals.$inferSelect;
export type Exercise = typeof exercises.$inferSelect;
export type WorkoutPlan = typeof workoutPlans.$inferSelect;
export type WorkoutDay = typeof workoutDays.$inferSelect;
export type WorkoutExercise = typeof workoutExercises.$inferSelect;
export type WorkoutSession = typeof workoutSessions.$inferSelect;
export type SessionSet = typeof sessionSets.$inferSelect;
export type ProgressPhoto = typeof progressPhotos.$inferSelect;
export type AiConversation = typeof aiConversations.$inferSelect;
export type Reminder = typeof reminders.$inferSelect;
export type WeeklyReport = typeof weeklyReports.$inferSelect;
export type FoodItem = typeof foodItems.$inferSelect;
