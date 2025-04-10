<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		text?: string;
		onclick?: () => void;
		ariaLabel?: string;
		lefticon: Snippet;
	}

	let { text, onclick = () => {}, ariaLabel, lefticon }: Props = $props();
</script>

<button
	class="bg-brand-tertiary lg:bg-white-primary flex w-full cursor-pointer items-center justify-start gap-2 p-2 lg:p-3 whitespace-nowrap first:rounded-t-md last:rounded-b-md lg:text-2xl lg:hover:bg-brand-secondary"
	{onclick}
	aria-label={ariaLabel}
>
	{@render lefticon()}
	{text}
</button>