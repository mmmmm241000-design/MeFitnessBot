import { getDb } from "../queries/connection";
import {
  telegramUsers,
  profiles,
  bodyMeasurements,
  dailyLogs,
  meals,
  exercises,
  workoutPlans,
  workoutDays,
  workoutExercises,
  workoutSessions,
  sessionSets,
  progressPhotos,
  aiConversations,
  reminders,
  weeklyReports,
} from "@db/schema";
import { eq, and, desc, gte, lte } from "drizzle-orm";

// ─── User Management ───
export async function findOrCreateTelegramUser(telegramId: number, username?: string, firstName?: string, lastName?: string) {
  const db = getDb();
  let user = await db.query.telegramUsers.findFirst({
    where: eq(telegramUsers.telegramId, telegramId),
  });

  if (!user) {
    await db.insert(telegramUsers).values({
      telegramId,
      username,
      firstName,
      lastName,
    });
    user = await db.query.telegramUsers.findFirst({
      where: eq(telegramUsers.telegramId, telegramId),
    });
  }

  return user;
}

export async function getUserProfile(telegramId: number) {
  const db = getDb();
  return db.query.profiles.findFirst({
    where: eq(profiles.telegramUserId, telegramId),
  });
}

export async function createOrUpdateProfile(telegramId: number, data: Partial<typeof profiles.$inferInsert>) {
  const db = getDb();
  const existing = await getUserProfile(telegramId);

  if (existing) {
    await db.update(profiles)
      .set(data)
      .where(eq(profiles.telegramUserId, telegramId));
    return getUserProfile(telegramId);
  }

  await db.insert(profiles).values({
    telegramUserId: telegramId,
    ...data,
  } as any);
  return getUserProfile(telegramId);
}

// ─── Daily Logs ───
export async function getOrCreateDailyLog(telegramId: number, dateStr: string) {
  const db = getDb();
  const dateObj = new Date(dateStr);
  let log = await db.query.dailyLogs.findFirst({
    where: and(eq(dailyLogs.telegramUserId, telegramId), eq(dailyLogs.date, dateObj)),
  });

  if (!log) {
    await db.insert(dailyLogs).values({
      telegramUserId: telegramId,
      date: dateObj,
    } as any);
    log = await db.query.dailyLogs.findFirst({
      where: and(eq(dailyLogs.telegramUserId, telegramId), eq(dailyLogs.date, dateObj)),
    });
  }

  return log;
}

export async function updateDailyLog(telegramId: number, dateStr: string, data: Partial<typeof dailyLogs.$inferInsert>) {
  const db = getDb();
  const dateObj = new Date(dateStr);
  await db.update(dailyLogs)
    .set(data)
    .where(and(eq(dailyLogs.telegramUserId, telegramId), eq(dailyLogs.date, dateObj)));
}

export async function addMeal(dailyLogId: number, telegramId: number, data: Partial<typeof meals.$inferInsert>) {
  const db = getDb();
  await db.insert(meals).values({
    dailyLogId,
    telegramUserId: telegramId,
    foodName: data.foodName || "",
    ...data,
  } as any);
}

export async function getTodayMeals(telegramId: number, dateStr: string) {
  const db = getDb();
  const dateObj = new Date(dateStr);
  const log = await db.query.dailyLogs.findFirst({
    where: and(eq(dailyLogs.telegramUserId, telegramId), eq(dailyLogs.date, dateObj)),
    with: { meals: true },
  });
  return log?.meals || [];
}

// ─── Body Measurements ───
export async function addMeasurement(telegramId: number, data: Partial<typeof bodyMeasurements.$inferInsert>) {
  const db = getDb();
  const insertData: any = { telegramUserId: telegramId, ...data };
  if (data.date && typeof data.date === "string") {
    insertData.date = new Date(data.date);
  }
  await db.insert(bodyMeasurements).values(insertData);
}

export async function getLatestMeasurement(telegramId: number) {
  const db = getDb();
  return db.query.bodyMeasurements.findFirst({
    where: eq(bodyMeasurements.telegramUserId, telegramId),
    orderBy: [desc(bodyMeasurements.date)],
  });
}

export async function getMeasurementsRange(telegramId: number, startDate: string, endDate: string) {
  const db = getDb();
  return db.query.bodyMeasurements.findMany({
    where: and(
      eq(bodyMeasurements.telegramUserId, telegramId),
      gte(bodyMeasurements.date, new Date(startDate)),
      lte(bodyMeasurements.date, new Date(endDate))
    ),
    orderBy: [desc(bodyMeasurements.date)],
  });
}

// ─── Workouts ───
export async function getCurrentWorkoutPlan(telegramId: number) {
  const db = getDb();
  return db.query.workoutPlans.findFirst({
    where: and(eq(workoutPlans.telegramUserId, telegramId), eq(workoutPlans.current, true)),
    with: {
      days: {
        with: {
          exercises: {
            with: {
              exercise: true,
            },
          },
        },
      },
    },
  });
}

export async function createWorkoutPlan(telegramId: number, data: Partial<typeof workoutPlans.$inferInsert>) {
  const db = getDb();
  // Deactivate old plans
  await db.update(workoutPlans)
    .set({ current: false })
    .where(eq(workoutPlans.telegramUserId, telegramId));

  await db.insert(workoutPlans).values({
    name: data.name || "خطة تمرين",
    telegramUserId: telegramId,
    daysPerWeek: data.daysPerWeek || 3,
    splitType: data.splitType || "custom",
    current: true,
    ...data,
  } as any);

  // Return the newly created plan
  return db.query.workoutPlans.findFirst({
    where: and(eq(workoutPlans.telegramUserId, telegramId), eq(workoutPlans.current, true)),
    orderBy: [desc(workoutPlans.createdAt)],
  });
}

