<script lang="ts">
	import Button from '$lib/components/buttons/button.svelte';
	import { innerWidth } from 'svelte/reactivity/window';

	import { goto } from '$app/navigation';
	import Hamburger from '$lib/svg/hamburger.svelte';
	import Icons from '$lib/svg/icons.svelte';
	import { fly } from 'svelte/transition';
	let { user } = $props();

	let isMobile = $derived((innerWidth.current && innerWidth.current < 1024) || false);

	let openBurger = $state(false);
</script>

<nav
	class="bg-brand-secondary sticky top-0 z-10 flex w-full items-center justify-end px-5 py-4 shadow-sm lg:px-20 lg:py-6"
>
	{#if isMobile}
		<button
			class="cursor-pointer"
			onclick={() => {
				openBurger = !openBurger;
			}}
		>
			{#if !openBurger}
				<Hamburger />
			{:else}
				<Icons name="crossBlack" width="28px" height="28px" />
			{/if}
		</button>
		{#if openBurger && isMobile}
			<div
				class="bg-brand-secondary pointer-events-auto absolute top-full left-0 z-9 w-full origin-top space-y-2 rounded-b-2xl px-5 py-4 shadow-md"
				id="mobile-menu"
				role="menu"
				aria-orientation="vertical"
				aria-labelledby="mobile-menu-button"
				tabindex="-1"
				in:fly={{ y: -50, duration: 400 }}
				out:fly={{ y: -20, duration: 200 }}
			>
				{#if user}
					<p>Hi, {user.email}</p>
					<Button
						text="Log out"
						style="secondary"
						fullWidth={true}
						onclick={() => goto('/auth/logout')}
					/>
				{:else}
					<Button
						text="Sign Up"
						style="secondary"
						fullWidth={true}
						onclick={() => goto('/auth/signup')}
					/>
					<Button
						text="Log in"
						style="secondary"
						fullWidth={true}
						onclick={() => goto('/auth/login')}
					/>
				{/if}
			</div>
		{/if}
	{:else}
		<div class="acc-buttons flex items-center justify-center gap-4">
			{#if user}
				<Button text="Log out" type="submit" onclick={() => goto('/auth/logout')} />
			{:else}
				<Button
					text="Sign Up"
					type="submit"
					style="secondary"
					onclick={() => goto('/auth/signup')}
				/>
				<Button text="Log in" type="submit" onclick={() => goto('/auth/login')} />
			{/if}
		</div>
	{/if}
	<!-- <Icons width="24px" height="24px" name="linkedIn" /> -->
</nav>
