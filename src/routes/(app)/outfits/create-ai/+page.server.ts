import type { Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const title = "AI Stylist";
	return { title };
};

export const actions: Actions = {
	create: async ({ request }) => {
		const formData = await request.formData();
		const purpose = formData.get('purpose');
		const dress_code = formData.get('dress_code');
		const location = formData.get('location');
		const time_of_day = formData.get('time_of_day');
		console.log(purpose, dress_code, location, time_of_day);
	}
};
