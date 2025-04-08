<script lang="ts">
	import FilterButton from '$lib/components/wardrobe/filterButton.svelte';
	import type { PageProps } from './$types';
	import WardrobeItem from '$lib/components/wardrobe/wardrobeItem.svelte';
	import type { ClothingWithTryOnsType } from '$lib/server/database_helpers/queryDb';
	import { onMount } from 'svelte';
	import StepIndicator from '$lib/components/visualiser/stepIndicator.svelte';
	import { bottoms, filterStore, tops } from '$lib/state/appstate.svelte';
	import Button from '$lib/components/buttons/button.svelte';
	import Pin from '$lib/svg/pin.svelte';

	let openClothingDialog = $state(false);
	let showTagInfo = $state(false);
	let changed = $state(false);

	let { data }: PageProps = $props();

	let step = $state(1);
	let selectedClothing = $state<ClothingWithTryOnsType[number]>();

	let clothingsWithTryOns = $state<ClothingWithTryOnsType>();

	let filteredClothingsWithTryOns = $derived.by(() => {
		// Return empty array if base data isn't loaded yet
		if (!clothingsWithTryOns) {
			return [];
		}

		// Get the category name safely
		const getCategoryName = (item: ClothingWithTryOnsType[number]): string | undefined =>
			item.categories?.name;

		if (step === 1) {
			// Use .includes() to check if the category name is IN the array
			return clothingsWithTryOns.filter((item) => {
				const categoryName = getCategoryName(item);
				return categoryName ? tops.includes(categoryName) : false;
			});
		} else if (step === 2) {
			// Use .includes() here too
			return clothingsWithTryOns.filter((item) => {
				const categoryName = getCategoryName(item);
				return categoryName ? bottoms.includes(categoryName) : false;
			});
		} else {
			// Default case: Return empty array if step is not 1 or 2
			return [];
			// Or maybe return all items? -> return clothingsWithTryOns;
		}
	});

	let uniqueCategories = $derived.by(() => {
		// .map on an empty array is safe
		return Array.from(
			new Set(
				filteredClothingsWithTryOns
					.map((item) => item.categories?.name) // item type is inferred here
					.filter((name): name is string => Boolean(name)) // Keep only valid string names
			)
		);
	});

	const filterInstance = filterStore();

	onMount(async () => {
		try {
			const parentData = await data.parentData;
			clothingsWithTryOns = await parentData.clothingsWithTryOns;
			if (!clothingsWithTryOns || clothingsWithTryOns.length === 0) {
				alert('Your wardrobe is empty. Please add some clothing to your wardrobe.');
			}
		} catch (error) {
			console.error(error);
		}
	});
</script>

<div class="bg-white-primary flex h-full w-full flex-col items-stretch justify-start gap-2 p-4">
	<StepIndicator steps={2} activeStep={step} />
	<h1>Select an upper body clothing</h1>
	<div class="flex items-center justify-start gap-2">
		{#each uniqueCategories as filter}
			<FilterButton {filter} />
		{/each}
	</div>
	{#if selectedClothing && step === 2}
		<div class="flex w-full items-center justify-center">
			<div class="relative">
				<img
					src={selectedClothing.signed_front}
					alt="model"
					class=" max-h-32 rounded-md object-cover shadow-sm"
				/>
				<Pin twClass="absolute -top-2 -right-2" />
			</div>
		</div>
	{/if}
	{#await data.parentData then parent}
		{#if parent.clothingsWithTryOns}
			<!-- awaiting layout's data -->
			{#await parent.clothingsWithTryOns then clothings}
				{#if filteredClothingsWithTryOns.length !== 0}
					<div class="overflow-y-auto flex-1">
						<div class="grid grid-cols-2 gap-2 md:grid-cols-3 md:gap-3 lg:grid-cols-4 lg:gap-4">
							{#each filteredClothingsWithTryOns as item}
								{#if filterInstance.filterCategory === 'All' || item.categories?.name === filterInstance.filterCategory}
									<WardrobeItem
										src={item.signed_front}
										alt="front side of ${item.name}"
										selected={selectedClothing?.front_image_url === item.front_image_url}
										onclick={() => {
											selectedClothing = item;
										}}
									/>
								{/if}
							{/each}
						</div>
					</div>
				{:else}
					<p>You have no {step === 1 ? 'Tops' : 'Bottoms'}</p> 
				{/if}
			{/await}
		{/if}
	{/await}
	<Button
		text={step === 1 ? "Next" : "Create Outfit"}
		onclick={() => {
			step++;
		}}
		disabled={!selectedClothing}
		fullWidth={true}
	/>
</div>
