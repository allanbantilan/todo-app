import { mutation } from "./_generated/server";

// Run this once to migrate existing todos to have category and priority fields
export const migrateTodos = mutation({
  handler: async (ctx) => {
    const allTodos = await ctx.db.query("todos").collect();

    let migratedCount = 0;

    for (const todo of allTodos) {
      // Check if todo already has the new fields
      if (!todo.category || !todo.priority) {
        await ctx.db.patch(todo._id, {
          category: "Personal",
          priority: "Medium",
        });
        migratedCount++;
      }
    }

    return {
      message: `Migration completed. ${migratedCount} todos updated.`,
      totalTodos: allTodos.length,
      migratedTodos: migratedCount,
    };
  },
});

// Run this once to clear todos that don't have a userId (pre-auth todos)
export const clearPreAuthTodos = mutation({
  handler: async (ctx) => {
    const allTodos = await ctx.db.query("todos").collect();

    let deletedCount = 0;

    for (const todo of allTodos) {
      // Delete todos without userId (from before auth was added)
      if (!(todo as any).userId) {
        await ctx.db.delete(todo._id);
        deletedCount++;
      }
    }

    return {
      message: `Cleared ${deletedCount} pre-auth todos.`,
      totalTodos: allTodos.length,
      deletedTodos: deletedCount,
    };
  },
});

// Run this once to clean broken auth data where accounts point to missing users
export const cleanupOrphanAuthRecords = mutation({
  handler: async (ctx) => {
    const accounts = await ctx.db.query("authAccounts").collect();

    let deletedAccounts = 0;

    for (const account of accounts) {
      const user = await ctx.db.get(account.userId);
      if (!user) {
        await ctx.db.delete(account._id);
        deletedAccounts++;
      }
    }

    return {
      message: `Removed ${deletedAccounts} orphan auth account record(s).`,
      totalAccounts: accounts.length,
      deletedAccounts,
    };
  },
});