<script lang="ts">
	import '../app.css';
	import type { LayoutProps } from './$types';
	import { goto, onNavigate } from '$app/navigation';
	import ProfileHead from '$lib/svg/small/wardrobe/profileHead.svelte';
	import NavButton from '$lib/components/buttons/navButton.svelte';
	import Uploaded from '$lib/svg/small/wardrobe/uploaded.svelte';
	import Hangar from '$lib/svg/small/wardrobe/hangar.svelte';
	import Outfit from '$lib/svg/small/wardrobe/outfit.svelte';
	import { page } from '$app/state';
	import Toast, { addToast } from '$lib/components/melt/toast.svelte';
	import { innerWidth } from 'svelte/reactivity/window';
	import Profilepopover from '$lib/components/profile/profilepopover.svelte';
	import { onDestroy, onMount } from 'svelte';
	import { invalidate } from '$app/navigation';
	import Back from '$lib/components/buttons/back.svelte';
	import Trashcan from '$lib/svg/small/profile/trashcan.svelte';
	import { deleteState, toggleDelete } from '$lib/state/deletestate.svelte';
	import Navbar from '$lib/components/nav/navbar.svelte';
	import type { RealtimeChannel } from '@supabase/supabase-js';

	let { data, children }: LayoutProps = $props();
	let { session, supabase, user } = $derived(data);

	let selectedTab = $state<'Outfits' | 'All items' | 'Wardrobe'>(page.data.title);
	let specialPath = ['/outfits/desktop-custom-outfit', '/outfits/create-ai', '/profile'];
	let isSpecialPath = $derived(
		// Check if any element in specialPath meets the condition
		specialPath.some((prefix) => page.url.pathname.startsWith(prefix))
	);

	let isVtoPath = $derived(page.url.pathname.startsWith('/vto') || page.url.pathname === '/');

	let isMobile = $derived((innerWidth.current && innerWidth.current < 1024) || false);

	onMount(() => {
		const { data } = supabase.auth.onAuthStateChange((_, newSession) => {
			if (newSession?.expires_at !== session?.expires_at) {
				invalidate('supabase:auth');
			}
		});

		return () => data.subscription.unsubscribe();
	});

	onNavigate(() => {
		if (deleteState.isDelete) {
			console.log('turning off delete mode');
			toggleDelete(); // this ensures selectedItems is cleared
			console.log('deleteState', deleteState.isDelete);
		}
	});

	let tryOnChannel: RealtimeChannel | null = null;

	onMount(() => {
		if (supabase && user) {
			const userId = user.id;
			console.log(`Setting up Realtime listener for user ${userId} on try_on_sessions...`);

			const channelName = `try_on_updates_user_${userId}`;

			tryOnChannel = supabase
				.channel(channelName)
				.on(
					'postgres_changes',
					{
						event: 'UPDATE',
						schema: 'public',
						table: 'try_on_sessions',
						// Filter: Only listen to updates for THIS user
						filter: `user_id=eq.${userId}`
					},
					(payload) => {
						console.log('Realtime UPDATE received:', payload);

						// The updated row data is in payload.new
						const updatedSession = payload.new as {
							id: number;
							status: string;
							user_id: string;
							clothings_id: number;
						};

						if (updatedSession && updatedSession.status === 'done') {
							addToast({
								data: {
									type: 'success',
									title: 'Try on completed',
									description: `Your try on result is ready for clothing ${updatedSession.clothings_id}`
								}
							});
						}
					}
				)
				.subscribe((status, err) => {
					// handle subscription status changes or errors
					if (status === 'SUBSCRIBED') {
						console.log(`Realtime channel subscribed successfully!`);
					} else if (status === 'CHANNEL_ERROR') {
						console.error(`Realtime channel error:`, err);
					} else if (status === 'TIMED_OUT') {
						console.warn(`Realtime channel timeout.`);
					} else {
						console.log(`Realtime channel status: ${status}`);
					}
				});

			console.log(`Realtime channel setup initiated.`);
		} else {
			console.log(
				'User not logged in or Supabase client not available, skipping Realtime subscription.'
			);
		}

		// Unsubscribe when the component is destroyed
		return () => {
			if (tryOnChannel) {
				console.log(`Removing Realtime channel...`);
				supabase
					?.removeChannel(tryOnChannel)
					.catch((err) => console.error('Error removing channel:', err)); // Add catch for safety
				tryOnChannel = null; // Clear reference
			}
		};
	});
</script>

<Toast />
{#if isMobile}
	<main class="flex h-svh max-h-svh w-svw flex-col justify-between">
		<!-- <header class="bg-white-primary flex w-full items-center justify-center p-4"> -->
		{#if !isVtoPath}
			<header class="bg-white-primary grid w-full grid-cols-[auto_1fr_auto] items-center p-4">
				<!-- <div class="absolute left-3"> -->
				<div class="flex min-w-6">
					{#if isSpecialPath}
						<Back onclick={() => goto(page.data.backPath)} />
					{:else}
						<button class="cursor-pointer" onclick={() => goto('/profile')}>
							<ProfileHead />
						</button>
					{/if}
				</div>
				<h1 class="text-center">{page.data.title || page.url.pathname}</h1>
				<div class="flex min-w-6">
					{#if page.url.pathname === '/profile/my-photos'}
						<button
							class="cursor-pointer"
							onclick={() => {
								toggleDelete();
							}}
							><Trashcan />
						</button>
					{/if}
				</div>
			</header>
		{:else}
			<Navbar {user} />
		{/if}

		<div class="flex-1 overflow-hidden">
			{@render children()}
		</div>

		{#if !isSpecialPath}
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
		{/if}
	</main>
{:else}
	<header class="flex h-svh max-h-svh w-svw flex-col justify-between">
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
	</header>
{/if}
