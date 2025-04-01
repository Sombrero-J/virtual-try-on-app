<script lang="ts">
	import { Select } from 'melt/builders';

	type Option = (typeof options)[number];

	const select = new Select<Option>({
		multiple: false,
		sameWidth: true,
		typeaheadTimeout: 500
	});

	interface Props {
		label: string;
		options: string[];
	}

	const { label, options }: Props = $props();
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
		{select.value ?? `Select a ${label}`}
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
		<div
			{...select.getOption(option)}
			class={[
				'cursor-pointer p-2',
				select.value === option && 'font-bold',
				select.highlighted === option && 'bg-gray-200'
			]}
		>
			{option}
		</div>
	{/each}
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
