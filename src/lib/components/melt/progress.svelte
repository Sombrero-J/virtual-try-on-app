<script lang="ts">
  import { Progress } from "melt/builders";

  interface Props {
    value?: number;
    labelOutside?: string;
    labelInside?: boolean;
    duration?: number;
  }

  let { value = 0, duration = 5000 }: Props = $props();

  const progress = new Progress({
    value: () => value,
    max: () => 100,
  });
</script>

<div
  {...progress.root}
  class="h-4 w-full bg-brand-secondary rounded-[10px] overflow-hidden relative"
>
  <div
    {...progress.progress}
    class="h-full bg-brand-gradient rounded-[10px] w-full -translate-x-[var(--progress)]"
  ></div>
</div>