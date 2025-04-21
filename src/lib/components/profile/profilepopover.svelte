<script lang="ts">
	import { innerWidth } from 'svelte/reactivity/window';
	import { Popover } from 'melt/builders';
	import ProfileHead from '$lib/svg/small/wardrobe/profileHead.svelte';

	import SectionButton from '$lib/components/profile/sectionbutton.svelte';
	import Photos from '$lib/svg/small/profile/photos.svelte';
	import Logout from '$lib/svg/small/profile/logout.svelte';
	import Trashcan from '$lib/svg/small/profile/trashcan.svelte';
	import Thumbsup from '$lib/svg/small/profile/thumbsup.svelte';
	import Link from '$lib/svg/small/profile/link.svelte';
	import Help from '$lib/svg/small/profile/help.svelte';
	import { goto } from '$app/navigation';
	import Dialog from '$lib/components/dialog/dialog.svelte';
	import Button from '$lib/components/buttons/button.svelte';

	const popover = new Popover({
		floatingConfig: {
			computePosition: {
				placement: 'bottom-end'
			}
		}
	});

	let opendeleteaccount = $state(false);
	let openlogout = $state(false);
	let { user } = $props();
</script>

<button {...popover.trigger} class="absolute right-15 cursor-pointer">
	<ProfileHead />
</button>

<div {...popover.content} class="bg-white-primary rounded-2xl p-5 shadow-lg">
	<div class="flex w-[20rem] flex-col items-start justify-start gap-5">
		<div class="flex flex-col items-start justify-center">
			<h1 class="text-black-primary text-2xl">{user ? 'Welcome back' : 'Welcome'}</h1>
			<p class="text-black-tertiary text-base">{user?.email}</p>
		</div>
		<div class="divide-border-gray w-full divide-y-1">
			{#if user}
				<SectionButton text="My photos" onclick={() => goto('/profile/my-photos')}>
					{#snippet lefticon()}
						<Photos />
					{/snippet}
				</SectionButton>
				<SectionButton
					text="Delete account"
					onclick={() => {
						opendeleteaccount = !opendeleteaccount;
					}}
				>
					{#snippet lefticon()}
						<Trashcan />
					{/snippet}
				</SectionButton>
				<SectionButton
					text="Log out"
					onclick={() => {
						openlogout = !openlogout;
					}}
				>
					{#snippet lefticon()}
						<Logout />
					{/snippet}
				</SectionButton>
			{:else}
				<SectionButton
					text="Sign up"
					onclick={() => {
						goto('/auth/signup');
					}}
				>
					{#snippet lefticon()}
						<Logout />
					{/snippet}
				</SectionButton>
				<SectionButton
					text="Log in"
					onclick={() => {
						goto('/auth/login');
					}}
				>
					{#snippet lefticon()}
						<Logout />
					{/snippet}
				</SectionButton>
			{/if}
			<!-- <SectionButton text="Contact us" onclick={() => goto('/profile/help')}>
				{#snippet lefticon()}
					<Help />
				{/snippet}
			</SectionButton>
			<SectionButton text="Invite friends" onclick={() => goto('/profile/invite')}>
				{#snippet lefticon()}
					<Link />
				{/snippet}
			</SectionButton>
			<SectionButton text="Give us a feedback" onclick={() => goto('/profile/feedback')}>
				{#snippet lefticon()}
					<Thumbsup />
				{/snippet}
			</SectionButton> -->
		</div>
	</div>
</div>

<Dialog title="Delete Account" open={opendeleteaccount} textButton={false}>
	<div class="flex w-full flex-col items-center justify-start gap-5">
		<h1 class="text-black-secondary text-xl">Are you sure that you want to delete your account?</h1>
		<div class="flex w-full gap-2">
			<Button text="Delete account" fullWidth={true} />
			<Button text="Cancel" style="secondary" fullWidth={true} />
		</div>
	</div></Dialog
>

<Dialog title="Log out" open={openlogout} textButton={false}>
	<div class="flex w-full flex-col items-center justify-start gap-5">
		<h1 class="text-black-secondary text-xl">Are you sure that you want to log out?</h1>
		<div class="flex w-full gap-2">
			<Button text="Log out" onclick={() => goto('/auth/logout')} fullWidth={true} />
			<Button text="Cancel" style="secondary" fullWidth={true} />
		</div>
	</div></Dialog
>
