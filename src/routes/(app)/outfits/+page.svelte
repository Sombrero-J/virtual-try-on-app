<script lang="ts">
	import type { PageProps } from './$types';
	import Button from '$lib/components/buttons/button.svelte';
	import Dialog from '$lib/components/dialog/dialog.svelte';
	import { goto } from '$app/navigation';
	import Warning from '$lib/svg/indicators/warning.svelte';
	import { onMount } from 'svelte';
	import Bigdialogbutton from '$lib/components/buttons/bigdialogbutton.svelte';
	import DialogButton from '$lib/components/buttons/dialogButton.svelte';
	import { innerWidth } from 'svelte/reactivity/window';

	const tops = ['T-Shirts', 'Long-Sleeve Tops', 'Shirts', 'Sweaters', 'Hoodies', 'Sleeveless'];
	const bottoms = ['Jeans', 'Pants', 'Skirts', 'Shorts', 'Athletic Bottoms'];
	const SUPPORTED_CATEGORIES = [...tops, ...bottoms];

	let { data, form }: PageProps = $props();

	let openDialog = $state(false);

	let numberOfTops = $state(0);
	let numberOfBottoms = $state(0);
	let lockOutfits = $derived(numberOfTops < 2 || numberOfBottoms < 1);

	onMount(async () => {
		let errorMessage;
		numberOfTops = 0;
		numberOfBottoms = 0;

		try {
			const parentDataResolved = await data.parentData; // Adjust if await isn't needed
			const clothingsWithTryOns = await parentDataResolved?.clothingsWithTryOns;

			// Check if clothingsWithTryOns is an array and has items
			if (clothingsWithTryOns && clothingsWithTryOns.length > 0) {
				let topsCount = 0;
				let bottomsCount = 0;

				for (const item of clothingsWithTryOns) {
					const categoryName = item.categories?.name;

					// Check if categoryName exists before using .includes
					if (categoryName) {
						if (tops.includes(categoryName)) {
							topsCount++;
						} else if (bottoms.includes(categoryName)) {
							bottomsCount++;
						}
					}
				}

				numberOfTops = topsCount;
				numberOfBottoms = bottomsCount;
			} else {
				// Handle the case where the wardrobe is empty or data is missing
				console.log('Wardrobe data is empty or not in the expected format.');
				// Avoid alert, prefer showing a message in the template:
				alert('Your wardrobe is empty. Please add some clothing to your wardrobe.');
			}
		} catch (error) {
			console.error('Error initializing wardrobe categories:', error);
			errorMessage = 'Failed to load wardrobe items. Please try again.'; // Set error message for UI
			alert(errorMessage);
		}
	});

	let isMobile = $derived((innerWidth.current && innerWidth.current < 1024) || false);
</script>

<div
	class="bg-white-primary flex h-full w-full flex-col items-center justify-center gap-2 overflow-hidden pb-2"
