<script lang="ts">
  import Button from "$lib/components/buttons/button.svelte";
  import CardHeader from "$lib/components/card/cardheader.svelte";
  import Textbox from "$lib/components/form/textbox.svelte";
  import { goto } from "$app/navigation";
  import type { ActionData } from "./$types";
  import EyeClosed from "$lib/svg/eyeClosed.svelte";
  import EyeOpened from "$lib/svg/eyeOpened.svelte";

  interface Props {
    form: ActionData;
  }

  let { form }: Props = $props();

  let new_password = $state("");
  let confirm_password = $state("");
  let password_confirmed = $state(false);

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
    validatePassword(new_password);
    password_confirmed = new_password === confirm_password;
  });

  function navigate() {
    goto("/");
  }
</script>

{#snippet unconfirmedPassword()}
  <button
    type="button"
    class="cursor-pointer"
    onclick={() => (showPassword = !showPassword)}
  >
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
  <!-- <Button text="Back" style="secondary" size="large" onclick={navigate}>
      {#snippet lefticon()}
        <Icons name="leftBlack" />
      {/snippet}
    </Button> -->
  <section class="flex flex-col items-center gap-6 w-[20rem] lg:w-[25rem]">
    <CardHeader title="New password" />
    <form
      class="text-left flex w-full flex-col justify-center items-start gap-4"
      method="post"
      action="?/reset"
    >
      <Textbox
        name="unconfirmed_new_password"
        placeholder="• • • • • • • •"
        label="New password"
        type={showPassword ? "text" : "password"}
        bind:value={new_password}
        showPassword={unconfirmedPassword}
      />
      <div class="font-normal text-xs text-black-tertiary">
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
        type={showConfirmPassword ? "text" : "password"}
        name="confirmed_password"
        bind:value={confirm_password}
        showPassword={confirmedPassword}
      />

      {#if !password_confirmed}
        <div class="font-normal text-xs text-[color:var(--color-red-warning)]">
          <p>Passwords must match.</p>
        </div>
      {/if}
      <Button
        type="submit"
        text="Reset password"
        disabled={!hasUpperCase ||
          !hasLowerCase ||
          !hasNumbers ||
          !hasSpecialChar ||
          !minLength ||
          !password_confirmed}
        fullWidth={true}
      />
    </form>
  </section>
</div>