<script lang="ts">
  let { selected = false }: { selected?: boolean } = $props();

  let color = $derived(selected ? "#0373B3" : "#8F9294");
</script>

<svg
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="25"
  viewBox="0 0 24 25"
  fill="none"
>
  <g clip-path="url(#clip0_43_839)">
    <path
      d="M6.99996 18.5002C5.75223 18.5002 4.55561 18.0261 3.67334 17.1822C2.79107 16.3383 2.29541 15.1937 2.29541 14.0002C2.29541 12.8067 2.79107 11.6621 3.67334 10.8182C4.55561 9.9743 5.75223 9.5002 6.99996 9.5002C7.29464 8.18737 8.15672 7.03368 9.39654 6.29291C10.0104 5.92612 10.6986 5.67174 11.4217 5.54431C12.1449 5.41687 12.8888 5.41887 13.6111 5.5502C14.3333 5.68152 15.0198 5.93959 15.6312 6.30968C16.2427 6.67976 16.7672 7.15461 17.1747 7.70712C17.5823 8.25963 17.8649 8.87898 18.0065 9.52979C18.1481 10.1806 18.1459 10.8502 18 11.5002H19C19.9282 11.5002 20.8185 11.8689 21.4748 12.5253C22.1312 13.1817 22.5 14.0719 22.5 15.0002C22.5 15.9285 22.1312 16.8187 21.4748 17.4751C20.8185 18.1314 19.9282 18.5002 19 18.5002H18"
      stroke={color}
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <path
      d="M9 15.5L12 12.5L15 15.5"
      stroke={color}
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <path
      d="M12 12.5V21.5"
      stroke={color}
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </g>
  <defs>
    <clipPath id="clip0_43_839">
      <rect width="24" height="24" fill="white" transform="translate(0 0.5)" />
    </clipPath>
  </defs>
</svg>
