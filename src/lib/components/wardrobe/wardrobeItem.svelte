<script lang="ts" module>
	import { deleteState, selectedDeleteItems } from '$lib/state/deletestate.svelte';

	function toggle(id: number) {
		selectedDeleteItems.has(id) ? selectedDeleteItems.delete(id) : selectedDeleteItems.add(id);
	}
</script>

<script lang="ts">
	interface Props {
		onclick?: () => void;
		src: string | null;
		alt: string;
		selected?: boolean;
		id: number;
		type?: 'button' | 'submit' | 'reset';
	}

	let { onclick, src, alt, selected = false, id, type = 'button' }: Props = $props();
</script>

{#if deleteState.isDelete}
	<div
		class="bg-white-primary border-border-gray aspect-ratio-3/4 relative flex max-w-[18rem] items-center justify-center overflow-hidden rounded-lg border-1 {selected
			? 'border-brand border-2 shadow-md'
			: ''}"
	>
		<img {src} {alt} class="h-full w-full object-cover object-center" />
		<div class="absolute top-2 right-2">
			<input
				class="bg-brand-secondary border-border-gray size-5 cursor-pointer rounded border-1 shadow-sm"
				type="checkbox"
				name="deleteID"
				id=""
				onchange={() => toggle(id)}
			/>
		</div>
	</div>
{:else}
	<button
		class="bg-white-primary border-border-gray aspect-ratio-3/4 flex max-w-[18rem] cursor-pointer items-center justify-center overflow-hidden rounded-lg border-1 hover:shadow-md {selected
			? 'border-brand border-2 shadow-md'
			: ''}"
		{type}
		{onclick}
	>
		<img {src} {alt} class="h-full w-full object-cover object-center" />
	</button>
{/if}
