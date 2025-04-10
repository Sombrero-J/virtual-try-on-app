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
	class="bg-brand-secondary flex aspect-square cursor-pointer items-center justify-center overflow-hidden rounded-lg shadow-md {selected
		? 'ring-brand ring-2 shadow-md'
		: ''}"
	{onclick}
>
	<img {src} {alt} class="h-full w-full object-contain" />
</button>
