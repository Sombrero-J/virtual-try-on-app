<script lang="ts">
  import Button from "$lib/components/buttons/button.svelte";
  import Dialog from "$lib/components/dialog/dialog.svelte";
  import { goto } from "$app/navigation";
  import Textbox from "../form/textbox.svelte";

  let { items, tabs = "Images" } = $props();

  let openDialog = $state(false);
  let openClothingDialog = $state(false);
  let selectedItemID = $state(0);
  let selectedItem = $derived(
    items.find((item: any) => item.id === selectedItemID)
  );
</script>

<div
  class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-3 lg:gap-4"
>
  <button
    class="bg-gray-100 rounded-lg shadow-sm aspect-square flex items-center justify-center cursor-pointer text-black-primary text-5xl font-bold"
    onclick={() => {
      openDialog = true;
    }}
    >+
  </button>
  {#each items as item (item.id)}
    <button
      class="bg-gray-100 rounded-lg shadow-sm aspect-square flex items-center justify-center cursor-pointer overflow-hidden"
      onclick={() => {
        openClothingDialog = true;
        selectedItemID = item.id;
      }}
    >
      <img
        src={item.signed_front}
        alt="front side of ${item.name}"
        class="h-full w-full object-cover"
      />
    </button>
  {/each}
</div>

<Dialog button={false} title="Create" bind:open={openDialog} understood={false}>
  <div class="w-full flex flex-col gap-2">
    <Button
      text="Try on clothing"
      fullWidth={true}
      onclick={() => {
        goto("/");
      }}
    />
    <Button text="Add clothing to wardrobe" fullWidth={true} />
  </div>
</Dialog>

<Dialog
  button={false}
  title="Clothing details is the best here"
  bind:open={openClothingDialog}
  understood={false}
>
  <div class="w-full flex flex-col gap-2">
    <img
      src={selectedItem.signed_front}
      alt="front side of ${selectedItem.name}"
      class="h-40 lg:h-90 w-auto object-contain"
    />
    <Textbox name="name" label="Name" />
    <Textbox name="description" label="Description" />
  </div>
</Dialog>
