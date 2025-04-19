import type { Actions } from "@sveltejs/kit";
import { fail } from "@sveltejs/kit";
import { redirect } from "@sveltejs/kit";

export const actions: Actions = {
  reset: async ({ request, locals: { supabase } }) => {
    const formData = await request.formData();
    const new_password = formData.get("confirmed_new_password") as string;
    const { error } = await supabase.auth.updateUser({
      password: new_password,
    });
    if (error) {
      console.error(error);
      return fail(400, { error: true });
    }

    redirect(303, "/");
  },
};
