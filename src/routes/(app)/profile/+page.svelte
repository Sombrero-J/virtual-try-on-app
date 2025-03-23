<script lang="ts">
	import Section from '$lib/components/profile/section.svelte';
	import type { PageData } from './$types';
	import SectionButton from '$lib/components/profile/sectionbutton.svelte';
	import Photos from '$lib/svg/small/profile/photos.svelte';
	import Trashcan from '$lib/svg/small/profile/trashcan.svelte';
	import Noteboard from '$lib/svg/small/profile/noteboard.svelte';
	import Lock from '$lib/svg/small/profile/lock.svelte';
	import Information from '$lib/svg/small/profile/information.svelte';
	import Thumbsup from '$lib/svg/small/profile/thumbsup.svelte';
	import Link from '$lib/svg/small/profile/link.svelte';
	import Instagram from '$lib/svg/small/profile/instagram.svelte';
	import Help from '$lib/svg/small/profile/help.svelte';

	let { data }: { data: PageData } = $props();
</script>

<section class="flex flex-col gap-2">
	<header>
		<h1>Profile Name</h1>
		<p>Member since 2025</p>
	</header>

	<Section title="General">
		<SectionButton text="My Photos">
			{#snippet lefticon()}
				<Photos />
			{/snippet}
		</SectionButton>
	</Section>

	<Section title="Support">
		<SectionButton text="Help">
			{#snippet lefticon()}
				<Help />
			{/snippet}
		</SectionButton>
	</Section>

	<Section title="Help us grow">
		<SectionButton text="Our Social Media">
			{#snippet lefticon()}
				<Instagram />
			{/snippet}
		</SectionButton>
		<SectionButton text="Invite Friends">
			{#snippet lefticon()}
				<Link />
			{/snippet}
		</SectionButton>
		<SectionButton text="Give Us A Feedback">
			{#snippet lefticon()}
				<Thumbsup />
			{/snippet}
		</SectionButton>
	</Section>
	<Section title="Legal">
		<SectionButton text="Version">
			{#snippet lefticon()}
				<Information />
			{/snippet}
		</SectionButton>
		<SectionButton text="Privacy Policy">
			{#snippet lefticon()}
				<Lock />
			{/snippet}
		</SectionButton>
		<SectionButton text="Terms of Service">
			{#snippet lefticon()}
				<Noteboard />
			{/snippet}
		</SectionButton>
	</Section>

	<SectionButton text="Delete Account">
		{#snippet lefticon()}
			<Trashcan />
		{/snippet}
	</SectionButton>
</section>
