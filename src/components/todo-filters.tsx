"use client";

import { useQueryStates } from "nuqs";
import { searchParamsParsers } from "@/lib/search-params";

export function TodoFilters() {
  const [{ q, status, priority }, setFilters] = useQueryStates(
    searchParamsParsers,
    {
      // Debounce the search box so we don't hammer the server on every
      // keystroke, but keep dropdown changes instant.
      shallow: false,
    }
  );

  return (
    <div className="filters">
      <input
        type="text"
        placeholder="Search todos..."
        value={q}
        onChange={(e) =>
          setFilters({ q: e.target.value || null }, { throttleMs: 300 })
        }
      />
      <select
        value={status}
        onChange={(e) =>
          setFilters({ status: e.target.value as typeof status })
        }
      >
        <option value="all">All</option>
        <option value="active">Active</option>
        <option value="completed">Completed</option>
      </select>
      <select
        value={priority}
        onChange={(e) =>
          setFilters({ priority: e.target.value as typeof priority })
        }
      >
        <option value="all">Any priority</option>
        <option value="HIGH">High</option>
        <option value="MEDIUM">Medium</option>
        <option value="LOW">Low</option>
      </select>
    </div>
  );
}
