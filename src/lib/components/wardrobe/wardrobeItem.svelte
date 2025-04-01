<script lang="ts">
	import { fade } from 'svelte/transition';

	interface Props {
		onclick?: () => void;
		src: string | null;
		alt: string;
		selected?: boolean;
		transitionIndex?: number;
	}

	let { onclick, src, alt, selected = false, transitionIndex }: Props = $props();
</script>

<button
	class="bg-brand-secondary flex aspect-square cursor-pointer items-center justify-center overflow-hidden rounded-lg {selected
		? 'border-black-primary border-1'
		: ''}"
	{onclick}
	transition:fade={{ duration: 1000, delay: 300 * (transitionIndex || 1) }}
>
	<img {src} {alt} class="h-full w-full object-cover" />
</button>
