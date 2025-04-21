export async function getClothings(supabase: supabaseFull, user_id: string) {
	const { data, error } = await supabase
		.from('clothings')
		.select('*')
		.eq('user_id', user_id)
		.order('last_modified', { ascending: false });

	if (error) {
		throw new Error('Error fetching clothes: ' + error.message);
	}
	return data;
}

export type ClothingWithTryOnsType = Awaited<ReturnType<typeof getClothingWithTryOns>>;

export async function getClothingWithTryOns(supabase: supabaseFull, user_id: string) {
	const response = supabase
		.from('clothings')
		.select(
			'id, name, categories_id, brands_id, front_image_url, back_image_url, signed_front, signed_back, expiry_front, expiry_back, try_on_sessions(id, try_on_url, signed_try_on, signed_expiry), brands(name), categories(name), colors(name), materials(name)'
		)
		.eq('user_id', user_id)
		.order('last_modified', { ascending: false });

	const { data, error } = await response; // maybe remove await to make it non-blocking

	if (error) {
		throw new Error('Error fetching clothes: ' + error.message);
	}

	const processedData = await Promise.all(data.map((item) => resolveSignedUrls(item, supabase)));
	return processedData;
}

export async function getOutfits(supabase: supabaseFull, user_id: string) {
	const { data, error } = await supabase
		.from('outfits')
		.select('*')
		.eq('user_id', user_id)
		.order('created_at', { ascending: false });

	if (error) {
		throw new Error('Error fetching outfits: ' + error.message);
	}

	const processedData = await Promise.all(data.map((item) => resolveSignedUrls(item, supabase)));
	return processedData;
}

export async function getTryOns(supabase: supabaseFull, user_id: string) {
	const { data, error } = await supabase.from('try_on_sessions').select('*').eq('user_id', user_id);
	// .order("created_at", { ascending: false });

	if (error) {
		throw new Error('Error fetching try ons: ' + error.message);
	}
	return data;
}

export type ModelsType = Awaited<ReturnType<typeof getModels>>;

export async function getModels(supabase: supabaseFull, user_id: string) {
	const { data, error } = await supabase
		.from('model_images')
		.select('*')
		.eq('user_id', user_id)
		.order('created_at', { ascending: false });

	if (error) {
		throw new Error('Error fetching model images: ' + error.message);
	}

	const processedData = await Promise.all(data.map((item) => resolveSignedUrls(item, supabase)));
	return processedData;
}

// INSERT INTO model_images (
// 	image_url,
// 	user_id,
// 	created_at
// )
// VALUES (
// 	p_model_image_url,
// 	p_user_id,
// 	NOW()
// )

export async function insertModel(supabase: supabaseFull, user_id: string, model_paths: string[]) {
	if (!model_paths || model_paths.length === 0) {
		console.log('No model paths provided to insert.');
		return [];
	}

	const newRows = model_paths.map((path) => ({
		image_url: path,
		user_id: user_id
	}));

	const { data, error } = await supabase.from('model_images').insert(newRows).select('*');

	if (error) {
		throw new Error('Error inserting model image: ' + error.message);
	}

	return data;
}

export type insertTryOnCacheType = {
	session_token: string;
	clothing_name: string;
	clothing_path: string;
	model_path: string;
	try_on_path: string;
	task_id: string;
	clothing_description: string;
	brand: string;
	colors: string[];
	materials: string[];
	category: string;
};

export async function insertTryOnCache(supabase: supabaseFull, body: insertTryOnCacheType) {
	const {
		session_token,
		clothing_name,
		clothing_path,
		model_path,
		try_on_path,
		task_id,
		clothing_description,
		brand,
		colors,
		materials,
		category
	} = body;
	const { data, error } = await supabase.from('anonymous_try_on_cache').insert(body).select('*');

	if (error) {
		console.error('Supabase insert error:', error);
		// Return a structured error object
		return { success: false, error: new Error(`Database Insert Failed: ${error.message}`) };
	}
	return { success: true, data: data };
}

interface UrlMappingConfig {
	idField: string;
	table: string;
	bucket: string;
	signedField: string;
	expiryField: string;
	defaultExpiry: number;
}

