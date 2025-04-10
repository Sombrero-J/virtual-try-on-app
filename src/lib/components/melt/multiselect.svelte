<script lang="ts">
	import { Select } from 'melt/builders';
	import { fashionColorsWithHex } from '$lib/state/appstate.svelte';
	import Tick from '$lib/svg/tick.svelte';

	type Option = (typeof options)[number];

	interface Props {
		label: string;
		options?: string[];
		color?: boolean;
	}

	const optionNames = $derived(fashionColorsWithHex.map((c) => c.name));
	// for efficient hex lookup by name
	const colorMap = $derived(new Map(fashionColorsWithHex.map((c) => [c.name, c.hex])));

	const { label, options = [], color = false }: Props = $props();

	const select = new Select<Option, true>({
		multiple: () => true,
		sameWidth: true,
		typeaheadTimeout: 500
	});

	function isWhite(hex: string | undefined): boolean {
		return typeof hex === 'string' && hex.toUpperCase() === '#FFFFFF';
	}

	const displayValue = $derived(
		select.value.size > 0 ? [...select.value].join(', ') : `Select ${label} (multiple)`
	);
</script>

<div class={['group justify-center, relative flex w-full flex-col items-start']}>
	<label
		for={select.ids.trigger}
		class="bg-white-primary group-focus-within:text-brand absolute -top-3 left-2.5 z-10 inline-block px-1 transition-colors duration-100 ease-in"
		>{label}</label
	>

	<button
		{...select.trigger}
		class="border-gray-subtler group-focus-within:border-brand relative flex min-h-[44px] w-full cursor-pointer items-center justify-between gap-2 rounded-md border px-3 py-2 transition-colors duration-100 ease-in lg:max-w-[20rem]"
	>
		{displayValue}
		<svg xmlns="http://www.w3.org/2000/svg" width="18" height="10" viewBox="0 0 18 10" fill="none">
			<path
				d="M0.514648 1.46495L8.99965 9.94995L17.4846 1.46495L16.0706 0.0499516L8.99965 7.12195L1.92865 0.0499516L0.514648 1.46495Z"
				fill="#8F9294"
			/>
		</svg>
	</button>
</div>

<div
	{...select.content}
	class="divide-border-gray border-border-gray bg-white-primary flex max-h-40 flex-col divide-y-1 overflow-y-auto rounded-md border-1 shadow-md"
>
	{#if color}
		{#each optionNames as optionName (optionName)}
			{@const hexCode = colorMap.get(optionName)}
			{@const isSelected = select.value.has(optionName)}
			<div
				{...select.getOption(optionName)}
				class="flex cursor-pointer items-center justify-between gap-2 p-2 transition-colors duration-100 outline-none"
				class:bg-gray-100={select.highlighted === optionName}
				class:bg-brand-secondary={select.value.has(optionName)}
				class:font-semibold={select.value.has(optionName)}
			>
				<!-- Color Swatch -->
				<div class="flex justify-center items-center gap-1">
					{#if hexCode}
						<span
							class="block h-4 w-4 flex-shrink-0 rounded-full"
							class:border={isWhite(hexCode)}
							class:border-gray-400={isWhite(hexCode)}
							style="background-color: {hexCode};"
						></span>
					{/if}

					<!-- Color Name -->
					<span>{optionName}</span>
				</div>
				{#if isSelected}
					<Tick />
				{/if}
			</div>
		{/each}
	{:else}
		{#each options as option}
			{@const isSelected = select.value.has(option)}

			<div
				{...select.getOption(option)}
				class={[
					'flex cursor-pointer justify-between p-2',
					select.value.has(option) && 'font-bold bg-brand-secondary',
					select.highlighted === option && 'bg-brand-secondary'
				]}
			>
				{option}
				{#if isSelected}
					<Tick />
				{/if}
			</div>
		{/each}
	{/if}
</div>

<input type="hidden" name={label} value={select.value} />

<style>
	[data-melt-select-content] {
		position: absolute;
		pointer-events: none;
		opacity: 0;

		transform: scale(0.975);

		transition: 0.2s;
		transition-property: opacity, transform;
		transform-origin: var(--melt-popover-content-transform-origin, center);
	}

	[data-melt-select-content][data-open] {
		pointer-events: auto;
		opacity: 1;

		transform: scale(1);
	}
</style>
