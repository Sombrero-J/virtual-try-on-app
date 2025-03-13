import { fail } from "@sveltejs/kit";
import type { Actions } from "./$types";

export const actions: Actions = {
  signup: async ({ request, locals: { supabase } }) => {
    const formData = await request.formData();
    const email = formData.get("email") as string;

    const { error } = await supabase
      .from("waiting_list")
      .insert([{ email: email }])

    if (error) {
      console.error(error);
      return fail(400, { email, incorrect: true });
    }
  },
};