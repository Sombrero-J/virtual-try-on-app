<script lang="ts">
	import FilterButton from '$lib/components/wardrobe/filterButton.svelte';
	import type { PageProps } from './$types';
	import { Tabs } from 'melt/builders';
	import Dialog from '$lib/components/dialog/dialog.svelte';
	import Textbox from '$lib/components/form/textbox.svelte';
	import WardrobeItem from '$lib/components/wardrobe/wardrobeItem.svelte';
	import type { ClothingWithTryOnsType } from '$lib/server/database_helpers/queryDb';
	import { onMount } from 'svelte';
	import Button from '$lib/components/buttons/button.svelte';
	import { enhance } from '$app/forms';
	import MultiSelect from '$lib/components/melt/multiselect.svelte';
	import FloatTextbox from '$lib/components/form/floatTextbox.svelte';
	import Info from '$lib/svg/info.svelte';
	import { allCategories, filterStore, materials } from '$lib/state/appstate.svelte';
	import Select from '$lib/components/melt/select.svelte';

	let openClothingDialog = $state(false);
	let showTagInfo = $state(false);
	let changed = $state(false);

	const tabIds = ['Images', 'Models'];
	type TabId = (typeof tabIds)[number];
	const tabs = new Tabs<TabId>({
		selectWhenFocused: () => true,
		loop: () => true,
		orientation: () => 'horizontal',
		value: 'Images',
		onValueChange: (value) => {
			selectedTab = value;
		}
	});
	let selectedTab = $state('Images');

	let { data }: PageProps = $props();

	let selectedClothing = $state<ClothingWithTryOnsType[number] | null>();
	let selectedClothingColors = $derived(selectedClothing?.colors.map((color) => color.name) ?? []);
	let selectedClothingMaterials: string[] = $derived.by(() => {
		if (selectedClothing && selectedClothing?.materials.length > 0) {
			return selectedClothing?.materials?.map((material) => material.name);
		} else {
			return [];
		}
	});
	let clothingCount = $state(0);

	let uniqueCategories = $state<string[]>([]);
	const filterInstance = filterStore();

	onMount(async () => {
		try {
			const parentData = await data.parentData;
			const clothingsWithTryOns = await parentData.clothingsWithTryOns;
			clothingCount = clothingsWithTryOns.length;
			if (clothingsWithTryOns && clothingsWithTryOns.length > 0) {
				const categoryNames = clothingsWithTryOns
					.map((item: ClothingWithTryOnsType[number]) => item.categories?.name)
					.filter((name): name is string => Boolean(name)); // Type guard ensures string[]

				const uniqueNamesSet = new Set(categoryNames);

				// convert Set to an Array and prepend 'All'
				uniqueCategories = ['All', ...Array.from(uniqueNamesSet)];
			} else {
				alert('Your wardrobe is empty. Please add some clothing to your wardrobe.');
				uniqueCategories = ['All'];
			}
		} catch (error) {
			console.error(error);
			uniqueCategories = ['All'];
		}
	});
</script>

<div
	class="bg-white-primary flex h-full w-full flex-col items-stretch justify-start gap-2 p-4 lg:gap-5 lg:px-20 lg:py-10"
