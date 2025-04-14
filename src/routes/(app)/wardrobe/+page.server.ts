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
		const name = formData.get('Name');
		const brand = formData.get('Brand');
		const category = formData.get('Category');

		const materials = formData.get('Materials') as string;
		const materialsArray = materials.split(', ');

		const color = formData.get('Colors') as string;
		const colorsArray = color.split(', ');

		const id = formData.get('id') as string;

		const user_id = user.id;

		console.log('Form data:', {
			name,
			brand,
			category,
			materialsArray,
			colorsArray,
			id,
			user_id
		});

		const { error } = await supabase.rpc('update_clothing_metadata', {
			p_user_id: user_id,
			p_name: name as string,
			p_brands: brand as string,
			p_categories: category as string,
			p_id: id,
			p_materials: materialsArray as string[],
			p_colors: colorsArray as string[]
		});

		if (error) {
			console.log('Error:', error.message);
			return fail(400, { message: 'Error updating clothing: ' + error.message });
		}

		console.log('Clothing updated successfully');
		return { success: true };
	}
};
