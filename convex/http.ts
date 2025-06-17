import { httpRouter } from "convex/server"
import { auth } from "./auth"

const http = httpRouter()

// Add auth HTTP routes for OAuth providers and password auth
auth.addHttpRoutes(http)

export default http
