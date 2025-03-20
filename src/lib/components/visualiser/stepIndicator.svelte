<script lang="ts">
  interface Props {
    steps?: number;
    activeStep?: number;
  }

  let { steps = 3, activeStep = 1 }: Props = $props();
</script>

<div class="flex gap-1">
  {#each Array(steps) as _, index}
    <div
      class={[
        "h-1 rounded-full transition-all duration-300 ease-in-out",
        index === activeStep - 1 && "bg-brand w-8",
        index < activeStep - 1 && "bg-brand w-4",
        index > activeStep - 1 && "bg-gray-subtler w-4",
      ]}
    ></div>
  {/each}
</div>