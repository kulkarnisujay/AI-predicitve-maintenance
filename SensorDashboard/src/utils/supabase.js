/**
 * Supabase Client Configuration
 *
 * This file initializes and exports the Supabase client for use throughout the application.
 * It uses configuration values from the config.js file.
 */

import { createClient } from "@supabase/supabase-js";
import { SUPABASE_CONFIG } from "./config";

// Initialize and export the Supabase client
export const supabase = createClient(
  SUPABASE_CONFIG.url,
  SUPABASE_CONFIG.anonKey
);