export async function addWorkoutDay(planId: number, data: Partial<typeof workoutDays.$inferInsert>) {
  const db = getDb();
  await db.insert(workoutDays).values({
    planId,
    dayNumber: data.dayNumber || 1,
    ...data,
  } as any);

  return db.query.workoutDays.findFirst({
    where: and(eq(workoutDays.planId, planId), eq(workoutDays.dayNumber, data.dayNumber || 1)),
    orderBy: [desc(workoutDays.createdAt)],
  });
}

export async function addWorkoutExercise(workoutDayId: number, exerciseId: number, data?: Partial<typeof workoutExercises.$inferInsert>) {
  const db = getDb();
  await db.insert(workoutExercises).values({
    workoutDayId,
    exerciseId,
    sets: data?.sets || 3,
    repsMin: data?.repsMin || 8,
    repsMax: data?.repsMax || 12,
    restSeconds: data?.restSeconds || 60,
    order: data?.order || 0,
    ...data,
  } as any);
}

export async function getExercisesByCategory(category: string) {
  const db = getDb();
  return db.query.exercises.findMany({
    where: eq(exercises.category, category as any),
  });
}

export async function startWorkoutSession(telegramId: number, workoutDayId?: number) {
  const db = getDb();
  const now = new Date();
  const dateStr = now.toISOString().split("T")[0];

  await db.insert(workoutSessions).values({
    telegramUserId: telegramId,
    workoutDayId,
    date: new Date(dateStr),
    startTime: now,
  } as any);

  return db.query.workoutSessions.findFirst({
    where: and(eq(workoutSessions.telegramUserId, telegramId), eq(workoutSessions.date, new Date(dateStr))),
    orderBy: [desc(workoutSessions.createdAt)],
  });
}

export async function completeWorkoutSession(sessionId: number, data: Partial<typeof workoutSessions.$inferInsert>) {
  const db = getDb();
  await db.update(workoutSessions)
    .set({ ...data, completed: true })
    .where(eq(workoutSessions.id, sessionId));
}

export async function addSessionSet(sessionId: number, exerciseId: number, data: Partial<typeof sessionSets.$inferInsert>) {
  const db = getDb();
  await db.insert(sessionSets).values({
    sessionId,
    exerciseId,
    setNumber: data.setNumber || 1,
    ...data,
  } as any);
}

// ─── AI Conversations ───
export async function addConversationMessage(telegramId: number, role: string, content: string, context?: any) {
  const db = getDb();
  await db.insert(aiConversations).values({
    telegramUserId: telegramId,
    role: role as any,
    content,
    context,
  });
}

export async function getRecentConversations(telegramId: number, limit: number = 10) {
  const db = getDb();
  return db.query.aiConversations.findMany({
    where: eq(aiConversations.telegramUserId, telegramId),
    orderBy: [desc(aiConversations.createdAt)],
    limit,
  });
}

// ─── Reminders ───
export async function getActiveReminders(telegramId: number) {
  const db = getDb();
  return db.query.reminders.findMany({
    where: and(eq(reminders.telegramUserId, telegramId), eq(reminders.isActive, true)),
  });
}

export async function addReminder(telegramId: number, data: Partial<typeof reminders.$inferInsert>) {
  const db = getDb();
  return db.insert(reminders).values({
    telegramUserId: telegramId,
    reminderType: data.reminderType || "meal",
    time: data.time || "08:00",
    ...data,
  } as any);
}

// ─── Progress Photos ───
export async function addProgressPhoto(telegramId: number, photoUrl: string, photoType: string, dateStr: string, notes?: string) {
  const db = getDb();
  return db.insert(progressPhotos).values({
    telegramUserId: telegramId,
    photoUrl,
    photoType: photoType as any,
    date: new Date(dateStr),
    notes,
  });
}

// ─── Weekly Reports ───
export async function getWeeklyReports(telegramId: number, limit: number = 4) {
  const db = getDb();
  return db.query.weeklyReports.findMany({
    where: eq(weeklyReports.telegramUserId, telegramId),
    orderBy: [desc(weeklyReports.weekStart)],
    limit,
  });
}

export async function createWeeklyReport(telegramId: number, data: Partial<typeof weeklyReports.$inferInsert>) {
  const db = getDb();
  const insertData: any = { telegramUserId: telegramId, ...data };
  if (data.weekStart && typeof data.weekStart === "string") insertData.weekStart = new Date(data.weekStart);
  if (data.weekEnd && typeof data.weekEnd === "string") insertData.weekEnd = new Date(data.weekEnd);
  return db.insert(weeklyReports).values(insertData);
}

// ─── Stats ───
export async function getUserStats(telegramId: number) {
  const db = getDb();
  const profile = await getUserProfile(telegramId);
  const latestMeasurement = await getLatestMeasurement(telegramId);
  const today = new Date().toISOString().split("T")[0];
  const todayLog = await getOrCreateDailyLog(telegramId, today);

  return {
    profile,
    latestMeasurement,
    todayLog,
  };
}
