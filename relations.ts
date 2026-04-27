import { relations } from "drizzle-orm";
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
} from "./schema";

export const telegramUsersRelations = relations(telegramUsers, ({ one, many }) => ({
  profile: one(profiles, {
    fields: [telegramUsers.telegramId],
    references: [profiles.telegramUserId],
  }),
  bodyMeasurements: many(bodyMeasurements),
  dailyLogs: many(dailyLogs),
  workoutPlans: many(workoutPlans),
  workoutSessions: many(workoutSessions),
  progressPhotos: many(progressPhotos),
  aiConversations: many(aiConversations),
  reminders: many(reminders),
  weeklyReports: many(weeklyReports),
}));

export const profilesRelations = relations(profiles, ({ one }) => ({
  user: one(telegramUsers, {
    fields: [profiles.telegramUserId],
    references: [telegramUsers.telegramId],
  }),
}));

export const bodyMeasurementsRelations = relations(bodyMeasurements, ({ one }) => ({
  user: one(telegramUsers, {
    fields: [bodyMeasurements.telegramUserId],
    references: [telegramUsers.telegramId],
  }),
}));

export const dailyLogsRelations = relations(dailyLogs, ({ one, many }) => ({
  user: one(telegramUsers, {
    fields: [dailyLogs.telegramUserId],
    references: [telegramUsers.telegramId],
  }),
  meals: many(meals),
}));

export const mealsRelations = relations(meals, ({ one }) => ({
  dailyLog: one(dailyLogs, {
    fields: [meals.dailyLogId],
    references: [dailyLogs.id],
  }),
}));

export const workoutPlansRelations = relations(workoutPlans, ({ one, many }) => ({
  user: one(telegramUsers, {
    fields: [workoutPlans.telegramUserId],
    references: [telegramUsers.telegramId],
  }),
  days: many(workoutDays),
}));

export const workoutDaysRelations = relations(workoutDays, ({ one, many }) => ({
  plan: one(workoutPlans, {
    fields: [workoutDays.planId],
    references: [workoutPlans.id],
  }),
  exercises: many(workoutExercises),
  sessions: many(workoutSessions),
}));

export const workoutExercisesRelations = relations(workoutExercises, ({ one }) => ({
  day: one(workoutDays, {
    fields: [workoutExercises.workoutDayId],
    references: [workoutDays.id],
  }),
  exercise: one(exercises, {
    fields: [workoutExercises.exerciseId],
    references: [exercises.id],
  }),
}));

export const workoutSessionsRelations = relations(workoutSessions, ({ one, many }) => ({
  user: one(telegramUsers, {
    fields: [workoutSessions.telegramUserId],
    references: [telegramUsers.telegramId],
  }),
  workoutDay: one(workoutDays, {
    fields: [workoutSessions.workoutDayId],
    references: [workoutDays.id],
  }),
  sets: many(sessionSets),
}));

export const sessionSetsRelations = relations(sessionSets, ({ one }) => ({
  session: one(workoutSessions, {
    fields: [sessionSets.sessionId],
    references: [workoutSessions.id],
  }),
  exercise: one(exercises, {
    fields: [sessionSets.exerciseId],
    references: [exercises.id],
  }),
}));

export const progressPhotosRelations = relations(progressPhotos, ({ one }) => ({
  user: one(telegramUsers, {
    fields: [progressPhotos.telegramUserId],
    references: [telegramUsers.telegramId],
  }),
}));

export const aiConversationsRelations = relations(aiConversations, ({ one }) => ({
  user: one(telegramUsers, {
    fields: [aiConversations.telegramUserId],
    references: [telegramUsers.telegramId],
  }),
}));

export const remindersRelations = relations(reminders, ({ one }) => ({
  user: one(telegramUsers, {
    fields: [reminders.telegramUserId],
    references: [telegramUsers.telegramId],
  }),
}));

export const weeklyReportsRelations = relations(weeklyReports, ({ one }) => ({
  user: one(telegramUsers, {
    fields: [weeklyReports.telegramUserId],
    references: [telegramUsers.telegramId],
  }),
}));
