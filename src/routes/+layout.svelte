<script lang="ts">
	import '../app.css';
	import { invalidate } from '$app/navigation';
	import GitHubIcon from '$lib/components/icons/GitHubIcon.svelte';
	import { t } from '$lib/i18n';
	import type { Snippet } from 'svelte';
	import type { LayoutData } from './$types';

	let { data, children }: { data: LayoutData; children: Snippet } = $props();

	const T = $derived(t(data.lang));

	let menuOpen = $state(false);

	async function setLang(lang: 'en' | 'ja') {
		document.cookie = `lang=${lang}; path=/; max-age=31536000; SameSite=Lax`;
		await invalidate('app:lang');
	}

	function toggleMenu() {
		menuOpen = !menuOpen;
	}

	function closeMenu() {
		menuOpen = false;
	}
</script>

<svelte:head>
	<title>{T.meta.siteName}</title>
	<meta name="description" content={T.meta.description} />
<meta property="og:site_name" content="JustUUID" />
	<meta property="og:type" content="website" />
	<meta property="og:url" content={`${data.origin}${data.pathname}`} />
	<meta property="og:locale" content={data.lang === 'ja' ? 'ja_JP' : 'en_US'} />
	<meta name="twitter:card" content="summary" />
</svelte:head>

<div class="layout">
<header>
		<div class="container header-inner">
			<a href="/" class="logo" onclick={closeMenu}>
				<span class="logo-text">JustUUID</span>
			</a>
<nav class="nav-right nav-desktop">
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

				<a href="/ranking" class="btn btn-ghost btn-sm">
					<span class="mi mi-sm">leaderboard</span>
					{T.nav.ranking}
				</a>

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
						<GitHubIcon />
						{T.nav.login}
					</a>
				{/if}
			</nav>
<button class="menu-toggle" onclick={toggleMenu} aria-label="Menu">
				<span class="mi">{menuOpen ? 'close' : 'menu'}</span>
			</button>
		</div>
{#if menuOpen}
			<div class="mobile-menu">
				<div class="container mobile-menu-inner">
					<div class="mobile-menu-row">
						<div class="lang-switcher" role="group" aria-label="Language">
							<button
								class="lang-btn"
								class:active={data.lang === 'en'}
								onclick={() => { setLang('en'); closeMenu(); }}
							>EN</button>
							<button
								class="lang-btn"
								class:active={data.lang === 'ja'}
								onclick={() => { setLang('ja'); closeMenu(); }}
							>JA</button>
						</div>
					</div>

					<a href="/ranking" class="mobile-menu-link" onclick={closeMenu}>
						<span class="mi mi-sm">leaderboard</span>
						<span>{T.nav.ranking}</span>
					</a>

					{#if data.user}
						<a href="/u/{data.user.id}" class="mobile-menu-link" onclick={closeMenu}>
							<img
								src={data.user.avatar_url}
								alt={data.user.username}
								class="nav-avatar"
							/>
							<span>@{data.user.username}</span>
						</a>
						<a
							href="/logout"
							class="mobile-menu-link"
							data-sveltekit-preload-data="off"
							onclick={closeMenu}
						>
							<span class="mi mi-sm">logout</span>
							<span>{T.nav.logout}</span>
						</a>
					{:else}
						<a href="/login" class="mobile-menu-link" data-sveltekit-preload-data="off" onclick={closeMenu}>
							<GitHubIcon />
							<span>{T.nav.login}</span>
						</a>
					{/if}
				</div>
			</div>
		{/if}
	</header>
<main>
		{@render children()}
	</main>
<footer>
		<div class="container footer-inner">
			<span class="footer-tagline mono">{T.footer.tagline}</span>
			<div class="footer-links">
				<a
					href="https://github.com/otoneko1102/justuuid"
					target="_blank"
					rel="noreferrer"
				>GitHub</a>
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
.menu-toggle {
		display: none;
		align-items: center;
		justify-content: center;
		width: 36px;
		height: 36px;
		border: 1px solid var(--border);
		border-radius: var(--radius-sm);
		background: transparent;
		color: var(--text);
		cursor: pointer;
		font-family: var(--font-sans);
	}

	.mobile-menu {
		display: none;
		border-top: 1px solid var(--border);
		background: rgba(9, 9, 11, 0.95);
		backdrop-filter: blur(12px);
		-webkit-backdrop-filter: blur(12px);
		animation: slideDown 0.15s ease;
	}

	@keyframes slideDown {
		from { opacity: 0; transform: translateY(-4px); }
		to { opacity: 1; transform: translateY(0); }
	}

	.mobile-menu-inner {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
		padding-block: var(--space-3);
	}

	.mobile-menu-row {
		display: flex;
		align-items: center;
		padding: var(--space-2) 0;
	}

	.mobile-menu-link {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		padding: var(--space-2) var(--space-1);
		font-size: 0.875rem;
		color: var(--text-muted);
		border-radius: var(--radius-sm);
		transition: all 0.15s ease;
	}

	.mobile-menu-link:hover {
		color: var(--text);
		background: var(--surface);
	}
main {
		flex: 1;
	}
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
@media (max-width: 600px) {
		.nav-desktop {
			display: none;
		}

		.menu-toggle {
			display: inline-flex;
		}

		.mobile-menu {
			display: block;
		}

		.footer-inner {
			flex-direction: column;
			text-align: center;
		}
	}
</style>
