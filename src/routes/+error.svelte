<script lang="ts">
	import { page } from '$app/stores';
	import { t } from '$lib/i18n';
	import type { LayoutData } from './$types';

	// Access lang from parent layout data
	const lang = $derived(($page.data as LayoutData).lang ?? 'en');
	const T = $derived(t(lang));
</script>

<svelte:head>
	<title>{T.errors.notFound} — JustUUID</title>
</svelte:head>

<div class="error-page container">
	<p class="status mono">{$page.status}</p>
	<h1>{$page.status === 404 ? T.errors.notFound : $page.error?.message}</h1>
	{#if $page.status === 404}
		<p class="desc">{T.errors.notFoundDesc}</p>
	{/if}
	<a href="/" class="btn btn-ghost">{T.errors.goHome}</a>
</div>

<style>
	.error-page {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		min-height: 60dvh;
		text-align: center;
		gap: var(--space-4);
	}

	.status {
		font-size: 5rem;
		font-weight: 700;
		color: var(--text-subtle);
		line-height: 1;
	}

	h1 {
		font-size: 1.5rem;
		font-weight: 600;
	}

	.desc {
		color: var(--text-muted);
	}
</style>
