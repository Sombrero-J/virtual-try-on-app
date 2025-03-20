<script lang="ts">
  import Toast, { addToast } from "$lib/components/melt/toast.svelte";
  import Label from "$lib/components/label.svelte";
  import Button from "$lib/components/buttons/button.svelte";
  import ImageUploadV2 from "$lib/components/form/image-upload-v2.svelte";
  import type { PageProps } from "./$types";
  import { enhance } from "$app/forms";

  let { form }: PageProps = $props();
</script>

<div class="flex flex-col gap-4 w-1/2">
  <form
    method="post"
    enctype="multipart/form-data"
    action="?/chatgpt"
    use:enhance
  >
    <ImageUploadV2 placeholder="Click to upload image" name="image" />
    <Button text="Detect" type="submit" fullWidth={true} />
  </form>
  <!--   
  <form method="post" enctype="multipart/form-data" action="?/detect" use:enhance>
    <ImageUploadV2 placeholder="Click to upload image" name="image" />
    <Button text="Detect" type="submit" />
  </form> -->
</div>

{#if form?.success}
  <p>Description: {form?.result.description}</p>
  <p>Brand: {form?.result.brand}</p>
  <p>Color: {form?.result.color}</p>
  <p>Material: {form?.result.material}</p>
  <p>Category: {form?.result.category}</p>
{/if}

{#if !form?.success}
  <p>{form?.error}</p>
{/if}
