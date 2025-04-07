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
	class="bg-brand-tertiary flex w-full items-center justify-start gap-2 p-2 whitespace-nowrap first:rounded-t-md last:rounded-b-md cursor-pointer"
	{onclick}
	aria-label={ariaLabel}
>
	{@render lefticon()}
	{text}
</button>
