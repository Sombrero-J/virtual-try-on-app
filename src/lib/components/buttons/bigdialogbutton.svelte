<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		icon: Snippet;
		text: string;
		description: string;
		onclick?: () => void;
		children?: Snippet;
	}

	let { icon, text, description, onclick, children }: Props = $props();
</script>

<button
	class="bg-brand-secondary hover:border-brand relative min-h-60 w-[30vw] max-w-[35rem] cursor-pointer rounded-3xl p-5 hover:border-2"
	aria-label="Customise your own"
	{onclick}
>
	<div class="flex flex-col items-center justify-center space-y-5">
		{@render children?.()}
		{@render icon()}
		<div>
			<h2 class="text-4xl font-semibold">{text}</h2>
			<p class="text-black-secondary text-lg font-normal">{description}</p>
		</div>
	</div>
</button>
