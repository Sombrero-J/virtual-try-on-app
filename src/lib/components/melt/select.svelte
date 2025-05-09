<script lang="ts">
	import { Select } from 'melt/builders';
	import Tick from '$lib/svg/tick.svelte';
	import { onDestroy } from 'svelte';

	type Option = (typeof options)[number];

	interface Props {
		label: string;
		options?: string[];
		defaultValue?: string;
		changed?: boolean;
		required?: boolean;
	}

	let { label, options = [], defaultValue, changed = $bindable(false), required = false }: Props = $props();

	const select = new Select<Option>({
		value: defaultValue,
		multiple: () => false,
		sameWidth: true,
		typeaheadTimeout: 500
	});

	$effect(() => {
		if (select.value !== defaultValue) {
			changed = true;
		}
	});

	onDestroy(() => {
		changed = false;
	});

	const displayValue = $derived(select.value || `Select ${label}`);
</script>

<div class={['group justify-center, relative flex w-full flex-col items-start']}>
	<label
		for={select.ids.trigger}
		class="bg-white-primary group-focus-within:text-brand absolute -top-3 left-2.5 z-10 inline-block px-1 transition-colors duration-100 ease-in"
		>{label}</label
	>

	<button
		{...select.trigger}
		class="border-gray-subtler group-focus-within:border-brand relative flex min-h-[44px] w-full cursor-pointer items-center justify-between gap-2 rounded-md border px-3 py-2 transition-colors duration-100 ease-in"
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
	{#each options as option}
		{@const isSelected = select.value === option}

		<div
			{...select.getOption(option)}
			class={[
				'flex cursor-pointer justify-between p-2',
				select.value === option && 'bg-brand-secondary font-bold',
				select.highlighted === option && 'bg-brand-secondary'
			]}
		>
			{option}
			{#if isSelected}
				<Tick />
			{/if}
		</div>
	{/each}
</div>

<input type="hidden" name={label} value={select.value} {required}/>

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
