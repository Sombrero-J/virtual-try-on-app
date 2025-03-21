<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		text?: string;
		type?: 'button' | 'submit' | 'reset';
		style?: 'primary' | 'secondary';
		loading?: boolean;
		size?: 'small' | 'large';
		disabled?: boolean;
		onclick?: () => void;
		ariaLabel?: string;
		fullWidth?: boolean;
		lefticon?: any;
		righticon?: any;
		twClass?: string;
		children?: Snippet;
	}

	let {
		text,
		type = 'submit',
		style = 'primary',
		loading = false,
		size = 'large',
		disabled = false,
		onclick = () => {},
		ariaLabel,
		fullWidth = false,
		lefticon,
		righticon,
		twClass,
		children
	}: Props = $props();

	const baseClasses = 'flex justify-center items-center whitespace-nowrap rounded-md border-0';

	// variantClasses is reactive to "disabled"
	let variantClasses = $derived(() => {
		if (loading) {
			return 'text-gray-disabled bg-brand-gradient-button bg-left cursor-not-allowed';
		} else if (style === 'primary') {
			return disabled
				? 'text-gray-disabled bg-brand-gradient-button-disabled cursor-not-allowed'
				: 'text-white-primary bg-brand-gradient-button bg-right duration-300 ease-in hover:bg-left hover:active:bg-brand hover:active:brand cursor-pointer';
		} else if (style === 'secondary') {
			return disabled
				? 'text-gray-subtler cursor-not-allowed'
				: 'text-black-primary border-1 border-brand bg-white-primary relative duration-300 hover:text-white-primary hover:bg-brand cursor-pointer';
		}
		return '';
	});

	const sizeClasses =
		size === 'large'
			? 'min-h-[44px] py-[0.5em] px-[1.5em] text-base'
			: size === 'small'
				? 'py-[0.25em] px-[0.5em] text-sm'
				: '';

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

<button class={computedClasses} {type} {onclick} aria-label={ariaLabel} {disabled}>
	{#if loading}
		{@render loadingIcons()}
	{:else}
		{@render lefticon?.()}
		{text}
		{@render children?.()}
		{@render righticon?.()}
	{/if}
</button>
