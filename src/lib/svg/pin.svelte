<script lang="ts">
	interface Props {
		twClass?: string;
	}
	let { twClass }: Props = $props();
</script>

<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" class={twClass}
	><g clip-path="url(#a)"
		><path
			stroke="#000"
			stroke-linecap="round"
			stroke-linejoin="round"
			stroke-width="2"
			d="m15 7-6 7a2 2 0 1 0 3 3l6-7a4 4 0 0 0-6-6l-6 7a6 6 0 1 0 9 9l6-7"
		/></g
	><defs><clipPath id="a"><path fill="#fff" d="M0 0h24v24H0z" /></clipPath></defs></svg
>
