<script module>
	let selectedFilter = $state('All');
</script>

<script lang="ts">
	import { filterStore } from '$lib/state/appstate.svelte';

	interface Props {
		filter?: string;
		onclick?: () => void;
		ariaLabel?: string;
	}

	let { filter = 'Default Filter', onclick = () => {}, ariaLabel = '' }: Props = $props();

	const filterInstance = filterStore();

	function handleClick() {
		filterInstance.filterCategory = filter;
		onclick();
	}
</script>

<button
	class={[
		' border-brand flex flex-shrink-0 cursor-pointer items-center justify-center rounded-2xl border-1 px-6 py-1.5 text-base whitespace-nowrap',
		filterInstance.filterCategory === filter
			? 'bg-brand-gradient text-white'
			: 'text-black-primary bg-transparent'
	]}
	onclick={handleClick}
	aria-label={ariaLabel}
>
	{filter}
</button>
