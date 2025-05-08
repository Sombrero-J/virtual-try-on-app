import { fail, redirect } from '@sveltejs/kit';

import type { Actions } from './$types';
import { AuthApiError } from '@supabase/supabase-js';

export const actions: Actions = {
	signup: async ({ request, locals: { supabase }, url }) => {
		const formData = await request.formData();
		const email = formData.get('email') as string;
		const password = formData.get('confirmed_password') as string;

		const { error } = await supabase.auth.signUp({ email, password });
		if (error) {
			console.error('Signup Error:', error);

			// if users already exists, return a 422 error
			if (
				error instanceof AuthApiError &&
				(error.status === 422 || error.code === 'user_already_exists')
			) {
				return fail(422, {
					email,
					error: 'user_already_exists',
					message: 'An account with this email already exists.'
				});
			}

			// Handle other potential AuthApiErrors or generic errors
			return fail(500, {
				email,
				error: 'server_error',
				message: 'Something went wrong trying to sign you up. Please try again later.'
			});
		} else {
			const redirectTo = url.searchParams.get('redirectTo') || '/home';
			redirect(303, redirectTo);
		}
	}
};
