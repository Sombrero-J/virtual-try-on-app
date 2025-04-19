import type { Actions } from "@sveltejs/kit";
import { fail } from "@sveltejs/kit";

export const actions: Actions = {
  reset: async ({ request, locals: { supabase } }) => {
    const formData = await request.formData();
    const email = formData.get("email") as string;

    if (!email) {
			return fail(400, { email, missing: true });
		}

    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) {
      return fail(400, { email, incorrect: true });
    }

    return { success: true, email: email };
  },
};