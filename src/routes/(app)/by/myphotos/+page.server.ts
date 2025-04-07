import { getModels } from '$lib/server/database_helpers/queryDb';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals: { supabase, user } }) => {
	if (!user) {
		redirect(302, '/auth/login');
	}
	const user_id = user.id;
	const modelData = getModels(supabase, user_id);

	const backPath = '/by/profile';
	const title = 'My Photos';
	return { title, backPath, modelData };
};
