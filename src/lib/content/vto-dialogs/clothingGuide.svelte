<script lang="ts">
  import frame1 from "$lib/assets/guides/clothing/allowed/frame-1.png?enhanced";
  import frame2 from "$lib/assets/guides/clothing/allowed/frame-2.png?enhanced";
  import frame3 from "$lib/assets/guides/clothing/allowed/frame-3.png?enhanced";
  import frame4 from "$lib/assets/guides/clothing/allowed/frame-4.png?enhanced";
  import frame5 from "$lib/assets/guides/clothing/allowed/frame-5.png?enhanced";
  import frame6 from "$lib/assets/guides/clothing/allowed/frame-6.png?enhanced";

  import frame7 from "$lib/assets/guides/clothing/avoid/frame-7.png?enhanced";
  import frame8 from "$lib/assets/guides/clothing/avoid/frame-8.png?enhanced";
  import frame9 from "$lib/assets/guides/clothing/avoid/frame-9.png?enhanced";
  import frame10 from "$lib/assets/guides/clothing/avoid/frame-10.png?enhanced";
  import frame11 from "$lib/assets/guides/clothing/avoid/frame-11.png?enhanced";
  import frame12 from "$lib/assets/guides/clothing/avoid/frame-12.png?enhanced";

  const allowedImages = [frame1, frame2, frame3, frame4, frame5, frame6];
  const avoidImages = [frame7, frame8, frame9, frame10, frame11, frame12];
</script>

<!-- https://sveltekit.io/blog/sveltekit-images#using-the-sveltekit-enhanced-img-method -->

<div class="flex flex-col md:flex-row justify-between gap-5">
  <!-- Upload These -->
  <div class="w-full md:w-1/2">
    <h3 class="text-sm lg:text-3xl font-medium text-center text-black mb-3">
      Upload these
    </h3>
    <div class="grid grid-cols-2 lg:grid-cols-3 gap-3">
      {#each allowedImages as img}
        <div class=" rounded-lg overflow-hidden shadow-md">
          <enhanced:img src={img} alt="guide one" />
        </div>
      {/each}
    </div>
  </div>

  <div class="w-px self-stretch bg-gray-300"></div>

  <!-- Avoid These -->
  <div class="w-full md:w-1/2">
    <h3 class="text-sm lg:text-3xl font-medium text-center text-black mb-3">
      Avoid these
    </h3>
    <div class="grid grid-cols-2 lg:grid-cols-3 gap-3">
      {#each avoidImages as img}
        <div class="relative rounded-lg overflow-hidden shadow-md">
          <enhanced:img src={img} alt="guide one" />
        </div>
      {/each}
    </div>
  </div>
</div>
