<script lang="ts">
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';

	export let variants: { width: number; url: string }[] = [];
	export let fallbackSrc: string; // Original image URL (signed)
	export let lqip: string = ''; // Base64 blurred placeholder
	export let alt: string = '';
	export let sizes: string = '(max-width: 640px) 100vw, 800px';
	export let loading: 'lazy' | 'eager' = 'lazy';
	export let decoding: 'async' | 'auto' | 'sync' = 'async';
	export let className = '';

	let loaded = false;

	// Sorted variants by width ascending
	$: sorted = variants.slice().sort((a, b) => a.width - b.width);

	// Construct srcset string
	$: srcset = sorted.map((v) => `${v.url} ${v.width}w`).join(', ');
</script>

<div class="image-wrapper {className}" style="background-image: url('{lqip}');">
	{#if variants.length > 0}
		<picture>
			<source {srcset} {sizes} type="image/webp" />
			<img
				src={fallbackSrc}
				{alt}
				class:image
				class:loaded
				{loading}
				{decoding}
				on:load={() => (loaded = true)}
			/>
		</picture>
	{:else}
		<img
			src={fallbackSrc}
			{alt}
			class:image
			class:loaded
			{loading}
			{decoding}
			on:load={() => (loaded = true)}
		/>
	{/if}
</div>

<style>
	.image-wrapper {
		display: block;
		position: relative;
		overflow: hidden;
		background-size: cover;
		background-position: center;
	}

	.image {
		width: 100%;
		height: auto;
		opacity: 0;
		transition: opacity 0.4s ease;
		display: block;
	}

	.image.loaded {
		opacity: 1;
	}
</style>
