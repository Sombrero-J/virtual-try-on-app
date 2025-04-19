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
	import avatar from '$lib/assets/user/Avatar.png';

	import { goto } from '$app/navigation';
	import Button from '$lib/components/buttons/button.svelte';
	import EditProfile from '$lib/svg/small/profile/editProfile.svelte';

	let { data }: { data: PageData } = $props();
</script>

<section class="flex h-full flex-col items-stretch justify-between p-4">
	<div class="flex flex-col items-stretch justify-start gap-2">
		<header class="flex flex-col items-center justify-center text-center">
			<div class="relative mb-3">
				<img src={avatar} alt="avatar" />
				<button class=" absolute -top-1 -right-1 cursor-pointer" onclick={() => {}}>
					<EditProfile />
				</button>
			</div>
			<h1>Profile Name</h1>
			<p>Member since 2025</p>
		</header>

		<Section title="General">
			<div>
				<SectionButton text="My Photos" onclick={() => goto('/profile/my-photos')}>
					{#snippet lefticon()}
						<Photos />
					{/snippet}
				</SectionButton>
			</div>
		</Section>

		<Section title="Support">
			<div>
				<SectionButton text="Contact us" onclick={() => goto('/help')}>
					{#snippet lefticon()}
						<Help />
					{/snippet}
				</SectionButton>
			</div>
		</Section>
		<Section title="Account Security">
			<div>
				<SectionButton text="Change password" onclick={() => goto('/profile/change-password')}>
					{#snippet lefticon()}
						<Lock />
					{/snippet}
				</SectionButton>
			</div>
		</Section>

		<!-- <Section title="Help us grow">
			<div class="divide-border-gray divide-y-1">
				<SectionButton text="Our Social Media" onclick={() => goto('/socialmedia')}>
					{#snippet lefticon()}
					<Instagram />
					{/snippet}
					</SectionButton>
					<SectionButton text="Invite Friends" onclick={() => goto('/invite')}>
						{#snippet lefticon()}
						<Link />
						{/snippet}
						</SectionButton>
						<SectionButton text="Give Us A Feedback" onclick={() => goto('/feedback')}>
							{#snippet lefticon()}
							<Thumbsup />
							{/snippet}
							</SectionButton>
							</div>
							</Section> -->
		<Section title="Legal">
			<div class="divide-border-gray divide-y-1">
				<SectionButton text="Version" onclick={() => goto('/profile/version')}>
					{#snippet lefticon()}
						<Information />
					{/snippet}
				</SectionButton>
				<SectionButton text="Privacy Policy" onclick={() => goto('/profile/privacy-policy')}>
					{#snippet lefticon()}
						<Lock />
					{/snippet}
				</SectionButton>
				<SectionButton text="Terms of Service" onclick={() => goto('/profile/terms')}>
					{#snippet lefticon()}
						<Noteboard />
					{/snippet}
				</SectionButton>
			</div>
		</Section>

		<div>
			<SectionButton text="Delete Account" onclick={() => goto('/profile/delete-account')}>
				{#snippet lefticon()}
					<Trashcan />
				{/snippet}
			</SectionButton>
		</div>
	</div>
	<Button
		twClass="justify-self-end"
		text="Log out"
		style="secondary"
		fullWidth={true}
		onclick={() => goto('/auth/logout')}
	/>
</section>
