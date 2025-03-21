<script module>
  let selectedFilter = $state("All");
</script>

<script lang="ts">
  interface Props {
    filter?: string;
    onclick?: () => void;
    ariaLabel?: string;
  }

  let {
    filter = "Default Filter",
    onclick = () => {},
    ariaLabel = "",
  }: Props = $props();

  function handleClick() {
    selectedFilter = filter;
    onclick();
  }
</script>

<button
  class={[
    "text-base flex justify-center items-center px-6 py-1.5 rounded-2xl border-1 border-brand cursor-pointer",
    selectedFilter === filter
      ? "bg-brand-gradient text-white"
      : "bg-transparent text-black-primary",
  ]}
  onclick={handleClick}
  aria-label={ariaLabel}
>
  {filter}
</button>