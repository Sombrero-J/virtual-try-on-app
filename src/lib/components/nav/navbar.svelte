<script lang="ts">

  import Button from "$lib/components/buttons/button.svelte";

  import { goto } from "$app/navigation";
  let { user } = $props();
</script>

<nav class="bg-brand-blue w-full flex justify-end items-center px-20 py-6 sticky top-0">

  <div class="acc-buttons flex justify-center items-center gap-4">
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