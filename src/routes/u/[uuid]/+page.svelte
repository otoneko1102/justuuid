<script lang="ts">
	import { t } from '$lib/i18n';
	import type { UserWithScore } from '$lib/types';
	import type { PageData } from './$types';

	type UserPageData = PageData & {
		similarTotalCount?: number;
	};

	let { data }: { data: UserPageData } = $props();

	const T = $derived(t(data.lang));
	const loadMoreLabel = $derived(
		data.lang === 'ja' ? 'もっと見る' : 'Load more',
	);
	const loadingLabel = $derived(
		data.lang === 'ja' ? '読み込み中...' : 'Loading...',
	);
	const SIMILAR_PAGE_SIZE = 10;

	let copied = $state(false);
	let copiedUrl = $state(false);
	let copiedBadge = $state(false);
	let similarUsers = $state<UserWithScore[]>([]);
	let similarTotalCount = $state(0);
	let isLoadingMoreSimilar = $state(false);
	const shareUrl = $derived(`${data.origin}/u/${data.user.id}`);
	const badgeSnippet = $derived(
		`<a href="${data.origin}/u/${data.user.id}" target="_blank" rel="noopener noreferrer">\n  <img src="${data.origin}/api/badge/u/${data.user.id}.svg" alt="UUID Badge" />\n</a>`,
	);
	const ogDesc = $derived(
		T.user.ogDescription
			.replace('{username}', data.user.username)
			.replace('{uuid}', data.user.id),
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

	async function copyBadge() {
		await navigator.clipboard.writeText(badgeSnippet).catch(() => {});
		copiedBadge = true;
		setTimeout(() => (copiedBadge = false), 2000);
	}

	function formatDate(iso: string, lang: 'en' | 'ja') {
		return new Date(iso).toLocaleDateString(lang === 'ja' ? 'ja-JP' : 'en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
		});
	}

	$effect(() => {
		similarUsers = data.similarUsers;
		similarTotalCount = data.similarTotalCount ?? data.similarUsers.length;
		isLoadingMoreSimilar = false;
	});

	async function loadMoreSimilarUsers() {
		if (isLoadingMoreSimilar || similarUsers.length >= similarTotalCount) {
			return;
		}

		isLoadingMoreSimilar = true;

		try {
			const response = await fetch(`/api/similar/${data.user.id}`, {
				method: 'POST',
				headers: {
					'content-type': 'application/json',
				},
				body: JSON.stringify({
					offset: similarUsers.length,
					limit: SIMILAR_PAGE_SIZE,
				}),
			});

			if (!response.ok) {
				throw new Error('Failed to fetch similar users');
			}

			const payload = (await response.json()) as {
				users: UserWithScore[];
				total: number;
			};
			const existingIds = new Set(similarUsers.map((user) => user.id));
			similarUsers = [
				...similarUsers,
				...payload.users.filter((user) => !existingIds.has(user.id)),
			];
			similarTotalCount = payload.total;
		} finally {
			isLoadingMoreSimilar = false;
		}
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

		<h1 class="username">
			<a
				href={'https://github.com/' + data.user.username}
				target="_blank"
				rel="noreferrer"
			>
				@{data.user.username}
			</a>
		</h1>

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
			<span class="mi mi-sm" style="color: var(--text-subtle)"
				>calendar_today</span
			>
			{T.user.memberSince}
			{formatDate(data.user.created_at, data.lang)}
		</p>
	</div>

	{#if data.isOwner}
		<div class="badge-section">
			<div class="badge-section-header">
				<span class="mi mi-sm" style="color: var(--text-subtle)">code</span>
				<span class="badge-section-title">{T.user.badgeLabel}</span>
			</div>
			<div class="badge-preview">
				<img
					src={`${data.origin}/api/badge/u/${data.user.id}.svg`}
					alt="UUID Badge"
				/>
			</div>
			<div class="share-row">
				<span class="share-label">{T.user.badgeHint}</span>
			</div>
			<div class="badge-snippet-row">
				<pre class="mono badge-snippet">{badgeSnippet}</pre>
				<button class="btn-copy" onclick={copyBadge} title={T.user.copyBadge}>
					{#if copiedBadge}
						<span class="mi mi-sm">check</span>
					{:else}
						<span class="mi mi-sm">content_copy</span>
					{/if}
				</button>
			</div>
		</div>
	{/if}

	<div class="similar-section">
		<div class="similar-header">
			<span class="mi mi-sm" style="color: var(--text-subtle)"
				>compare_arrows</span
			>
			<span class="similar-title">{T.user.similar.title}</span>
		</div>
		{#if similarUsers.length === 0}
			<p class="similar-empty">{T.user.similar.empty}</p>
		{:else}
			<ul class="similar-list">
				{#each similarUsers as su}
					<li class="similar-item">
						<a href="/u/{su.id}" class="similar-link">
							<img
								src={su.avatar_url}
								alt="@{su.username}"
								class="similar-avatar"
							/>
							<div class="similar-info">
								<span class="similar-username">@{su.username}</span>
								<span class="uuid mono similar-uuid" title={su.id}>{su.id}</span
								>
							</div>
							<div class="similar-score-wrap">
								<span class="similar-pct">{(su.score * 100).toFixed(2)}%</span>
								<div class="similar-bar-bg">
									<div
										class="similar-bar-fill"
										style="width: {(su.score * 100).toFixed(2)}%"
									></div>
								</div>
							</div>
						</a>
					</li>
				{/each}
			</ul>
			{#if similarUsers.length < similarTotalCount}
				<div class="similar-more">
					<button
						type="button"
						class="btn btn-ghost"
						onclick={loadMoreSimilarUsers}
						disabled={isLoadingMoreSimilar}
					>
						{#if isLoadingMoreSimilar}
							{loadingLabel}
						{:else}
							{loadMoreLabel}
						{/if}
					</button>
				</div>
			{/if}
		{/if}
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

	.badge-snippet-row {
		display: flex;
		align-items: flex-start;
		gap: var(--space-2);
		min-width: 0;
	}

	.badge-snippet {
		font-size: 0.6875rem;
		color: var(--text);
		word-break: break-all;
		white-space: pre-wrap;
		min-width: 0;
		margin: 0;
		line-height: 1.5;
		background: var(--bg);
		border: 1px solid var(--border);
		border-radius: var(--radius-sm);
		padding: var(--space-2) var(--space-3);
		flex: 1;
	}

	.badge-section {
		width: 100%;
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--radius);
		padding: var(--space-4) var(--space-5);
	}

	.badge-section-header {
		display: flex;
		align-items: center;
		gap: var(--space-2);
	}

	.badge-section-title {
		font-size: 0.875rem;
		font-weight: 500;
		color: var(--text-muted);
	}

	.badge-preview {
		display: flex;
		justify-content: center;
		padding: var(--space-2) 0;
	}

	.badge-preview img {
		height: 20px;
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
		-webkit-mask:
			linear-gradient(#fff 0 0) padding-box,
			linear-gradient(#fff 0 0);
		-webkit-mask-composite: destination-out;
		mask:
			linear-gradient(#fff 0 0) padding-box,
			linear-gradient(#fff 0 0);
		mask-composite: exclude;
		animation: spin 4s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
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
		overflow-x: auto;
		overflow-y: hidden;
		scrollbar-width: thin;
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

	.similar-section {
		width: 100%;
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--radius);
		padding: var(--space-4) var(--space-5);
	}

	.similar-header {
		display: flex;
		align-items: center;
		gap: var(--space-2);
	}

	.similar-title {
		font-size: 0.875rem;
		font-weight: 500;
		color: var(--text-muted);
	}

	.similar-empty {
		font-size: 0.875rem;
		color: var(--text-subtle);
	}

	.similar-list {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.similar-more {
		display: flex;
		justify-content: center;
		margin-top: var(--space-1);
	}

	.similar-item {
		border-radius: var(--radius-sm);
	}

	.similar-link {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		padding: var(--space-2) var(--space-2);
		border-radius: var(--radius-sm);
		transition: background 0.15s ease;
		text-decoration: none;
		color: var(--text);
	}

	.similar-link:hover {
		background: var(--bg);
	}

	.similar-avatar {
		width: 32px;
		height: 32px;
		border-radius: var(--radius-full);
		object-fit: cover;
		border: 1px solid var(--border);
		flex-shrink: 0;
	}

	.similar-info {
		display: flex;
		flex-direction: column;
		gap: 2px;
		min-width: 0;
		flex: 1;
	}

	.similar-username {
		font-size: 0.8125rem;
		font-weight: 500;
		color: var(--text);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.similar-uuid {
		display: block;
		font-size: clamp(0.56rem, 0.5rem + 0.22vw, 0.7rem);
		color: var(--text-subtle);
		white-space: nowrap;
		overflow-x: auto;
		overflow-y: hidden;
		text-overflow: clip;
		line-height: 1.35;
		scrollbar-width: thin;
	}

	.similar-score-wrap {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		gap: 3px;
		flex-shrink: 0;
		min-width: 60px;
	}

	.similar-pct {
		font-size: 0.8125rem;
		font-weight: 600;
		color: var(--accent);
	}

	.similar-bar-bg {
		width: 60px;
		height: 4px;
		background: var(--border);
		border-radius: 9999px;
		overflow: hidden;
	}

	.similar-bar-fill {
		height: 100%;
		background: var(--accent);
		border-radius: 9999px;
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

		.avatar-wrap,
		.avatar {
			width: 80px;
			height: 80px;
		}

		.username {
			font-size: 1.375rem;
		}

		.uuid {
			font-size: 0.58rem;
			padding: var(--space-2) var(--space-3);
		}

		.cosmic-event {
			padding: var(--space-3) var(--space-4);
			gap: var(--space-3);
		}

		.badge-section {
			padding: var(--space-3) var(--space-4);
		}

		.badge-snippet {
			font-size: 0.625rem;
		}

		.similar-uuid {
			font-size: 0.54rem;
		}
	}
</style>
