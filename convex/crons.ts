import { cronJobs } from "convex/server"
import { internal } from "./_generated/api"

const crons = cronJobs()

// Auto-purge trashed chats older than 30 days
// Runs daily at 2 AM UTC to minimize disruption
crons.daily(
  "auto-purge-trashed-chats",
  { hourUTC: 2, minuteUTC: 0 },
  internal.chats.autoPurgeTrashedChats
)

export default crons
