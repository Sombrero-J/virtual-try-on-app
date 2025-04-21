<script lang="ts">
	import Draggable from '$lib/components/wardrobe/draggable.svelte';
	import Grids from '$lib/components/wardrobe/grids.svelte';
	import NewIcons from '$lib/components/wardrobe/newIcons.svelte';
	import Share from '$lib/svg/small/share.svelte';
	import Edit from '$lib/svg/small/wardrobe/edit.svelte';
	import type { PageProps } from './$types';
	import Dialog from '$lib/components/dialog/dialog.svelte';
	import Button from '$lib/components/buttons/button.svelte';
	import { goto, invalidateAll } from '$app/navigation';
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
	import { continueSaveAction, triggerSaveAction } from './helpers';
	import { innerWidth } from 'svelte/reactivity/window';
	import Download from '$lib/svg/small/download.svelte';
	import FilterButton from '$lib/components/wardrobe/filterButton.svelte';
	import Bigdialogbutton from '$lib/components/buttons/bigdialogbutton.svelte';
	import type { Database } from '$lib/type/supabase';
	import { page } from '$app/state';

	type CategoriesEnum = Database['public']['Enums']['categories_type'];

	let { data, form }: PageProps = $props();
	let { user, supabase } = $derived(data);

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

	const MAX_MODEL_IMAGE_SIZE = 3 * 1024 * 1024; // 3MB in bytes

	async function fetchTask() {
		try {
			if (!taskID) {
				throw new Error('No task ID found');
			}

			setTimeout(async () => {
				progress = 80;
				const res = await fetchQueryTask(taskID);
				if (res.url) {
					addToast({
						data: {
							type: 'success',
							title: 'Try on success!',
							description: 'Your try on is successful!'
						}
					});
					progress = 100;
					tryOnUrl = res.url;
					const { success, message } = await triggerSaveAction(
						taskID,
						clothingFile,
						tryOnUrl,
						selectedModel,
						selectedModelFile
						// what if selectedModel and selectedModelFile are both truthful
					);

					if (!success) {
						addToast({
							data: {
								type: 'error',
								title: 'Error: Saving error',
								description:
									'Saving try on error: ' + message + ' Please try again or contact support.'
							}
						});
					} else {
						addToast({
							data: {
								type: 'success',
								title: 'Try on saved',
								description: 'Your try on has been successfully saved to the wardrobe.'
							}
						});
					}
				} else if (res.error) {
					addToast({
						data: {
							type: 'error',
							title: 'Error: Try on failed.',
							description: 'An unexpected error occurred during generation. ' + res.error
						}
					});
				}
			}, 10000);
		} catch (error) {
			addToast({
				data: {
					type: 'error',
					title: 'Error: Server error.',
					description: 'An error occurred in the server, please contact support.'
				}
			});
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
		const sessionId = page.url.searchParams.get('autoSave');
		if (sessionId) {
			const { success, data, message } = await continueSaveAction(sessionId);
			if (success) {
				addToast({
					data: {
						type: 'success',
						title: 'Try-on saved',
						description: 'Your try on has been saved.'
					}
				});
			} else {
				addToast({
					data: {
						type: 'error',
						title: 'Error saving try on',
						description: message
					}
				});
			}
		}
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
					.filter((name): name is CategoriesEnum => Boolean(name));

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
		const inputElement = event.target as HTMLInputElement;
		const files = inputElement.files;

		if (!files || files.length === 0) {
			console.log('No file selected.');
			return;
		}

		const file = files[0];

		// Check if the file is an image
		if (!file.type.startsWith('image/')) {
			addToast({
				data: {
					type: 'error',
					title: 'Invalid File Type',
					description: `"${file.name}" is not a valid image. Please choose JPG, PNG, WEBP.`
				}
			});
			inputElement.value = '';
			return;
		}

		// 4. Check file size
		if (file.size > MAX_MODEL_IMAGE_SIZE) {
			addToast({
				data: {
					type: 'error',
					title: 'File Too Large',
					description: `The image "${file.name}" (${(file.size / 1024 / 1024).toFixed(1)}MB) exceeds the limit of ${MAX_MODEL_IMAGE_SIZE / 1024 / 1024}MB.`
				}
			});
			inputElement.value = ''; // Clear selection
			return;
		}

		if (imageURl) {
			URL.revokeObjectURL(imageURl);
		}

		imageURl = URL.createObjectURL(file);

		newModelFile = file;
		openModelsDialog = true;

		addToast({
			data: {
				type: 'success',
				title: 'Image Ready',
				description: `Selected "${file.name}" successfully.`
			}
		});

		inputElement.value = '';
	}

	let wardrobeFiles = $state<File[]>([]);
	let wardrobePreviewUrls = $state<string[]>([]);

	function handleNewClothingsUpload(event: any) {
		const inputElement = event.target as HTMLInputElement;
		const selectedFiles = Array.from(inputElement.files || []) as File[];

		if (!selectedFiles.length) return;

		const validImageFiles: File[] = [];
		const invalidFiles: File[] = [];

		// Check if they are images
		selectedFiles.forEach((file) => {
			if (file.type.startsWith('image/')) {
				validImageFiles.push(file);
			} else {
				invalidFiles.push(file);
			}
		});

		// 1. Handle ignored non-image files (show warning if some valid images were also selected)
		if (invalidFiles.length > 0 && validImageFiles.length > 0) {
			addToast({
				data: {
					type: 'warning',
					title: 'Some Files Ignored',
					description: `${invalidFiles.length} file(s) are not valid images and were ignored.`
				}
			});
		}

		// 2. Handle the case where ONLY non-image files were selected (show error)
		if (invalidFiles.length > 0 && validImageFiles.length === 0) {
			addToast({
				data: {
					type: 'error',
					title: 'Invalid File Type(s)',
					description: `No valid image files selected. Please choose files like JPG, PNG, WEBP.`
				}
			});
			// Clear the input value so user can select again easily
			inputElement.value = '';
			return;
		}

		// 3. Handle the case where only valid images were selected (or a mix, warning already shown)
		if (validImageFiles.length > 0) {
			const newPreviewUrls = validImageFiles.map((file) => URL.createObjectURL(file));

			wardrobeFiles = [...wardrobeFiles, ...validImageFiles];
			wardrobePreviewUrls = [...wardrobePreviewUrls, ...newPreviewUrls];

			addToast({
				data: {
					type: 'success',
					title: 'Images Ready',
					description: `${validImageFiles.length} valid image(s) selected.`
				}
			});

			openAddNewClothingsDialog = true; // Open dialog only if valid images were processed
		} else if (
			validImageFiles.length === 0 &&
			invalidFiles.length === 0 &&
			selectedFiles.length > 0
		) {
			// Handles potential edge cases
			console.warn('handleNewClothingsUpload: No files processed, check file filtering logic.');
			addToast({
				data: {
					type: 'info',
					title: 'No Files Processed',
					description: `Please select valid image files.`
				}
			});
		}

		// Clear the input value AFTER processing to allow selecting the same file again if needed
		// (e.g., user closes dialog without saving and wants to re-add).
		inputElement.value = '';
	}

	function handleTryOnUploadModel(event: any) {
		const inputElement = event.target as HTMLInputElement;
		const files = inputElement.files;

		if (!files || files.length === 0) {
			console.log('No file selected.');
			return;
		}

		const file = files[0];

		// Check if the file is an image
		if (!file.type.startsWith('image/')) {
			addToast({
				data: {
					type: 'error',
					title: 'Invalid File Type',
					description: `The selected file (${file.name}) is not a supported image. Please upload a JPG, PNG, WEBP, etc.`
				}
			});
			inputElement.value = '';
			return;
		}

		// 4. Check file size (Client-side check for immediate feedback)
		if (file.size > MAX_MODEL_IMAGE_SIZE) {
			addToast({
				data: {
					type: 'error',
					title: 'File Too Large',
					description: `The image "${file.name}" is too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Please upload an image smaller than ${MAX_MODEL_IMAGE_SIZE / 1024 / 1024}MB.`
				}
			});
			inputElement.value = '';
			return;
		}

		// Revoke the previous Object URL if one exists to prevent memory leaks
		if (imageURl) {
			URL.revokeObjectURL(imageURl);
		}

		imageURl = URL.createObjectURL(file);

		// Update state
		selectedModel = null; // Reset any previously selected model
		selectedModelFile = file; // Store the validated file object

		addToast({
			data: {
				type: 'success',
				title: 'Model Image Selected',
				description: `Image '${file.name}' is ready.`
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
							<div class="relative w-full lg:w-2/3 lg:max-w-[30rem]">
								{#if selectedDisplayTryOn}
									<div class="flex flex-col items-start justify-start gap-4">
										<img
											class="h-auto w-full object-contain shadow-lg lg:h-[40rem] lg:rounded-lg"
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
									class="bg-brand-secondary text-black-primary flex cursor-pointer items-center justify-center rounded-lg text-5xl font-bold"
									onclick={() => {
										openDialog = true;
									}}
									>+
								</button>
								{#each clothingsWithTryOns as item}
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
										class="bg-brand-secondary text-brand flex cursor-pointer items-center justify-center rounded-lg text-6xl font-bold"
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
			if (!tryOnCategory) {
				addToast({
					data: {
						type: 'error',
						title: 'Missing Category',
						description: 'Please select a clothing category.'
					}
				});
				cancel();
				return;
			}
			if (!clothingFile) {
				addToast({
					data: {
						type: 'error',
						title: 'Missing Clothing Image',
						description: 'Please select or upload a clothing image.'
					}
				});
				cancel();
				return;
			}
			if (!selectedModel && !selectedModelFile) {
				addToast({
					data: {
						type: 'error',
						title: 'Missing Model Image',
						description: 'Please select or upload a model image.'
					}
				});
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

			addToast({
				data: {
					type: 'info',
					title: 'Task queued',
					description: `Your ${tryOnCategory.toLowerCase()} try on is starting.`
				}
			});

			return async ({ result, update }) => {
				let tryOnInitiated = false; // Flag to track if fetchTask should run

				try {
					if (result.type === 'success' && result.data) {
						if (result.data.success === true) {
							taskID = result.data.taskID as string;

							if (taskID) {
								addToast({
									data: {
										type: 'info',
										title: 'Task in progress',
										description: 'Virtual try-on is processing. Please wait...'
									}
								});
								tryOnInitiated = true;
								step++;
							} else {
								// --- ERROR: Server succeeded but no Task ID ---
								addToast({
									data: {
										type: 'error',
										title: 'Submission Error',
										description:
											(result.data.message as string) ||
											'Could not start the try-on task (missing Task ID). Please try again.'
									}
								});
							}
						} else {
							// --- ERROR: Server reported failure (e.g., validation) ---
							addToast({
								data: {
									type: 'error',
									title: 'Submission Failed',
									description:
										(result.data.message as string) ||
										'The server could not process your try-on request.'
								}
							});
						}
					} else if (result.type === 'failure') {
						// --- ERROR: Unhandled Server Error ---
						console.error('Try-on server action failed (unhandled):', result);
						addToast({
							data: {
								type: 'error',
								title: 'Server Error',
								description:
									(result.data?.message as string) ||
									'An unexpected error occurred on the server. Please try again later.'
							}
						});
					} else if (result.type === 'error') {
						// --- ERROR: Network/Fetch Error ---
						console.error('Enhance Fetch Error:', result.error);
						addToast({
							data: {
								type: 'error',
								title: 'Network Error',
								description: 'Could not connect to the server. Please check your connection.'
							}
						});
					} else {
						// --- UNEXPECTED STATE ---
						console.warn('Unexpected result type from enhance:', result);
						addToast({
							data: {
								type: 'warning',
								title: 'Unknown Error',
								description: 'An unexpected issue occurred during submission.'
							}
						});
					}

					// --- Fetch Task Result (only if submission was successful) ---
					if (tryOnInitiated && taskID) {
						try {
							await fetchTask();
							await update();
						} catch (fetchError) {
							console.error('fetchTask failed:', fetchError);
							addToast({
								data: {
									type: 'error',
									title: 'Processing Failed',
									description:
										'The virtual try-on process did not complete successfully. Please try again.'
								}
							});
							step--;
						}
					}
				} finally {
					showLoading = false;
				}
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
							class="bg-brand-secondary text-black-primary relative flex cursor-pointer items-center justify-center rounded-lg text-5xl font-bold"
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
								id={model.id}
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
						id={model.id}
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
					} else {
						addToast({
							data: {
								type: 'error',
								title: 'No Image Selected',
								description: 'Please select an image file for the model before saving.'
							}
						});
						cancel();
					}
					return async ({ result, update }) => {
						if (result.type === 'success' && result.data) {
							if (result.data.success === true) {
								addToast({
									data: {
										type: 'success',
										title: 'Model Saved',
										description: (result.data?.message as string) || 'New model added successfully!'
									}
								});
								openModelsDialog = false;

								if (imageURl) {
									URL.revokeObjectURL(imageURl);
									imageURl = '';
								}
								newModelFile = null;
								// Optional: Invalidate data to refresh lists, etc.
								// await invalidateAll(); // Or specific identifiers invalidate('app:models');
							} else {
								addToast({
									data: {
										type: 'error',
										title: 'Save Failed',
										description:
											(result.data.message as string) ||
											'Could not save the model. Please try again.'
									}
								});
								// Keep the dialog open so the user can potentially fix the issue
							}
						} else if (result.type === 'failure') {
							// --- ERROR TOAST: Server action crashed / Unhandled Error ---
							console.error('Server action failed:', result); // Log the full result for debugging
							addToast({
								data: {
									type: 'error',
									title: 'Server Error',
									description:
										(result.data?.message as string) ||
										'An unexpected error occurred on the server. Please try again later.'
								}
							});
							// Keep the dialog open
						} else if (result.type === 'error') {
							console.error('Enhance Fetch Error:', result.error);
							addToast({
								data: {
									type: 'error',
									title: 'Network Error',
									description: 'Could not reach the server. Please check your connection.'
								}
							});
							// Keep the dialog open
						}

						await update();
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
					<div class="relative aspect-3/4 w-[18rem] overflow-hidden rounded">
						<img src={url} alt={`Clothing item ${i + 1}`} class="h-full w-full object-cover" />
						<button
							class="bg-brand-secondary absolute top-1 right-1 flex cursor-pointer items-center justify-center rounded-sm px-2 text-black-primary text-2xl shadow-md"
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
				use:enhance={({ formData, cancel }) => {
					if (wardrobeFiles.length === 0) {
						addToast({
							data: {
								type: 'warning',
								title: 'No Images Selected',
								description: 'Please select one or more clothing images to upload.'
							}
						});
						cancel();
						return;
					}

					wardrobeFiles.forEach((file) => {
						formData.append('clothing_images', file);
					});

					addToast({
						data: {
							type: 'info',
							title: 'Uploading...',
							description: `Uploading ${wardrobeFiles.length} image(s) to your wardrobe.`
						}
					});

					return async ({ result, update }) => {
						if (result.type === 'success' && result.data) {
							if (result.data.success === true) {
								addToast({
									data: {
										type: 'success',
										title: 'Upload Successful',
										description:
											(result.data.message as string) ||
											`${result.data.insertedCount || 'Items'} added successfully!`
									}
								});

								openAddNewClothingsDialog = false;
								wardrobePreviewUrls.forEach(URL.revokeObjectURL); // Prevent memory leaks
								wardrobeFiles = [];
								wardrobePreviewUrls = [];

								await invalidateAll();
							} else {
								addToast({
									data: {
										type: 'warning',
										title: 'Upload Issue',
										description:
											(result.data.message as string) ||
											'Some or all images could not be processed by the server.'
									}
								});
								// DO NOT clear state here - keep dialog open so user sees context/files
								// try to highlight rejected files if `result.data.rejectedImages` is useful client-side
							}
						} else if (result.type === 'failure') {
							console.error('Server action failed (unhandled exception):', result);
							addToast({
								data: {
									type: 'error',
									title: 'Server Error',
									description:
										(result.data?.message as string) ||
										'An unexpected error occurred on the server while uploading. Please try again later.'
								}
							});
							// Keep dialog open
						} else if (result.type === 'error') {
							console.error('Enhance Fetch Error:', result.error);
							addToast({
								data: {
									type: 'error',
									title: 'Network Error',
									description:
										'Could not connect to the server to upload images. Please check your connection.'
								}
							});
							// Keep dialog open
						}

						await update();
					};
				}}
			>
				<div class="flex gap-2">
					<Button
						fullWidth={true}
						text="Add More"
						type="button"
						style="secondary"
						onclick={() => {
							const input = document.createElement('input');
							input.type = 'file';
							input.multiple = true;
							input.accept = 'image/*';
							input.onchange = handleNewClothingsUpload;
							input.click();
						}}
					/>
					<Button text="Upload to Wardrobe" fullWidth={true} type="submit" />
				</div>
			</form>
		{:else}
			<p class="text-center text-gray-500">No images selected</p>
		{/if}
	</div>
</Dialog>
