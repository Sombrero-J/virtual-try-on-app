<script lang="ts">
  interface Props {
    svg: string;
    width: string;
    height: string;
    color: string;
    viewBox: string;
  }

  let { svg, width, height, color, viewBox }: Props = $props();
</script>

<!-- SVG Icon Wrapper -->

{#if svg}
  <pre>{svg}</pre>
  <svg
    width={typeof width === "number" ? `${width}px` : width}
    height={typeof height === "number" ? `${height}px` : height}
    {viewBox}
    fill="none"
    stroke={color}
    xmlns="http://www.w3.org/2000/svg"
  >
    {@html svg}
  </svg>
{:else}
  <p>nothing</p>
{/if}
