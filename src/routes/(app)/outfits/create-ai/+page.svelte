<script lang="ts">
	import Button from '$lib/components/buttons/button.svelte';
	import Radiogroup from '$lib/components/outfits/radiogroup.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<form
	action="?/create"
	method="post"
	class="mx-auto flex h-full max-w-9/10 flex-col items-start justify-start gap-4 overflow-y-auto py-5"
>
	<Radiogroup
		items={['Networking', 'Celebration', 'Professional', 'Other']}
		label="Purpose"
		name="purpose"
	/>
	<Radiogroup
		items={[
			'Casual Wear',
			'Business Casual',
			'Business Formal',
			'Sportswear',
			'Costume',
			'Other'
		]}
		label="Dress Code"
		name="dress_code"
	/>
	<Radiogroup
		items={['Indoor', 'Outdoor', 'Beach', 'Rooftop', 'Other']}
		label="Location"
		name="location"
	/>
	<Radiogroup
		items={['Morning', 'Afternoon', 'Evening', 'Night', 'Other']}
		label="Time of Day"
		name="time_of_day"
	/>
	<Button text="Generate outfit for me" style="primary" size="large" fullWidth={true} type="submit" />
</form>
