import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	// TODO: Get user data
	const backPath = '/home';
	const title = 'Profile';
	return { title, backPath };
};
