<script lang="ts">
  import CardHeader from "$lib/components/card/cardheader.svelte";
  import Textbox from "$lib/components/form/textbox.svelte";
  import Button from "$lib/components/buttons/button.svelte";
  import EyeOpened from "$lib/svg/eyeOpened.svelte";
  import EyeClosed from "$lib/svg/eyeClosed.svelte";
  import type { ActionData } from "./$types";

  interface Props {
    form: ActionData;
  }

  let { form }: Props = $props();

  let email: string = $state("");
  $effect(() => {
    email = form?.email || "";
  });
  let password: string = $state("");

  let showPassword = $state(false);

</script>

{#snippet inputPassword()}
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

<div class="flex flex-col items-start justify-center">
  <!-- <Button text="Back" style="secondary" size="large" onclick={navigate}>
      {#snippet lefticon()}
        <Icons name="leftBlack" />
      {/snippet}
    </Button> -->
  <section class="flex flex-col items-center gap-6 w-[20rem] lg:w-[25rem]">
    <CardHeader title="Log in" />
    <form
      class="text-left flex w-full flex-col justify-center items-end gap-4"
      method="post"
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
        type={showPassword ? "text" : "password"}
        name="password"
        bind:value={password}
        showPassword={inputPassword}
      />
      <a id="forgotpassword" href="/auth/reset">forgot password?</a>
      {#if form?.incorrect}
        <p
          class="error w-full text-center font-normal text-sm text-red-warning"
        >
          Your email or password is incorrect!
        </p>
      {/if}
      <Button
        style="primary"
        type="submit"
        text="Sign In"
        fullWidth={true}
        disabled={!email || !password}
      />
      <div
        class="text-center w-full text-black-secondary text-md font-normal"
      >
        <span>Don't have an account?</span>
        <a href="/auth/signup" class="text-brand hover:underline">Sign Up</a>
      </div>
    </form>
  </section>
</div>
