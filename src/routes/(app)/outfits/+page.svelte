<script lang="ts">
	import type { PageData } from './$types';
	import Button from '$lib/components/buttons/button.svelte';
	import Dialog from '$lib/components/dialog/dialog.svelte';
	import { goto } from '$app/navigation';
	let { data }: { data: PageData } = $props();

	let openDialog = $state(false);
</script>

<div
	class="bg-white-primary flex h-full w-full flex-col items-center justify-center gap-2 overflow-hidden pb-2"
>
	{#await data.outfits}
		<div class="flex flex-col gap-2">
			<h1 class="text-2xl font-bold">Loading...</h1>
		</div>
	{:then outfits}
		{#if outfits && outfits.length > 0}
			{#each outfits as outfit}
				<div class="flex flex-col gap-2">
					<h1 class="text-2xl font-bold">Outfits</h1>
				</div>
			{/each}
		{:else}
			<div class="flex h-full w-full flex-col items-center justify-center gap-2 px-4">
				<div class="flex flex-1 flex-col items-center justify-center gap-1">
					<h1 class="text-xl font-medium">You have no outfits yet</h1>
					<p class="text-black-tertiary text-sm">
						Create your first outfit by clicking the button below.
					</p>
				</div>
				<Button text="Create Outfit" fullWidth={true} onclick={() => (openDialog = true)} />
			</div>
		{/if}
	{/await}
</div>

<Dialog button={false} title="Create" bind:open={openDialog} understood={false}>
	<div class="flex w-full flex-col gap-2">
		<Button
			text="Customise your own"
			fullWidth={true}
			onclick={() => {
				goto('/outfits/create-custom');
			}}
		/>
		<Button
			text="Smart Creation with AI Stylist"
			fullWidth={true}
			onclick={() => {
				goto('/outfits/create-ai');
			}}
		/>
	</div>
</Dialog>
