<script lang="ts">
	interface Props {
		title?: string;
	}

	let { title = 'Default Title' }: Props = $props();
</script>

<header class="text-center">
	<h1 class="text-2xl font-medium text-black-primary lg:text-3xl">
		{title}
	</h1>
</header>