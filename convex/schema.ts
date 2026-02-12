import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  ...authTables,
  todos: defineTable({
    text: v.string(),
    isCompleted: v.boolean(),
    category: v.optional(v.string()),
    priority: v.optional(v.string()),
    userId: v.string(),
  }).index("by_user", ["userId"]),
});
