import { z } from "zod";
import { createRouter, adminQuery } from "./middleware";
import { getDb } from "./queries/connection";
import {
  telegramUsers,
  profiles,
  dailyLogs,
  bodyMeasurements,
  workoutPlans,
  workoutSessions,
  exercises,
} from "@db/schema";
import { eq, desc, count } from "drizzle-orm";

export const dashboardRouter = createRouter({
  stats: adminQuery.query(async () => {
    const db = getDb();
    const [usersCount] = await db.select({ count: count() }).from(telegramUsers);
    const [activeProfiles] = await db.select({ count: count() }).from(profiles).where(eq(profiles.setupComplete, true));
    const today = new Date().toISOString().split("T")[0];
    const [todayLogs] = await db.select({ count: count() }).from(dailyLogs).where(eq(dailyLogs.date, new Date(today)));
    const [totalWorkouts] = await db.select({ count: count() }).from(workoutSessions).where(eq(workoutSessions.completed, true));
    const [totalExercises] = await db.select({ count: count() }).from(exercises);

    return {
      totalUsers: usersCount?.count || 0,
      activeUsers: activeProfiles?.count || 0,
      todayLogs: todayLogs?.count || 0,
      totalWorkouts: totalWorkouts?.count || 0,
      totalExercises: totalExercises?.count || 0,
    };
  }),

  recentUsers: adminQuery.input(z.object({ limit: z.number().default(20) })).query(async ({ input }: { input: { limit: number } }) => {
    const db = getDb();
    return db.query.telegramUsers.findMany({
      orderBy: [desc(telegramUsers.createdAt)],
      limit: input.limit,
      with: {
        profile: true,
      },
    });
  }),

  userDetails: adminQuery.input(z.object({ telegramId: z.number() })).query(async ({ input }: { input: { telegramId: number } }) => {
    const db = getDb();
    const user = await db.query.telegramUsers.findFirst({
      where: eq(telegramUsers.telegramId, input.telegramId),
      with: {
        profile: true,
        bodyMeasurements: { orderBy: [desc(bodyMeasurements.date)], limit: 10 },
        dailyLogs: { orderBy: [desc(dailyLogs.date)], limit: 14 },
        workoutPlans: { orderBy: [desc(workoutPlans.createdAt)], limit: 5 },
        workoutSessions: { orderBy: [desc(workoutSessions.createdAt)], limit: 10 },
      },
    });
    return user;
  }),

  weeklyActivity: adminQuery.query(async () => {
    const db = getDb();
    const days = 7;
    const results = [];
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      const dateObj = new Date(dateStr);
      const [logs] = await db.select({ count: count() }).from(dailyLogs).where(eq(dailyLogs.date, dateObj));
      const [workouts] = await db.select({ count: count() }).from(workoutSessions).where(eq(workoutSessions.date, dateObj));
      results.push({ date: dateStr, logs: logs?.count || 0, workouts: workouts?.count || 0 });
    }
    return results.reverse();
  }),

  goalDistribution: adminQuery.query(async () => {
    const db = getDb();
    const goals = await db.select({ goal: profiles.goal, count: count() }).from(profiles).groupBy(profiles.goal);
    return goals.map((g: { goal: string | null; count: number }) => ({ goal: g.goal || "unknown", count: g.count }));
  }),
});
