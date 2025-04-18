<script lang="ts">
	import Progress from '$lib/components/melt/progress.svelte';
	interface Props {
		imageFile?: File | null;
		imageUrl?: string | null;
		progress?: number;
	}

	let { imageFile = null, progress = 10, imageUrl = null }: Props = $props();

	$effect(() => {
		if (imageFile) {
			imageUrl = URL.createObjectURL(imageFile);
		}
	});
</script>

<div class="flex w-full flex-col items-center justify-center gap-8 lg:max-w-[30rem] my-auto mx-auto">
	<div
		class="border-brand-purple bg-brand-blue relative flex h-[23rem] w-full flex-col items-center justify-center overflow-hidden rounded-lg border-1 lg:h-[40rem]"
	>
		<img
			src={imageUrl}
			alt="model uploaded by user"
			class="h-full w-full rounded-lg object-contain"
		/>
		<div class="bg-glass animate-scan absolute left-0 h-full w-full">
			<div class="bg-brand-gradient absolute -bottom-2 left-0 h-[0.5rem] w-full"></div>
		</div>
	</div>

	<Progress value={progress} />
	<p class="text-2xl font-medium">Generating...</p>
</div>
