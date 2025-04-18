<script lang="ts">
  import type { Snippet } from "svelte";

  interface Props {
    imageUrl?: string;
    button: Snippet;
  }

  let { imageUrl, button }: Props = $props();
</script>

<div class="w-full flex flex-col justify-center items-center gap-2">
  <div
    class="relative text-center flex h-[23rem] w-full justify-center items-center lg:h-[40rem]"
  >
    {#if imageUrl}
      <img
        src={imageUrl}
        alt="Virtual Try On"
        class="h-full w-auto rounded-lg object-contain"
      />
    {/if}
  </div>
  {@render button()}
</div>