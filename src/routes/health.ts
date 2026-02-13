import "dotenv/config"
import { Router, Request, Response } from "express"
import { supabase } from "../config/supabase"


const router = Router()

router.get("/", async (req: Request, res: Response) => {
	try {
		// Test database connection by attempting a simple query
		const { data, error } = await supabase.from("_test").select("*").limit(1)

		// PGRST205: Table not found in schema cache (table doesn't exist - connection OK)
		// 42P01: PostgreSQL table does not exist (connection OK)
		// Any other error code indicates a connection problem
		if (error && error.code !== "PGRST205" && error.code !== "42P01") {
			console.error("Supabase connection error:", error)
			throw error
		}

		res.json({
			status: "ok",
			supabase: "connected",
			timestamp: new Date().toISOString(),
		})
	} catch (error) {
		console.error("Health check failed:", error)
		// Handle both Error objects and plain objects from Supabase
		const errorMessage = error instanceof Error
			? error.message
			: (error as any)?.message || "Unknown error"

		res.status(500).json({
			status: "error",
			message: errorMessage,
		})
	}
})

export default router
