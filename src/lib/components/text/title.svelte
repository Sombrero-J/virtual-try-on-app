<script lang="ts">
  interface Props {
    title?: string;
    level?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  }

  let { title = "Default title", level = "h1" }: Props = $props();
</script>

<svelte:element
  this={level}
  class="font-title font-medium leading-[2.25rem] md:mb-8 text-black-primary"
  style="font-family: $lp-ff-landingpage;"
>
  {title}
</svelte:element>
