<script module>
	let selected = $state('');
</script>

<script lang="ts">
	import { goto } from '$app/navigation';
	import type { Snippet } from 'svelte';

	interface Props {
		text: string;
		href: string;
		icon: Snippet;
		onclick?: () => void;
	}

	let { text, href, icon, onclick = () => {} }: Props = $props();
</script>

<button
	class="flex cursor-pointer flex-col items-center justify-center gap-1"
	onclick={() => {
		selected = text;
		goto(href);
		onclick();
	}}
>
	{@render icon()}
	<span class={[selected === text ? 'text-brand' : 'text-black-tertiary', 'text-sm']}>
		{text}
	</span>
</button>
