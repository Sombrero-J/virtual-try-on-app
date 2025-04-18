<script lang="ts">
	import '../../app.css';
	import type { LayoutProps } from '../$types';
	import { goto } from '$app/navigation';
	import ProfileHead from '$lib/svg/small/wardrobe/profileHead.svelte';
	import NavButton from '$lib/components/buttons/navButton.svelte';
	import Uploaded from '$lib/svg/small/wardrobe/uploaded.svelte';
	import Hangar from '$lib/svg/small/wardrobe/hangar.svelte';
	import Outfit from '$lib/svg/small/wardrobe/outfit.svelte';
	import { page } from '$app/state';
	import Toast from '$lib/components/melt/toast.svelte';
	import { innerWidth } from 'svelte/reactivity/window';
	import Profilepopover from '$lib/components/profile/profilepopover.svelte';

	let { data, children }: LayoutProps = $props();

	let user = data.user;

	let selectedTab = $state<'Outfits' | 'All items' | 'Wardrobe'>(page.data.title);

	let isMobile = $derived((innerWidth.current && innerWidth.current < 1024) || false);
</script>

<Toast />
{#if isMobile}
	<div class="flex h-svh max-h-svh w-svw flex-col justify-between">
		<div class="bg-white-primary flex w-full items-center justify-center px-4 py-4">
			<button class="absolute left-3 cursor-pointer" onclick={() => goto('/by/profile')}>
				<ProfileHead />
			</button>
			<h1>{page.data.title}</h1>
		</div>

		<div class="flex-1 overflow-hidden">
			{@render children()}
		</div>

		<div class="bg-brand-secondary flex w-full justify-between gap-1 px-8 py-3">
			<NavButton
				selected={selectedTab}
				text="Outfits"
				href="/outfits"
				onclick={() => (selectedTab = 'Outfits')}
			>
				{#snippet icon()}
					<Outfit selected={selectedTab === 'Outfits'} />
				{/snippet}
			</NavButton>
			<NavButton
				selected={selectedTab}
				text="All items"
				href="/home"
				onclick={() => (selectedTab = 'All items')}
			>
				{#snippet icon()}
					<Uploaded selected={selectedTab === 'All items'} />
				{/snippet}
			</NavButton>
			<NavButton
				selected={selectedTab}
				text="Wardrobe"
				href="/wardrobe"
				onclick={() => (selectedTab = 'Wardrobe')}
			>
				{#snippet icon()}
					<Hangar selected={selectedTab === 'Wardrobe'} />
				{/snippet}
			</NavButton>
		</div>
	</div>
{:else}
	<div class="flex h-svh max-h-svh w-svw flex-col justify-between">
		<div
			class="bg-brand-secondary flex h-[5rem] w-full items-center justify-center gap-8 px-4 py-4"
		>
			<NavButton
				selected={selectedTab}
				text="All items"
				href="/home"
				onclick={() => (selectedTab = 'All items')}
			>
				{#snippet icon()}
					<Uploaded selected={selectedTab === 'All items'} />
				{/snippet}
			</NavButton>
			<NavButton
				selected={selectedTab}
				text="Wardrobe"
				href="/wardrobe"
				onclick={() => (selectedTab = 'Wardrobe')}
			>
				{#snippet icon()}
					<Hangar selected={selectedTab === 'Wardrobe'} />
				{/snippet}
			</NavButton>
			<NavButton
				selected={selectedTab}
				text="Outfits"
				href="/outfits"
				onclick={() => (selectedTab = 'Outfits')}
			>
				{#snippet icon()}
					<Outfit selected={selectedTab === 'Outfits'} />
				{/snippet}
			</NavButton>
			<Profilepopover {user} />
		</div>

		<div class="flex-1 overflow-hidden">
			{@render children()}
		</div>
	</div>
{/if}
