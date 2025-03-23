import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	// TODO: Get user data
	const title = 'Profile';
	return { title };
};
