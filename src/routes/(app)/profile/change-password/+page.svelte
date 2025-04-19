<script lang="ts">
	import CardHeader from '$lib/components/card/cardheader.svelte';
	import Textbox from '$lib/components/form/textbox.svelte';
	import Button from '$lib/components/buttons/button.svelte';
	import { goto } from '$app/navigation';
	import EyeClosed from '$lib/svg/eyeClosed.svelte';
	import EyeOpened from '$lib/svg/eyeOpened.svelte';
	import { enhance } from '$app/forms';

	let password: string = $state('');
	let confirmPassword: string = $state('');
	let passwordConfirmed = $state(false);

	let hasUpperCase = $state(false);
	let hasLowerCase = $state(false);
	let hasNumbers = $state(false);
	let hasSpecialChar = $state(false);
	let minLength = $state(false);

	let showPassword = $state(false);
	let showConfirmPassword = $state(false);

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

<section class="flex size-full flex-col items-stretch justify-start gap-2 p-4">
	<Textbox
		name="unconfirmed_new_password"
		placeholder="Enter your new password"
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

	<form
		action="?/change_password"
		method="post"
		class="flex flex-1 flex-col items-stretch justify-between gap-2"
		use:enhance={() => {
			return ({ result }) => {
				if (result.type === 'success') {
					alert('Password changed successfully!');
					goto('/profile');
				} else {
					alert('Error changing password. Please try again.');
					console.error('Error changing password:', result);
				}
			};
		}}
	>
		<div>
			<Textbox
				placeholder="Enter your new password again"
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
		</div>
		<Button
			type="submit"
			text="Reset Password"
			disabled={!hasUpperCase ||
				!hasLowerCase ||
				!hasNumbers ||
				!hasSpecialChar ||
				!minLength ||
				!passwordConfirmed}
			fullWidth={true}
		/>
	</form>
</section>
