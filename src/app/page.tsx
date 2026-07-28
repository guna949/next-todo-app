import { and, desc, eq, ilike, count, type SQL } from "drizzle-orm";
import { withDb } from "@/lib/db";
import { todos } from "@/db/schema";
import { searchParamsCache } from "@/lib/search-params";
import { TodoForm } from "@/components/todo-form";
import { TodoFilters } from "@/components/todo-filters";
import { TodoList } from "@/components/todo-list";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function HomePage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { q, status, priority } = searchParamsCache.parse(await searchParams);

  const conditions: SQL[] = [];
  if (q) conditions.push(ilike(todos.title, `%${q}%`));
  if (status === "active") conditions.push(eq(todos.completed, false));
  if (status === "completed") conditions.push(eq(todos.completed, true));
  if (priority !== "all") conditions.push(eq(todos.priority, priority));

  const { todoRows, activeCount } = await withDb(async (db) => {
    const todoRows = await db
      .select()
      .from(todos)
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(desc(todos.createdAt));

    const [{ value: activeCount }] = await db
      .select({ value: count() })
      .from(todos)
      .where(eq(todos.completed, false));

    return { todoRows, activeCount };
  });

  return (
    <main>
      <h1>Todos</h1>
      <p className="subtitle">
        {activeCount} active 
      </p>

      <div className="card">
        <TodoForm />
        <TodoFilters />
        <TodoList todos={todoRows} />
      </div>
    </main>
  );
}