import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getTodos = query({
  handler: async (ctx) => {
    const userId = await ctx.auth.getUserIdentity();

    if (!userId) {
      return [];
    }

    const todos = await ctx.db
      .query("todos")
      .withIndex("by_user", (q) => q.eq("userId", userId.subject))
      .order("desc")
      .collect();
    return todos;
  },
});

export const addTodo = mutation({
  args: {
    text: v.string(),
    category: v.string(),
    priority: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await ctx.auth.getUserIdentity();

    if (!userId) {
      throw new ConvexError("User must be authenticated");
    }

    // Validate priority
    if (!["High", "Medium", "Low"].includes(args.priority)) {
      throw new ConvexError("Priority must be 'High', 'Medium', or 'Low'");
    }

    const todoId = await ctx.db.insert("todos", {
      text: args.text,
      isCompleted: false,
      category: args.category,
      priority: args.priority,
      userId: userId.subject,
    });

    return todoId;
  },
});

export const toggleTodo = mutation({
  args: { id: v.id("todos") },
  handler: async (ctx, args) => {
    const userId = await ctx.auth.getUserIdentity();

    if (!userId) {
      throw new ConvexError("User must be authenticated");
    }

    const todo = await ctx.db.get(args.id);

    if (!todo) {
      throw new ConvexError("Todo not found");
    }

    if (todo.userId !== userId.subject) {
      throw new ConvexError("Unauthorized");
    }

    await ctx.db.patch(args.id, { isCompleted: !todo.isCompleted });
  },
});

export const deleteTodo = mutation({
  args: { id: v.id("todos") },
  handler: async (ctx, args) => {
    const userId = await ctx.auth.getUserIdentity();

    if (!userId) {
      throw new ConvexError("User must be authenticated");
    }

    const todo = await ctx.db.get(args.id);

    if (!todo) {
      throw new ConvexError("Todo not found");
    }

    if (todo.userId !== userId.subject) {
      throw new ConvexError("Unauthorized");
    }

    await ctx.db.delete(args.id);
  },
});

export const updateTodo = mutation({
  args: {
    id: v.id("todos"),
    text: v.string(),
    category: v.optional(v.string()),
    priority: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await ctx.auth.getUserIdentity();

    if (!userId) {
      throw new ConvexError("User must be authenticated");
    }

    const todo = await ctx.db.get(args.id);

    if (!todo) {
      throw new ConvexError("Todo not found");
    }

    if (todo.userId !== userId.subject) {
      throw new ConvexError("Unauthorized");
    }

    const updates: any = {
      text: args.text,
    };

    if (args.category !== undefined) {
      updates.category = args.category;
    }

    if (args.priority !== undefined) {
      // Validate priority if provided
      if (!["High", "Medium", "Low"].includes(args.priority)) {
        throw new ConvexError("Priority must be 'High', 'Medium', or 'Low'");
      }
      updates.priority = args.priority;
    }

    await ctx.db.patch(args.id, updates);
  },
});

export const clearAllTodos = mutation({
  handler: async (ctx) => {
    const userId = await ctx.auth.getUserIdentity();

    if (!userId) {
      throw new ConvexError("User must be authenticated");
    }

    const allTodos = await ctx.db
      .query("todos")
      .withIndex("by_user", (q) => q.eq("userId", userId.subject))
      .collect();

    for (const todo of allTodos) {
      await ctx.db.delete(todo._id);
    }
    return { deletedCount: allTodos.length };
  },
});
