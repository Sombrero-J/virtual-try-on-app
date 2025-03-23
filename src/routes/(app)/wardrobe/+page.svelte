<script lang="ts">
	import FilterButton from '$lib/components/wardrobe/filterButton.svelte';
	import type { PageProps } from './$types';
	import { Tabs } from 'melt/builders';
	import Dialog from '$lib/components/dialog/dialog.svelte';
	import Textbox from '$lib/components/form/textbox.svelte';
	import type { Database } from '$lib/type/supabase';
	import WardrobeItem from '$lib/components/wardrobe/wardrobeItem.svelte';
	import type { ClothingWithTryOnsType } from '$lib/server/database_helpers/queryDb';
	import { onMount } from 'svelte';
	import Button from '$lib/components/buttons/button.svelte';
	import { enhance } from '$app/forms';

	let openClothingDialog = $state(false);
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
	class="bg-white-primary flex h-full w-full flex-col items-stretch justify-start gap-2 overflow-hidden"
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
	<div class="flex items-center justify-start gap-2 overflow-x-auto pl-4">
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
		<form method="post" action="?/update" use:enhance>
			<Textbox name="name" value={selectedClothing?.name ?? ''} bind:changed />
			<Textbox name="brand" value={selectedClothing?.brands?.name ?? 'undecided'} />
			<Textbox name="category" value={selectedClothing?.categories?.name} />
			<Textbox name="material" value={selectedClothing?.materials?.name ?? 'undecided'} />
			<Textbox name="color" value={selectedClothing?.colors?.[0]?.name} />
			<input type="hidden" name="id" value={selectedClothing?.id} />
			{#if changed}
				<Button type="submit" text="Update" fullWidth={true} />
			{/if}
		</form>
	</div>
</Dialog>
