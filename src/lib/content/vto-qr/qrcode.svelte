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
		stage: string;
	}

	let { token, stage }: Props = $props();

	const generateQrCode = async () => {
		try {
			url = origin + '/vto-test/phone-upload?sessionId=' + token + '&stage=' + stage;
			qrCodeDataUrl = await QRCode.toDataURL(url);
		} catch (error) {
			alert('Error generating qrcode: ' + error);
		}
	};

	onMount(() => {
		generateQrCode();
	});
</script>

<div class="flex flex-row items-center justify-center gap-4 p-5">
	<ol class="max-w-[15rem] list-inside list-decimal space-y-3 text-left">
		<li>Use your phone's camera to scan the QR code below.</li>
		<li>Follow the link on your phone to choose your photo.</li>
		<li>Confirm the upload on your phone. It will then appear here.</li>
	</ol>
	<img src={qrCodeDataUrl} alt={qrCodeDataUrl} />
</div>
