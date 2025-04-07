<script lang="ts">
  import { tryOnStore } from "$lib/state/vto.svelte";
  import ImageUploadV2 from "$lib/components/form/image-upload-v2.svelte";
  import { goto } from "$app/navigation";
  import Title from "$lib/components/text/title.svelte";
  import Subtitle from "$lib/components/text/subtitle.svelte";
  import Dialog from "$lib/components/dialog/dialog.svelte";
  import BodyGuide from "$lib/content/vto-dialogs/bodyGuide.svelte";
  import Or from "$lib/components/text/or.svelte";
  import Button from "$lib/components/buttons/button.svelte";
  import Qrcode from "$lib/content/vto-qr/qrcode.svelte";
  import StepIndicator from "$lib/components/visualiser/stepIndicator.svelte";
  import { applyAction } from "$app/forms";
  import { subscribeToUploadChanges } from "$lib/clientUtil/realtime";
  import type { RealtimeChannel } from "@supabase/supabase-js";

  import type { PageProps } from "./$types";
  import { enhance } from "$app/forms";
  import { onDestroy, onMount } from "svelte";

  let { data }: PageProps = $props();
  let { supabase } = data;

  let openQR = $state(false);

  let tryOn = tryOnStore();
  let file = $state<File | null>(tryOn.modelImageFile || null);

  function uploadBodyImage() {
    if (file) {
      tryOn.modelImageFile = file;
    }
  }

  let channelSubscription: RealtimeChannel;
  let showLoader = $state(false);

  const token = crypto.randomUUID(); // token is unique every component
  onMount(() => {
    channelSubscription = subscribeToUploadChanges(
      supabase,
      token,
      (newFile: File) => {
        file = newFile;
      }
    );
  });

  onDestroy(() => {
    if (channelSubscription) {
      supabase.removeChannel(channelSubscription);
    }
  });
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
        <StepIndicator steps={3} activeStep={1} />
      </div>
    </div>

    <div class="flex flex-col gap-1 justify-center items-start">
      <!-- TITLE -->
      <div class="lg:mb-4 flex flex-col gap-1">
        <div class="hidden lg:block mb-4">
          <StepIndicator steps={3} activeStep={1} />
        </div>
        <Title title="Upload your body image" level="h1" />
        <Subtitle>
          <div>
            <p>Upload your image with:</p>
            <ul>
              <li>Plain Background</li>
              <li>Full body with full visibility</li>
              <li>Straight arms</li>
              <li>One Person</li>
            </ul>
          </div>
        </Subtitle>
      </div>
      <!-- END TITLE -->

      <!-- SHOW EXAMPLE BUTON -->
      <Dialog title={"Your Image Examples"}>
        <BodyGuide />
      </Dialog>
      <!-- END SHOW EXAMPLE BUTTON -->
    </div>
  </div>
  <div class="flex flex-col gap-2 w-full max-w-[30rem]">
    <!-- UPLOAD IMAGE BOX -->
    <ImageUploadV2
      bind:file
      placeholder="Click to upload image"
      name="body-image"
    />

    <!-- BUTTONS UNDER BOX -->
    <form
      action="?/flag"
      method="post"
      use:enhance={() => {
        uploadBodyImage();
        showLoader = true;
        return async ({ result }) => {
          await applyAction(result);
          goto("/beta/vto-test/clothing-image-upload");
        };
      }}
    >
      <Button
        disabled={!file}
        text="Continue"
        style="primary"
        type="submit"
        loading={showLoader}
        fullWidth={true}
      />
    </form>
    <!-- END BUTTONS UNDER BOX -->
    <div class="hidden lg:block w-full">
      <Or />
      {#if file}
        <Button
          text="Reupload image from phone"
          style="secondary"
          fullWidth={true}
          onclick={() => (openQR = true)}
        />
      {:else}
        <Button
          text="Upload image from phone"
          fullWidth={true}
          style="secondary"
          onclick={() => (openQR = true)}
        />
      {/if}
    </div>

    <Dialog bind:open={openQR} button={false} title={"Upload image from phone"}>
      <Qrcode {token} />
    </Dialog>
  </div>
</div>