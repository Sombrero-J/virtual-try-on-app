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
	import Select from '$lib/components/melt/select.svelte';
	import FloatTextbox from '$lib/components/form/floatTextbox.svelte';
	import Info from '$lib/svg/info.svelte';

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

	let selectedClothing = $state<ClothingWithTryOnsType[number]>();
	let uniqueCategories = $state<string[]>([]);

	onMount(async () => {
		try {
			const parentData = await data.parentData;
			const clothingsWithTryOns = await parentData.clothingsWithTryOns;
			if (clothingsWithTryOns && clothingsWithTryOns.length > 0) {
				uniqueCategories = Array.from(
					new Set(
						clothingsWithTryOns
							.map((item) => item.categories?.name)
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

<div
	class="bg-white-primary flex h-full w-full flex-col items-stretch justify-start gap-2"
>
	<div
		{...tabs.triggerList}
		class="border-border-gray mx-4 flex items-center justify-center gap-2 rounded-xl border-1 p-0.5"
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
	<div class="flex items-center justify-start gap-2 pl-4">
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
				<div class="overflow-y-auto">
					<div class="grid grid-cols-2 gap-2 md:grid-cols-3 md:gap-3 lg:grid-cols-4 lg:gap-4">
						{#each clothings as item}
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
										}}
										src={item.try_on_sessions[0].signed_try_on || ''}
										alt="a person wearing ${item.name}"
									/>
								{/if}
							{/if}
						{/each}
					</div>
				</div>
			{/await}
		{/if}
	{/await}
</div>

<Dialog button={false} title="Clothing details" bind:open={openClothingDialog} understood={false}>
	<div class="flex w-full flex-col gap-2">
		{#if tabs.value === 'Images'}
			<img
				src={selectedClothing!.signed_front}
				alt="front side of ${selectedClothing!.name}"
				class="h-40 w-auto object-contain lg:h-90"
			/>
		{/if}

		<form method="post" class="flex flex-col gap-4" action="?/update" use:enhance>
			<FloatTextbox
				label="Name"
				name="name"
				placeholder="My Favourite..."
				value={selectedClothing?.name ?? ''}
				bind:changed
			/>
			<FloatTextbox
				label="Brand"
				name="brand"
				placeholder="Gucci, Polo..."
				value={selectedClothing?.brands?.name ?? null}
				bind:changed
			/>
			<FloatTextbox
				label="Category"
				name="category"
				placeholder="T-shirt, Dress..."
				value={selectedClothing?.categories?.name ?? null}
				bind:changed
			/>
			<FloatTextbox
				label="Material"
				name="material"
				placeholder="Cotton, Wool..."
				value={selectedClothing?.materials?.name ?? null}
				bind:changed
			/>

			<Select
				label="Color"
				options={[
					'red',
					'blue',
					'green',
					'yellow',
					'purple',
					'orange',
					'pink',
					'brown',
					'black',
					'white',
					'gray',
					'silver',
					'gold',
					'beige',
					'turquoise',
					'maroon',
					'navy',
					'teal',
					'lime',
					'olive',
					'azure',
					'ivory',
					'fuchsia',
					'khaki',
					'magenta',
					'plum',
					'salmon',
					'tan',
					'turquoise',
					'violet',
					'wheat',
					'zinc'
				]}
			/>
			<FloatTextbox label="Tag" name="tag" placeholder="Summer, Dinner...">
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

<Dialog title="Tag Info" button={false} bind:open={showTagInfo}>
	<p>
		A Tag is a way to categorise or label your clothing items, making it easier to search and
		organise your wardrobe.
	</p>
</Dialog>
