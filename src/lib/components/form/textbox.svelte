<script lang="ts">
  import Label from "$lib/components/label.svelte";
  import type { Snippet } from "svelte";

  interface Props {
    placeholder?: string | null;
    label?: string;
    fullWidth?: boolean;
    type?: "text" | "password" | "email" | "textbox";
    disabled?: boolean;
    name: string;
    required?: boolean;
    value?: string;
    iconleft?: Snippet;
    iconright?: Snippet;
    showPassword?: Snippet;
  }

  let {
    placeholder = "Default Placeholder",
    label = "",
    fullWidth = true,
    type = "text",
    disabled = false,
    name,
    required = true,
    value = $bindable(""),
    iconleft,
    iconright,
    showPassword,
  }: Props = $props();
</script>

<div
  class={["flex flex-col justify-center items-start", fullWidth && "w-full"]}
>
  {#if label}
    <Label target="this" {label} />
  {/if}
  <!-- Input wrapper: Converted from .input-icon -->
  <div
    class="relative flex justify-center items-center gap-2 min-h-[44px] w-full py-2 px-3 border border-gray-subtler rounded-md"
  >
    {@render iconleft?.()}
    {#if type === "password"}
      <input
        type="password"
        id="this"
        bind:value
        {name}
        {placeholder}
        {disabled}
        {required}
        class="bg-transparent border-0 w-full focus:outline-none"
      />
    {:else if type === "email"}
      <input
        type="email"
        id="this"
        bind:value
        {name}
        {placeholder}
        {disabled}
        {required}
        class="bg-transparent border-0 w-full focus:outline-none"
      />
    {:else if type === "textbox"}
      <textarea
        id="this"
        bind:value
        {name}
        class="w-full min-h-[8rem] resize-none border-0 focus:outline-none"
      ></textarea>
    {:else}
      <input
        type="text"
        id="this"
        bind:value
        {name}
        {placeholder}
        {disabled}
        {required}
        class="bg-transparent border-0 w-full focus:outline-none"
      />
    {/if}
    {@render iconright?.()}
    {#if value && showPassword}
      {@render showPassword?.()}
    {/if}
  </div>
</div>
