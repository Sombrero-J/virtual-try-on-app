<script lang="ts">
  interface Props {
    onclick: () => void;
    src: string | null;
    alt: string;
    selected?: boolean;
  }

  let { onclick, src, alt, selected = false }: Props = $props();
</script>

<button
  class="bg-brand-secondary rounded-lg aspect-square flex items-center justify-center cursor-pointer overflow-hidden {selected
    ? 'border-1 border-black-primary'
    : ''}"
  {onclick}
>
  <img {src} {alt} class="h-full w-full object-cover" />
</button>
