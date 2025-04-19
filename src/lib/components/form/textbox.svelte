<script lang="ts">
	import Label from '$lib/components/label.svelte';
	import type { Snippet } from 'svelte';

	interface Props {
		placeholder?: string | null;
		label?: string;
		fullWidth?: boolean;
		type?: 'text' | 'password' | 'email' | 'textbox';
		disabled?: boolean;
		name: string;
		required?: boolean;
		value?: string;
		iconleft?: Snippet;
		iconright?: Snippet;
		showPassword?: Snippet;
		changed?: boolean;
	}

	let {
		placeholder = 'Default Placeholder',
		label = '',
		fullWidth = true,
		type = 'text',
		disabled = false,
		name,
		required = true,
		value = $bindable(''),
		iconleft,
		iconright,
		showPassword,
		changed = $bindable(false)
	}: Props = $props();

	let originalValue = value;

	function compareOriginalValue(currentValue: string) {
		changed = currentValue !== originalValue;
	}

	function oninput(event: Event) {
		const target = event.target as HTMLInputElement | HTMLTextAreaElement;
		compareOriginalValue(target.value);
	}
</script>

<div class={['group flex flex-col items-start justify-center', fullWidth && 'w-full']}>
	{#if label}
		<Label target="this" {label} />
	{/if}
	<!-- Input wrapper: Converted from .input-icon -->
	<div
		class="border-gray-subtler group-focus-within:border-brand relative flex min-h-[44px] w-full items-center justify-center gap-2 rounded-md border px-3 py-2"
	>
		{@render iconleft?.()}
		{#if type === 'password'}
			<input
				type="password"
				id="this"
				bind:value
				{name}
				{placeholder}
				{disabled}
				{required}
				class="w-full border-0 bg-transparent focus:outline-none"
				{oninput}
			/>
		{:else if type === 'email'}
			<input
				type="email"
				id="this"
				bind:value
				{name}
				{placeholder}
				{disabled}
				{required}
				class="w-full border-0 bg-transparent focus:outline-none"
				{oninput}
			/>
		{:else if type === 'textbox'}
			<textarea
				id="this"
				bind:value
				{name}
				class="min-h-[8rem] w-full resize-none border-0 focus:outline-none"
				{oninput}
			></textarea>
		{:else}
			<input
				type="text"
				id="this"
				bind:value
				{name}
				{placeholder}
				{disabled}
				{required}
				class="w-full border-0 bg-transparent focus:outline-none"
				{oninput}
			/>
		{/if}
		{@render iconright?.()}
		{#if value && showPassword}
			{@render showPassword?.()}
		{/if}
	</div>
</div>
