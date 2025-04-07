<script lang="ts" module>
	import { innerWidth } from 'svelte/reactivity/window';
	import type { AddToastProps } from 'melt/builders';
	type ToastData = {
		type: 'success' | 'error' | 'warning' | 'info';
		title: string;
		description: string;
	};

	const toaster = new Toaster<ToastData>({
		closeDelay: () => 2000,
		type: () => 'polite', // can be MaybeGetter<"assertive" | "polite" | undefined>
		hover: () => 'pause'
	});

	export const addToast = (props: AddToastProps<ToastData>) => toaster.addToast(props);

	let isMobile = $derived((innerWidth.current && innerWidth.current < 1024) || false);

	let transitionOrigin = $derived(isMobile ? -50 : 50);
</script>

<script lang="ts">
	import { fly } from 'svelte/transition';
	import { Toaster } from 'melt/builders';
	import { onMount } from 'svelte';

	import Success from '$lib/svg/indicators/success.svelte';
	// import Error from "$lib/svg/indicators/error.svelte";
	import Warning from '$lib/svg/indicators/warning.svelte';
	// import Info from "$lib/svg/indicators/info.svelte";
</script>

<!-- Some browsers automatically apply the inset CSS property to elements with the popover attribute (which toaster.root has due to popover: "manual"). Need to explicitly unset the inset property so bottom-4 right-4 styles work.-->
<div
	{...toaster.root}
	class="!fixed inset-auto flex w-[300px] flex-col gap-2 overflow-hidden max-lg:!top-4 lg:!right-4 lg:!bottom-4"
>
	{#each toaster.toasts as toast (toast.id)}
		<div
			class="flex items-start justify-between rounded-lg border border-gray-200 bg-white p-4 shadow-lg"
			transition:fly={{ y: transitionOrigin, duration: 500 }}
		>
			<div class="flex flex-col items-start justify-center">
				<div class="flex items-center justify-start gap-2">
					{#if toast.data.type === 'success'}
						<Success />
						<!-- {:else if toast.data.type === "error"}
        <Error /> -->
					{:else if toast.data.type === 'warning'}
						<Warning />
						<!-- {:else if toast.data.type === "info"}
        <Info /> -->
					{/if}
					<h3 {...toast.title} class="text-black-primary font-medium">
						{toast.data.title}
					</h3>
				</div>
				<div {...toast.description} class="text-black-tertiary text-sm">
					{toast.data.description}
				</div>
			</div>
			<button {...toast.close} aria-label="dismiss alert" class="text-gray-400 hover:text-gray-600">
				X
			</button>
		</div>
	{/each}
</div>
