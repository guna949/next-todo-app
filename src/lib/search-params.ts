import {
  createSearchParamsCache,
  parseAsString,
  parseAsStringEnum,
} from "nuqs/server";

export const statusParser = parseAsStringEnum<"all" | "active" | "completed">([
  "all",
  "active",
  "completed",
]).withDefault("all");

export const priorityParser = parseAsStringEnum<
  "all" | "LOW" | "MEDIUM" | "HIGH"
>(["all", "LOW", "MEDIUM", "HIGH"]).withDefault("all");

export const searchParamsParsers = {
  q: parseAsString.withDefault(""),
  status: statusParser,
  priority: priorityParser,
};

// Parsed once per request on the server (page.tsx), reused by any nested
// Server Component that needs the same filter/search state without prop
// drilling.
export const searchParamsCache = createSearchParamsCache(searchParamsParsers);
