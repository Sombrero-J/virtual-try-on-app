<script lang="ts">
	import { RadioGroup } from 'melt/builders';

	interface Props {
		items: string[];
		label: string;
		name: string;
		required?: boolean;
	}
	let { items, label, name, required = false }: Props = $props();

	const group = new RadioGroup({
		required: () => required,
		name: () => name
	});

	const baseClasses =
		'flex justify-center items-center whitespace-nowrap rounded-full border-0 min-h-[44px] py-[0.5em] px-[1.5em] text-base';

	const checked =
		'text-white-primary border-1 border-border-gray bg-brand-gradient-button bg-right';

	const unchecked =
		'text-black-primary border-1 border-border-gray bg-white-primary relative duration-300 hover:bg-border-gray cursor-pointer';
</script>

<div {...group.root} class="flex flex-col items-start justify-center gap-1">
	<!-- svelte-ignore a11y_label_has_associated_control -- https://github.com/sveltejs/svelte/issues/15067 -->
	<label {...group.label} class="text-black-primary text-base font-medium">{label}</label>
	<div class="flex flex-wrap gap-2">
		{#each items as i}
			{@const item = group.getItem(i)}
			{#if item.checked}
				<div class={`${baseClasses} ${checked}`} {...item.attrs}>
					{i}
				</div>
			{:else}
				<div {...item.attrs} class={`${baseClasses} ${unchecked}`}>
					{i}
				</div>
			{/if}
		{/each}
	</div>
	<input {...group.hiddenInput} />
</div>
