<script lang="ts">
	interface Props {
		onclick?: () => void;
		src: string | null;
		alt: string;
		selected?: boolean;
	}

	let { onclick, src, alt, selected = false }: Props = $props();
</script>

<button
	class="bg-brand-secondary flex aspect-square cursor-pointer items-center justify-center overflow-hidden rounded-lg {selected
		? 'border-black-primary border-1'
		: ''}"
	{onclick}
>
	<img {src} {alt} class="h-full w-full object-cover" />
</button>
