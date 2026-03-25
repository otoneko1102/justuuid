<script lang="ts">
	import { t } from '$lib/i18n';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const T = $derived(t(data.lang));

	let copied = $state(false);
	let copiedUrl = $state(false);
	const shareUrl = $derived(`${data.origin}/u/${data.user.id}`);
	const ogDesc = $derived(
		T.user.ogDescription.replace('{username}', data.user.username).replace('{uuid}', data.user.id)
	);

	async function copyUuid() {
		await navigator.clipboard.writeText(data.user.id).catch(() => {});
		copied = true;
		setTimeout(() => (copied = false), 2000);
	}

	async function copyUrl() {
		await navigator.clipboard.writeText(shareUrl).catch(() => {});
		copiedUrl = true;
		setTimeout(() => (copiedUrl = false), 2000);
	}

	function formatDate(iso: string, lang: 'en' | 'ja') {
		return new Date(iso).toLocaleDateString(lang === 'ja' ? 'ja-JP' : 'en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
		});
	}
</script>

<svelte:head>
	<title>@{data.user.username} - JustUUID</title>
	<meta name="description" content={ogDesc} />
	<meta property="og:title" content="@{data.user.username} - JustUUID" />
	<meta property="og:description" content={ogDesc} />
	<meta property="og:image" content={data.user.avatar_url} />
	<meta property="og:url" content={shareUrl} />
	<meta property="og:type" content="profile" />
	<meta name="twitter:card" content="summary" />
	<meta name="twitter:title" content="@{data.user.username} - JustUUID" />
	<meta name="twitter:description" content={ogDesc} />
	<meta name="twitter:image" content={data.user.avatar_url} />
</svelte:head>

