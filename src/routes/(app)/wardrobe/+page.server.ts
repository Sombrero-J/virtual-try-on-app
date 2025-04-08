import type { PageServerLoad } from './$types';
import { fail, type Actions } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ parent }) => {
	// streaming promises from layout.server.ts
	const title = 'Wardrobe'; //this is for the layout title
	const parentData = parent();

	return { parentData, title: title };
};

export const actions: Actions = {
	update: async ({ request, locals: { safeGetSession, supabase } }) => {
		const { session, user } = await safeGetSession();

		if (!session || !user) {
			return fail(401, { message: 'Unauthorized' });
		}
		const formData = await request.formData();
		const name = formData.get('name');
		const brand = formData.get('brand');
		const category = formData.get('category');
		const material = formData.get('material');
		const color = formData.get('color');
		const id = formData.get('id');

		const user_id = user.id;

		const { error } = await supabase.rpc('update_clothing_metadata', {
			p_brands: brand as string,
			p_categories: category as string,
			p_colors: [color] as string[],
			p_id: id as string,
			p_materials: material as string,
			p_name: name as string,
			p_user_id: user_id
		});

		if (error) {
			return fail(400, { message: 'Error updating clothing: ' + error.message });
		}

		return { success: true };
	}
};
