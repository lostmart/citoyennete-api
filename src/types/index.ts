export interface Question {
	id: string
	level: "CSP" | "CR" | "NAT"
	theme: string
	question_type: "knowledge" | "situational"
	content: QuestionContent
	correct_answer: number
	is_premium: boolean
}

export interface QuestionContent {
	[language: string]: {
		question: string
		options: string[]
		explanation: string
	}
}

export interface UserProfile {
	id: string
	subscription_tier: "free" | "premium" | "lifetime"
	subscription_expires_at?: string
	preferred_language: string
	target_exam_level?: string
}

export interface AuthenticatedUser {
	id: string
	email: string
	tier: "free" | "premium" | "lifetime"
}

export interface QuestionQueryParams {
	level?: string
	theme?: string
	language?: string
	limit?: string
}
