<script lang="ts">
	import Toast, { addToast } from '$lib/components/melt/toast.svelte';
	import Label from '$lib/components/label.svelte';
	import Button from '$lib/components/buttons/button.svelte';
	import ImageUploadV2 from '$lib/components/form/image-upload-v2.svelte';
	import type { PageProps } from './$types';
	import { enhance } from '$app/forms';
	import Progress from '$lib/components/melt/progress.svelte';
	import Select from '$lib/components/melt/multiselect.svelte';
	import Dialog from '$lib/components/dialog/dialog.svelte';
	import { text } from '@sveltejs/kit';
	import DialogButton from '$lib/components/buttons/dialogButton.svelte';
	import ImageButton from '$lib/components/form/imageButton.svelte';
	import upperimg from '$lib/assets/categories/upper.png?enhanced';
	import Multiselect from '$lib/components/melt/multiselect.svelte';
	import { materials } from '$lib/state/appstate.svelte';

	let { form }: PageProps = $props();
	let open = $state(false);
	let progress = $state(0);
	let openDialog = $state(true);

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

<form method="post" enctype="multipart/form-data" action="?/multiselect" use:enhance>
	<Multiselect label="Test" options={materials}/>
	<Button text="Submit" type="submit" style="secondary" />
</form>

{#if form?.success}
	<p>{form?.result}</p>
{/if}

{#if !form?.success}
	<p>{form?.error}</p>
{/if}
