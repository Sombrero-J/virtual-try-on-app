<script lang="ts">
	import QRCode from 'qrcode';
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';

	let qrCodeDataUrl = $state('');
	let url = $state('');
	let origin = $derived(page.url.origin);

	interface Props {
		token: string;
	}

	let { token }: Props = $props();

	const generateQrCode = async () => {
		try {
			url = origin + '/beta/phone-upload?sessionId=' + token;
			qrCodeDataUrl = await QRCode.toDataURL(url);
		} catch (error) {
			alert('Error generating qrcode: ' + error);
		}
	};

	onMount(() => {
		generateQrCode();
	});
</script>

<div class="flex flex-col items-center justify-center gap-4">
	<ol>
		<li>Scan the QR code with your phone.</li>
		<li>The code will lead you to the upload page.</li>
		<li>Upload your photos and click "Submit".</li>
	</ol>
	<img src={qrCodeDataUrl} alt={qrCodeDataUrl} />
</div>
