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
	import Button from '$lib/components/buttons/button.svelte';
	import ImageButton from '$lib/components/form/imageButton.svelte';
	import { subscribeToUploadChanges } from '$lib/clientUtil/realtime';
	import type { RealtimeChannel } from '@supabase/supabase-js';
	import { onDestroy, onMount } from 'svelte';
	import Qrcode from '$lib/content/vto-qr/qrcode.svelte';
	import fullimg from '$lib/assets/categories/full.png?enhanced';
	import lowerimg from '$lib/assets/categories/lower.png?enhanced';
	import upperimg from '$lib/assets/categories/upper.png?enhanced';

	import type { PageProps } from './$types';
	import StepIndicator from '$lib/components/visualiser/stepIndicator.svelte';
	import Pin from '$lib/svg/pin.svelte';
	import { addToast } from '$lib/components/melt/toast.svelte';

	let { data }: PageProps = $props();
	let { supabase } = data;
	// let sessionId = $derived(data.sessionId);
	// let model_url = $derived(data.model_url);

	let openDialog = $state(false);

	let tryOn = tryOnStore();
	let clothingImageFile = $state<File | null>(tryOn.clothingImageFile);
	let bodyImageFile = tryOn.modelImageFile;
	let imageUrl = $derived.by(() => {
		if (bodyImageFile) {
			return URL.createObjectURL(bodyImageFile);
		} else {
			return null;
		}
	});

	let category = $state('');
	let openQR = $state(false);

	function updateTryOnState() {
		if (clothingImageFile && category) {
			tryOn.clothingImageFile = clothingImageFile;
			tryOn.category = category;
			addToast({
				data: {
					type: 'info',
					title: 'Task queued',
					description: `Your ${category.toLowerCase()} try on is starting.`
				}
			});
			goto('/vto/generation');
		} else {
			addToast({
				data: {
					type: 'error',
					title: 'Error: Missing category',
					description: `Please select a category.`
				}
			});
		}
	}

	let channelSubscription: RealtimeChannel;
	let showLoader = $state(false);

	const token = crypto.randomUUID(); // token is unique every component
	onMount(() => {
		if (!bodyImageFile) {
			goto('/');
		}

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
	class="mx-auto flex h-full w-8/10 flex-1 flex-col items-start justify-between gap-5 pt-6 pb-8 lg:flex-row lg:gap-40 lg:pt-20"
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
			<div class="flex flex-col items-start justify-start gap-1 lg:mb-4">
				{#if imageUrl}
					<div class="mb-4 hidden items-center justify-center lg:flex">
						<div class="relative">
							<img src={imageUrl} alt="model" class=" max-h-32 rounded-md object-cover shadow-sm" />
							<Pin twClass="absolute -top-2 -right-2" />
						</div>
					</div>
				{/if}
				<div class="mb-4 hidden lg:flex">
					<StepIndicator steps={3} activeStep={2} />
				</div>

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
			<Dialog title={'Clothing Image Examples'} textButton={true}>
				<ClothingGuide />
			</Dialog>
			<!-- END SHOW EXAMPLE BUTTON -->
		</div>
	</div>
	{#if imageUrl}
		<div class="flex w-full items-center justify-center lg:hidden">
			<div class="relative">
				<img src={imageUrl} alt="model" class=" max-h-32 rounded-md object-cover shadow-sm" />
				<Pin twClass="absolute -top-2 -right-2" />
			</div>
		</div>
	{/if}
	<div class="flex w-full max-w-[30rem] flex-col items-center justify-center gap-2">
		<!-- UPLOAD IMAGE BOX -->
		<ImageUploadV2
			bind:file={clothingImageFile}
			placeholder="Click to upload image"
			name="clothing-image"
		/>

		<!-- BUTTONS UNDER BOX -->
		<Button
			fullWidth={true}
			disabled={!clothingImageFile || !bodyImageFile}
			type="button"
			text="Generate"
			style="primary"
			loading={showLoader && openDialog}
			onclick={() => {
				openDialog = true;
				showLoader = true;
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

	<Dialog bind:open={openQR} title={'Upload image from phone'}>
		<Qrcode {token} stage="clothing" />
	</Dialog>

	<Dialog
		title="Please select a category"
		buttonText="Confirm"
		bind:open={openDialog}
		textButton={false}
		onclick={updateTryOnState}
		disabled={!category}
	>
		<div class="flex flex-col gap-4 lg:flex-row">
			<ImageButton
				text="Upper Body"
				ariaLabel="Scan to upload"
				type="submit"
				onclick={() => {
					category = 'Upper Body';
				}}
				src={upperimg}
				alt="a man in button up shirt"
			/>
			<ImageButton
				text="Lower Body"
				ariaLabel="Scan to upload"
				type="submit"
				onclick={() => {
					category = 'Lower Body';
				}}
				src={lowerimg}
				alt="a man in white trousers"
			/>
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
