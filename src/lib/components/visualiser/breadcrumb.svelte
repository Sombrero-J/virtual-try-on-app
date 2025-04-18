<script lang="ts">
	export type Crumb = {
		/**
		 * The text label to display for the breadcrumb.
		 */
		label: string;

		/**
		 * The URL (Uniform Resource Locator) the breadcrumb should link to.
		 */
		href?: string;
		onclick?: () => void;
	};

	interface Props {
		crumbs: Crumb[];
	}

	let { crumbs = [] }: Props = $props();

	// last index of the crumb array
	const lastIndex = $derived(crumbs.length - 1);
</script>

{#if crumbs.length > 0}
	<nav aria-label="breadcrumb">
		<!-- Use an ordered list for semantic structure -->
		<!-- You would add CSS classes here for styling, e.g., class="flex items-center space-x-2" -->
		<ol class="flex items-center justify-start gap-2">
			{#each crumbs as crumb, i}
				<li>
					{#if i === lastIndex}
						<!-- Last item: Display as text, mark as the current page -->
						<span aria-current="page" class="text-black-tertiary">{crumb.label}</span>
					{:else}
						<!-- Not the last item: Display as a link if href is provided -->
						{#if crumb.href}
							<a href={crumb.href}>{crumb.label}</a>
						{:else if crumb.onclick}
							<button class="cursor-pointer" onclick={crumb.onclick}>
								{crumb.label}
							</button>
						{:else}
							<!-- Fallback if a non-last item doesn't have an href (less common) -->
							<span>{crumb.label}</span>
						{/if}

						<!-- Separator (visally hidden from screen readers) -->
						<!-- You might use an SVG icon or different character -->
						<span aria-hidden="true">></span>
					{/if}
				</li>
			{/each}
		</ol>
	</nav>
{/if}
