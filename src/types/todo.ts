import type { todos } from "@/db/schema";

export type Todo = typeof todos.$inferSelect;
export type Priority = "LOW" | "MEDIUM" | "HIGH";
export type StatusFilter = "all" | "active" | "completed";
export type PriorityFilter = "all" | Priority;