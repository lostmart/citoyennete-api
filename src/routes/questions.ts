import { Router, Request, Response } from "express"
import { supabase } from "../config/supabase"
import { authenticateUser } from "../middleware/auth"
import { Question, QuestionQueryParams } from "../types"

const router = Router()

// GET /api/questions - Fetch questions with access control
router.get("/", authenticateUser, async (req: Request, res: Response) => {
	try {
		const {
			level,
			theme,
			language = "fr",
			limit = "10",
		} = req.query as QuestionQueryParams
		const userTier = req.user!.tier

		// Build query
		let query = supabase
			.from("questions")
			.select(
				"id, level, theme, question_type, content, correct_answer, is_premium",
			)

		// Filter by level
		if (level) {
			query = query.eq("level", level)
		}

		// Filter by theme
		if (theme) {
			query = query.eq("theme", theme)
		}

		// Access control: Free users can't access premium content
		if (userTier === "free") {
			query = query.eq("is_premium", false)
		}

		// Limit results
		const limitNum = parseInt(limit, 10)
		query = query.limit(limitNum)

		const { data: questions, error } = await query

		if (error) {
			throw error
		}

		// Transform response: Extract language-specific content
		const transformedQuestions = (questions as Question[]).map((q) => ({
			id: q.id,
			level: q.level,
			theme: q.theme,
			type: q.question_type,
			question: q.content[language]?.question || q.content["fr"]?.question,
			options: q.content[language]?.options || q.content["fr"]?.options,
			explanation:
				q.content[language]?.explanation || q.content["fr"]?.explanation,
			correctAnswer: q.correct_answer,
			isPremium: q.is_premium,
		}))

		res.json({
			questions: transformedQuestions,
			count: transformedQuestions.length,
			userTier: userTier,
		})
	} catch (error) {
		console.error("Error fetching questions:", error)
		res.status(500).json({ error: "Failed to fetch questions" })
	}
})

export default router
