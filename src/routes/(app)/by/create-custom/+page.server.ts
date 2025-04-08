import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals: { user }, parent }) => {
	if (!user) {
		redirect(302, '/auth/login');
	}

	const backPath = '/outfits';
	const title = 'Customise outfit';
	const parentData = parent();

	return { title, backPath, parentData };
};
