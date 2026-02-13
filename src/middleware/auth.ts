import { Request, Response, NextFunction } from "express"
import { supabase } from "../config/supabase"
import { AuthenticatedUser, UserProfile } from "../types"

// Extend Express Request to include user
declare global {
	namespace Express {
		interface Request {
			user?: AuthenticatedUser
		}
	}
}

export async function authenticateUser(
	req: Request,
	res: Response,
	next: NextFunction,
): Promise<void> {
	try {
		const authHeader = req.headers.authorization

		if (!authHeader || !authHeader.startsWith("Bearer ")) {
			res.status(401).json({ error: "Missing authentication token" })
			return
		}

		const token = authHeader.split(" ")[1]

		// Verify JWT with Supabase
		const {
			data: { user },
			error: authError,
		} = await supabase.auth.getUser(token)

		if (authError || !user) {
			res.status(401).json({ error: "Invalid or expired token" })
			return
		}

		// Fetch user's subscription tier
		const { data: profile, error: profileError } = await supabase
			.from("user_profiles")
			.select("subscription_tier")
			.eq("id", user.id)
			.single()

		if (profileError) {
			console.error("Profile fetch error:", profileError)
			// Default to free if profile doesn't exist yet
			req.user = {
				id: user.id,
				email: user.email || "",
				tier: "free",
			}
		} else {
			req.user = {
				id: user.id,
				email: user.email || "",
				tier: (profile as UserProfile).subscription_tier || "free",
			}
		}

		next()
	} catch (error) {
		console.error("Auth middleware error:", error)
		res.status(500).json({ error: "Authentication failed" })
	}
}
