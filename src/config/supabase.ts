import { createClient } from "@supabase/supabase-js"
import dotenv from "dotenv"

dotenv.config()

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
	throw new Error("Missing Supabase environment variables")
}

// Service key client (backend only - has elevated permissions)
export const supabase = createClient(supabaseUrl, supabaseServiceKey)
