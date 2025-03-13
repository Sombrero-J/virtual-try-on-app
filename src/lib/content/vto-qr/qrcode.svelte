<script lang="ts">
  import QRCode from "qrcode";
  import { page } from "$app/state";
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";

  let qrCodeDataUrl = $state("");
  let url = $state("");
  let origin = $derived(page.url.origin);

  interface Props {
    token: string;
  }

  let { token }: Props = $props();

  const generateQrCode = async () => {
    try {
      url = origin + "/beta/phone-upload?sessionId=" + token;
      qrCodeDataUrl = await QRCode.toDataURL(url);
    } catch (error) {
      alert("Error generating qrcode: " + error);
    }
  };

  onMount(() => {
    generateQrCode();
  });
</script>

<img src={qrCodeDataUrl} alt={qrCodeDataUrl} />
<a href={url}>go to phone upload</a>
