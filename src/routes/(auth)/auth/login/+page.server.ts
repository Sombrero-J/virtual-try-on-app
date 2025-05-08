import { redirect } from '@sveltejs/kit'
import type { Actions } from './$types'
import { fail } from '@sveltejs/kit'

export const actions: Actions = {
  default: async ({ request, locals: { supabase }, url}) => {
    const formData = await request.formData();
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      console.error(error);
      return fail(400, { email, incorrect: true });
    } else {
      const redirectTo = url.searchParams.get('redirectTo') || '/home';
      redirect(303, redirectTo);
    }
  },
}