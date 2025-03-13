<script lang="ts">
  import type { Snippet } from "svelte";


  interface Props {
    text?: string;
    type?: "button" | "submit" | "reset";
    onclick?: () => void;
    ariaLabel?: string;
    pic: Snippet;
  }

  let {
    text = "Default Text",
    type = "submit",
    onclick = () => {},
    ariaLabel = "",
    pic,
  }: Props = $props();
</script>

<button
  {type}
  {onclick}
  aria-label={ariaLabel}
  class="flex flex-col justify-end items-center rounded-2xl border border-gray-subtler hover:border-black cursor-pointer p-0 bg-transparent overflow-hidden w-[13rem] h-[15rem]"
>
  {@render pic?.()}
  <p class="text-black-primary text-2xl font-medium py-1">
    {text}
  </p>
</button>