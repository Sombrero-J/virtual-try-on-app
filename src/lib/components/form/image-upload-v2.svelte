<script lang="ts">
	import Icons from '$lib/svg/icons.svelte';
	import { addToast } from '$lib/components/melt/toast.svelte';
	import BigUploadClothing from '$lib/svg/small/BigUploadClothing.svelte';
	import UploadClothing from '$lib/svg/small/uploadClothing.svelte';
	import Restart from '$lib/svg/small/restart.svelte';

	interface Props {
		placeholder?: string;
		name?: string;
		file?: File | null;
		required?: boolean;
	}

	let {
		placeholder = 'Default Placeholder',
		name = '',
		file = $bindable(),
		required = true
	}: Props = $props();

	function handleFileChange(event: any) {
		imageURl = URL.createObjectURL(event.target.files[0]);
		file = event.target.files[0]; // to pass the file to the parent, for saving purposes
		addToast({
			data: {
				type: 'success',
				title: 'Success',
				description: 'Image uploaded successfully!'
			}
		});
	}

	let imageURl = $derived.by(() => {
		if (file) {
			return URL.createObjectURL(file);
		}
		return null;
	});
</script>

<div
	class="border-brand bg-brand-secondary relative flex h-[20rem] w-full flex-col items-center justify-center gap-5 rounded-lg border-1 border-dashed text-center lg:h-[40rem]"
>
	{#if imageURl}
		<img src={imageURl} alt="A Full Body" class="h-full w-full rounded-lg object-contain" />
		<div
			class="bg-brand-secondary pointer-events-none p-1 absolute top-[10px] right-[10px] flex items-center justify-center gap-1"
		>
			<Restart />
			<p class="text-black-primary text-base font-medium">Replace</p>
		</div>
	{:else}
		<div class="lg:hidden">
			<UploadClothing />
		</div>
		<div class="hidden lg:block">
			<BigUploadClothing />
		</div>
		<p class=" text-brand text-sm font-medium lg:text-2xl">
			{placeholder}
		</p>
		<div class="flex flex-col gap-1">
			<p class="text-black-primary text-sm font-medium lg:text-2xl">JPG, PNG, WebP</p>
			<p class="text-black-tertiary text-xs font-medium lg:text-xl">Not more than 3MB</p>
		</div>
	{/if}
	<input
		{name}
		type="file"
		id="imageUpload"
		class="absolute h-full w-full cursor-pointer opacity-0"
		accept="image/*"
		{required}
		onchange={handleFileChange}
	/>
</div>
