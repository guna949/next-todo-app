"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { withDb } from "@/lib/db";
import { todos } from "@/db/schema";
import type { Priority } from "@/types/todo";

export async function createTodo(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const priority = (String(formData.get("priority") ?? "MEDIUM") || "MEDIUM") as Priority;
  if (!title) return;

  await withDb((db) => db.insert(todos).values({ title, priority }));
  revalidatePath("/");
}

export async function toggleTodo(id: string, completed: boolean) {
  await withDb((db) =>
    db.update(todos).set({ completed, updatedAt: new Date() }).where(eq(todos.id, id))
  );
  revalidatePath("/");
}

export async function deleteTodo(id: string) {
  await withDb((db) => db.delete(todos).where(eq(todos.id, id)));
  revalidatePath("/");
}

export async function updateTodoTitle(id: string, title: string) {
  const trimmed = title.trim();
  if (!trimmed) return;

  await withDb((db) =>
    db.update(todos).set({ title: trimmed, updatedAt: new Date() }).where(eq(todos.id, id))
  );
  revalidatePath("/");
}