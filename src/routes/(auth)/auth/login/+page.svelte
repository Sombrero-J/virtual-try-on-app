<script lang="ts">
	import CardHeader from '$lib/components/card/cardheader.svelte';
	import Textbox from '$lib/components/form/textbox.svelte';
	import Button from '$lib/components/buttons/button.svelte';
	import EyeOpened from '$lib/svg/eyeOpened.svelte';
	import EyeClosed from '$lib/svg/eyeClosed.svelte';
	import type { ActionData } from './$types';
	import { page } from '$app/state';
	import { applyAction, enhance } from '$app/forms';
	import { addToast } from '$lib/components/melt/toast.svelte';

	interface Props {
		form: ActionData;
	}

	let { form }: Props = $props();

	let email: string = $state('');
	$effect(() => {
		email = form?.email || '';
	});
	let password: string = $state('');

	let showPassword = $state(false);
	let loading = $state(false);
</script>

{#snippet inputPassword()}
	<button type="button" class="cursor-pointer" onclick={() => (showPassword = !showPassword)}>
		{#if showPassword}
			<EyeOpened />
		{:else}
			<EyeClosed />
		{/if}
	</button>
{/snippet}

<div class="bg-white-primary flex size-full items-center justify-center">
	<!-- <Button text="Back" style="secondary" size="large" onclick={navigate}>
      {#snippet lefticon()}
        <Icons name="leftBlack" />
      {/snippet}
    </Button> -->
	<section class="flex w-[20rem] flex-col items-center gap-6 lg:w-[25rem]">
		<CardHeader title="Log in" />
		<form
			class="flex w-full flex-col items-end justify-center gap-4 text-left"
			method="post"
			use:enhance={() => {
				loading = true;
				return async ({ result }) => {
					loading = false;
					if (result.type === 'redirect') {
						addToast({
							data: {
								type: 'success',
								title: 'Success',
								description: 'Login successful!'
							}
						});
						await applyAction(result);
					} else {
						addToast({
							data: {
								type: 'error',
								title: 'Error',
								description: 'Login failed. Please try again.'
							}
						});
					}
				};
			}}
		>
			<Textbox
				placeholder="Enter your email..."
				label="Email address"
				type="email"
				name="email"
				bind:value={email}
			/>
			<Textbox
				placeholder="• • • • • • • •"
				label="Password"
				type={showPassword ? 'text' : 'password'}
				name="password"
				bind:value={password}
				showPassword={inputPassword}
			/>
			<a id="forgotpassword" href="/auth/reset">forgot password?</a>
			{#if form?.incorrect}
				<p class="error text-red-warning w-full text-center text-sm font-normal">
					Your email or password is incorrect!
				</p>
			{/if}
			<Button
				{loading}
				style="primary"
				type="submit"
				text="Sign In"
				fullWidth={true}
				disabled={!email || !password}
			/>
			<div class="text-black-secondary text-md w-full text-center font-normal">
				<span>Don't have an account?</span>
				<a href={`/auth/signup/${page.url.search}`} class="text-brand hover:underline">Sign Up</a>
			</div>
		</form>
	</section>
</div>
