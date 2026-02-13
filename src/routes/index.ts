import { Router } from "express"
import healthRouter from "./health"
import questionsRouter from "./questions"
import testRls from "./test-rls"

const router = Router()

router.use("/health", healthRouter)
router.use("/questions", questionsRouter)

//test RLS route (using SERVICE ROLE key, so it bypasses RLS and shows all questions)
router.use("/test-rls", testRls)

export = router