const urlMappings: { [key: string]: UrlMappingConfig } = {
	front_image_url: {
		idField: 'id',
		table: 'clothings',
		bucket: 'clothings',
		signedField: 'signed_front',
		expiryField: 'expiry_front',
		defaultExpiry: 3600
	},
	back_image_url: {
		idField: 'id',
		table: 'clothings',
		bucket: 'clothings',
		signedField: 'signed_back',
		expiryField: 'expiry_back',
		defaultExpiry: 3600
	},
	try_on_url: {
		idField: 'id',
		table: 'try_on_sessions',
		bucket: 'tryon',
		signedField: 'signed_try_on',
		expiryField: 'signed_expiry',
		defaultExpiry: 3600
	},
	image_url: {
		idField: 'id',
		table: 'model_images',
		bucket: 'models',
		signedField: 'signed_url',
		expiryField: 'expiry_signed',
		defaultExpiry: 3600
	},
	cover_image_url: {
		idField: 'id',
		table: 'outfits',
		bucket: 'tryon',
		signedField: 'signed_cover',
		expiryField: 'expiry_cover',
		defaultExpiry: 3600
	}
};

async function resolveSignedUrls<T extends Record<string, unknown>>(
	obj: T,
	supabase: supabaseFull
): Promise<T> {
	for (const key in urlMappings) {
		if (Object.hasOwn(obj, key) && typeof obj[key] === 'string' && obj[key]) {
			const config = urlMappings[key];

			const filePath = obj[key] as string;
			const id = obj[config.idField];

			if (id === undefined || id === null) {
				console.warn(
					`Skipping signed URL for field '${key}': Object missing ID field '${config.idField}'. Object:`,
					obj
				);
				continue; // Cannot update DB without ID
			}

			const now = new Date();
			const signedField = config.signedField;
			const expiryField = config.expiryField;

			const storedSignedUrl = obj[signedField] as string | null | undefined;
			const storedExpiry = obj[expiryField] as string | null | undefined;

			let needNewUrl = true;
			if (storedSignedUrl && storedExpiry) {
				const expiryDate = new Date(storedExpiry);

				const bufferMilliseconds = 5 * 60 * 1000;

				if (expiryDate.getTime() > now.getTime() + bufferMilliseconds) {
					needNewUrl = false;
				}
			}

			if (needNewUrl) {
				const { data, error } = await supabase.storage
					.from(config.bucket)
					.createSignedUrl(filePath, config.defaultExpiry);

				if (error || !data) {
					console.error(
						`Error generating signed URLs for field ${String(filePath)}:`,
						error?.message
					);
					(obj as Record<string, unknown>)[signedField] = null;
					(obj as Record<string, unknown>)[expiryField] = null;
					continue;
				}

				const newSignedUrl = data.signedUrl;
				const newExpiryISO = new Date(Date.now() + config.defaultExpiry * 1000).toISOString();

				// Update the object in memory (for immediate return to user)
				(obj as Record<string, unknown>)[signedField] = newSignedUrl;
				(obj as Record<string, unknown>)[expiryField] = newExpiryISO;

				triggerDirectBackgroundDbUpdate(
					config.table,
					config.idField,
					id as string | number,
					{
						[signedField]: newSignedUrl,
						[expiryField]: newExpiryISO
					},
					supabase
				);
			}
		}
	}

	// Recursively process any nested objects or arrays
	for (const key in obj) {
		if (Array.isArray(obj[key])) {
			obj[key] = await Promise.all(
				obj[key].map((item) =>
					typeof item === 'object' && item !== null
						? resolveSignedUrls(item as Record<string, unknown>, supabase)
						: item
				)
			);
		} else if (typeof obj[key] === 'object' && obj[key] !== null) {
			obj[key] = await resolveSignedUrls(obj[key] as Record<string, unknown>, supabase);
		}
	}

	return obj;
}

function triggerDirectBackgroundDbUpdate(
	tableName: string,
	idField: string,
	idValue: string | number,
	updates: Record<string, string | null>,
	supabase: supabaseFull
): void {
	supabase
		.from(tableName)
		.update(updates)
		.eq(idField, idValue)
		.then(({ error }) => {
			// we are not awaiting this, so it is fire-and-forget
			// The await happens implicitly before .then() is called
			if (error) {
				console.error(
					`Background Direct DB Update Error: Table=${tableName}, ID=${idValue}, Error=`,
					error
				);
			} else {
				console.log(`Background Direct DB Update Successful: Table=${tableName}, ID=${idValue}`);
			}
		});
}
