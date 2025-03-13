import type { Session, SupabaseClient, User } from "@supabase/supabase-js";
import type { Database } from "./lib/type/supabase";

// add type definitions for the new event.locals properties.
declare global {
  // created for global access, now combined with Database
  type supabaseFull = SupabaseClient<Database>
  namespace App {
    // interface Error {}
    interface Locals {
      supabase: supabaseFull;
      safeGetSession: () => Promise<{
        session: Session | null;
        user: User | null;
      }>;
      session: Session | null;
      user: User | null;
      uploadedBody: boolean;
      uploadedClothing: boolean;
    }
    interface PageData {
      session: Session | null;
    }
    // interface PageState {}
    // interface Platform {}
  }
}

export {};