<div class="profile-page container">
{#if data.isOwner}
		<div class="owner-banner">
			<span class="mi mi-sm banner-icon">info</span>
			<div class="owner-banner-content">
				<span class="banner-title">{T.user.yourPage}</span>
				<div class="share-row">
					<span class="share-label">{T.user.sharePrompt}</span>
					<div class="share-url-row">
						<span class="mono share-link">{shareUrl}</span>
						<button class="btn-copy" onclick={copyUrl} title={T.user.copyUrl}>
							{#if copiedUrl}
								<span class="mi mi-sm">check</span>
							{:else}
								<span class="mi mi-sm">content_copy</span>
							{/if}
						</button>
					</div>
				</div>
			</div>
		</div>
	{/if}
<div class="profile-card" class:cosmic-profile={data.user.collision_detected}>
<div class="avatar-wrap">
			<img
				src={data.user.avatar_url}
				alt="@{data.user.username}"
				class="avatar"
			/>
			{#if data.user.collision_detected}
				<div class="cosmic-ring" aria-hidden="true"></div>
			{/if}
		</div>
<h1 class="username"><a href={"https://github.com/" + data.user.username} target="_blank">@{data.user.username}</a></h1>
<div class="uuid-block">
			<p class="uuid-label">UUID</p>
			<p class="uuid mono">{data.user.id}</p>
		</div>
<div class="actions">
			<button class="btn btn-primary" onclick={copyUuid}>
				{#if copied}
					<span class="mi mi-sm">check</span>
					{T.user.copied}
				{:else}
					<span class="mi mi-sm">content_copy</span>
					{T.user.copyUuid}
				{/if}
			</button>
		</div>
<p class="member-since">
			<span class="mi mi-sm" style="color: var(--text-subtle)">calendar_today</span>
			{T.user.memberSince} {formatDate(data.user.created_at, data.lang)}
		</p>
	</div>
{#if data.user.collision_detected}
		<div class="cosmic-event">
			<span class="mi mi-lg cosmic-icon">casino</span>
			<div class="cosmic-event-content">
				<h2>{T.user.cosmic.title}</h2>
				<p>{T.user.cosmic.description}</p>
			</div>
		</div>
	{/if}

</div>

<style>
	.profile-page {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding-block: var(--space-12) var(--space-16);
		gap: var(--space-6);
		max-width: 560px;
	}
.owner-banner {
		width: 100%;
		display: flex;
		align-items: flex-start;
		gap: var(--space-3);
		background: rgba(129, 140, 248, 0.08);
		border: 1px solid rgba(129, 140, 248, 0.2);
		border-radius: var(--radius);
		padding: var(--space-3) var(--space-4);
	}

	.banner-icon {
		color: var(--accent);
		flex-shrink: 0;
		margin-top: 1px;
	}

	.owner-banner-content {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
		font-size: 0.875rem;
		min-width: 0;
	}

	.banner-title {
		color: var(--accent);
		font-weight: 500;
	}

	.share-row {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
		color: var(--text-muted);
	}

	.share-label {
		font-size: 0.8125rem;
	}

	.share-url-row {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		min-width: 0;
	}

	.share-link {
		font-size: 0.75rem;
		color: var(--text);
		word-break: break-all;
		min-width: 0;
	}

	.btn-copy {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		width: 28px;
		height: 28px;
		border-radius: var(--radius-sm);
		border: 1px solid var(--border);
		background: transparent;
		color: var(--text-muted);
		cursor: pointer;
		transition: all 0.15s ease;
		font-family: var(--font-sans);
	}

	.btn-copy:hover {
		background: var(--surface);
		color: var(--accent);
		border-color: var(--accent);
	}
.profile-card {
		width: 100%;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--radius-xl);
		padding: var(--space-12) var(--space-8);
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-6);
		text-align: center;
	}

	.cosmic-profile {
		border-color: rgba(240, 171, 252, 0.3);
		background: linear-gradient(
			180deg,
			rgba(240, 171, 252, 0.04) 0%,
			var(--surface) 40%
		);
	}
.avatar-wrap {
		position: relative;
		width: 100px;
		height: 100px;
	}

	.avatar {
		width: 100px;
		height: 100px;
		border-radius: var(--radius-full);
		object-fit: cover;
		border: 3px solid var(--border);
	}

	.cosmic-ring {
		position: absolute;
		inset: -4px;
		border-radius: var(--radius-full);
		border: 2px solid transparent;
		background: linear-gradient(135deg, var(--cosmic), var(--accent)) border-box;
		-webkit-mask: linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0);
		-webkit-mask-composite: destination-out;
		mask: linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0);
		mask-composite: exclude;
		animation: spin 4s linear infinite;
	}

	@keyframes spin {
		to { transform: rotate(360deg); }
	}
.username {
		font-size: 1.625rem;
		font-weight: 700;
		letter-spacing: -0.02em;
	}
.uuid-block {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-2);
		width: 100%;
	}

	.uuid-label {
		font-size: 0.75rem;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		color: var(--text-subtle);
		font-weight: 600;
	}

	.uuid {
		font-size: clamp(0.62rem, 1.8vw, 0.95rem);
		color: var(--accent);
		letter-spacing: 0.01em;
		white-space: nowrap;
		padding: var(--space-3) var(--space-4);
		background: var(--bg);
		border: 1px solid var(--border);
		border-radius: var(--radius);
		width: 100%;
		line-height: 1.6;
		text-shadow: 0 0 20px rgba(129, 140, 248, 0.4);
	}
.actions {
		display: flex;
		gap: var(--space-3);
	}
.member-since {
		font-size: 0.8125rem;
		color: var(--text-subtle);
		display: flex;
		align-items: center;
		gap: var(--space-1);
	}
.cosmic-event {
		width: 100%;
		display: flex;
		gap: var(--space-4);
		align-items: flex-start;
		padding: var(--space-4) var(--space-5);
		background: rgba(240, 171, 252, 0.06);
		border: 1px solid rgba(240, 171, 252, 0.2);
		border-radius: var(--radius-lg);
	}

	.cosmic-icon {
		color: var(--cosmic);
		flex-shrink: 0;
		margin-top: 2px;
	}

	.cosmic-event-content h2 {
		font-size: 0.9375rem;
		font-weight: 600;
		color: var(--cosmic);
		margin-bottom: var(--space-1);
	}

	.cosmic-event-content p {
		font-size: 0.875rem;
		color: var(--text-muted);
		line-height: 1.7;
	}

	@media (max-width: 480px) {
		.profile-page {
			padding-block: var(--space-6) var(--space-8);
		}

		.profile-card {
			padding: var(--space-6) var(--space-4);
			border-radius: var(--radius-lg);
		}

		.owner-banner {
			padding: var(--space-3);
		}

		.avatar-wrap, .avatar {
			width: 80px;
			height: 80px;
		}

		.username {
			font-size: 1.375rem;
		}

		.uuid {
			font-size: 0.62rem;
			padding: var(--space-2) var(--space-3);
		}

		.cosmic-event {
			padding: var(--space-3) var(--space-4);
			gap: var(--space-3);
		}
	}
</style>
