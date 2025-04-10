<script lang="ts">
	import WardrobeItem from '$lib/components/wardrobe/wardrobeItem.svelte';
	import type { ModelsType } from '$lib/server/database_helpers/queryDb';
	import Trashcan from '$lib/svg/small/profile/trashcan.svelte';
	import { onMount } from 'svelte';
	import type { PageProps } from './$types';
	import { innerWidth } from 'svelte/reactivity/window';
	import Dialog from '$lib/components/dialog/dialog.svelte';
	import Button from '$lib/components/buttons/button.svelte';

	let { data, form }: PageProps = $props();
	let isMobile = $derived((innerWidth.current && innerWidth.current < 1024) || false);
	let selectedModel = $state<ModelsType[number] | null>(null);
	let opendelete = $state(false);

	onMount(async () => {
		try {
			const models = await data.modelData;

			if (models && models.length > 0) {
				if (models.length > 0) {
					selectedModel = models[0];
				} else {
					// Handle the case where items exist, but none have try-on sessions
					console.log('No clothing items found with active try-on sessions.');
					// Optionally alert the user or set a specific state
					// selectedItem remains null
				}
			} else {
				alert('Your wardrobe is empty. Please add some clothing to your wardrobe.');
				selectedModel = null;
			}
		} catch (error) {
			console.error('Error initializing wardrobe categories:', error);
			selectedModel = null;
		}
	});
</script>

{#if !isMobile}
	<div class="bg-white-primary relative h-full w-full overflow-hidden lg:flex lg:py-20 lg:pr-20">
		{#await data.modelData}
			Loading tryons
		{:then models}
			{#if models.length > 0}
				{#if selectedModel}
					<div class="flex w-full items-center justify-center lg:w-1/2 lg:p-4">
						<div class="relative w-full max-w-[25rem] p-1 lg:w-2/3 lg:max-w-[30rem]">
							<img
								class="h-full w-full shadow-lg lg:rounded-lg lg:object-cover"
								src={selectedModel.signed_url}
								alt="try on"
							/>
							<div
								class="absolute top-0 -right-12 hidden flex-col items-center justify-center gap-3 lg:flex"
							>
								<button
									class="cursor-pointer"
									onclick={() => {
										opendelete = !opendelete;
									}}
								>
									<Trashcan />
								</button>
							</div>
						</div>
					</div>
				{/if}
				<div class="flex w-1/2 flex-col items-start justify-start gap-5">
					<div class="grid grid-cols-2 gap-2 md:grid-cols-3 md:gap-3 lg:grid-cols-4 lg:gap-4">
						<button
							class="bg-brand-secondary text-brand flex aspect-square cursor-pointer items-center justify-center rounded-lg text-6xl font-bold"
							onclick={() => {}}
							>+
						</button>
						{#each models as model}
							<WardrobeItem
								selected={selectedModel?.id === model.id}
								src={model.signed_url}
								alt={model.description || ''}
								onclick={() => {
									selectedModel = model;
								}}
							/>
						{/each}
					</div>
				</div>
			{/if}
		{/await}
	</div>
{:else}
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
{/if}

<Dialog textButton={false} title="Delete photo" open={opendelete}>
	<div class="flex w-full flex-col items-center justify-start gap-5">
		<h1 class="text-xl text-black-secondary">Are you sure that you want to delete this photo?</h1>
		<div class="flex w-full gap-2">
			<Button text="Cancel" style="secondary" fullWidth={true} />
			<Button text="Delete" fullWidth={true} />
		</div>
	</div>
</Dialog>
