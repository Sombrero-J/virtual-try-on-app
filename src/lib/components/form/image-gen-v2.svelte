<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		imageUrl?: string;
		button: Snippet;
	}

	let { imageUrl, button }: Props = $props();
</script>

<div class="flex w-full flex-col items-center justify-center gap-2">
	<div class="relative flex aspect-3/4 w-full max-w-[20rem] max-h-[25rem] items-center justify-center">
		{#if imageUrl}
			<img src={imageUrl} alt="Virtual Try On" class="h-full w-full rounded-md object-contain" />
		{/if}
	</div>
	{@render button()}
</div>
