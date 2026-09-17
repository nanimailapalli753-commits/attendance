import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

// Load .env
dotenv.config();

// Read Supabase settings
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Check URL
if (!supabaseUrl) {
  throw new Error("SUPABASE_URL is missing in .env");
}

// Check service role key
if (!supabaseServiceRoleKey) {
  throw new Error("SUPABASE_SERVICE_ROLE_KEY is missing in .env");
}

// Create Supabase server client
export const supabase = createClient(
  supabaseUrl,
  supabaseServiceRoleKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

console.log("[Supabase] Connection module loaded.");