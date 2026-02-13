import { Router } from "express"
import { supabase } from "../config/supabase"

const router = Router()

router.get("/", async (req, res) => {
	try {
		// Fetch all questions using SERVICE ROLE key (bypasses RLS)
		const { data: allQuestions, error } = await supabase
			.from("questions")
			.select("exam_level")

		if (error) throw error

		res.json({
			message: "RLS Test - Using SERVICE ROLE key",
			note: "Service role bypasses RLS, so we see ALL questions",
			total_questions: allQuestions?.length || 0,
			breakdown: {
				CSP: allQuestions?.filter((q) => q.exam_level === "CSP").length,
				CR: allQuestions?.filter((q) => q.exam_level === "CR").length,
				NAT: allQuestions?.filter((q) => q.exam_level === "NAT").length,
			},
		})
	} catch (error) {
		res.status(500).json({ error: String(error) })
	}
})

export default router
