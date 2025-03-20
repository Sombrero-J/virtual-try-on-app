<script lang="ts">
  import { tryOnStore } from "$lib/state/vto.svelte";
  import {
    fetchQueryTask,
    downloadFileFromBlob,
    fetchSubmitTask,
  } from "./utils";
  import Title from "$lib/components/text/title.svelte";
  import Subtitle from "$lib/components/text/subtitle.svelte";
  import Back from "$lib/components/buttons/back.svelte";
  import ImageScan from "$lib/components/imageScan/imageScan.svelte";
  import { page } from "$app/state";
  import { onMount } from "svelte";
  import ImageGenV2 from "$lib/components/form/image-gen-v2.svelte";
  import Button from "$lib/components/buttons/button.svelte";
  import { goto } from "$app/navigation";
  import { enhance } from "$app/forms";
  import type { SubmitFunction } from "@sveltejs/kit";
  import StepIndicator from "$lib/components/visualiser/stepIndicator.svelte";

  let tryOn = tryOnStore();
  let modelFile = tryOn.modelImageFile;
  let taskID = $state("");
  let clothingFile = tryOn.clothingImageFile;

  let tryOnUrl = $state("");
  let progress = $state(10);
  onMount(async () => {
    checkState();
    const pendingSave = page.url.searchParams.get("autoSave") === "true";
    if (pendingSave) {
      console.log("need to save.");
    }
    try {
      const { data, error } = await fetchSubmitTask();
      progress = 30;
      if (data) {
        taskID = data;
        setTimeout(async () => {
          progress = 80;
          const res = await fetchQueryTask(data);
          if (res.url) {
            progress = 100;
            tryOnUrl = res.url;
            tryOn.tryonImageUrl = tryOnUrl;
          } else if (res.error) {
            alert("Something went wrong: " + res.error);
          }
        }, 10000);
      } else if (error) {
        alert(error);
      }
    } catch (error) {
      alert(error);
    }
  });

  const saveToWardrobe: SubmitFunction = ({ formData, cancel }) => {
    if (taskID && clothingFile && modelFile) {
      formData.append("taskID", taskID);
      formData.append("clothingFile", clothingFile);
      formData.append("modelFile", modelFile);
      formData.append("tryonUrl", tryOnUrl);
    } else {
      alert("Something went wrong. Please try again.");
      cancel();
    }

    return async ({ result }) => {
      if (result.type == "success") {
        console.log("Data: " + result.data);
        goto("/beta/wardrobe");
      } else if (result.type == "failure") {
        alert("Saving failed: " + result.data);
      }
    };
  };

  const checkState = () => {
    if (!tryOn.modelImageFile || !tryOn.clothingImageFile) {
      goto("/beta/vto-test/body-image-upload");
    }
  };
</script>

<div
  class="flex flex-col lg:flex-row justify-between items-start gap-5 lg:gap-40 lg:pt-20 flex-1 py-8 w-8/10"
>
  <div
    class="relative flex flex-col justify-between lg:justify-center lg:min-h-[40rem] w-full"
  >
    <!-- Small screen -->
    <div class="block lg:hidden">
      <div class="relative flex justify-center items-center mb-8 w-full">
        <div class="absolute left-0">
          <Back gotoPath="/beta/vto-test/body-image-upload" />
        </div>
        <StepIndicator steps={3} activeStep={3} />
      </div>
    </div>
    <!-- Large screen -->
    <div class="hidden lg:block">
      <div class="absolute left-0 top-0">
        <Back gotoPath="/beta/vto-test/body-image-upload" />
      </div>
    </div>

    <div class="flex flex-col gap-1 justify-center items-start">
      <!-- TITLE -->
      <div class="lg:mb-4 flex flex-col gap-1">
        <div class="hidden lg:block mb-4">
          <StepIndicator steps={3} activeStep={2} />
        </div>
        <Title title="Virtual Try On Generation" level="h1" />
        <Subtitle>
          {#if tryOnUrl}
            <div>
              <p>Congratulations! Try On Completed!</p>
            </div>
          {:else}
            <div>
              <p>It may take up to 14-20 seconds to generate</p>
            </div>
          {/if}
        </Subtitle>
      </div>
      <!-- END TITLE -->
    </div>
  </div>
  <div class="flex flex-col gap-2 w-full max-w-[30rem]">
    {#if tryOnUrl}
      <ImageGenV2 imageUrl={tryOnUrl}>
        {#snippet button()}
          <div class="flex flex-col gap-2">
            <div class="flex justify-center items-center gap-2">
              <Button
                text="Restart"
                type="button"
                style="secondary"
                onclick={() => goto("/beta/vto-test/body-image-upload")}
              />
              <Button
                text="Download"
                type="submit"
                style="secondary"
                onclick={() => downloadFileFromBlob(tryOnUrl)}
              />
            </div>
            <form
              action="?/save"
              method="post"
              enctype="multipart/form-data"
              use:enhance={saveToWardrobe}
            >
              <Button text="Save to wardrobe" fullWidth={true} />
            </form>
          </div>
        {/snippet}
      </ImageGenV2>
    {:else}
      <ImageScan imageFile={modelFile} progress={progress} />
    {/if}
  </div>
</div>