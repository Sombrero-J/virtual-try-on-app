<script lang="ts">
	import Progress from '$lib/components/melt/progress.svelte';
	import { onDestroy } from 'svelte';
	interface Props {
		imageFileOrUrl?: File | string | null;
		progress?: number;
	}

	let { imageFileOrUrl = null, progress = 10 }: Props = $props();

	let imageUrl = $derived.by(() => {
		if (imageFileOrUrl instanceof File) {
			return URL.createObjectURL(imageFileOrUrl);
		} else if (typeof imageFileOrUrl === 'string') {
			return imageFileOrUrl;
		}
		return null;
	});

	onDestroy(() => {
		if (imageUrl) {
			URL.revokeObjectURL(imageUrl);
		}
	});
</script>

<div
	class="mx-auto my-auto flex w-full flex-col items-center justify-center gap-8 lg:max-w-[30rem]"
>
	<div
		class="border-brand-purple bg-brand-blue relative flex h-[23rem] w-full flex-col items-center justify-center overflow-hidden rounded-lg border-1 lg:h-[30rem]"
	>
		{#if imageUrl}
			<img
				src={imageUrl}
				alt="model uploaded by user"
				class="h-full w-full rounded-lg object-contain"
			/>
		{/if}
		<div class="bg-glass animate-scan absolute left-0 h-full w-full">
			<div class="bg-brand-gradient absolute -bottom-2 left-0 h-[0.5rem] w-full"></div>
		</div>
	</div>

	<Progress value={progress} />
	<p class="text-2xl font-medium">Generating...</p>
</div>
