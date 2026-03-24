<script lang="ts">
	import '../app.css';
	import { invalidate } from '$app/navigation';
	import { t } from '$lib/i18n';
	import type { Snippet } from 'svelte';
	import type { LayoutData } from './$types';

	let { data, children }: { data: LayoutData; children: Snippet } = $props();

	const T = $derived(t(data.lang));

	async function setLang(lang: 'en' | 'ja') {
		document.cookie = `lang=${lang}; path=/; max-age=31536000; SameSite=Lax`;
		await invalidate('app:lang');
	}
</script>

<svelte:head>
	<title>{T.meta.siteName}</title>
	<meta name="description" content={T.meta.description} />
</svelte:head>

<div class="layout">
	<!-- ── Header ───────────────────────────────────────────── -->
	<header>
		<div class="container header-inner">
			<a href="/" class="logo">
				<span class="logo-text">JustUUID</span>
			</a>

			<nav class="nav-right">
				<!-- Language switcher -->
				<div class="lang-switcher" role="group" aria-label="Language">
					<button
						class="lang-btn"
						class:active={data.lang === 'en'}
						onclick={() => setLang('en')}
					>EN</button>
					<button
						class="lang-btn"
						class:active={data.lang === 'ja'}
						onclick={() => setLang('ja')}
					>JA</button>
				</div>

				{#if data.user}
					<a href="/u/{data.user.id}" class="btn btn-ghost btn-sm">
						<img
							src={data.user.avatar_url}
							alt={data.user.username}
							class="nav-avatar"
						/>
						<span>@{data.user.username}</span>
					</a>
					<a
						href="/logout"
						class="btn btn-ghost btn-sm icon-only"
						data-sveltekit-preload-data="off"
						title={T.nav.logout}
					>
						<span class="mi mi-sm">logout</span>
					</a>
				{:else}
					<a href="/login" class="btn btn-primary btn-sm" data-sveltekit-preload-data="off">
						<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>
						{T.nav.login}
					</a>
				{/if}
			</nav>
		</div>
	</header>

	<!-- ── Main content ─────────────────────────────────────── -->
	<main>
		{@render children()}
	</main>

	<!-- ── Footer ───────────────────────────────────────────── -->
	<footer>
		<div class="container footer-inner">
			<span class="footer-tagline mono">{T.footer.tagline}</span>
			<div class="footer-links">
				<a href="/privacy-policy">{T.footer.privacyPolicy}</a>
				<a href="/terms-of-service">{T.footer.termsOfService}</a>
			</div>
		</div>
	</footer>
</div>

<style>
	.layout {
		display: flex;
		flex-direction: column;
		min-height: 100dvh;
	}

	/* ── Header ─────────────────────────────────────────────── */
	header {
		position: sticky;
		top: 0;
		z-index: 50;
		border-bottom: 1px solid var(--border);
		background: rgba(9, 9, 11, 0.85);
		backdrop-filter: blur(12px);
		-webkit-backdrop-filter: blur(12px);
	}

	.header-inner {
		display: flex;
		align-items: center;
		justify-content: space-between;
		height: 56px;
	}

	.logo {
		display: flex;
		align-items: center;
		gap: var(--space-2);
	}

	.logo-text {
		font-weight: 700;
		font-size: 1.125rem;
		letter-spacing: -0.02em;
		background: linear-gradient(135deg, #fff 0%, var(--accent) 100%);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	.nav-right {
		display: flex;
		align-items: center;
		gap: var(--space-3);
	}

	.lang-switcher {
		display: flex;
		border: 1px solid var(--border);
		border-radius: var(--radius-sm);
		overflow: hidden;
	}

	.lang-btn {
		padding: 4px 10px;
		font-size: 0.75rem;
		font-weight: 600;
		letter-spacing: 0.04em;
		cursor: pointer;
		border: none;
		background: transparent;
		color: var(--text-muted);
		transition: all 0.15s ease;
		font-family: var(--font-sans);
	}

	.lang-btn:hover {
		color: var(--text);
		background: var(--surface);
	}

	.lang-btn.active {
		background: var(--surface-2);
		color: var(--text);
	}

	.nav-avatar {
		width: 20px;
		height: 20px;
		border-radius: var(--radius-full);
		object-fit: cover;
	}

	.icon-only {
		padding-inline: var(--space-2);
	}

	/* ── Main ───────────────────────────────────────────────── */
	main {
		flex: 1;
	}

	/* ── Footer ─────────────────────────────────────────────── */
	footer {
		border-top: 1px solid var(--border);
		padding-block: var(--space-6);
		margin-top: var(--space-16);
	}

	.footer-inner {
		display: flex;
		align-items: center;
		justify-content: space-between;
		flex-wrap: wrap;
		gap: var(--space-4);
	}

	.footer-tagline {
		font-size: 0.8125rem;
		color: var(--text-subtle);
	}

	.footer-links {
		display: flex;
		gap: var(--space-6);
	}

	.footer-links a {
		font-size: 0.8125rem;
		color: var(--text-muted);
		transition: color 0.15s ease;
	}

	.footer-links a:hover {
		color: var(--text);
	}

	/* ── Responsive ─────────────────────────────────────────── */
	@media (max-width: 600px) {
		.nav-right {
			gap: var(--space-2);
		}

		.footer-inner {
			flex-direction: column;
			text-align: center;
		}
	}
</style>
