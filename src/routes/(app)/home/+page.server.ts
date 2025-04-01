import { getModels } from '$lib/server/database_helpers/queryDb';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ parent, locals: { supabase, user } }) => {
	const title = 'All items'; //this is for the layout title

	if (!user) {
		redirect(302, '/auth/login');
	}
	const user_id = user.id;

	// streaming promises from layout.server.ts
	const parentData = parent();
	const modelData = getModels(supabase, user_id);
	return { parentData, modelData, title: title, message: null };
};
