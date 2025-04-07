import { BEAUTY_API } from "$env/static/private";

export async function createTask(
	fullBodyImageName: string,
	clothingImageName: string,
	category: string
): Promise<{
	success: boolean;
	task_uuid?: string;
	user_img_url?: string;
	cloth_img_url?: string;
	error?: string;
}> {
	const categoryItems = ['Upper Body', 'Lower Body', 'Dresses', 'Full Body', 'Hair'];
	const categoryNum = categoryItems.indexOf(category) + 1;

	if (categoryNum === 0) {
		return { success: false, error: 'Invalid category provided.' };
	}

	const payload = {
		user_img_name: fullBodyImageName,
		cloth_img_name: clothingImageName,
		category: categoryNum.toString(),
		watermark: 2
	};

	try {
		const response = await fetch('https://heybeauty.ai/api/create-task', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${BEAUTY_API}`
			},
			body: JSON.stringify(payload)
		});

		if (!response.ok) {
			return {
				success: false,
				error: 'Response Failure: Create Try On Request Failed.'
			};
		}

		const data = await response.json();
		if (data.code !== 0) {
			return { success: false, error: 'API Error: ' + data.message };
		}

		const { uuid, user_img_url, cloth_img_url } = data.data;
		console.log('User Image URL:', user_img_url);
		console.log('Cloth Image URL:', cloth_img_url);

		return { success: true, task_uuid: uuid, user_img_url, cloth_img_url };
	} catch (error) {
		console.error('Error creating task:', error);
		return { success: false, error: 'Exception occurred while creating task.' };
	}
}

export async function uploadFullBodyImage(
	user_img_url: string,
	fullBodyData: Buffer
): Promise<{ success: boolean; error?: string }> {
	try {
		const response = await fetch(user_img_url, {
			method: 'PUT',
			headers: {
				'Content-Type': 'image/jpeg'
			},
			body: fullBodyData
		});

		if (!response.ok) {
			return {
				success: false,
				error: 'Response Failure: Upload Full Body Image Failed.'
			};
		}

		return { success: true };
	} catch (error) {
		console.error('Error uploading full body image:', error);
		return {
			success: false,
			error: 'Exception occurred while uploading full body image.'
		};
	}
}

// Upload Clothing Image: Accepts the URL and file Buffer.
export async function uploadClothingImage(
	cloth_img_url: string,
	clothingData: Buffer
): Promise<{ success: boolean; error?: string }> {
	try {
		const response = await fetch(cloth_img_url, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/octet-stream'
			},
			body: clothingData
		});

		if (!response.ok) {
			return {
				success: false,
				error: 'Response Failure: Upload Clothing Image Failed.'
			};
		}

		return { success: true };
	} catch (error) {
		console.error('Error uploading clothing image:', error);
		return {
			success: false,
			error: 'Exception occurred while uploading clothing image.'
		};
	}
}

export async function submitTask(
	task_uuid: string
): Promise<{ success: boolean; message?: string; error?: string }> {
	const payload = { task_uuid };
	try {
		const response = await fetch('https://heybeauty.ai/api/submit-task', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${BEAUTY_API}`
			},
			body: JSON.stringify(payload)
		});

		if (!response.ok) {
			return { success: false, error: 'Response Failure: Submit Task Failed.' };
		}

		const data = await response.json();
		if (data.code !== 0) {
			return { success: false, error: 'API Error: ' + data.message };
		}

		return { success: true, message: task_uuid };
	} catch (error) {
		console.error('Error submitting task:', error);
		return {
			success: false,
			error: 'Exception occurred while submitting task.'
		};
	}
}
