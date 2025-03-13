<script lang="ts">
  import type { ComponentProps } from "melt";
  import { FileUpload, getters, type FileUploadProps } from "melt/builders";
  import Icons from "$lib/svg/icons.svelte";
  import uploadIllus from "$lib/svg/uploadIllus.svg";

  type Props = ComponentProps<FileUploadProps<boolean>> & {
    placeholder?: string;
    required?: boolean;
  };

  let previewUrl = $state("");
  let previewUrls = $state<[string]>([""]);
  let { placeholder, multiple, ...rest }: Props = $props();

  const fileUpload = new FileUpload({
    multiple: () => multiple,
    accept: "image/*",
    maxSize: 10 * 1024 * 1024,
    onSelectedChange: (files) => {
      if (files instanceof File) {
        previewUrl = URL.createObjectURL(files);
      } else if (files instanceof Set && files.size > 0) {
        files.forEach((file) => {
          previewUrls.push(URL.createObjectURL(file));
        });
      }
    },
    onError: (error) => alert(`Upload error: ${error.message}`),
  });
</script>

<div class="font-primary cursor-pointer aspect-2/3 w-75/100 max-w-sm shadow-md shadow-brand-purple/15">
  {#if previewUrl}
    <img src={previewUrl} alt="Preview" class="w-full" />
    <div>
      <Icons name="restart" width="24px" height="24px" />
      <p>Replace photo</p>
    </div>
  {/if}
  <div
    {...fileUpload.dropzone}
    class="w-full h-full bg-brand-blue flex flex-col justify-center items-center gap-10 text-base lg:text-2xl text-brand-purple"
  >
    <img src={uploadIllus} alt="upload direction" />
    {#if fileUpload.isDragging}
      <p>Drop files here</p>
    {:else}
      <p>Click to upload or drag and drop</p>
    {/if}
  </div>
  <input {...fileUpload.input} />
</div>
