import type { LayoutServerLoad } from './$types';
import { getClothingWithTryOns } from '$lib/server/database_helpers/queryDb';

import { redirect } from '@sveltejs/kit';

export const load: LayoutServerLoad = async ({ locals: { supabase, session, user }, cookies }) => {
	if (!session || !user) {
		redirect(302, '/auth/login');
	}

	const clothingsWithTryOns = getClothingWithTryOns(supabase, user.id);

	return {
		clothingsWithTryOns,
		user,
		session,
		cookies: cookies.getAll()
	};
};
