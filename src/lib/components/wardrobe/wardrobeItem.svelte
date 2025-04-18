<script lang="ts">
	import { fade } from 'svelte/transition';

	interface Props {
		onclick?: () => void;
		src: string | null;
		alt: string;
		selected?: boolean;
		transitionIndex?: number;
		type?: 'button' | 'submit' | 'reset';
	}

	let { onclick, src, alt, selected = false, transitionIndex, type = 'button' }: Props = $props();
</script>

<button
	class="bg-brand-secondary flex aspect-square cursor-pointer items-center justify-center overflow-hidden rounded-lg shadow-md {selected
		? 'border-brand border-2 shadow-md'
		: ''}"
	{type}
	{onclick}
>
	<img {src} {alt} class="h-full w-full object-contain" />
</button>
