<script lang="ts">
	import { onMount, type Snippet } from 'svelte';
	import { innerHeight } from 'svelte/reactivity/window';
	import FilterButton from '$lib/components/wardrobe/filterButton.svelte';

	let containerHeight = $state(0);
	let bottom = $state(-10000);
	let startY = $state(0);
	let startBottom = $state(0);
	let isDragging = $state(false);
	let draggable = $state<HTMLDivElement | null>(null);

	let windowHeight = innerHeight.current || 800;

	let minBottom = $derived.by(() => -containerHeight + 150);
	let maxBottom = 0;

	onMount(() => {
		if (draggable) {
			containerHeight = draggable.offsetHeight;
			bottom = -containerHeight + 200; // Start position
		}
	});

	function handleMouseDown(e: MouseEvent | TouchEvent) {
		isDragging = true;
		startY = 'touches' in e ? e.touches[0].clientY : e.clientY;
		startBottom = bottom;
		// startY = e.touches?.[0]?.clientY || e.clientY;
	}

	function handlePointerMove(e: MouseEvent | TouchEvent) {
		if (!isDragging || !draggable || !windowHeight) return;

		let clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
		let deltaY = startY - clientY;
		let newBottom = startBottom + deltaY;

		bottom = Math.max(minBottom, Math.min(maxBottom, newBottom));
	}

	function handlePointerUp() {
		isDragging = false;
	}

	interface Props {
		children: Snippet;
		filterArray: string[];
	}

	let { children, filterArray }: Props = $props();
</script>

<svelte:window
	onmouseup={handlePointerUp}
	ontouchend={handlePointerUp}
	ontouchmove={handlePointerMove}
	onmousemove={handlePointerMove}
/>

<div
	bind:this={draggable}
	class="bg-white-primary absolute left-0 flex flex-col max-h-9/10 max-w-svw items-center justify-start overflow-hidden rounded-t-3xl px-4 py-2"
	style="bottom: {bottom}px ;"
>
	<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
	<div
		class="flex max-h-full w-full flex-col items-center justify-start gap-2 overflow-hidden text-center"
	>
		<div
			role="dialog"
			aria-label="Uploaded Items Bottom Sheet"
			class="flex w-full flex-shrink-0 cursor-move flex-col items-center justify-start gap-2"
			onmousedown={handleMouseDown}
			ontouchstart={handleMouseDown}
		>
			<div class="bg-gray-subtlest h-[2px] w-1/10 rounded-full"></div>
			<h2 class="text-base font-semibold">Uploaded Items</h2>
		</div>
		<div
			class="flex max-w-[100vw] flex-shrink-0 items-center justify-start gap-2 overflow-x-auto px-5"
		>
			{#each filterArray as filter}
				<FilterButton {filter} />
			{/each}
		</div>
		<div class="overflow-y-auto">
			{@render children()}
		</div>
	</div>
</div>
