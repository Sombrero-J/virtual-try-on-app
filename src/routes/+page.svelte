<script lang="ts">
	import { tryOnStore } from '$lib/state/vto.svelte';
	import ImageUploadV2 from '$lib/components/form/image-upload-v2.svelte';
	import { goto } from '$app/navigation';
	import Title from '$lib/components/text/title.svelte';
	import Subtitle from '$lib/components/text/subtitle.svelte';
	import Dialog from '$lib/components/dialog/dialog.svelte';
	import BodyGuide from '$lib/content/vto-dialogs/bodyGuide.svelte';
	import Or from '$lib/components/text/or.svelte';
	import Button from '$lib/components/buttons/button.svelte';
	import Qrcode from '$lib/content/vto-qr/qrcode.svelte';
	import StepIndicator from '$lib/components/visualiser/stepIndicator.svelte';
	import { applyAction } from '$app/forms';
	import { subscribeToUploadChanges } from '$lib/clientUtil/realtime';
	import type { RealtimeChannel } from '@supabase/supabase-js';

	import type { PageProps } from './$types';
	import { enhance } from '$app/forms';
	import { onDestroy, onMount } from 'svelte';
	import { addToast } from '$lib/components/melt/toast.svelte';

	let { data }: PageProps = $props();
	let { supabase } = data;

	let openQR = $state(false);

	let tryOn = tryOnStore();
	let file = $state<File | null>(tryOn.modelImageFile || null);

	function uploadBodyImage() {
		if (file) {
			tryOn.modelImageFile = file;
		}
	}

	let channelSubscription: RealtimeChannel;
	let showLoader = $state(false);

	const token = crypto.randomUUID(); // token is unique every component
	onMount(() => {
		channelSubscription = subscribeToUploadChanges(supabase, token, (newFile: File) => {
			addToast({
				data: {
					type: 'success',
					title: 'Upload image from phone',
					description: 'Received image from phone!'
				}
			});
			file = newFile;
		});
	});

	onDestroy(() => {
		if (channelSubscription) {
			supabase.removeChannel(channelSubscription);
		}
	});
</script>

<div
	class="mx-auto flex h-full w-8/10 flex-1 flex-col items-start lg:items-center justify-between gap-5 py-8 lg:flex-row lg:gap-40 lg:pt-20"
>
	<div class="relative flex w-full flex-col justify-between lg:min-h-[40rem] lg:justify-center">
		<!-- Small screen -->
		<div class="block lg:hidden">
			<div class="relative mb-8 flex w-full items-center justify-center">
				<StepIndicator steps={3} activeStep={1} />
			</div>
		</div>

		<div class="flex flex-col items-start justify-center gap-1">
			<!-- TITLE -->
			<div class="flex flex-col gap-1 lg:mb-4">
				<div class="mb-4 hidden lg:flex">
					<StepIndicator steps={3} activeStep={1} />
				</div>
				<Title title="Upload your body image" level="h1" />
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
			</div>
			<!-- END TITLE -->

			<!-- SHOW EXAMPLE BUTON -->
			<Dialog textButton={true} title={'Your Image Examples'}>
				<BodyGuide />
			</Dialog>
			<!-- END SHOW EXAMPLE BUTTON -->
		</div>
	</div>
	<div class="flex w-full max-w-[30rem] flex-col items-center justify-center gap-2">
		<!-- UPLOAD IMAGE BOX -->
		<ImageUploadV2 bind:file placeholder="Click to upload image" name="body-image" />

		<!-- BUTTONS UNDER BOX -->

		<Button
			onclick={() => {
				uploadBodyImage();
				showLoader = true;
				goto('/vto/clothing-image-upload');
			}}
			disabled={!file}
			text="Continue"
			style="primary"
			type="submit"
			loading={showLoader}
			fullWidth={true}
		/>
		<!-- END BUTTONS UNDER BOX -->
		<div class="hidden w-full lg:block">
			<Or />
			{#if file}
				<Button
					text="Reupload image from phone"
					style="secondary"
					fullWidth={true}
					onclick={() => (openQR = true)}
				/>
			{:else}
				<Button
					text="Upload image from phone"
					fullWidth={true}
					style="secondary"
					onclick={() => (openQR = true)}
				/>
			{/if}
		</div>

		<Dialog
			bind:open={openQR}
			textButton={false}
			title={'Upload image from phone'}
			buttonText="Done"
		>
			<Qrcode {token} stage="body" />
		</Dialog>
	</div>
</div>
