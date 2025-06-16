import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const getCurrentUser = query({
  args: {},
  handler: async (ctx: any) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }
    
    return await ctx.db.get(userId);
  },
});

export const updateUserProfile = mutation({
  args: {
    name: v.optional(v.string()),
    image: v.optional(v.string()),
  },
  handler: async (ctx: any, { name, image }: { name?: string; image?: string }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }
    
    interface UserUpdateData {
      name?: string;
      image?: string;
    }
    
    const updateData: UserUpdateData = {};
    if (name !== undefined) updateData.name = name;
    if (image !== undefined) updateData.image = image;
    
    if (Object.keys(updateData).length === 0) {
      return;
    }
    
    await ctx.db.patch(userId, updateData);
  },
});