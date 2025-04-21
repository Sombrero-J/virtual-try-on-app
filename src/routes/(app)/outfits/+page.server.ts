import { getOutfits } from '$lib/server/database_helpers/queryDb';
import type { PageServerLoad } from './$types';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals: { supabase, safeGetSession }, parent }) => {
	const { session, user } = await safeGetSession();

	if (!session || !user) {
		return fail(401, { outfits: [], user: null });
	}

	const parentData = parent();
	const outfits = getOutfits(supabase, user!.id);
	const title = 'Outfits'; //this is for the layout title

	return { parentData, outfits, user: user, title: title };
};
