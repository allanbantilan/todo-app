import { defineSchema, defineTable } from "convex/server";

import { v } from "convex/values";

export default defineSchema({
  todos: defineTable({
    text: v.string(),
    isCompleted: v.boolean(),
    category: v.optional(v.string()),
    priority: v.optional(v.string()),
  }),
});
