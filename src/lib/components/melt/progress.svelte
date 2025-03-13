<script lang="ts">
  import { Progress } from "melt/builders";

  interface Props {
    value?: number;
    labelOutside?: string;
    labelInside?: boolean;
  }

  let { value = 0 }: Props = $props();

  const progress = new Progress({
    value: () => value,
    max: () => 100,
  });
</script>

<div
  {...progress.root}
  class="h-4 w-full bg-brand-blue rounded-[10px] overflow-hidden relative"
>
  <div
    {...progress.progress}
    class="h-full bg-brand-gradient rounded-[10px] w-full -translate-x-[var(--progress)] transition-all duration-300 ease-in-out"
  ></div>
</div>