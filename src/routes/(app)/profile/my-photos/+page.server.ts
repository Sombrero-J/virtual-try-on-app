import { getModels } from '$lib/server/database_helpers/queryDb';
import { redirect, type Actions } from '@sveltejs/kit';
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
	delete: async ({ request, locals: { supabase }, url }) => {
		const formData = await request.formData();
		const ids = formData.getAll('deleteID') as string[];
		console.log('IDs to delete:', Number(ids));

		const response = await supabase.from('model_images').delete().eq('id', Number(ids));

		return {
			success: true,
			message: 'Delete successful'
		};
	}
};
