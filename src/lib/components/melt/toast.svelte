<script lang="ts" module>
  import type { AddToastProps } from "melt/builders";
  type ToastData = {
    type: "success" | "error" | "warning" | "info";
    title: string;
    description: string;
  };

  const toaster = new Toaster<ToastData>({
    closeDelay: () => 2000,
    type: () => "polite", // can be MaybeGetter<"assertive" | "polite" | undefined>
    hover: () => "pause",
  });

  export const addToast = (props: AddToastProps<ToastData>) =>
    toaster.addToast(props);
</script>

<script lang="ts">
  import { fly } from "svelte/transition";
  import { Toaster } from "melt/builders";
  import { onMount } from "svelte";

  import Success from "$lib/svg/indicators/success.svelte";
  // import Error from "$lib/svg/indicators/error.svelte";
  import Warning from "$lib/svg/indicators/warning.svelte";
  // import Info from "$lib/svg/indicators/info.svelte";
</script>

<!-- Some browsers automatically apply the inset CSS property to elements with the popover attribute (which toaster.root has due to popover: "manual"). Need to explicitly unset the inset property so bottom-4 right-4 styles work.-->
<div
  {...toaster.root}
  class="!fixed !bottom-4 !right-4 inset-auto flex w-[300px] flex-col gap-2 overflow-hidden"
>
  {#each toaster.toasts as toast (toast.id)}
    <div
      class="flex justify-between items-start bg-white rounded-lg shadow-lg p-4 border border-gray-200"
      transition:fly={{ y: 50 }}
    >
      <div class="flex flex-col justify-center items-start">
        <div class="flex justify-start items-center gap-2">
          {#if toast.data.type === "success"}
            <Success />
            <!-- {:else if toast.data.type === "error"}
        <Error /> -->
          {:else if toast.data.type === "warning"}
            <Warning />
            <!-- {:else if toast.data.type === "info"}
        <Info /> -->
          {/if}
          <h3 {...toast.title} class="font-medium text-black-primary">
            {toast.data.title}
          </h3>
        </div>
        <div {...toast.description} class="text-sm text-black-tertiary">
          {toast.data.description}
        </div>
      </div>
      <button
        {...toast.close}
        aria-label="dismiss alert"
        class="text-gray-400 hover:text-gray-600"
      >
        X
      </button>
    </div>
  {/each}
</div>
