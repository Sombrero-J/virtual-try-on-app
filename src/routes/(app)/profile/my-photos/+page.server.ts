import { getModels } from '$lib/server/database_helpers/queryDb';
import { fail, redirect, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals: { supabase, user } }) => {
	if (!user) {
		redirect(302, '/auth/login');
	}
	const user_id = user.id;
	const modelData = getModels(supabase, user_id);

	const backPath = '/profile';
	const title = 'My Photos';
	return { title, backPath, modelData };
};

export const actions: Actions = {
	delete: async ({ request, locals: { supabase } }) => {
		const formData = await request.formData();
		const idsAsString = formData.getAll('deleteID') as string[];

		if (!idsAsString || idsAsString.length === 0) {
			return { success: false, message: 'No items selected.' };
		}

		// Convert to number[]
		const idsAsNumbers = idsAsString.map((id) => Number(id));

		// --- Important: Check for NaN errors during conversion ---
		if (idsAsNumbers.some(isNaN)) {
			console.error('Error: Could not convert all IDs to numbers.', idsAsString, idsAsNumbers);
			return fail(402, { message: 'Invalid ID format detected.' });
		}

		console.log('Numeric IDs to delete:', idsAsNumbers);

		try {
			const { error, count } = await supabase.from('model_images').delete().in('id', idsAsNumbers);

			if (error) {
				console.error('Supabase delete error:', error);
				return { success: false, message: `Database error: ${error.message}` };
			}

			return {
				success: true,
				message: `${idsAsNumbers.length} model image(s) deleted.`,
				deletedCount: count
			};
		} catch (err) {
			console.error('Unexpected error during deletion:', err);
			return { success: false, message: 'An unexpected error occurred.' };
		}
	}
};
