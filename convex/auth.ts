import { convexAuth, getAuthUserId } from "@convex-dev/auth/server";
import { Password } from "@convex-dev/auth/providers/Password";
import { query } from "./_generated/server";

export const { auth, signIn, signOut, store } = convexAuth({
  providers: [
    Password({
      profile: (params) => {
        const email = String(params.email ?? "");
        const name =
          typeof params.name === "string" && params.name.trim().length > 0
            ? params.name.trim()
            : null;

        return {
          email,
          ...(name ? { name } : {}),
        };
      },
    }),
  ],
});

export const currentUser = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    return await ctx.db.get(userId);
  },
});