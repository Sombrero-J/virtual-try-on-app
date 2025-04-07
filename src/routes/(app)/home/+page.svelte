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

	import type { ClothingWithTryOnsType, ModelsType } from '$lib/server/database_helpers/queryDb';
	import WardrobeItem from '$lib/components/wardrobe/wardrobeItem.svelte';
	import DialogButton from '$lib/components/buttons/dialogButton.svelte';
	import ImageUploadV2 from '$lib/components/form/image-upload-v2.svelte';

	import ImageButton from '$lib/components/form/imageButton.svelte';
	import lowerimg from '$lib/assets/categories/lower.png?enhanced';
	import upperimg from '$lib/assets/categories/upper.png?enhanced';
	import { enhance } from '$app/forms';
	import { fetchQueryTask } from '../../(vto)/beta/vto-test/generation/utils';
	import StepIndicator from '$lib/components/visualiser/stepIndicator.svelte';
	import { addToast } from '$lib/components/melt/toast.svelte';
	import Subtitle from '$lib/components/text/subtitle.svelte';
	import ClothingGuide from '$lib/content/vto-dialogs/clothingGuide.svelte';
	import Pin from '$lib/svg/pin.svelte';

	let { data, form }: PageProps = $props();

	let openDialog = $state(false);
	let openTryOnDialog = $state(false);
	let openModelsDialog = $state(false);
	let openAddModelsDialog = $state(false);
	let openAddNewClothingsDialog = $state(false);

	let selectedItem = $state<ClothingWithTryOnsType[number]>();
	let selectedModel = $state<ModelsType[number]>();
	let selectedTryOnModelID = $state<number>();
	let uniqueCategories = $state();
	let tryOnCategory = $state<'Upper Body' | 'Lower Body'>();

	let clothingFile = $state<File>();

	let progress = $state(10);
	let tryOnUrl = $state('');
	let taskID = $derived(form?.taskID as string);
	let showLoading = $state(false);

	async function fetchTask() {
		try {
			if (!taskID) {
				throw new Error('No task ID found');
			}

			setTimeout(async () => {
				progress = 80;
				const res = await fetchQueryTask(taskID);
				if (res.url) {
					progress = 100;
					tryOnUrl = res.url;
				} else if (res.error) {
					alert('Something went wrong: ' + res.error);
				}
			}, 10000);
		} catch (error) {
			alert(error);
		}
	}
	let step = $state<1 | 2 | 3 | 4>(1);

	$effect(() => {
		if (openTryOnDialog === false) {
			step = 1;
			openDialog = false;
			selectedModel = undefined;
		}

		if (step <= 0) {
			openTryOnDialog = false;
		}
	});

	onMount(async () => {
		try {
			const parentData = await data.parentData;
			const clothingsWithTryOns = await parentData.clothingsWithTryOns;
			if (clothingsWithTryOns && clothingsWithTryOns.length > 0) {
				selectedItem = clothingsWithTryOns[0];
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

	let imageURl = $state('');
	let newModelFile = $state<File | null>(null);

	function handleFileChange(event: any) {
		imageURl = URL.createObjectURL(event.target.files[0]);
		newModelFile = event.target.files[0];
		addToast({
			data: {
				type: 'success',
				title: 'Success',
				description: 'Image uploaded successfully!'
			}
		});
	}

	let wardrobeFiles = $state<File[]>([]);
	let wardrobePreviewUrls = $state<string[]>([]);

	function handleNewClothingsUpload(event: any) {
		const selectedFiles = Array.from(event.target.files) as File[];
		if (!selectedFiles.length) return;

		const newPreviewUrls = selectedFiles.map((file) => URL.createObjectURL(file));

		wardrobeFiles = [...wardrobeFiles, ...selectedFiles];
		wardrobePreviewUrls = [...wardrobePreviewUrls, ...newPreviewUrls];

		addToast({
			data: {
				type: 'success',
				title: 'Success',
				description: `${selectedFiles.length} image(s) selected successfully!`
			}
		});

		openAddNewClothingsDialog = true;
	}
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
					<button
						class="absolute top-3 left-3 cursor-pointer"
						onclick={() => (openModelsDialog = true)}
					>
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
							{#each clothingsWithTryOns as item, i}
								<WardrobeItem
									src={item.signed_front}
									alt="front side of ${item.name}"
									selected={selectedItem?.front_image_url === item.front_image_url}
									transitionIndex={i}
								/>
							{/each}
						</div>

						<Dialog button={false} title="Create" bind:open={openDialog} understood={false}>
							<div class="flex w-full flex-col gap-2">
								<DialogButton
									text="Try on clothing"
									fullWidth={true}
									onclick={() => {
										openTryOnDialog = true;
										step = 1;
									}}
								/>
								<DialogButton text="Upload clothings to wardrobe" fullWidth={true}>
									<input
										type="file"
										multiple
										class="absolute size-full cursor-pointer opacity-0"
										accept="image/*"
										onchange={handleNewClothingsUpload}
									/>
								</DialogButton>
							</div>
						</Dialog>
					</Draggable>
				{/if}
			{/await}
		{/if}
	{/await}
</div>

{#snippet stepindicator()}
	<StepIndicator steps={4} activeStep={step} />
{/snippet}

<Dialog
	button={false}
	titleholder={stepindicator}
	bind:open={openTryOnDialog}
	understood={false}
	backFn={() => step--}
>
	<form
		action="?/tryon"
		method="POST"
		enctype="multipart/form-data"
		use:enhance={({ formData, cancel }) => {
			if (selectedModel && tryOnCategory && clothingFile) {
				formData.append('model_path', selectedModel.image_url as string);
				formData.append('category', tryOnCategory);
				formData.append('clothing_image', clothingFile);
				showLoading = true;
			} else {
				cancel();
			}
			return async ({ result, update }) => {
				step++;
				update({ invalidateAll: false });
				if (result.type === 'success' || result.type === 'failure') {
					step++;
					await fetchTask();
				} else if (result.type === 'error') {
					// Handle unexpected server errors if needed
					console.error('Server action failed:', result.error);
					// Optionally show an error message to the user
				}

				// 6. Set loading state to false *after* all post-action
				//    processing (including update and fetchTask) is done.
				console.log('Submission processing finished, showLoading = false');
				showLoading = false;
			};
		}}
	>
		{#if step === 1}
			{#await data.modelData}
				Loading
			{:then models}
				<div class="space-y-4">
					<h1 class="text-xl font-medium">Select your picture</h1>
					<div class="grid grid-cols-2 gap-2 md:grid-cols-3 md:gap-3 lg:grid-cols-4 lg:gap-4">
						{#each models as model}
							<WardrobeItem
								src={model.signed_url}
								alt={model.description || ''}
								onclick={() => {
									selectedModel = model;
									step++;
								}}
								selected={selectedModel?.id == model.id}
							/>
						{/each}
					</div>
				</div>
			{/await}
		{:else if step === 2}
			<div class="space-y-4">
				<h1 class="text-xl font-medium">Upload a clothing image</h1>
				<div class="flex flex-col items-start justify-center gap-2">
					<Subtitle>
						<div>
							<p>Upload your image with:</p>
							<ul>
								<li>Plain Background</li>
								<li>One Clothing Image</li>
							</ul>
						</div>
					</Subtitle>
					<Dialog title={'Clothing Image Examples'}>
						<ClothingGuide />
					</Dialog>
				</div>
				{#if selectedModel}
					<div class="flex w-full items-center justify-center">
						<div class="relative">
							<img
								src={selectedModel.signed_url}
								alt="model"
								class=" max-h-32 rounded-md object-cover shadow-sm"
							/>
							<Pin twClass="absolute -top-2 -right-2" />
						</div>
					</div>
				{/if}
				<ImageUploadV2
					bind:file={clothingFile}
					placeholder="Upload a clothing image"
					name="body-image"
				/>
				<Button
					text="Try On"
					fullWidth={true}
					disabled={!clothingFile || !selectedModel}
					onclick={() => {
						step++;
					}}
				/>
			</div>
		{:else if step === 3}
			<h1 class="text-xl font-medium">Select the area</h1>
			<div class="flex flex-col items-start justify-center gap-2">
				<Subtitle>
					<p>Select the area you would like to try on</p>
				</Subtitle>
			</div>
			<div class="flex flex-col gap-4">
				<ImageButton
					text="Upper Body"
					ariaLabel="Scan to upload"
					type="submit"
					src={upperimg}
					alt="a man in button up shirt"
					onclick={() => {
						tryOnCategory = 'Upper Body';
					}}
				/>
				<ImageButton
					text="Lower Body"
					ariaLabel="Scan to upload"
					type="submit"
					src={lowerimg}
					alt="a man in white trousers"
					onclick={() => {
						tryOnCategory = 'Lower Body';
					}}
				/>
			</div>
			<!-- <Button
				text="Try On"
				type="submit"
				fullWidth={true}
				disabled={!clothingFile || !tryOnCategory || !selectedModel}
				onclick={() => step++}
			/> -->
		{/if}
	</form>
	{#if step === 4}
		<img src={tryOnUrl} alt="try on generation" />
		<Button
			text="Done"
			fullWidth={true}
			disabled={!clothingFile}
			onclick={() => {
				openTryOnDialog = false;
				openDialog = false;
			}}
		/>
	{/if}
</Dialog>

<Dialog button={false} title="Choose a model image" bind:open={openModelsDialog} understood={false}>
	{#await data.modelData}
		Loading
	{:then models}
		{#if !imageURl}
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
						onchange={handleFileChange}
					/>
				</div>
				{#each models as model}
					<WardrobeItem
						src={model.signed_url}
						alt={model.description || ''}
						onclick={() => {
							selectedTryOnModelID = model.id;
						}}
					/>
				{/each}
			</div>
		{:else}
			<img src={imageURl} alt="user model" />
			<form
				action="?/addNewModel"
				method="post"
				enctype="multipart/form-data"
				use:enhance={({ formData }) => {
					if (newModelFile) {
						formData.append('model_image', newModelFile);
					}
					return async ({ result }) => {
						if (result.type === 'success') {
							console.log('Result: ', result.data);
							addToast({
								data: {
									type: 'success',
									title: 'Success',
									description: 'Image uploaded successfully!'
								}
							});
							openModelsDialog = false;
							imageURl = '';
							newModelFile = null;
						} else if (result.type === 'error') {
							console.error('Server action failed:', result.error);
						}
					};
				}}
			>
				<Button text="Add" fullWidth={true} disabled={!newModelFile} />
			</form>
		{/if}
	{/await}
</Dialog>

<Dialog
	button={false}
	title="Upload Clothing to Wardrobe"
	bind:open={openAddNewClothingsDialog}
	understood={false}
>
	<div class="flex flex-col gap-4">
		{#if wardrobePreviewUrls.length > 0}
			<div class="grid grid-cols-2 gap-2 overflow-y-auto md:grid-cols-3 md:gap-3">
				{#each wardrobePreviewUrls as url, i}
					<div class="relative aspect-square">
						<img
							src={url}
							alt={`Clothing item ${i + 1}`}
							class="h-full w-full rounded object-cover"
						/>
						<button
							class="bg-opacity-50 absolute top-1 right-1 flex cursor-pointer items-center justify-center rounded-full bg-black px-2 text-white"
							onclick={() => {
								wardrobePreviewUrls = wardrobePreviewUrls.filter((_, idx) => idx !== i);
								wardrobeFiles = wardrobeFiles.filter((_, idx) => idx !== i);
							}}
						>
							×
						</button>
					</div>
				{/each}
			</div>

			<form
				action="?/addNewClothings"
				method="post"
				enctype="multipart/form-data"
				use:enhance={({ formData }) => {
					wardrobeFiles.forEach((file) => {
						formData.append('clothing_images', file);
					});

					return async ({ result }) => {
						if (result.type === 'success') {
							addToast({
								data: {
									type: 'success',
									title: 'Success',
									description: 'Images uploaded to wardrobe successfully!'
								}
							});
							console.log(result.data);
							// console: Object { success: true, message: "3 clothing item(s) added successfully. ", insertedCount: 3, rejectedImages: [] }

							openAddNewClothingsDialog = false;
							// Clean up state and revoke object URLs to prevent memory leaks
							wardrobePreviewUrls.forEach(URL.revokeObjectURL);
							wardrobeFiles = [];
							wardrobePreviewUrls = [];
						} else if (result.type === 'error') {
							console.error('Server action failed:', result.error);
							addToast({
								data: {
									type: 'error',
									title: 'Error',
									description: 'Failed to upload images.'
								}
							});
						}
					};
				}}
			>
				<div class="flex gap-2">
					<Button text="Upload to Wardrobe" fullWidth={true} type="submit" />
					<Button
						text="Add More"
						type="button"
						onclick={() => {
							const input = document.createElement('input');
							input.type = 'file';
							input.multiple = true;
							input.accept = 'image/*';
							input.onchange = handleNewClothingsUpload;
							input.click();
						}}
					/>
				</div>
			</form>
		{:else}
			<p class="text-center text-gray-500">No images selected</p>
		{/if}
	</div>
</Dialog>
