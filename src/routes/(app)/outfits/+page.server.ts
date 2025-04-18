import { getOutfits } from '$lib/server/database_helpers/queryDb';
import type { PageServerLoad } from './$types';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals: { supabase, safeGetSession }, parent }) => {
	const { session, user } = await safeGetSession();

	if (!session || !user) {
		return fail(401, { outfits: [], user: null });
	}

	const parentData = parent();
	const outfits = getOutfitsData(supabase, user!.id);
	const title = 'Outfits'; //this is for the layout title

	return { parentData, outfits, user: user, title: title };
};

const getOutfitsData = async (supabase: supabaseFull, user_id: string) => {
	const outfits = await getOutfits(supabase, user_id);

	if (!outfits || outfits.length === 0) {
		return [];
	}

	const currentTime = new Date();

	const itemsNeedingNewURLs = outfits.filter(
		(outfit) =>
			!outfit.signed_cover || !outfit.expiry_cover || new Date(outfit.expiry_cover) < currentTime
	);

	const signedUrlsMap = new Map();

	if (itemsNeedingNewURLs.length > 0) {
		const coverUrls = itemsNeedingNewURLs.map((cloth) => cloth.cover_image_url);

		const { data, error } = await supabase.storage
			.from('outfits_covers')
			.createSignedUrls(coverUrls, 3600); // Expiry time: 1 hour

		if (error || !data) {
			console.error('Error generating signed URLs:', error?.message);
			return outfits; // Return without updates if signing fails
		}

		// Store newly generated signed URLs in a Map for quick lookup
		itemsNeedingNewURLs.forEach((item, index) => {
			signedUrlsMap.set(item.id, {
				signedUrl: data[index]?.signedUrl || null,
				expiryTime: new Date(Date.now() + 3600 * 1000).toISOString()
			});
		});
	}

	// Update the clothing items with either the existing or new signed URL
	const updatedClothingItems = outfits.map((item) => {
		if (signedUrlsMap.has(item.id)) {
			return {
				...item,
				signed_cover: signedUrlsMap.get(item.id).signedUrl,
				expiry_cover: signedUrlsMap.get(item.id).expiryTime
			};
		}
		return item;
	});

	return updatedClothingItems;
};
