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
		<h2 class="text-base text-black-tertiary">{title}</h2>
	</header>
	{@render children()}
</section>
