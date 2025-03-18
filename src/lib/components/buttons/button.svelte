<script lang="ts">
  import type { Snippet } from "svelte";

  interface Props {
    text?: string;
    type?: "button" | "submit" | "reset";
    style?: "primary" | "secondary";
    size?: "small" | "large";
    disabled?: boolean;
    onclick?: () => void;
    ariaLabel?: string;
    fullWidth?: boolean;
    lefticon?: any;
    righticon?: any;
    twClass?: string;
    children?: Snippet;
  }

  let {
    text,
    type = "submit",
    style = "primary",
    size = "large",
    disabled = false,
    onclick = () => {},
    ariaLabel,
    fullWidth = false,
    lefticon,
    righticon,
    twClass,
    children,
  }: Props = $props();

  const baseClasses =
    "flex justify-center items-center whitespace-nowrap rounded-md border-0";

  // variantClasses is reactive to "disabled"
  let variantClasses = $derived(() => {
    if (style === "primary") {
      return disabled
        ? "text-gray-disabled bg-brand-gradient-button cursor-not-allowed"
        : "text-white-primary bg-brand-gradient-button bg-right duration-300 ease-in hover:bg-left hover:active:bg-brand-purple hover:active:brand-purple cursor-pointer";
    } else if (style === "secondary") {
      return disabled
        ? "text-gray-subtler cursor-not-allowed"
        : "text-black-primary border-1 border-brand-purple bg-white-primary relative duration-300 hover:text-white-primary hover:bg-brand-purple cursor-pointer";
    }
    return "";
  });

  const sizeClasses =
    size === "large"
      ? "min-h-[44px] py-[0.5em] px-[1.5em] text-base"
      : size === "small"
        ? "py-[0.25em] px-[0.5em] text-sm"
        : "";

  const computedClasses = $derived([
    baseClasses,
    fullWidth && "w-full",
    // variantClasses is a derived function
    variantClasses(),
    sizeClasses,
    twClass,
  ]);
</script>

<button
  class={computedClasses}
  {type}
  {onclick}
  aria-label={ariaLabel}
  {disabled}
>
  {@render lefticon?.()}
  {text}
  {@render children?.()}
  {@render righticon?.()}
</button>
