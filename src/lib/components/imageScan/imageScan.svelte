<script lang="ts">
  import Progress from "$lib/components/melt/progress.svelte";
  interface Props {
    imageFile?: File | null;
    progress?: number;
  }

  let { imageFile = null, progress = 10 }: Props = $props();

  let imageUrl = $derived(imageFile ? URL.createObjectURL(imageFile) : null);
</script>

<div class="flex flex-col gap-8 justify-center items-center w-full">
  <div
    class="relative flex flex-col justify-center items-center overflow-hidden h-[23rem] w-full lg:h-[40rem] border-1 rounded-lg border-brand-purple bg-brand-blue"
  >
    <img
      src={imageUrl}
      alt="model uploaded by user"
      class="w-full h-full object-contain rounded-lg"
    />
    <div class="absolute left-0 w-full h-full bg-glass animate-scan">
      <div
        class="absolute -bottom-2 left-0 w-full h-[0.5rem] bg-brand-gradient"
      ></div>
    </div>
  </div>

  <Progress value={progress} />
  <p class="text-2xl font-medium">Generating...</p>
</div>
