<script lang="ts">
	import { onMount, type Snippet } from 'svelte';
	import TextButton from '$lib/components/buttons/textButton.svelte';
	import Button from '$lib/components/buttons/button.svelte';
	import Icons from '$lib/svg/icons.svelte';
	import CloseButton from '$lib/svg/small/closeButton.svelte';
	import { innerWidth, innerHeight } from 'svelte/reactivity/window';
	import { fly } from 'svelte/transition';
	import Back from '../buttons/back.svelte';

	let startY = $state(0);
	let isDragging = $state(false);
	let draggable = $state<HTMLDivElement | null>(null);

	let containerHeight = $derived.by(() => {
		if (draggable) {
			return draggable.offsetHeight;
		} else {
			return 300;
		}
	});

	let translateY = $state(0);
	let maxTranslateY = $derived((innerHeight.current || 800) - 100);
	let closeThreshold = $derived(containerHeight * 0.5);
	let startTranslateY = $state(0);

	function handleMouseDown(e: PointerEvent) {
		// Prevent text selection during drag
		e.preventDefault();

		isDragging = true;
		startY = e.clientY;
		startTranslateY = translateY;
	}

	function handlePointerMove(e: PointerEvent) {
		if (!isDragging || !draggable) return;

		let clientY = e.clientY;
		let deltaY = clientY - startY; // positive means dragging down
		let newTranslateY = startTranslateY + deltaY;

		// Clamp translation: cannot drag further up than 0
		translateY = Math.max(0, newTranslateY);
		// Optional: Clamp to maxTranslateY if you want a hard stop at the bottom
		// translateY = Math.min(maxTranslateY, Math.max(0, newTranslateY));
	}

	function handlePointerUp() {
		if (!isDragging) return;
		isDragging = false;

		if (translateY > closeThreshold) {
			open = false;
		}
		// translateY must go back to 0 to ensure reopen works
		translateY = 0;
	}

	interface Props {
		title?: string;
		titleholder?: Snippet;
		children: Snippet;
		open?: boolean;
		textButton?: boolean;
		buttonText?: string;
		backFn?: () => void;
		onclick?: () => void;
	}

	let {
		children,
		title,
		titleholder,
		open = $bindable(),
		textButton = true,
		buttonText = '',
		backFn,
		onclick = () => {}
	}: Props = $props();

	let isMobile = $derived((innerWidth.current && innerWidth.current < 1024) || false);

	let sheetStyle = $derived(`
        transform: translateY(${open ? translateY : containerHeight}px);
        transition: ${isDragging ? 'none' : 'transform 0.3s ease-out'};
        touch-action: ${isDragging ? 'none' : 'auto'}; /* Prevent scroll interference ONLY during drag */
    `);
</script>

<svelte:window
	onkeydown={(e) => {
		if (e.key === 'Escape' && open) {
			open = false;
		}
	}}
	onpointerup={handlePointerUp}
	onpointermove={handlePointerMove}
/>

{#if textButton}
	<TextButton onclick={() => (open = !open)} text="Show Examples" />
{/if}

{#if open && !isMobile}
	<div
		class="fixed top-0 left-0 z-[100] flex size-full items-center justify-center bg-neutral-200/50"
		role="presentation"
		onclick={(event) => {
			if (event.target === event.currentTarget) {
				open = false;
			}
		}}
	>
		<div
			class="justify-top flex max-h-2/3 max-w-8/10 flex-col items-center gap-5 rounded-3xl bg-white p-7 shadow-xl"
		>
			<div class="relative flex w-full items-center justify-center gap-2">
				<h1 class="flex-1 text-4xl font-medium text-center mx-20">{title}</h1>
				<button
					class="absolute right-0 cursor-pointer"
					aria-label="Close modal"
					onclick={() => (open = false)}
				>
					<div class="hidden lg:block">
						<Icons name="crossBlack" width="44px" height="44px" />
					</div>
				</button>
			</div>
			<div class="h-full overflow-y-auto">
				{@render children?.()}
			</div>
			{#if buttonText}
				<Button
					twClass={'cursor-pointer'}
					fullWidth={true}
					text={buttonText}
					onclick={() => {
						open = false;
						onclick();
					}}
				/>
			{/if}
		</div>
	</div>
{:else if open && isMobile}
	<!-- Positioning (bottom): You're directly manipulating a bottom state variable. It's often better for performance, especially with animations, to use CSS transform: translateY() instead of changing layout properties like bottom. We'll keep a state variable, but have it represent the translateY value. -->
	<div
		class="fixed top-0 left-0 z-[100] flex size-full items-center justify-center bg-neutral-200/50"
		role="presentation"
		onclick={(event) => {
			if (event.target === event.currentTarget) {
				open = false;
			}
		}}
	>
		<div
			bind:this={draggable}
			class="bg-white-primary fixed bottom-0 left-0 min-h-[10rem] w-full overflow-hidden rounded-t-3xl px-4 py-2"
			style={sheetStyle}
			transition:fly={{ y: 200, duration: 500 }}
		>
			<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
			<div class="flex w-full flex-col items-center justify-start gap-3 text-center">
				<div
					role="dialog"
					aria-label="Uploaded Items Bottom Sheet"
					class="flex w-full cursor-move flex-col items-center justify-center gap-2"
					onpointerdown={handleMouseDown}
				>
					<div class="bg-gray-subtlest h-[2px] w-1/10 rounded-full"></div>
					<div class="flex w-full items-center">
						{#if backFn}
							<Back onclick={backFn} />
						{/if}
						{#if title}
							<h1 class={['flex-1 text-xl font-medium', !backFn && 'pl-[24px]']}>{title}</h1>
						{:else if titleholder}
							<div class={['flex-1', !backFn && 'pl-[24px]']}>
								{@render titleholder?.()}
							</div>
						{/if}
						<button class="cursor-pointer" onclick={() => (open = false)}>
							<Icons name="crossBlack" width="24px" height="24px" />
						</button>
					</div>
				</div>
				<div class="w-full">
					{@render children?.()}
				</div>
			</div>
		</div>
	</div>
{/if}
