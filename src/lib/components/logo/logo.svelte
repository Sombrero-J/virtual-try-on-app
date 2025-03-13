<script lang="ts">
	let outerWidth = $state<number | undefined>();
	let size: string = $state('small');
	$effect(() => {
		size = outerWidth !== undefined && outerWidth < 1024 ? 'small' : 'big';
	});
</script>

<svelte:window bind:outerWidth />

<h1>Logo</h1>