>
	<div class="hidden lg:flex justify-between w-full items-center">
		<h1 class="text-4xl font-medium">Wardrobe</h1>
		<p class="text-black-tertiary text-2xl">{clothingCount <= 0 ? 'No' : clothingCount} items</p>
	</div>
	<div
		{...tabs.triggerList}
		class="border-border-gray flex items-center justify-center gap-2 rounded-xl border-1 p-0.5"
	>
		{#each tabIds as id}
			<button
				{...tabs.getTrigger(id)}
				class={[
					'bg-brand flex-1 cursor-pointer rounded-md p-0.5',
					tabs.value === id
						? 'bg-brand-gradient text-white-primary'
						: 'bg-white-primary text-black-primary'
				]}
			>
				{id}</button
			>
		{/each}
	</div>
	<div class="flex items-center justify-start gap-2 overflow-x-auto overflow-y-hidden py-2">
		{#each uniqueCategories as filter}
			<FilterButton {filter} />
		{/each}
	</div>
	{#await data.parentData then parent}
		{#if parent.clothingsWithTryOns}
			<!-- awaiting layout's data -->
			{#await parent.clothingsWithTryOns}
				Loading clothes
			{:then clothings}
				<div class="overflow-y-auto p-2">
					<div class="grid grid-cols-2 gap-2 md:grid-cols-3 md:gap-3 lg:grid-cols-4 lg:gap-4">
						{#each clothings as item}
							{#if filterInstance.filterCategory === 'All' || item.categories?.name === filterInstance.filterCategory}
								{#if tabs.value === 'Images'}
									<WardrobeItem
										onclick={() => {
											openClothingDialog = true;
											selectedClothing = item;
										}}
										src={item.signed_front}
										alt="front side of ${item.name}"
									/>
								{:else if tabs.value === 'Models'}
									{#if item.try_on_sessions.length > 0}
										<WardrobeItem
											onclick={() => {
												openClothingDialog = true;
												selectedClothing = item;
											}}
											src={item.try_on_sessions[0].signed_try_on || ''}
											alt="a person wearing ${item.name}"
										/>
									{:else}
										<WardrobeItem
											onclick={() => {
												openClothingDialog = true;
												selectedClothing = item;
											}}
											src={item.signed_front}
											alt="front side of ${item.name}"
										/>
									{/if}
								{/if}
							{/if}
						{/each}
					</div>
				</div>
			{/await}
		{/if}
	{/await}
</div>

<Dialog textButton={false} title="Clothing details" bind:open={openClothingDialog}>
	<div class="flex w-full flex-col gap-2 lg:flex-row lg:gap-5">
		<img
			src={selectedClothing!.signed_front}
			alt="front side of ${selectedClothing!.name}"
			class="h-40 w-auto rounded-lg object-contain lg:h-90"
		/>

		<form
			method="post"
			class="flex w-[25rem] flex-col gap-4 py-2"
			action="?/update"
			use:enhance={() => {
				return ({ result, update }) => {
					if (result.type === 'success') {
						// Handle success
						alert('Clothing updated successfully!');
						changed = false;
						openClothingDialog = false;
					} else if (result.type === 'failure') {
						alert('Error updating clothing. Please try again.' + result.data);
						openClothingDialog = false;
					}
				};
			}}
		>
			<FloatTextbox
				label="Name"
				name="name"
				placeholder="My Favourite..."
				value={selectedClothing?.name ?? ''}
				required={true}
				bind:changed
			/>
			<FloatTextbox
				label="Brand"
				name="brand"
				placeholder="Gucci, Polo..."
				value={selectedClothing?.brands?.name ?? null}
				required={false}
				bind:changed
			/>
			<MultiSelect
				label="Materials"
				options={materials}
				defaultValue={selectedClothingMaterials}
				bind:changed
			/>
			<MultiSelect label="Colors" color={true} defaultValue={selectedClothingColors} bind:changed />
			<Select
				label="Category"
				options={allCategories}
				defaultValue={selectedClothing?.categories?.name}
				required={true}
				bind:changed
			/>
			<FloatTextbox
				label="Tag"
				name="tag"
				placeholder="Summer, Dinner..."
				required={false}
				bind:changed
			>
				{#snippet iconright()}
					<button class="cursor-pointer" onclick={() => (showTagInfo = !showTagInfo)}>
						<Info />
					</button>
				{/snippet}
			</FloatTextbox>
			<input type="hidden" name="id" value={selectedClothing?.id} />
			<Button type="submit" text="Update" fullWidth={true} disabled={!changed} />
		</form>
	</div>
</Dialog>

<Dialog title="Tag Info" textButton={false} bind:open={showTagInfo}>
	<p>
		A Tag is a way to categorise or label your clothing items, making it easier to search and
		organise your wardrobe.
	</p>
</Dialog>
