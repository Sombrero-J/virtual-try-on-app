<script lang="ts">
	import '../../app.css';
	import type { Snippet } from 'svelte';
	import Navbar from '$lib/components/nav/navbar.svelte';
	import { invalidate } from '$app/navigation';
	import { onMount } from 'svelte';
	import type { LayoutData } from './$types';
	import Toast from '$lib/components/melt/toast.svelte';
	interface Props {
		data: LayoutData;
		children?: Snippet;
	}

	let { data, children }: Props = $props();
	let { session, supabase, user } = $derived(data);

	onMount(() => {
		const { data } = supabase.auth.onAuthStateChange((_, newSession) => {
			if (newSession?.expires_at !== session?.expires_at) {
				invalidate('supabase:auth');
			}
		});

		return () => data.subscription.unsubscribe();
	});
</script>

<div class="flex min-h-screen w-full flex-col">
	<main class="bg-white-primary flex w-full flex-1 flex-col items-center justify-center">
		<Toast />
		{@render children?.()}
	</main>
</div>
