import { Router } from "express"
import healthRouter from "./health"
import questionsRouter from "./questions"

const router = Router()

router.use("/health", healthRouter)
router.use("/questions", questionsRouter)

export = router
