<script lang="ts">
  import { goto } from "$app/navigation";
  interface Props {
    gotoPath: string;
  }

  let { gotoPath }: Props = $props();
</script>

<button
  onclick={() => goto(gotoPath)}
  class="flex justify-center items-center gap-1 text-black-primary text-2xl font-medium border-0 bg-transparent cursor-pointer"
>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
  >
    <path
      d="M15.5348 3.51501L7.0498 12L15.5348 20.485L16.9498 19.071L9.8778 12L16.9498 4.92901L15.5348 3.51501Z"
      fill="#0F121A"
    />
  </svg>
  Back
</button>