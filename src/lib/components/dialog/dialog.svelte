<script lang="ts">
  import type { Snippet } from "svelte";
  import TextButton from "$lib/components/buttons/textButton.svelte";
  import Button from "$lib/components/buttons/button.svelte";
  import Icons from "$lib/svg/icons.svelte";
  import CloseButton from "$lib/svg/small/closeButton.svelte";

  // let open = $state(false);

  interface Props {
    title: string;
    children: Snippet;
    open?: boolean;
    button?: boolean;
    understood?: boolean;
  }

  let { children, title, open = $bindable(), button = true, understood = true }: Props = $props();
</script>

<svelte:window
  onkeydown={(e) => {
    if (e.key === "Escape" && open) {
      open = false;
    }
  }}
/>

{#if button}
  <TextButton onclick={() => (open = !open)} text="Show Examples" />
{/if}

{#if open}
  <div
    class="fixed bg-neutral-200/50 top-0 left-0 size-full flex justify-center items-center z-[100]"
    role="presentation"
    onclick={(event) => {
      if (event.target === event.currentTarget) {
        open = false;
      }
    }}
  >
    <div
      class="max-w-8/10 max-h-2/3 rounded-3xl p-7 bg-white flex flex-col gap-5 justify-top items-center shadow-xl"
    >
      <div class="w-full flex justify-center items-center gap-2">
        <h1 class="flex-1 text-base lg:text-4xl font-medium">{title}</h1>
        <button
          class="right-0 cursor-pointer"
          aria-label="Close modal"
          onclick={() => (open = false)}
        >
          <div class="lg:hidden">
            <CloseButton />
          </div>
          <div class="hidden lg:block">
            <Icons name="crossBlack" width="44px" height="44px" />
          </div>
        </button>
      </div>
      <div class="overflow-y-auto h-full">
        {@render children?.()}
      </div>
      {#if understood}
        <Button
          twClass={"cursor-pointer"}
          fullWidth={true}
          text="Understood"
          onclick={() => (open = false)}
        />
      {/if}
    </div>
  </div>
{/if}
