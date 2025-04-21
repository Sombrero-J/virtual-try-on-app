import { fail, redirect } from '@sveltejs/kit';

import type { Actions } from './$types';
import { AuthApiError } from '@supabase/supabase-js';

export const actions: Actions = {
	signup: async ({ request, locals: { supabase } }) => {
		const formData = await request.formData();
		const email = formData.get('email') as string;
		const password = formData.get('confirmed_password') as string;

		const { error } = await supabase.auth.signUp({ email, password });
		if (error) {
			console.error('Signup Error:', error); // Log the full error for debugging

			// Check if it's the specific "User already exists" error
			// Use instanceof for better type safety and check the status code or specific error code
			if (
				error instanceof AuthApiError &&
				(error.status === 422 || error.code === 'user_already_exists')
			) {
				return fail(422, {
					// 422 Unprocessable Entity is appropriate
					email, // Send email back
					error: 'user_already_exists',
					message: 'An account with this email already exists.'
				});
			}

			// Handle other potential AuthApiErrors or generic errors
			return fail(500, {
				// 500 Internal Server Error for unexpected issues
				email,
				error: 'server_error',
				message: 'Something went wrong trying to sign you up. Please try again later.'
			});
		}
    return {
      success: true,
      message: 'Signup successful!'
    }
	}
};
