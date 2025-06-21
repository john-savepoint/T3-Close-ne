import { internalMutation } from "../_generated/server"
import { v } from "convex/values"

// Migration to add missing fields to existing documents
// This prevents schema validation errors when deploying

export const addEmailVerificationTimeToUsers = internalMutation({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect()

    let updated = 0
    for (const user of users) {
      // Only update if the field is missing
      if (user.emailVerificationTime === undefined) {
        await ctx.db.patch(user._id, {
          emailVerificationTime: Date.now(), // Set to current time as default
        })
        updated++
      }
    }

    console.log(`Migration complete: Updated ${updated} users with emailVerificationTime`)
    return { updated }
  },
})

// Generic migration to clean up extra fields not in schema
export const removeExtraFields = internalMutation({
  args: {
    tableName: v.string(),
    allowedFields: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    // This would need to be implemented based on your specific needs
    console.log(`Would clean up table: ${args.tableName}`)
    return { message: "Not implemented - customize as needed" }
  },
})
