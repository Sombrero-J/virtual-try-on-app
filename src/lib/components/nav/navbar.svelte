<script lang="ts">
  import Taileo from "$lib/components/logo/logo.svelte";
  import Button from "$lib/components/button.svelte";

  import { goto } from "$app/navigation";
  let { user } = $props();
</script>

<nav class="bg-brand-blue w-full flex justify-between items-center px-20 py-6 sticky top-0">
  <Taileo />

  <div class="acc-buttons">
    {#if user}
      <Button
        text="Log out"
        type="submit"
        onclick={() => goto("/auth/logout")}
      />
    {:else}
      <Button
        text="Sign Up"
        type="submit"
        style="secondary"
        onclick={() => goto("/auth/signup")}
      />
      <Button
        text="Log in"
        type="submit"
        onclick={() => goto("/auth/login")}
      />
    {/if}
  </div>
  <!-- <Icons width="24px" height="24px" name="linkedIn" /> -->
</nav>