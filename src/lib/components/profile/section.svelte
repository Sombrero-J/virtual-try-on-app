<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		title: string;
		children: Snippet;
	}

	let { title, children }: Props = $props();
</script>

<section>
	<header>
		<h2 class="text-black-tertiary text-base">{title}</h2>
	</header>
	{@render children()}
</section>
