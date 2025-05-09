<script lang="ts">
	import CardHeader from '$lib/components/card/cardheader.svelte';
	import Textbox from '$lib/components/form/textbox.svelte';
	import Button from '$lib/components/buttons/button.svelte';
	import { goto } from '$app/navigation';
	import EyeClosed from '$lib/svg/eyeClosed.svelte';
	import EyeOpened from '$lib/svg/eyeOpened.svelte';
	import { applyAction, enhance } from '$app/forms';
	import { addToast } from '$lib/components/melt/toast.svelte';
	import { page } from '$app/state';

	let email: string = $state('');
	let password: string = $state('');
	let confirmPassword: string = $state('');
	let passwordConfirmed = $state(false);
	let loading = $state(false);

	let hasUpperCase = $state(false);
	let hasLowerCase = $state(false);
	let hasNumbers = $state(false);
	let hasSpecialChar = $state(false);
	let minLength = $state(false);

	let showPassword = $state(false);
	let showConfirmPassword = $state(false);

	let user_exist = $state(false);

	function validatePassword(password: string) {
		hasUpperCase = /[A-Z]/.test(password);
		hasLowerCase = /[a-z]/.test(password);
		hasNumbers = /\d/.test(password);
		hasSpecialChar = /[!@#$%^&*]/.test(password);
		minLength = password.length >= 8;
	}

	$effect(() => {
		validatePassword(password);
		passwordConfirmed = password === confirmPassword;
	});
</script>

{#snippet unconfirmedPassword()}
	<button type="button" class="cursor-pointer" onclick={() => (showPassword = !showPassword)}>
		{#if showPassword}
			<EyeOpened />
		{:else}
			<EyeClosed />
		{/if}
	</button>
{/snippet}

{#snippet confirmedPassword()}
	<button
		type="button"
		class="cursor-pointer"
		onclick={() => (showConfirmPassword = !showConfirmPassword)}
	>
		{#if showConfirmPassword}
			<EyeOpened />
		{:else}
			<EyeClosed />
		{/if}
	</button>
{/snippet}

<div class="flex flex-col items-start justify-center">
	<section class="flex w-[20rem] flex-col items-center gap-6 lg:w-[25rem]">
		<CardHeader title="Sign Up for Free" />
		<form
			class="flex w-full flex-col items-start justify-center gap-4 text-left"
			method="post"
			action={`?/signup&${page.url.searchParams}`}
			use:enhance={() => {
				loading = true;
				return async ({ result, update }) => {
					loading = false;
					if (result.type === 'failure') {
						if (result.data?.error === 'user_already_exists') {
							user_exist = true;
							addToast({
								data: {
									type: 'error',
									title: 'Error',
									description: 'Email already exists. Please log in.'
								}
							});
						} else {
							addToast({
								data: {
									type: 'error',
									title: 'Error',
									description:
										(result.data?.message as string) ||
										'There was an error creating your account. Please try again.'
								}
							});
						}
						console.error(result);
						await update();
					} else if (result.type === 'error') {
						// Handle validation errors
						addToast({
							data: {
								type: 'error',
								title: 'Sign up error',
								description: 'Something went wrong. Please try again.'
							}
						});
						await update();
					} else if (result.type === 'redirect') {
						addToast({
							data: {
								type: 'success',
								title: 'Success',
								description: 'Account created successfully!'
							}
						});
						console.log('Result:', result);
						await applyAction(result);
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
				name="unconfirmed_new_password"
				placeholder="• • • • • • • •"
				label="New password"
				type={showPassword ? 'text' : 'password'}
				bind:value={password}
				showPassword={unconfirmedPassword}
			/>
			<div class="text-black-tertiary text-xs font-normal">
				{#if !hasUpperCase || !hasLowerCase || !hasNumbers || !hasSpecialChar || !minLength}
					<p>Password must have:</p>
				{/if}
				<ul class="text-red-warning">
					{#if !hasUpperCase}
						<li>At least one uppercase letter</li>
					{/if}
					{#if !hasLowerCase}
						<li>At least one lowercase letter</li>
					{/if}
					{#if !hasNumbers}
						<li>At least one number</li>
					{/if}
					{#if !hasSpecialChar}
						<li>At least one special character</li>
					{/if}
					{#if !minLength}
						<li>At least 8 characters</li>
					{/if}
				</ul>
			</div>

			<Textbox
				placeholder="• • • • • • • •"
				label="Confirm new password"
				type={showConfirmPassword ? 'text' : 'password'}
				name="confirmed_password"
				bind:value={confirmPassword}
				showPassword={confirmedPassword}
			/>

			{#if !passwordConfirmed}
				<div class="text-xs font-normal text-[color:var(--color-red-warning)]">
					<p>Passwords must match.</p>
				</div>
			{/if}

			{#if user_exist}
				<div class="text-xs font-normal text-[color:var(--color-red-warning)]">
					<p>Email already exist. Please log in.</p>
				</div>
			{/if}
			<Button
				type="submit"
				{loading}
				text="Sign Up"
				disabled={!hasUpperCase ||
					!hasLowerCase ||
					!hasNumbers ||
					!hasSpecialChar ||
					!minLength ||
					!passwordConfirmed ||
					!email}
				fullWidth={true}
			/>
		</form>
		<div class="text-black-secondary text-md w-full text-center font-normal">
			<span>Already have an account?</span>
			<a href={`/auth/login/${page.url.search}`} class="text-brand hover:underline">Log In</a>
		</div>
	</section>
</div>
