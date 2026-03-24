<script lang="ts">
	import { t } from '$lib/i18n';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	const T = $derived(t(data.lang));
	const TOS = $derived(T.terms);

	type Section = { title: string; body: string };
	const sections = $derived(Object.values(TOS.sections) as Section[]);
</script>

<svelte:head>
	<title>{TOS.title} — JustUUID</title>
</svelte:head>

<div class="legal-page container">
	<header class="legal-header">
		<h1>{TOS.title}</h1>
		<p class="updated">{TOS.lastUpdated}</p>
	</header>

	<article class="legal-content">
		{#each Object.values(TOS.sections) as section}
			<section>
				<h2>{section.title}</h2>
				<p>{section.body}</p>
			</section>
		{/each}
	</article>
</div>

<style>
	.legal-page {
		max-width: 720px;
		padding-block: var(--space-12) var(--space-16);
	}

	.legal-header {
		margin-bottom: var(--space-8);
		padding-bottom: var(--space-6);
		border-bottom: 1px solid var(--border);
	}

	.legal-header h1 {
		font-size: 2rem;
		font-weight: 700;
		letter-spacing: -0.02em;
		margin-bottom: var(--space-2);
	}

	.updated {
		font-size: 0.875rem;
		color: var(--text-muted);
	}

	.legal-content {
		display: flex;
		flex-direction: column;
		gap: var(--space-8);
	}

	section h2 {
		font-size: 1.0625rem;
		font-weight: 600;
		margin-bottom: var(--space-3);
	}

	section p {
		color: var(--text-muted);
		line-height: 1.8;
	}
</style>
