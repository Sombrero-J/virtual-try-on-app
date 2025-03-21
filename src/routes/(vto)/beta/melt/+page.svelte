<script lang="ts">
  import Toast, { addToast } from "$lib/components/melt/toast.svelte";
  import Label from "$lib/components/label.svelte";
  import Button from "$lib/components/buttons/button.svelte";
  import ImageUploadV2 from "$lib/components/form/image-upload-v2.svelte";
  import type { PageProps } from "./$types";
  import { enhance } from "$app/forms";
  import Progress from "$lib/components/melt/progress.svelte";

  let { form }: PageProps = $props();
  let progress = $state(0);

  function startProgress(
    startValue: number,
    stopValue: number,
    durationInSeconds: number
  ) {
    progress = startValue;

    if (startValue >= stopValue || durationInSeconds <= 0) return;

    const interval = 50;
    const totalSteps = (durationInSeconds * 1000) / interval;
    const step = (stopValue - startValue) / totalSteps;

    let intervalId = setInterval(() => {
      if (progress >= stopValue) {
        progress = stopValue;
      } else {
        progress += step;
      }
    }, interval);
    return () => clearInterval(intervalId);
  }
</script>

<div class="flex gap-4">
  <form
    method="post"
    enctype="multipart/form-data"
    action="?/chatgpt"
    use:enhance
  >
    <ImageUploadV2 placeholder="Click to upload image" name="image" />
    <Button text="Detect" type="submit" />
  </form>
  <!--   
  <form method="post" enctype="multipart/form-data" action="?/detect" use:enhance>
    <ImageUploadV2 placeholder="Click to upload image" name="image" />
    <Button text="Detect" type="submit" />
  </form> -->
</div>

{#if form?.success}
  <p>{form?.result}</p>
{/if}

{#if !form?.success}
  <p>{form?.error}</p>
{/if}
