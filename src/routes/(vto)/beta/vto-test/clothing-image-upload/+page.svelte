<script lang="ts">
	import { tryOnStore } from '$lib/state/vto.svelte';
	import ImageUploadV2 from '$lib/components/form/image-upload-v2.svelte';
	import { goto } from '$app/navigation';
	import Title from '$lib/components/text/title.svelte';
	import Subtitle from '$lib/components/text/subtitle.svelte';
	import Back from '$lib/components/buttons/back.svelte';
	import Dialog from '$lib/components/dialog/dialog.svelte';
	import Or from '$lib/components/text/or.svelte';
	import ClothingGuide from '$lib/content/vto-dialogs/clothingGuide.svelte';
	import Button from '$lib/components/button.svelte';
	import ImageButton from '$lib/components/form/imageButton.svelte';
	import { subscribeToUploadChanges } from '$lib/clientUtil/realtime';
	import type { RealtimeChannel } from '@supabase/supabase-js';
	import { onDestroy, onMount } from 'svelte';
	import Qrcode from '$lib/content/vto-qr/qrcode.svelte';
	import fullimg from '$lib/assets/categories/full.png';
	import lowerimg from '$lib/assets/categories/lower.png';
	import upperimg from '$lib/assets/categories/upper.png';

	import type { PageProps } from './$types';
	import StepIndicator from '$lib/components/visualiser/stepIndicator.svelte';
	let { data }: PageProps = $props();
	let { supabase } = data;
	// let sessionId = $derived(data.sessionId);
	// let model_url = $derived(data.model_url);

	let openDialog = $state(false);

	let tryOn = tryOnStore();
	let clothingImageFile = $state<File | null>(tryOn.clothingImageFile);
	let bodyImageFile = tryOn.modelImageFile;
	let category = $state('lower');
	let openQR = $state(false);

	function updateTryOnState(x: string) {
		if (clothingImageFile && category) {
			tryOn.clothingImageFile = clothingImageFile;
			tryOn.category = x;
			goto('/beta/vto-test/generation');
		} else {
			alert('Something went wrong, please start again.');
		}
	}

	let channelSubscription: RealtimeChannel;
	let showLoader = $state(false);

	const token = crypto.randomUUID(); // token is unique every component
	onMount(() => {
		channelSubscription = subscribeToUploadChanges(supabase, token, (newFile: File) => {
			clothingImageFile = newFile;
		});
	});

	onDestroy(() => {
		if (channelSubscription) {
			supabase.removeChannel(channelSubscription);
		}
	});
</script>

<div
	class="flex w-8/10 flex-1 flex-col items-start justify-between gap-5 py-8 lg:flex-row lg:gap-40 lg:pt-20"
>
	<div class="relative flex flex-col justify-between lg:min-h-[40rem] lg:justify-center">
		<div class="absolute top-0 left-0">
			<Back gotoPath="/beta/vto-test/body-image-upload" />
		</div>
		<div class="flex flex-col items-start justify-center gap-1">
			<!-- TITLE -->
			<div class="flex flex-col gap-1 lg:mb-4">
				<StepIndicator steps={3} activeStep={2} />

				<Title title="Upload your clothing image" level="h1" />
				<Subtitle>
					<div>
						<p>Upload your image with:</p>
						<ul>
							<li>Plain Background</li>
							<li>One Clothing Image</li>
						</ul>
					</div>
				</Subtitle>
			</div>
			<!-- END TITLE -->

			<!-- SHOW EXAMPLE BUTON -->
			<Dialog title={'Clothing Image Examples'}>
				<ClothingGuide />
			</Dialog>
			<!-- END SHOW EXAMPLE BUTTON -->
		</div>
	</div>
	<div class="flex w-full flex-col gap-2 lg:w-1/3">
		<!-- UPLOAD IMAGE BOX -->
		<ImageUploadV2
			bind:file={clothingImageFile}
			placeholder="Click to upload image"
			name="clothing-image"
		/>

		<!-- BUTTONS UNDER BOX -->
		<Button
			disabled={!clothingImageFile || !bodyImageFile}
			type="button"
			text="Generate"
			style="primary"
			onclick={() => {
				openDialog = true;
			}}
		/>
		<!-- END BUTTONS UNDER BOX -->
		<div class="hidden w-full lg:block">
			<Or />
			{#if clothingImageFile}
				<Button
					text="Reupload image from phone"
					fullWidth={true}
					style="secondary"
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
	</div>

	<Dialog bind:open={openQR} button={false} title={'Upload image from phone'}>
		<Qrcode {token} />
	</Dialog>

	<Dialog title="Please select a category" bind:open={openDialog} button={false}>
		<div class="flex flex-col gap-4">
			<ImageButton
				text="Upper Body"
				ariaLabel="Scan to upload"
				type="submit"
				onclick={() => {
					updateTryOnState('Upper Body');
				}}
			>
				{#snippet pic()}
					<enhanced:img src={upperimg} alt="a man in button up shirt" />
				{/snippet}
			</ImageButton>
			<ImageButton
				text="Lower Body"
				ariaLabel="Scan to upload"
				type="submit"
				onclick={() => {
					updateTryOnState('Lower Body');
				}}
			>
				{#snippet pic()}
					<enhanced:img src={lowerimg} alt="a man in white trousers" />
				{/snippet}
			</ImageButton>
		</div>
		<!-- <ImageButton
        text="Dresses"
        ariaLabel="Scan to upload"
        type="submit"
        onclick={() => {
          category = "dresses";
        }}
      />
      <ImageButton
        text="Full Body"
        ariaLabel="Scan to upload"
        type="submit"
        onclick={() => {
          category = "fullBody";
        }}
      />
      <ImageButton
        text="Hair"
        ariaLabel="Scan to upload"
        type="submit"
        onclick={() => {
          category = "hair";
        }}
      /> -->
	</Dialog>
</div>
