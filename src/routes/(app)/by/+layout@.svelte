<script lang="ts">
	import type { LayoutProps } from '../$types';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import Back from '$lib/components/buttons/back.svelte';
	let { data, children }: LayoutProps = $props();

	let selectedTab = $state<'Outfits' | 'All items' | 'Wardrobe'>(page.data.title);
</script>

<div class="flex h-svh max-h-svh w-svw flex-col justify-between">
	<div class="bg-white-primary flex w-full items-center justify-center px-4 py-4">
		<div class="absolute left-3">
			<Back onclick={() => goto(page.data.backPath)} />
		</div>
		<h1>{page.data.title}</h1>
	</div>

	<div class="flex-1 overflow-hidden">
		{@render children()}
	</div>
</div>
