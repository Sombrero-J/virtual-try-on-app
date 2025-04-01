<script lang="ts">
	interface Props {
		label?: string;
		target?: string;
		twClass?: string;
	}

	let { label = 'Default Label', target = 'Default For', twClass = "" }: Props = $props();
</script>

<label class={['text-black-secondary mb-1 text-base font-normal', twClass]} for={target}
	>{label}</label
>
