<script lang="ts">
	import ImageUploadV2 from '$lib/components/form/image-upload-v2.svelte';
	import Button from '$lib/components/buttons/button.svelte';
	import { enhance } from '$app/forms';
	import type { PageProps } from './$types';
	import { page } from '$app/state';
	import Subtitle from '$lib/components/text/subtitle.svelte';
	import Title from '$lib/components/text/title.svelte';
	import Dialog from '$lib/components/dialog/dialog.svelte';
	import BodyGuide from '$lib/content/vto-dialogs/bodyGuide.svelte';
	import ClothingGuide from '$lib/content/vto-dialogs/clothingGuide.svelte';
	import { addToast } from '$lib/components/melt/toast.svelte';

	const token = page.url.searchParams.get('sessionId');
	const stage = page.url.searchParams.get('stage');

	let { form }: PageProps = $props();
	let file = $state<File | null>(null);
	let showLoader = $state(false);
</script>

<div
	class="mx-auto flex h-full w-8/10 flex-1 flex-col items-center justify-between gap-5 py-8 lg:flex-row lg:gap-40 lg:pt-20"
>
	<div class="relative flex w-full flex-col justify-between lg:min-h-[40rem] lg:justify-center">
		<div class="flex flex-col items-start justify-center gap-1">
			<!-- TITLE -->
			<div class="flex flex-col items-start justify-start gap-1 lg:mb-4">
				{#if stage === 'body'}
					<Title title="Upload Your Model Image" level="h1" />
					<Subtitle>
						<div>
							<p>Upload your image with:</p>
							<ul>
								<li>Plain Background</li>
								<li>Full body with full visibility</li>
								<li>Straight arms</li>
								<li>One Person</li>
							</ul>
						</div>
					</Subtitle>
					<Dialog title={'Your Image Examples'} textButton={true}>
						<BodyGuide />
					</Dialog>
				{:else if stage === 'clothing'}
					<Title title="Upload Your Clothing Image" level="h1" />
					<Subtitle>
						<div>
							<p>Upload your image with:</p>
							<ul>
								<li>Plain Background</li>
								<li>One Clothing Image</li>
							</ul>
						</div>
					</Subtitle>
					<Dialog title={'Your Image Examples'} textButton={true}>
						<ClothingGuide />
					</Dialog>
				{/if}
			</div>
			<!-- END TITLE -->
		</div>
	</div>
	<form
		class="flex w-full flex-col items-center justify-center gap-2"
		method="post"
		enctype="multipart/form-data"
		action="?/upload"
		use:enhance={() => {
			showLoader = true;

			return async ({ result, update }) => {
				try {
					if (result.type === 'success' && result.data) {
						if (result.data.success === true) {
							addToast({
								data: {
									type: 'success',
									title: 'Submitted!',
									description: 'Check your original device. You may close this window now.'
								}
							});
							await update();
						}
					} else if (result.type === 'failure') {
						console.error('Upload action failed:', result.data);
						addToast({
							data: {
								type: 'error',
								title: 'Upload Failed',
								description:
									(result.data?.message as string) ||
									'Could not process the upload. Please try again.'
							}
						});
					} else if (result.type === 'error') {
						console.error('Enhance Fetch Error Object:', result.error);
						console.error('Enhance Fetch Error Message:', result.error.message);
						console.error('Enhance Fetch Error Stack:', result.error.stack);
						addToast({
							data: {
								type: 'error',
								title: 'Network Error',
								description:
									'Could not connect to the server. Please check your connection and try again.'
							}
						});
					}
				} finally {
					showLoader = false;
				}
			};
		}}
	>
		<!-- UPLOAD IMAGE BOX -->
		<ImageUploadV2 bind:file placeholder="Click to upload image" name="phone-image" />

		<!-- BUTTONS UNDER BOX -->
		<input type="hidden" name="token" value={token} />

		<Button
			disabled={!file}
			text="Submit"
			style="primary"
			type="submit"
			loading={showLoader}
			fullWidth={true}
		/>
	</form>
</div>
