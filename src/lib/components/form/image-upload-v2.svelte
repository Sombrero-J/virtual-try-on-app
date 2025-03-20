<script lang="ts">
  import uploadIllus from "$lib/svg/uploadIllus.svg";
  import Icons from "$lib/svg/icons.svelte";
  import { addToast } from "$lib/components/melt/toast.svelte";
  import UploadClothing from "$lib/svg/small/uploadClothing.svelte";
  interface Props {
    placeholder?: string;
    name?: string;
    file?: File | null;
    required?: boolean;
  }

  let {
    placeholder = "Default Placeholder",
    name = "",
    file = $bindable(),
    required = true,
  }: Props = $props();

  function handleFileChange(event: any) {
    imageURl = URL.createObjectURL(event.target.files[0]);
    file = event.target.files[0]; // to pass the file to the parent, for saving purposes
    addToast({
      data: {
        type: "success",
        title: "Success",
        description: "Image uploaded successfully!",
      },
    });
  }

  let imageURl = $derived.by(() => {
    if (file) {
      return URL.createObjectURL(file);
    }
    return null;
  });
</script>

<div
  class="relative text-center flex flex-col h-[20rem] w-full justify-center items-center gap-5 rounded-lg border-1 border-dashed border-brand bg-brand-secondary lg:h-[40rem]"
>
  {#if imageURl}
    <img
      src={imageURl}
      alt="A Full Body"
      class="h-full w-full object-contain rounded-lg"
    />
    <div
      class="flex gap-2 items-center justify-center pointer-events-none absolute top-[10px] right-[10px]"
    >
      <Icons name="restart" width="24px" height="24px" />
      <p class="text-brand text-xl font-medium">Replace photo</p>
    </div>
  {:else}
    <div class="lg:hidden">
      <UploadClothing />
    </div>
    <div class="hidden lg:block">
      <img src={uploadIllus} alt="" />
    </div>
    <p class=" text-brand text-sm lg:text-2xl font-medium">
      {placeholder}
    </p>
    <div class="flex flex-col gap-1">
      <p class="text-black-primary text-sm lg:text-2xl font-medium">
        JPG, PNG, WebP
      </p>
      <p class="text-black-tertiary text-xs lg:text-xl font-medium">
        Not more than 3MB
      </p>
    </div>
  {/if}
  <input
    {name}
    type="file"
    id="imageUpload"
    class="h-full w-full opacity-0 cursor-pointer absolute"
    accept="image/*"
    {required}
    onchange={handleFileChange}
  />
</div>