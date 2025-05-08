<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		imageUrl?: string;
		button: Snippet;
	}

	let { imageUrl, button }: Props = $props();
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
				alt="generated try on"
				class="h-full w-full rounded-lg object-contain"
			/>
		{/if}
	</div>
	{@render button()}

</div>
