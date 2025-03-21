<script lang="ts">
  import type { PageData } from "./$types";
  import Button from "$lib/components/landingPage/button.svelte";
  let { data }: { data: PageData } = $props();
</script>

<div
  class="h-full w-full pb-2 flex flex-col gap-2 justify-center items-center overflow-hidden bg-white-primary"
>
  {#await data.outfits}
    <div class="flex flex-col gap-2">
      <h1 class="text-2xl font-bold">Loading...</h1>
    </div>
  {:then outfits}
    {#if outfits && outfits.length > 0}
      {#each outfits as outfit}
        <div class="flex flex-col gap-2">
          <h1 class="text-2xl font-bold">Outfits</h1>
        </div>
      {/each}
    {:else}
      <div
        class="h-full w-full flex flex-col justify-center items-center gap-2 px-4"
      >
        <div class="flex-1 flex flex-col justify-center items-center gap-1">
          <h1 class="text-xl font-medium">You have no outfits yet</h1>
          <p class="text-sm text-black-tertiary">
            Create your first outfit by clicking the button below.
          </p>
        </div>
        <Button text="Create Outfit" fullWidth={true} />
      </div>
    {/if}
  {/await}
</div>
