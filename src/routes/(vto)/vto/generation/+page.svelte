<script lang="ts">
	import { tryOnStore } from '$lib/state/vto.svelte';
	import { fetchQueryTask, downloadFileFromBlob, fetchSubmitTask } from './utils';
	import Title from '$lib/components/text/title.svelte';
	import Subtitle from '$lib/components/text/subtitle.svelte';
	import Back from '$lib/components/buttons/back.svelte';
	import ImageScan from '$lib/components/imageScan/imageScan.svelte';
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import ImageGenV2 from '$lib/components/form/image-gen-v2.svelte';
	import Button from '$lib/components/buttons/button.svelte';
	import { goto } from '$app/navigation';
	import { enhance } from '$app/forms';
	import type { SubmitFunction } from '@sveltejs/kit';
	import StepIndicator from '$lib/components/visualiser/stepIndicator.svelte';
	import { Tween } from 'svelte/motion';
	import { linear } from 'svelte/easing';
	import { addToast } from '$lib/components/melt/toast.svelte';

	let tryOn = tryOnStore();
	let modelFile = tryOn.modelImageFile;
	let taskID = $state('');
	let clothingFile = tryOn.clothingImageFile;

	let tryOnUrl = $state('');

	let progress = new Tween(0, {
		duration: 15000,
		easing: linear,
		delay: 2000
	});
	onMount(async () => {
		checkState();
		try {
			const { data, error } = await fetchSubmitTask();
			progress.target = 30;
			if (data) {
				taskID = data;
				setTimeout(async () => {
					progress.target = 80;
					const res = await fetchQueryTask(taskID);
					if (res.url) {
						addToast({
							data: {
								type: 'success',
								title: 'Try on success!',
								description: 'Your try on is successful!'
							}
						});
						progress.target = 100;
						tryOnUrl = res.url;
						tryOn.tryonImageUrl = tryOnUrl;
					} else if (res.error) {
						addToast({
							data: {
								type: 'error',
								title: 'Error: Try on failed.',
								description: 'An unexpected error occurred during generation. ' + res.error
							}
						});
					}
				}, 15000);
			} else if (error) {
				addToast({
					data: {
						type: 'error',
						title: 'Error: Server error.',
						description: 'An error occurred in the server, please contact support.'
					}
				});
			}
		} catch (error) {
			addToast({
				data: {
					type: 'error',
					title: 'Error: Server error.',
					description: 'An error occurred in the server, please contact support.'
				}
			});
		}
	});

	const saveToWardrobe: SubmitFunction = ({ formData, cancel }) => {
		if (taskID && clothingFile && modelFile) {
			formData.append('taskID', taskID);
			formData.append('clothingFile', clothingFile);
			formData.append('modelFile', modelFile);
			formData.append('tryonUrl', tryOnUrl);
		} else {
			addToast({
				data: {
					type: 'error',
					title: 'Error: Missing items.',
					description: 'Please retry and upload the required items.'
				}
			});
			cancel();
		}

		return async ({ result }) => {
			if (result.type == 'success') {
				if (result.data?.success) {
					addToast({
						data: {
							type: 'success',
							title: 'Successfully saved to wardrobe.',
							description: 'Item added to your wardrobe.'
						}
					});
					goto('/wardrobe');
				} else {
					addToast({
						data: {
							type: 'error',
							title: 'Error: Failed to save outfit.',
							description: 'An error occurred. ' + result.data?.message
						}
					});
				}
			} else if (result.type == 'failure') {
				addToast({
					data: {
						type: 'error',
						title: 'Error: Failed to save outfit.',
						description: 'An error occurred. ' + result.data?.message
					}
				});
			} else if (result.type === 'error') {
				addToast({
					data: {
						type: 'error',
						title: 'Network Error',
						description: 'Could not reach the server. Please check your connection.'
					}
				});
			}
		};
	};

	const checkState = () => {
		if (!tryOn.modelImageFile || !tryOn.clothingImageFile) {
			goto('/');
		}
	};
</script>

<div
	class="mx-auto flex w-8/10 flex-1 flex-col items-start lg:items-center justify-between gap-5 py-8 lg:flex-row lg:gap-40 lg:pt-20"
>
	<div class="relative flex w-full flex-col justify-between lg:min-h-[40rem] lg:justify-center">
		<!-- Small screen -->
		<div class="block lg:hidden">
			<div class="relative mb-8 flex w-full items-center justify-center">
				<div class="absolute left-0">
					<Back onclick={() => goto('/')} />
				</div>
				<StepIndicator steps={3} activeStep={2} />
			</div>
		</div>
		<!-- Large screen -->
		<div class="hidden lg:block">
			<div class="absolute top-0 left-0">
				<Back onclick={() => goto('/')} />
			</div>
		</div>

		<div class="flex flex-col items-start justify-center gap-1">
			<!-- TITLE -->
			<div class="flex flex-col gap-1 lg:mb-4">
				<div class="mb-4 hidden lg:flex">
					<StepIndicator steps={3} activeStep={2} />
				</div>
				<Title title="Virtual Try On Generation" level="h1" />
				<Subtitle>
					{#if tryOnUrl}
						<div>
							<p>Congratulations! Try On Completed!</p>
						</div>
					{:else}
						<div>
							<p>It may take up to 14-20 seconds to generate</p>
						</div>
					{/if}
				</Subtitle>
			</div>
			<!-- END TITLE -->
		</div>
	</div>
	<div class="flex w-full max-w-[30rem] flex-col gap-2">
		{#if tryOnUrl}
			<ImageGenV2 imageUrl={tryOnUrl}>
				{#snippet button()}
					<div class="flex flex-col gap-2">
						<div class="flex items-center justify-center gap-2">
							<Button
								text="Restart"
								type="button"
								style="secondary"
								onclick={() => goto('/')}
							/>
							<Button
								text="Download"
								type="submit"
								style="secondary"
								onclick={() => downloadFileFromBlob(tryOnUrl)}
							/>
						</div>
						<form
							action="?/save"
							method="post"
							enctype="multipart/form-data"
							use:enhance={saveToWardrobe}
						>
							<Button text="Save to wardrobe" fullWidth={true} />
						</form>
					</div>
				{/snippet}
			</ImageGenV2>
		{:else}
			<ImageScan imageFile={modelFile} progress={progress.current} />
		{/if}
	</div>
</div>
