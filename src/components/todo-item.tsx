"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toggleTodo, deleteTodo } from "@/app/actions";
import type { Todo } from "@/types/todo";

export function TodoItem({ todo }: { todo: Todo }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <li
      className={`todo-item${todo.completed ? " completed" : ""}`}
      style={{ opacity: isPending ? 0.6 : 1 }}
    >
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={(e) =>
          startTransition(async () => {
            await toggleTodo(todo.id, e.target.checked);
            router.refresh();
          })
        }
      />
      <span className="todo-title">{todo.title}</span>
      <span className={`badge ${todo.priority}`}>{todo.priority}</span>
      <button
        type="button"
        className="ghost"
        aria-label="Delete todo"
        onClick={() =>
          startTransition(async () => {
            await deleteTodo(todo.id);
            router.refresh();
          })
        }
      >
        ✕
      </button>
    </li>
  );
}