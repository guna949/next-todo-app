"use client";

import { useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createTodo } from "@/app/actions";

export function TodoForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <form
      ref={formRef}
      action={(formData) => {
        startTransition(async () => {
          await createTodo(formData);
          formRef.current?.reset();
          router.refresh();
        });
      }}
      className="form-row"
      style={{ marginBottom: 20 }}
    >
      <input
        type="text"
        name="title"
        placeholder="What needs doing?"
        required
        disabled={isPending}
      />
      <select name="priority" defaultValue="MEDIUM" disabled={isPending}>
        <option value="LOW">Low</option>
        <option value="MEDIUM">Medium</option>
        <option value="HIGH">High</option>
      </select>
      <button type="submit" className="primary" disabled={isPending}>
        {isPending ? "Adding…" : "Add"}
      </button>
    </form>
  );
}