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
	import { isRedirect, text } from '@sveltejs/kit';
	import DialogButton from '$lib/components/buttons/dialogButton.svelte';
	import ImageButton from '$lib/components/form/imageButton.svelte';
	import upperimg from '$lib/assets/categories/upper.png?enhanced';
	import Multiselect from '$lib/components/melt/multiselect.svelte';
	import { materials } from '$lib/state/appstate.svelte';
	import { Tween } from 'svelte/motion';
	import { linear } from 'svelte/easing';
	import { onMount } from 'svelte';
	import { compressAndPreview } from '$lib/clientUtil/image';

	let { form }: PageProps = $props();
	let open = $state(false);
	let progress = new Tween(0, {
		duration: 5000,
		easing: linear,
		delay: 2000
	});
	let openDialog = $state(true);

	let originalPreviewUrl = $state('');
	let compressedUrl = $state('');
	let compressedFileNow = $state<File | null>(null);
	async function handleFileSelect(event: Event) {
		const target = event.target as HTMLInputElement;
		const selectedFile = target.files?.[0];

		if (!selectedFile) {
			return;
		}

		if (!selectedFile.type.startsWith('image/')) {
			console.log('wrong file');
			target.value = ''; // Reset file input
			return;
		}

		originalPreviewUrl = URL.createObjectURL(selectedFile);

		// Start compression
		const { compressedFile, compressedPreviewUrl } = await compressAndPreview(selectedFile);

		compressedFileNow = compressedFile;
		compressedUrl = compressedPreviewUrl;

		console.log('Received: ', compressedFile, 'and', compressedPreviewUrl);
	}

	onMount(() => {
		progress.target = 70;
	});
</script>

<form method="post" enctype="multipart/form-data" action="?/multiselect" use:enhance>
	<Multiselect label="Test" options={materials} />
	<Button text="Submit" type="submit" style="secondary" />
</form>

{#if form?.success}
	<p>{form?.result}</p>
{/if}

{#if !form?.success}
	<p>{form?.error}</p>
{/if}

<input
	type="file"
	name="file"
	id="file"
	onchange={handleFileSelect}
	accept="image/png, image/jpeg, image/webp, image/gif"
/>

<form
	action="?/uploadImage"
	method="post"
	use:enhance={({ formData, cancel }) => {
		if (!compressedFileNow) {
			cancel();
			return;
		}
		formData.append('compressedimage', compressedFileNow);
	}}
	enctype="multipart/form-data"
>
	<Button text="Upload" type="submit" />
</form>

{#if originalPreviewUrl}
	<img class="max-w-[20rem]" src={originalPreviewUrl} alt="" />
{/if}
{#if compressedUrl}
	<img class="max-w-[20rem]" src={compressedUrl} alt="" />
{/if}
