import { fail, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const title = 'Change Password';
	const backPath = '/profile';
	return { title, backPath };
};

export const actions: Actions = {
	change_password: async ({ request, locals: { supabase } }) => {
		const formData = await request.formData();
		const newPassword = formData.get('confirmed_password') as string;

		console.log('newPassword', newPassword);

		const { error } = await supabase.auth.updateUser({ password: newPassword });
		if (error) {
			console.error(error);
			return fail(500, { messsage: 'Failed to change password' });
		} else {
			return { success: true };
		}
	}
};
