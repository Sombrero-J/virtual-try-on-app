<script lang="ts">
  interface Props {
    text?: string;
    onclick?: () => void;
  }

  let { text = "Default text", onclick}: Props = $props();
</script>

<button class="text-brand-purple hover:text-black cursor-pointer font-medium text-sm md:text-2xl" {onclick}>
  {text}
</button>