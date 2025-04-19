<script lang="ts">
	import FilterButton from '$lib/components/wardrobe/filterButton.svelte';
	import type { PageProps } from './$types';
	import WardrobeItem from '$lib/components/wardrobe/wardrobeItem.svelte';
	import type { ClothingWithTryOnsType, ModelsType } from '$lib/server/database_helpers/queryDb';
	import { onMount } from 'svelte';
	import StepIndicator from '$lib/components/visualiser/stepIndicator.svelte';
	import { bottoms, filterStore, tops } from '$lib/state/appstate.svelte';
	import Button from '$lib/components/buttons/button.svelte';
	import Pin from '$lib/svg/pin.svelte';
	import Breadcrumb, { type Crumb } from '$lib/components/visualiser/breadcrumb.svelte';
	import Dialog from '$lib/components/dialog/dialog.svelte';
	import { enhance } from '$app/forms';
	import ImageGenV2 from '$lib/components/form/image-gen-v2.svelte';
	import ImageScan from '$lib/components/imageScan/imageScan.svelte';
	import { Tween } from 'svelte/motion';
	import { linear } from 'svelte/easing';

	let { data }: PageProps = $props();

	let progress = new Tween(0, {
		duration: 15000,
		easing: linear,
		delay: 2000
	});

	let step = $state(1);
	let selectedUpperGarment = $state<ClothingWithTryOnsType[number]>();
	let selectedBottomGarment = $state<ClothingWithTryOnsType[number]>();
	let selectedModel = $state<ModelsType[number] | null>();
	let showLoading = $state(false);

	let openModelDialog = $state(false);

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
			return [];
		}
	});

	let uniqueCategories = $derived.by(() => {
		const uniqueNamesSet = new Set(
			filteredClothingsWithTryOns.map((item) => item.categories?.name) // item type is inferred here
		);

		// convert Set to an Array and prepend 'All'
		const uniqueCategories = ['All', ...Array.from(uniqueNamesSet)];

		// .map on an empty array is safe
		return Array.from(uniqueCategories);
	});

	const filterInstance = filterStore();

	const reactiveCrumbs = $derived.by(() => {
		if (step === 1) {
			return [
				{ label: 'Outfits', href: '/outfits' },
				{
					label: 'Choose upper body garment'
				}
			] as Crumb[];
		} else if (step === 2) {
			return [
				{ label: 'Outfits', href: '/outfits' },
				{
					label: 'Choose upper body garment',
					onclick: () => {
						step--;
					}
				},
				{ label: 'Choose lower body garment' } // No href for the current/last step
			] as Crumb[];
		} else if (step === 3) {
			return [
				{ label: 'Outfits', href: '/outfits' },
				{
					label: 'Choose upper body garment',
					onclick: () => {
						step = 1;
					}
				},
				{
					label: 'Choose lower body garment',
					onclick: () => {
						step = 2;
					}
				},
				{ label: 'Outfit generation' }
			] as Crumb[];
		} else {
			return [];
		}
	});

	let formElement: HTMLFormElement;
	let outfitUrl = $state<string | null>(null);

	// submit the form programmatically, with a button in a dialog
	function submitForm() {
		if (!formElement) return;

		// 3. Programmatically submit the persistent form
		formElement.requestSubmit();
	}

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

<div
	class="bg-white-primary flex h-full w-full flex-col items-stretch justify-start gap-2 p-4 px-15"
