<script lang="ts">
	import Toast, { addToast } from '$lib/components/melt/toast.svelte';
	import Label from '$lib/components/label.svelte';
	import Button from '$lib/components/buttons/button.svelte';
	import ImageUploadV2 from '$lib/components/form/image-upload-v2.svelte';
	import type { PageProps } from './$types';
	import { enhance } from '$app/forms';
	import Progress from '$lib/components/melt/progress.svelte';
	import Select from '$lib/components/melt/select.svelte';
	import Dialog from '$lib/components/dialog/dialog.svelte';
	import { text } from '@sveltejs/kit';
	import DialogButton from '$lib/components/buttons/dialogButton.svelte';

	let { form }: PageProps = $props();
	let open = $state(false);
	let progress = $state(0);

	function startProgress(startValue: number, stopValue: number, durationInSeconds: number) {
		progress = startValue;

		if (startValue >= stopValue || durationInSeconds <= 0) return;

		const interval = 50;
		const totalSteps = (durationInSeconds * 1000) / interval;
		const step = (stopValue - startValue) / totalSteps;

		let intervalId = setInterval(() => {
			if (progress >= stopValue) {
				progress = stopValue;
			} else {
				progress += step;
			}
		}, interval);
		return () => clearInterval(intervalId);
	}
</script>

<Dialog title="Add new clothing" bind:open >
	<DialogButton text="Try On Clothing" fullWidth={true}/>
</Dialog>
<Button text="open" onclick={() => open = true} />

<form method="post" enctype="multipart/form-data" action="?/select" use:enhance>
	<!-- <ImageUploadV2 placeholder="Click to upload image" name="image" /> -->
	<Select label="color" options={['red', 'blue', 'green']} />
	<Button text="Detect" type="submit" style="secondary"/>
</form>

{#if form?.success}
	<p>{form?.result}</p>
{/if}

{#if !form?.success}
	<p>{form?.error}</p>
{/if}
