import { pgTable, uuid, text, boolean, timestamp, pgEnum } from "drizzle-orm/pg-core";

export const priorityEnum = pgEnum("priority", ["LOW", "MEDIUM", "HIGH"]);

export const todos = pgTable("Todo", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").notNull(),
  completed: boolean("completed").notNull().default(false),
  priority: priorityEnum("priority").notNull().default("MEDIUM"),
  createdAt: timestamp("createdAt", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updatedAt", { withTimezone: true }).notNull().defaultNow(),
});