>
	<Breadcrumb crumbs={reactiveCrumbs} />
	{#if step === 1 || step === 2}
		<h1 class="text-4xl font-medium">Customise Your Own</h1>

		<div class="flex w-full items-center justify-between">
			<div class="space-y-2">
				<h2 class="text-2xl">
					{step === 1 ? 'Select an Upper Body Garment' : 'Select a Lower Body Garment'}
				</h2>
				<div class="flex items-center justify-start gap-2 overflow-x-auto">
					{#each uniqueCategories as filter}
						<FilterButton {filter} />
					{/each}
				</div>
			</div>
			{#if selectedUpperGarment && step === 2}
				<div class="relative">
					<img
						src={selectedUpperGarment.signed_front}
						alt="model"
						class=" max-h-32 rounded-md object-cover shadow-sm"
					/>
					<Pin twClass="absolute -top-2 -right-2" />
				</div>
			{/if}
		</div>
		{#await data.parentData then parent}
			{#if parent.clothingsWithTryOns}
				<!-- awaiting layout's data -->
				{#await parent.clothingsWithTryOns then clothings}
					{#if filteredClothingsWithTryOns.length !== 0}
						<div class="flex-1 overflow-y-auto">
							<div class="grid grid-cols-2 gap-2 md:grid-cols-3 md:gap-3 lg:grid-cols-4 lg:gap-4">
								{#each filteredClothingsWithTryOns as item}
									{#if filterInstance.filterCategory === 'All' || item.categories?.name === filterInstance.filterCategory}
										<WardrobeItem
											src={item.signed_front}
											alt="front side of ${item.name}"
											selected={selectedUpperGarment?.front_image_url === item.front_image_url ||
												selectedBottomGarment?.front_image_url === item.front_image_url}
											onclick={() => {
												if (step === 1) {
													selectedUpperGarment = item;
												} else if (step === 2) {
													selectedBottomGarment = item;
												}
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
	{:else if step === 3}
		<h1 class="text-4xl font-medium">Your outfit generation</h1>

		{#if outfitUrl}
			<ImageGenV2 imageUrl={outfitUrl}>
				{#snippet button()}
					<div class="flex flex-col gap-2">
						<form action="?/save" method="post" enctype="multipart/form-data">
							<Button text="Save outfit" fullWidth={true} />
						</form>
					</div>
				{/snippet}
			</ImageGenV2>
		{:else}
			<ImageScan imageUrl={selectedModel?.signed_url} progress={progress.current} />
		{/if}
	{/if}
	{#if step === 1}
		<Button
			twClass="fixed bottom-10 left-1/2 -translate-x-1/2 mx-auto min-w-[20rem] shadow-lg"
			text={'Next'}
			onclick={() => {
				step++;
			}}
			disabled={!selectedUpperGarment}
		/>
	{:else if step === 2}
		<Button
			twClass="fixed bottom-10 left-1/2 -translate-x-1/2 mx-auto min-w-[20rem] shadow-lg"
			text={'Create Outfit'}
			onclick={() => {
				openModelDialog = true;
			}}
			disabled={!selectedBottomGarment}
		/>
	{/if}
</div>

<form
	action="?/outfits"
	method="POST"
	bind:this={formElement}
	enctype="multipart/form-data"
	use:enhance={({ formData, cancel }) => {
		openModelDialog = false;
		step++;
		progress.target = 90;

		if (!selectedUpperGarment || !selectedBottomGarment) {
			alert('Missing upper or lower garment');
			cancel();
			return;
		}

		if (!selectedModel) {
			console.log('Please select a model image');
			cancel();
			return;
		}

		if (selectedModel) {
			formData.append('model_path', selectedModel.id.toString());
		}

		formData.append('upperBody', selectedUpperGarment.id.toString());
		formData.append('lowerBody', selectedBottomGarment.id.toString());
		showLoading = true;

		return async ({ result, update }) => {
			progress.target = 100;
			update({ invalidateAll: false });
			if (result.type === 'success') {
				if (result.data) {
					outfitUrl = result.data.data.signedUrl as string;
				}
			} else if (result.type === 'failure') {
				alert('Something went wrong: ' + result.data?.message);
			}
			showLoading = false;
		};
	}}
></form>

<Dialog
	textButton={true}
	buttonText="Next"
	title="Choose a model"
	bind:open={openModelDialog}
	backFn={() => {
		selectedModel = null;
		openModelDialog = false;
	}}
	onclick={submitForm}
>
	{#await data.modelData}
		Loading
	{:then models}
		<div class="space-y-4">
			<h1 class="text-xl font-medium">Choose your model image</h1>
			<div class="grid grid-cols-2 gap-2 md:grid-cols-3 md:gap-3 lg:grid-cols-4 lg:gap-4">
				{#each models as model}
					<WardrobeItem
						src={model.signed_url}
						alt={model.description || ''}
						onclick={() => {
							selectedModel = model;
						}}
						selected={selectedModel?.id == model.id}
					/>
				{/each}
			</div>
		</div>
	{/await}
</Dialog>
