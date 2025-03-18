<script lang="ts">
	import type { PageData } from './$types';
	import Button from '$lib/components/buttons/button.svelte';
	import { goto } from '$app/navigation';
	let { data }: { data: PageData } = $props();
</script>

<div class="flex h-screen flex-col items-center justify-center">
	<h1 class="text-4xl font-bold">Virtual Try On</h1>
	<p class="text-lg">Welcome to the Virtual Try On app</p>
	<Button onclick={() => goto('/beta/vto-test/body-image-upload')} text="Start" />
</div>
