import { TodoItem } from "@/components/todo-item";
import type { Todo } from "@/types/todo";

export function TodoList({ todos }: { todos: Todo[] }) {
  if (todos.length === 0) {
    return <p className="empty-state">No todos match your filters.</p>;
  }

  return (
    <ul className="todo-list">
      {todos.map((todo) => (
        <TodoItem key={todo.id} todo={todo} />
      ))}
    </ul>
  );
}
