<script lang="ts">
	import Draggable from '$lib/components/wardrobe/draggable.svelte';
	import Grids from '$lib/components/wardrobe/grids.svelte';
	import NewIcons from '$lib/components/wardrobe/newIcons.svelte';
	import Share from '$lib/svg/small/share.svelte';
	import Edit from '$lib/svg/small/wardrobe/edit.svelte';
	import WomanIcon from '$lib/svg/small/wardrobe/woman.svelte';
	import type { PageProps } from './$types';
	import Dialog from '$lib/components/dialog/dialog.svelte';
	import Button from '$lib/components/buttons/button.svelte';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import type { ClothingWithTryOnsType } from '$lib/server/database_helpers/queryDb';
	import WardrobeItem from '$lib/components/wardrobe/wardrobeItem.svelte';

	let { data, form }: PageProps = $props();

	let openDialog = $state(false);
	let openClothingDialog = $state(false);
	let selectedItem = $state<ClothingWithTryOnsType[number]>();
	let uniqueCategories = $state();

	onMount(async () => {
		try {
			const parentData = await data.parentData;
			const clothingsWithTryOns = await parentData.clothingsWithTryOns;
			if (clothingsWithTryOns && clothingsWithTryOns.length > 0) {
				selectedItem = clothingsWithTryOns[0];
				uniqueCategories = Array.from(
					new Set(
						clothingsWithTryOns.map((item) => item.categories?.name)
						// filter out any falsy values
						.filter((name): name is string => Boolean(name))
					)
				);
			} else {
				alert('Your wardrobe is empty. Please add some clothing to your wardrobe.');
			}
		} catch (error) {
			console.error(error);
		}
	});
</script>

<!-- awaiting page.servers's data -->
<div class="bg-white-primary relative h-full w-full overflow-hidden">
	{#await data.parentData}
		Loading
	{:then parent}
		{#if parent.clothingsWithTryOns}
			<!-- awaiting layout's data -->
			{#await parent.clothingsWithTryOns}
				Loading tryons
			{:then clothingsWithTryOns}
				{#if clothingsWithTryOns.length > 0}
					{#if selectedItem}
						<img
							class="relative w-full"
							src={selectedItem.try_on_sessions[0].signed_try_on}
							alt="try on"
						/>
					{/if}
					<button class="absolute top-3 left-3 cursor-pointer">
						<Edit />
					</button>
					<button class="absolute top-3 right-3 cursor-pointer">
						<Share />
					</button>

					<Draggable filterArray={uniqueCategories as string[]}>
						<div class="grid grid-cols-2 gap-2 md:grid-cols-3 md:gap-3 lg:grid-cols-4 lg:gap-4">
							<button
								class="bg-brand-secondary text-black-primary flex aspect-square cursor-pointer items-center justify-center rounded-lg text-5xl font-bold"
								onclick={() => {
									openDialog = true;
								}}
								>+
							</button>
							{#each clothingsWithTryOns as item}
								<WardrobeItem
									onclick={() => {
										openClothingDialog = true;
										selectedItem = item;
									}}
									src={item.signed_front}
									alt="front side of ${item.name}"
									selected={selectedItem?.front_image_url === item.front_image_url}
								/>
							{/each}
						</div>

						<Dialog button={false} title="Create" bind:open={openDialog} understood={false}>
							<div class="flex w-full flex-col gap-2">
								<Button
									text="Try on clothing"
									fullWidth={true}
									onclick={() => {
										goto('/beta/vto-test/body-image-upload');
									}}
								/>
								<Button text="Add clothing to wardrobe" fullWidth={true} />
							</div>
						</Dialog>
					</Draggable>
				{/if}
			{/await}
		{/if}
	{/await}
</div>
