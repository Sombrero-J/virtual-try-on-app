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
	class="bg-brand-tertiary flex w-full items-center justify-start p-2 gap-2 rounded-md whitespace-nowrap"
	{onclick}
	aria-label={ariaLabel}
>
	{@render lefticon()}
	{text}
</button>