>
	{#await data.outfits}
		<div class="flex flex-col gap-2">
			<h1 class="text-2xl font-bold">Loading...</h1>
		</div>
	{:then outfits}
		{#if outfits && outfits.length > 0}
			You have some outfits
			{#each outfits as outfit}
				<div class="flex flex-col gap-2">
					<h1 class="text-2xl font-bold">Outfits</h1>
				</div>
			{/each}
			<Button
				text="Create Outfit"
				disabled={lockOutfits}
				fullWidth={true}
				onclick={() => (openDialog = true)}
			/>
		{:else if lockOutfits}
			<div class="bg-brand-secondary absolute space-y-3 rounded-lg px-10 py-5 shadow-lg">
				<div class="flex items-center justify-start gap-2">
					<Warning />
					<h2 class="text-4xl font-medium">Unlock the Outfits Section:</h2>
				</div>
				<div class="text-black-tertiary text-base">
					<p>Upload to your wardrobe at least:</p>
					<ul>
						<li>2 Tops (You have {numberOfTops})</li>
						<li>1 Bottom (You have {numberOfBottoms})</li>
					</ul>
				</div>
				<Button onclick={() => goto('/home')} text="Upload Items to Wardrobe" fullWidth={true} />
			</div>
		{:else if numberOfTops < 10 || numberOfBottoms < 3}
			<div class="bg-brand-secondary absolute top-50 space-y-3 rounded-lg px-10 py-5 shadow-lg">
				<div class="flex items-center justify-start gap-2">
					<Warning />
					<h2 class="text-4xl font-medium">Better Outfit Ideas & Try-Ons:</h2>
				</div>
				<div class="text-black-tertiary text-base">
					<p>We recommend adding more items for the best results:</p>
					<ul>
						<li>10 Top (You have {numberOfTops})</li>
						<li>3 Bottoms (You have {numberOfBottoms})</li>
					</ul>
				</div>
				<Button
					onclick={() => goto('/home')}
					text="Upload More Items"
					fullWidth={true}
					style="secondary"
				/>
			</div>

			<div class="flex h-full w-full flex-col items-center justify-center gap-2 px-4">
				<div class="flex flex-1 flex-col items-center justify-center gap-1">
					<h1 class="text-xl font-medium">You have no outfits yet</h1>
					<p class="text-black-tertiary text-sm">
						Create your first outfit by clicking the button below.
					</p>
				</div>
				<Button
					text="Create Outfit"
					disabled={lockOutfits}
					fullWidth={true}
					onclick={() => (openDialog = true)}
				/>
			</div>
		{/if}
	{/await}
</div>

<Dialog textButton={false} title="Create Outfits" bind:open={openDialog}>
	<div class="flex w-full flex-col gap-2 lg:flex-row">
		{#if !isMobile}
			<Bigdialogbutton
				text="Customise Your Own"
				description="Handpick from your own wardrobe"
				onclick={() => goto('/outfits/desktop-custom-outfit')}
			>
				{#snippet icon()}
					<svg xmlns="http://www.w3.org/2000/svg" width="60" height="56" fill="none"
						><path
							stroke="#000"
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="4"
							d="M38.6 10.9a8.6 8.6 0 1 0-8.6 8.5v4.3M30 23.7 4.3 43.4A5.7 5.7 0 0 0 2 48 5.7 5.7 0 0 0 8 53.7H52A5.7 5.7 0 0 0 58 48a5.7 5.7 0 0 0-2.2-4.6L30 23.7Z"
						/></svg
					>
				{/snippet}
			</Bigdialogbutton>
			<Bigdialogbutton
				onclick={() => {
					goto('/by/create-ai');
				}}
				text="Smart Creation with AI"
				description="Find the best outfit for any event"
			>
				{#snippet icon()}
					<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" fill="none"
						><path
							stroke="#000"
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="4"
							d="M8.7 51.2c2.1 2.1 5.5 2.1 7.5 0l32.5-32.5a5.3 5.3 0 1 0-7.5-7.5L8.7 43.7c-2 2.1-2 5.5 0 7.5ZM45 22.5 37.5 15M21.3 6.1 25 5l-1.1 3.8 1.1 3.7-3.8-1.1-3.7 1.1 1.1-3.8L17.5 5l3.8 1.1ZM11.3 21.1 15 20l-1.1 3.8 1.1 3.7-3.8-1.1-3.7 1.1 1.1-3.8L7.5 20l3.8 1.1ZM48.8 33.6l3.7-1.1-1.1 3.8 1.1 3.7-3.8-1.1L45 40l1.1-3.8-1.1-3.7 3.8 1.1Z"
						/></svg
					>
				{/snippet}
			</Bigdialogbutton>
		{:else}
			<DialogButton
				text="Customise Your Own"
				onclick={() => {
					goto('/by/create-custom');
				}}
			/>
			<DialogButton
				text="Smart Creation with AI"
				onclick={() => {
					goto('/by/create-ai');
				}}
			/>
		{/if}
	</div>
</Dialog>
