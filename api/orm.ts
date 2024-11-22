import { pgTable, text, serial, decimal, timestamp } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  username: text("username").primaryKey(),
});

export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  username: text("username").references(() => users.username),
  value: decimal("value").notNull(),
  type: text("type", { enum: ["expense", "income"] }).notNull(),
  name: text("name").notNull(),
  description: text("description"),
  emoji: text("emoji"),
  datetime: timestamp("datetime", { withTimezone: true }).notNull(),
});

export type Transaction = typeof transactions.$inferInsert;
export type User = typeof users.$inferInsert;
