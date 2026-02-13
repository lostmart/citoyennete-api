import express, { Application } from "express"
import cors from "cors"
import routes from "./routes"
import { errorHandler } from "./middleware/errorHandler"

const app: Application = express()
const PORT = process.env.PORT || 3000

// Middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// CORS configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",") || [
	"http://localhost:5173",
]
app.use(
	cors({
		origin: (origin, callback) => {
			// Allow requests with no origin (mobile apps, Postman, etc.)
			if (!origin) return callback(null, true)

			if (allowedOrigins.includes(origin)) {
				callback(null, true)
			} else {
				callback(new Error("Not allowed by CORS"))
			}
		},
		credentials: true,
	}),
)

// Routes
app.use("/api", routes)

// Error handling
app.use(errorHandler)

// Start server
app.listen(PORT, () => {
	console.log(`🚀 Server running on port ${PORT}`)
	console.log(`📍 Environment: ${process.env.NODE_ENV || "development"}`)
	console.log(`🔗 Health check: http://localhost:${PORT}/api/health`)
})
