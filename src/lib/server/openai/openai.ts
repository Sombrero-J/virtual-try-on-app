import OpenAI from 'openai';
import { OPENAI_API_KEY } from '$env/static/private';

const openai = new OpenAI({
	apiKey: OPENAI_API_KEY
});

export async function describeImage(base64Image: string) {
	try {
		const systemPrompt =
			'You are an AI assistant for a Digital Wardrobe application, specializing in detailed and factual clothing descriptions based on uploaded images.\n\nObjective:\nYour task is to generate a precise and structured description to help an AI agent recommend suitable clothing to users.\nGuidelines:\n\nEssential Details:\n        Brand (if visible).\n        Color(s) (include multiple if applicable).\n        Material (only if distinguishable).\n        Category (e.g., t-shirt, dress, blazer).\n        Distinct Features (e.g., logo placement, patterns, embellishments, sleeve type, neckline, closure).\n\n    Strict Accuracy:\n        Do not assume or infer details. Only describe what is clearly visible.\n        Do not mention unexisting elements (e.g., buttons if not shown, specific fabrics if unclear).\n        Avoid subjective or emotional terms. (e.g., “stylish,” “elegant”).\n\n    Clarity & Brevity:\n        Keep descriptions under 35 words for quick processing.\n        Use a structured, natural, and professional tone as if describing to a visually impaired person.\n\nExample Output:\nBlack Nike hoodie with front zipper, adjustable drawstring hood, ribbed cuffs, and kangaroo pocket.\nLavender Vans t-shirt with contrasting black sleeves, crew neck, and bold front logo print. \n If the brand or material is unclear from the image, return null instead of guessing.';

		const response = await openai.responses.create({
			model: 'gpt-4o-mini',
			instructions: systemPrompt,
			input: [
				{
					role: 'user',
					content: [
						{
							type: 'input_image',
							image_url: `data:image/jpeg;base64,${base64Image}`,
							detail: 'high'
						}
					]
				}
			],
			text: {
				format: {
					type: 'json_schema',
					name: 'clothing_description',
					schema: {
						type: 'object',
						properties: {
							description: { type: 'string' },
							brand: { type: ['string', 'null'] },
							color: { type: 'array', items: { type: 'string' } },
							material: { type: ['string', 'null'] },
							category: { type: 'string' }
						},
						required: ['description', 'color', 'category', 'brand', 'material'],
						additionalProperties: false
					},
					strict: true
				}
			},
			temperature: 0.5,
			max_output_tokens: 2048,
			store: true
		});

		const outputItem = response.output[0];

		if ('content' in outputItem) {
			const contentItem = outputItem.content[0];

			if (contentItem.type === 'refusal') {
				console.error(contentItem.refusal);
				return { result: null, error: contentItem.refusal };
			} else {
				console.log(response.output_text);
				return { result: response.output_text, error: null};
			}
		} else {
			console.error('Unexpected output type', outputItem);
			throw new Error('Invalid response format: missing content');
		}
	} catch (error) {
		console.error('Error while describing the image:', error);
		return { result: null, error: 'Error while describing the image' };
	}
}
