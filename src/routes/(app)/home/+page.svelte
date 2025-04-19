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
	import { downloadFileFromBlob, fetchQueryTask } from '../vto-test/generation/utils';
	import StepIndicator from '$lib/components/visualiser/stepIndicator.svelte';
	import { addToast } from '$lib/components/melt/toast.svelte';
	import Subtitle from '$lib/components/text/subtitle.svelte';
	import ClothingGuide from '$lib/content/vto-dialogs/clothingGuide.svelte';
	import Pin from '$lib/svg/pin.svelte';
	import { filterStore } from '$lib/state/appstate.svelte';
	import type { SubmitFunction } from '@sveltejs/kit';
	import { triggerSaveAction } from './helpers';
	import { innerWidth } from 'svelte/reactivity/window';
	import Download from '$lib/svg/small/download.svelte';
	import FilterButton from '$lib/components/wardrobe/filterButton.svelte';
	import Bigdialogbutton from '$lib/components/buttons/bigdialogbutton.svelte';

	let { data, form }: PageProps = $props();

	const filterInstance = filterStore();

	let openDialog = $state(false);
	let openTryOnDialog = $state(false);
	let openModelsDialog = $state(false);
	let openAddModelsDialog = $state(false);
	let openAddNewClothingsDialog = $state(false);

	let selectedItem = $state<ClothingWithTryOnsType[number] | null>(null);
	let selectedDisplayTryOn = $derived.by(() => {
		if (selectedItem && selectedItem.try_on_sessions.length > 0 && selectedDisplayTryOnID > 0) {
			const targetTryOn = selectedItem?.try_on_sessions.filter(
				(tryOn) => tryOn.id === selectedDisplayTryOnID
			);
			return targetTryOn[0].signed_try_on;
		} else {
			return '';
		}
	});
	let selectedDisplayTryOnID = $state(-1);

	let selectedModel = $state<ModelsType[number] | null>();
	let selectedModelFile = $state<File | null>(null);
	let selectedTryOnModelID = $state<number>();
	let uniqueCategories = $state<string[]>([]);
	let tryOnCategory = $state<'Upper Body' | 'Lower Body'>();

	let clothingFile = $state<File | null>(null);

	let progress = $state(10);
	let tryOnUrl = $state('');
	let taskID = $state('');
	let showLoading = $state(false);
	let isSaving = $state(false); // Optional: Track loading state

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
					await triggerSaveAction(
						isSaving,
						taskID,
						clothingFile,
						tryOnUrl,
						selectedModel,
						selectedModelFile
						// what if selectedModel and selectedModelFile are both truthful
					);
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
			const parentDataResolved = await data.parentData;
			const clothingsWithTryOns = await parentDataResolved.clothingsWithTryOns;

			if (clothingsWithTryOns && clothingsWithTryOns.length > 0) {
				// filter out clothings with no try ons
				const filteredClothingsWithTryOns = clothingsWithTryOns.filter(
					(item: ClothingWithTryOnsType[number]) =>
						item.try_on_sessions && item.try_on_sessions.length > 0
				);

				// Select the first item from filtered list
				if (filteredClothingsWithTryOns.length > 0) {
					selectedItem = filteredClothingsWithTryOns[0];
					selectedDisplayTryOnID = filteredClothingsWithTryOns[0].try_on_sessions[0].id;
				} else {
					// Handle the case where items exist, but none have try-on sessions
					console.log('No clothing items found with active try-on sessions.');
					// Optionally alert the user or set a specific state
					// selectedItem remains null
				}

				const categoryNames = clothingsWithTryOns
					.map((item: ClothingWithTryOnsType[number]) => item.categories?.name)
					.filter((name): name is string => Boolean(name)); // Type guard ensures string[]

				const uniqueNamesSet = new Set(categoryNames);

				// convert Set to an Array and prepend 'All'
				uniqueCategories = ['All', ...Array.from(uniqueNamesSet)];
			} else {
				alert('Your wardrobe is empty. Please add some clothing to your wardrobe.');
				uniqueCategories = ['All'];
				selectedItem = null;
			}
		} catch (error) {
			console.error('Error initializing wardrobe categories:', error);
			uniqueCategories = ['All'];
			selectedItem = null;
		}
	});

	let imageURl = $state('');
	let newModelFile = $state<File | null>(null);

	function handleFileChange(event: any) {
		imageURl = URL.createObjectURL(event.target.files[0]);
		newModelFile = event.target.files[0];
		openModelsDialog = true;
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

	function handleTryOnUploadModel(event: any) {
		imageURl = URL.createObjectURL(event.target.files[0]);
		selectedModel = null;
		selectedModelFile = event.target.files[0];
		addToast({
			data: {
				type: 'success',
				title: 'Success',
				description: 'Image uploaded successfully!'
			}
		});
		step++;
	}

	let isMobile = $derived((innerWidth.current && innerWidth.current < 1024) || false);
</script>

<!-- awaiting page.servers's data -->
<div class="bg-white-primary relative h-full w-full overflow-hidden lg:flex lg:pt-20 lg:pr-20">
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
						<div class="flex w-full items-center justify-center lg:w-1/2 lg:p-4">
							<div class="relative w-full max-w-[25rem] lg:w-2/3 lg:max-w-[30rem]">
								{#if selectedDisplayTryOn}
									<div class="flex flex-col items-start justify-start gap-4">
										<img
											class="h-[40rem] w-full shadow-lg lg:rounded-lg lg:object-fill"
											src={selectedDisplayTryOn}
											alt="try on"
										/>
										{#if !isMobile && selectedItem.try_on_sessions.length > 0}
											<div class="h-[7rem] w-full space-y-1">
												<h1 class="text-base font-medium">My model images</h1>
												<div
													class="flex h-full w-full items-center justify-start gap-2 overflow-x-auto overflow-y-hidden py-2 pl-2"
												>
													<button
														class="bg-brand-secondary text-brand relative h-24 w-20 flex-shrink-0 cursor-pointer rounded-lg text-4xl font-normal shadow-sm"
													>
														+
														<input
															type="file"
															name="new_model_image"
															id="upload_model"
															class="absolute top-0 left-0 h-full w-full cursor-pointer opacity-0"
															onchange={handleFileChange}
														/>
													</button>
													{#each selectedItem.try_on_sessions as tryOn}
														<button
															class="h-full flex-shrink-0 cursor-pointer"
															onclick={() => {
																selectedDisplayTryOnID = tryOn.id;
															}}
														>
															<img
																class="h-full w-auto rounded-lg object-cover shadow-sm {selectedDisplayTryOnID ===
																tryOn.id
																	? 'ring-brand ring-2 shadow-md'
																	: ''}"
																src={tryOn.signed_try_on}
																alt="try on"
															/>
														</button>
													{/each}
												</div>
											</div>
										{/if}
									</div>

									<button
										class="absolute top-3 left-3 cursor-pointer lg:hidden"
										onclick={() => (openModelsDialog = true)}
									>
										<Edit />
									</button>
									<button class="absolute top-3 right-3 cursor-pointer lg:hidden">
										<Share />
									</button>
									<div
										class="absolute top-0 -right-12 hidden flex-col items-center justify-center gap-3 lg:flex"
									>
										<button class="cursor-pointer">
											<Share />
										</button>
										<button
											class="cursor-pointer"
											onclick={() => downloadFileFromBlob(selectedDisplayTryOn)}
										>
											<Download />
										</button>
									</div>
								{:else}
									<img
										class="h-full w-full shadow-lg lg:rounded-lg lg:object-cover"
										src={selectedItem.signed_front}
										alt="front side of ${selectedItem.name}"
									/>
									<h1>No try on available for this clothing</h1>
								{/if}
							</div>
						</div>
					{/if}

					{#if isMobile}
						<Draggable filterArray={uniqueCategories}>
							<div
								class="grid grid-cols-2 gap-2 p-1 md:grid-cols-3 md:gap-3 lg:grid-cols-4 lg:gap-4"
							>
								<button
									class="bg-brand-secondary text-black-primary flex aspect-square cursor-pointer items-center justify-center rounded-lg text-5xl font-bold"
									onclick={() => {
										openDialog = true;
									}}
									>+
								</button>
								{#each clothingsWithTryOns as item, i}
									<!-- filtering categories -->
									{#if filterInstance.filterCategory === 'All' || item.categories?.name === filterInstance.filterCategory}
										<WardrobeItem
											src={item.signed_front}
											alt="front side of ${item.name}"
											selected={selectedItem?.front_image_url === item.front_image_url}
											onclick={() => {
												selectedItem = item;
												selectedDisplayTryOnID = selectedItem.try_on_sessions[0].id || -1;
											}}
											id={item.id}
										/>
									{/if}
								{/each}
							</div>
						</Draggable>
					{:else}
						<div class="flex w-1/2 flex-col items-start justify-start gap-3">
							<h1 class="text-4xl font-medium">All Items</h1>
							<!-- why does this shrink by itself? -->
							<div class="flex flex-shrink-0 items-center justify-start gap-2 overflow-x-auto">
								{#each uniqueCategories as filter}
									<FilterButton {filter} />
								{/each}
							</div>
							<div class="overflow-y-auto">
								<div class="grid grid-cols-2 gap-2 md:grid-cols-3 md:gap-3 lg:grid-cols-4 lg:gap-4">
									<button
										class="bg-brand-secondary text-brand flex max-h-[20rem] w-auto cursor-pointer items-center justify-center rounded-lg text-6xl font-bold"
										onclick={() => {
											openDialog = true;
										}}
										>+
									</button>
									{#each clothingsWithTryOns as item, i}
										<!-- filtering categories -->
										{#if filterInstance.filterCategory === 'All' || item.categories?.name === filterInstance.filterCategory}
											<WardrobeItem
												src={item.signed_front}
												alt="front side of ${item.name}"
												selected={selectedItem?.front_image_url === item.front_image_url}
												onclick={() => {
													selectedItem = item;
													selectedDisplayTryOnID = selectedItem.try_on_sessions[0].id || -1;
												}}
												transitionIndex={i}
											/>
										{/if}
									{/each}
								</div>
							</div>
						</div>
					{/if}
				{/if}
			{/await}
		{/if}
	{/await}
</div>

<Dialog textButton={false} title="Create" bind:open={openDialog}>
	<div class="flex w-full flex-col gap-2 lg:flex-row">
		{#if !isMobile}
			<Bigdialogbutton
				text="Try On"
				description="Visualise yourself in any clothing."
				onclick={() => {
					goto('/vto-test/body-image-upload');
				}}
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

			<!-- this snippet is here because Upload Clothings button needs a children input -->
			{#snippet hangaricon()}
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
			<Bigdialogbutton
				text="Upload Clothings"
				description="Easily manage your fashion with our Digital Wardrobe."
				icon={hangaricon}
			>
				<input
					type="file"
					multiple
					class="absolute size-full cursor-pointer opacity-0"
					accept="image/*"
					onchange={handleNewClothingsUpload}
				/>
			</Bigdialogbutton>
		{:else}
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
		{/if}
	</div>
</Dialog>

{#snippet stepindicator()}
	<StepIndicator steps={4} activeStep={step} />
{/snippet}

<Dialog
	textButton={false}
	titleholder={stepindicator}
	bind:open={openTryOnDialog}
	backFn={() => step--}
>
	<form
		action="?/tryon"
		method="POST"
		enctype="multipart/form-data"
		use:enhance={({ formData, cancel }) => {
			if (!tryOnCategory || !clothingFile) {
				console.log('Please select a category and upload a clothing image');
				cancel();
				return;
			}

			if (!selectedModel && !selectedModelFile) {
				console.log('Please select a model image');
				cancel();
				return;
			}
			if (selectedModel) {
				formData.append('model_path', selectedModel.signed_url as string);
			} else if (selectedModelFile) {
				formData.append('model_file', selectedModelFile);
			}

			formData.append('category', tryOnCategory);
			formData.append('clothing_image', clothingFile);
			showLoading = true;

			return async ({ result, update }) => {
				step++;
				update({ invalidateAll: false });
				if (result.type === 'success') {
					if (result.data) {
						taskID = result.data?.taskID as string;
					}
					await fetchTask();
				} else if (result.type === 'failure') {
					alert('Something went wrong: ' + result.data);
				}

				showLoading = false;
			};
		}}
	>
		{#if step === 1}
			{#await data.modelData}
				Loading
			{:then models}
				<div class="space-y-4">
					<h1 class="text-xl font-medium">Choose your model image</h1>
					<div class="grid grid-cols-2 gap-2 md:grid-cols-3 md:gap-3 lg:grid-cols-4 lg:gap-4">
						<label
							for="upload_tryon_model"
							class="bg-brand-secondary text-black-primary relative flex aspect-square cursor-pointer items-center justify-center rounded-lg text-5xl font-bold"
						>
							+
							<input
								type="file"
								name="new_model_image"
								id="upload_tryon_model"
								class="absolute h-full w-full cursor-pointer opacity-0"
								onchange={handleTryOnUploadModel}
							/>
						</label>
						{#each models as model}
							<WardrobeItem
								src={model.signed_url}
								alt={model.description || ''}
								onclick={() => {
									selectedModelFile = null;
									selectedModel = model;
								}}
								selected={selectedModel?.id == model.id}
							/>
						{/each}
					</div>
					<Button
						text="Next"
						onclick={() => {
							step++;
						}}
						disabled={!selectedModel}
						fullWidth={true}
					/>
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
				{#if imageURl || selectedModel}
					<div class="flex w-full items-center justify-center">
						<div class="relative">
							<img
								src={selectedModel?.signed_url || imageURl}
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
					disabled={!clothingFile || !(selectedModel || selectedModelFile)}
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
					src={upperimg}
					alt="a man in button up shirt"
					onclick={() => {
						tryOnCategory = 'Upper Body';
					}}
				/>
				<ImageButton
					text="Lower Body"
					ariaLabel="Scan to upload"
					src={lowerimg}
					alt="a man in white trousers"
					onclick={() => {
						tryOnCategory = 'Lower Body';
					}}
				/>
			</div>
			<Button
				text="Try On"
				type="submit"
				fullWidth={true}
				disabled={!clothingFile || !tryOnCategory || !(selectedModel || selectedModelFile)}
			/>
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

<Dialog
	textButton={false}
	title={imageURl ? 'Upload a new model image' : 'Choose a model image'}
	bind:open={openModelsDialog}
>
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
			<img src={imageURl} class="mb-3 max-w-[15rem] rounded-md" alt="user model" />
			<form
				action="?/addNewModel"
				method="post"
				enctype="multipart/form-data"
				use:enhance={({ formData, cancel }) => {
					if (newModelFile) {
						formData.append('model_image', newModelFile);
						console.log('Adding new model...');
					} else {
						cancel();
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
						} else if (result.type === 'failure') {
							console.error('Server action failed:', result.data);
						}
					};
				}}
			>
				<Button type="submit" text="Add" fullWidth={true} disabled={!newModelFile} />
			</form>
		{/if}
	{/await}
</Dialog>

<Dialog
	textButton={false}
	title="Upload Clothing to Wardrobe"
	bind:open={openAddNewClothingsDialog}
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
