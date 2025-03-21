<script lang="ts">
	import { tryOnStore } from "$lib/state/vto.svelte";
	import ImageUploadV2 from "$lib/components/form/image-upload-v2.svelte";
	import { goto } from "$app/navigation";
	import Title from "$lib/components/text/title.svelte";
	import Subtitle from "$lib/components/text/subtitle.svelte";
	import Back from "$lib/components/buttons/back.svelte";
	import Dialog from "$lib/components/dialog/dialog.svelte";
	import Or from "$lib/components/text/or.svelte";
	import ClothingGuide from "$lib/content/vto-dialogs/clothingGuide.svelte";
	import Button from "$lib/components/buttons/button.svelte";
	import ImageButton from "$lib/components/form/imageButton.svelte";
	import { subscribeToUploadChanges } from "$lib/clientUtil/realtime";
	import type { RealtimeChannel } from "@supabase/supabase-js";
	import { onDestroy, onMount } from "svelte";
	import Qrcode from "$lib/content/vto-qr/qrcode.svelte";
	import fullimg from "$lib/assets/categories/full.png?enhanced";
	import lowerimg from "$lib/assets/categories/lower.png?enhanced";
	import upperimg from "$lib/assets/categories/upper.png?enhanced";
  
	import type { PageProps } from "./$types";
	import StepIndicator from "$lib/components/visualiser/stepIndicator.svelte";
	let { data }: PageProps = $props();
	let { supabase } = data;
	// let sessionId = $derived(data.sessionId);
	// let model_url = $derived(data.model_url);
  
	let openDialog = $state(false);
  
	let tryOn = tryOnStore();
	let clothingImageFile = $state<File | null>(tryOn.clothingImageFile);
	let bodyImageFile = tryOn.modelImageFile;
	let category = $state("lower");
	let openQR = $state(false);
  
	function updateTryOnState(x: string) {
	  if (clothingImageFile && category) {
		tryOn.clothingImageFile = clothingImageFile;
		tryOn.category = x;
		goto("/beta/vto-test/generation");
	  } else {
		alert("Something went wrong, please start again.");
	  }
	}
  
	let channelSubscription: RealtimeChannel;
	let showLoader = $state(false);
  
	const token = crypto.randomUUID(); // token is unique every component
	onMount(() => {
	  channelSubscription = subscribeToUploadChanges(
		supabase,
		token,
		(newFile: File) => {
		  clothingImageFile = newFile;
		}
	  );
	});
  
	onDestroy(() => {
	  if (channelSubscription) {
		supabase.removeChannel(channelSubscription);
	  }
	});
  </script>
  
  <div
	class="flex flex-col lg:flex-row justify-between items-start gap-5 lg:gap-40 lg:pt-20 flex-1 pt-6 pb-8 w-8/10"
  >
	<div
	  class="relative flex flex-col justify-between lg:justify-center lg:min-h-[40rem] w-full"
	>
	  <!-- Small screen -->
	  <div class="block lg:hidden">
		<div class="relative flex justify-center items-center mb-8 w-full">
		  <div class="absolute left-0">
			<Back gotoPath="/beta/vto-test/body-image-upload" />
		  </div>
		  <StepIndicator steps={3} activeStep={2} />
		</div>
	  </div>
	  <!-- Large screen -->
	  <div class="hidden lg:block">
		<div class="absolute left-0 top-0">
		  <Back gotoPath="/beta/vto-test/body-image-upload" />
		</div>
	  </div>
  
	  <div class="flex flex-col gap-1 justify-center items-start">
		<!-- TITLE -->
		<div class="lg:mb-4 flex flex-col gap-1">
		  <div class="hidden lg:block mb-4">
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
		<Dialog title={"Clothing Image Examples"}>
		  <ClothingGuide />
		</Dialog>
		<!-- END SHOW EXAMPLE BUTTON -->
	  </div>
	</div>
	<div class="flex flex-col gap-2 w-full max-w-[30rem]">
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
		loading={showLoader}
		onclick={() => {
		  openDialog = true;
		  showLoader = true;
		}}
	  />
	  <!-- END BUTTONS UNDER BOX -->
	  <div class="hidden lg:block w-full">
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
  
	<Dialog bind:open={openQR} button={false} title={"Upload image from phone"}>
	  <Qrcode {token} />
	</Dialog>
  
	<Dialog
	  title="Please select a category"
	  bind:open={openDialog}
	  button={false}
	>
	  <div class="flex flex-col gap-4">
		<ImageButton
		  text="Upper Body"
		  ariaLabel="Scan to upload"
		  type="submit"
		  onclick={() => {
			updateTryOnState("Upper Body");
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
			updateTryOnState("Lower Body");
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
  