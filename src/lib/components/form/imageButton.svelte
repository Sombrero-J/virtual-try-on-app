<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		text?: string;
		type?: 'button' | 'submit' | 'reset';
		onclick?: () => void;
		ariaLabel?: string;
		pic?: Snippet;
		src: any;
		alt: string;
	}

	let {
		text = 'Default Text',
		type = 'button',
		onclick = () => {},
		ariaLabel = '',
		src,
		alt
	}: Props = $props();
</script>

<button
	{type}
	{onclick}
	aria-label={ariaLabel}
	class="bg-brand-secondary focus:ring-brand flex w-full cursor-pointer items-center justify-start gap-5 rounded-2xl p-4 focus:ring-1 lg:max-w-50 lg:flex-col lg:gap-0 lg:p-0"
>
	<!-- <div>
		{@render pic?.()}
	</div> -->
	<enhanced:img {src} {alt} class="h-30 w-auto object-cover lg:h-auto lg:w-full"/>
	<p class="text-black-primary py-1 text-2xl font-medium lg:px-5">
		{text}
	</p>
</button>
