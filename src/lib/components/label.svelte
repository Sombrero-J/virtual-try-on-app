<script lang="ts">
  interface Props {
    label?: string;
    target?: string;
  }

  let { label = "Default Label", target = "Default For" }: Props = $props();
</script>

<label class="text-black-primary text-base font-medium mb-1" for={target}>{label}</label>