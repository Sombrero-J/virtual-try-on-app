<script lang="ts">
	import WardrobeItem from '$lib/components/wardrobe/wardrobeItem.svelte';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
</script>

<div
	class="bg-white-primary flex h-full w-full flex-col items-stretch justify-start gap-2 overflow-hidden px-4"
>
	{#await data.modelData then models}
		<div class="grid grid-cols-2 gap-2 md:grid-cols-3 md:gap-3 lg:grid-cols-4 lg:gap-4">
			<div
				class="bg-brand-secondary text-black-primary relative flex aspect-square cursor-pointer items-center justify-center rounded-lg text-5xl font-bold"
			>
				+
				<input
					type="file"
					name="new_model_image"
					id="upload_model"
					class="absolute h-full w-full cursor-pointer opacity-0"
				/>
			</div>
			{#each models as model}
				<WardrobeItem src={model.signed_url} alt={model.description || ''} />
			{/each}
		</div>
	{/await}
</div>
