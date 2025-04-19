<script lang="ts">
  import Button from "$lib/components/buttons/button.svelte";
  import CardHeader from "$lib/components/card/cardheader.svelte";
  import Textbox from "$lib/components/form/textbox.svelte";
  import { goto } from "$app/navigation";
  import type { PageProps } from "./$types";
  import { enhance } from "$app/forms";

  let { form }: PageProps = $props();

  let email: string = $state("");
  $effect(() => {
    email = form?.email ?? "";
  });
  let creating = $state(false);

  function navigate() {
    goto("/");
  }
</script>

<div class="flex flex-col items-start justify-center">
  <!-- <Button text="Back" style="secondary" size="large" onclick={navigate}>
      {#snippet lefticon()}
        <Icons name="leftBlack" />
      {/snippet}
    </Button> -->
  <section class="flex flex-col items-center gap-6 w-[20rem] lg:w-[25rem]">
    <CardHeader title="Reset password" />
    <form
      class="text-left flex w-full flex-col justify-center items-start gap-4"
      method="post"
      action="?/reset"
    >
      <Textbox
        placeholder="example@email.com"
        label="Email address"
        type="email"
        name="email"
        bind:value={email}
      />

      <Button
        type="submit"
        text="Send link"
        disabled={!email}
        fullWidth={true}
      />
    </form>
  </section>
</div>
