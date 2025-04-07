<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		text?: string;
		loading?: boolean;
		disabled?: boolean;
		onclick?: () => void;
		ariaLabel?: string;
		fullWidth?: boolean;
		twClass?: string;
		children?: Snippet;
	}

	let {
		text,
		loading = false,
		disabled = false,
		onclick = () => {},
		ariaLabel,
		fullWidth = false,
		twClass,
		children
	}: Props = $props();

	const baseClasses =
		'relative flex justify-center items-center whitespace-nowrap rounded-md border-0';

	// variantClasses is reactive to "disabled"
	let variantClasses = $derived(() => {
		if (loading) {
			return 'text-gray-disabled bg-brand-gradient-button bg-left cursor-not-allowed';
		} else {
			return disabled
				? 'text-gray-disabled bg-brand-gradient-button-disabled cursor-not-allowed'
				: 'text-black-primary bg-brand-secondary cursor-pointer focus:outline-1 focus:outline-offset-1 focus:outline-brand';
		}
	});

	const sizeClasses = 'min-h-[44px] py-[0.5em] px-[1.5em] text-base';

	const computedClasses = $derived([
		baseClasses,
		fullWidth && 'w-full',
		// variantClasses is a derived function
		variantClasses(),
		sizeClasses,
		twClass
	]);
</script>

{#snippet loadingIcons()}
	<div class="flex items-center justify-center gap-2">
		<div class="animate-colorWave h-2 w-2 [animation-delay:0s]"></div>
		<div class="animate-colorWave h-2 w-2 [animation-delay:0.4s]"></div>
		<div class="animate-colorWave h-2 w-2 [animation-delay:0.8s]"></div>
	</div>
{/snippet}

<button class={computedClasses} {onclick} aria-label={ariaLabel} {disabled}>
	{#if loading}
		{@render loadingIcons()}
	{:else}
		{text} {@render children?.()}
	{/if}
</button>
