<script lang="ts">
	import { goto } from '$app/navigation';
	import GitHubIcon from '$lib/components/icons/GitHubIcon.svelte';
	import { onMount, onDestroy } from 'svelte';
	import { t } from '$lib/i18n';
	import type { User } from '$lib/types';
	import type { PageData } from './$types';

	type UserSort = 'random' | 'newest' | 'oldest';
	type HomePageData = PageData & {
		lookupError?: string | null;
		lookupUsername?: string;
	};

	let { data }: { data: PageData } = $props();
	const homeData = $derived(data as HomePageData);

	const T = $derived(t(data.lang));
	const lookupErrorMessage = $derived.by(() => {
		if (homeData.lookupError !== 'user-not-found') {
			return null;
		}

		const username = homeData.lookupUsername
			? `@${homeData.lookupUsername}`
			: null;

		if (data.lang === 'ja') {
			return username
				? `${username} は JustUUID に登録されていません。`
				: '指定された GitHub ユーザーは JustUUID に見つかりませんでした。';
		}

		return username
			? `${username} is not registered on JustUUID.`
			: 'The requested GitHub user was not found on JustUUID.';
	});
	const showMoreLabel = $derived(
		data.lang === 'ja' ? 'もっと表示' : 'Load more',
	);
	const sortOptions = $derived(
		data.lang === 'ja'
			? [
					{ value: 'random' as UserSort, label: 'ランダム' },
					{ value: 'newest' as UserSort, label: '新しい順' },
					{ value: 'oldest' as UserSort, label: '古い順' },
				]
			: [
					{ value: 'random' as UserSort, label: 'Random' },
					{ value: 'newest' as UserSort, label: 'Newest' },
					{ value: 'oldest' as UserSort, label: 'Oldest' },
				],
	);
	const sortHint = $derived.by(() => {
		if (currentSort === 'random') {
			return T.home.users.randomHint;
		}

		if (data.lang === 'ja') {
			return currentSort === 'newest'
				? '新しい順で表示中です。'
				: '古い順で表示中です。';
		}

		return currentSort === 'newest'
			? 'Showing users sorted by newest first.'
			: 'Showing users sorted by oldest first.';
	});

	let searchInput = $state('');
	let visibleUsers = $state<User[]>([]);
	let currentSort = $state<UserSort>('random');
	let isLoadingMore = $state(false);
	let isSorting = $state(false);

	$effect(() => {
		searchInput = data.query;
		visibleUsers = data.users;
		currentSort = 'random';
		isLoadingMore = false;
		isSorting = false;
	});

	async function fetchUsers({
		sort = currentSort,
		offset = 0,
		limit = visibleUsers.length || 6,
		excludeIds = [],
	}: {
		sort?: UserSort;
		offset?: number;
		limit?: number;
		excludeIds?: string[];
	}) {
		const response = await fetch('/api/users', {
			method: 'POST',
			headers: {
				'content-type': 'application/json',
			},
			body: JSON.stringify({
				sort,
				offset,
				limit,
				excludeIds,
			}),
		});

		if (!response.ok) {
			throw new Error('Failed to fetch users');
		}

		const payload = (await response.json()) as { users: User[] };
		return payload.users;
	}

	async function changeSort(sort: UserSort) {
		if (sort === currentSort || data.query || isLoadingMore) {
			return;
		}

		const previousSort = currentSort;
		currentSort = sort;
		isSorting = true;

		try {
			visibleUsers = await fetchUsers({
				sort,
				offset: 0,
				limit: Math.max(visibleUsers.length, 6),
			});
		} catch {
			currentSort = previousSort;
		} finally {
			isSorting = false;
		}
	}

	async function loadMoreUsers() {
		if (
			isLoadingMore ||
			isSorting ||
			data.query ||
			visibleUsers.length >= data.totalCount
		) {
			return;
		}

		isLoadingMore = true;

		try {
			const nextUsers = await fetchUsers({
				sort: currentSort,
				offset: currentSort === 'random' ? 0 : visibleUsers.length,
				limit: 12,
				excludeIds:
					currentSort === 'random' ? visibleUsers.map((user) => user.id) : [],
			});
			const existingIds = new Set(visibleUsers.map((user) => user.id));
			visibleUsers = [
				...visibleUsers,
				...nextUsers.filter((user) => !existingIds.has(user.id)),
			];
		} finally {
			isLoadingMore = false;
		}
	}

	function handleSearch(e: Event) {
		e.preventDefault();
		const q = searchInput.trim();
		goto(q ? `/?q=${encodeURIComponent(q)}` : '/', { invalidateAll: true });
	}

	function clearSearch() {
		searchInput = '';
		goto('/', { invalidateAll: true });
	}

	function formatDate(iso: string, lang: 'en' | 'ja') {
		return new Date(iso).toLocaleDateString(lang === 'ja' ? 'ja-JP' : 'en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
		});
	}

	const HEX = '0123456789abcdef';
	const TEMPLATE = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx';
	let animatedChars = $state(generateUuid());
	let interval: ReturnType<typeof setInterval>;

	function generateUuid(): string[] {
		return TEMPLATE.split('').map((c) => {
			if (c === 'x') return HEX[Math.floor(Math.random() * 16)];
			if (c === 'y') return HEX[Math.floor(Math.random() * 4) + 8];
			return c;
		});
	}

	onMount(() => {
		interval = setInterval(() => {
			const next = [...animatedChars];
			const positions = TEMPLATE.split('').reduce<number[]>((acc, c, i) => {
				if (c === 'x' || c === 'y') acc.push(i);
				return acc;
			}, []);
			const count = 3 + Math.floor(Math.random() * 3);
			for (let n = 0; n < count; n++) {
				const idx = positions[Math.floor(Math.random() * positions.length)];
				const c = TEMPLATE[idx];
				next[idx] =
					c === 'y'
						? HEX[Math.floor(Math.random() * 4) + 8]
						: HEX[Math.floor(Math.random() * 16)];
			}
			animatedChars = next;
		}, 80);
	});

	onDestroy(() => {
		if (interval) clearInterval(interval);
	});
</script>

<svelte:head>
	<title>JustUUID - {T.meta.description}</title>
	<meta name="description" content={T.meta.ogDescription} />
	<meta property="og:title" content="JustUUID - {T.meta.description}" />
	<meta property="og:description" content={T.meta.ogDescription} />
	<meta property="og:image" content={`${data.origin}/favicon.svg`} />
	<meta name="twitter:title" content="JustUUID - {T.meta.description}" />
	<meta name="twitter:description" content={T.meta.ogDescription} />
</svelte:head>

<section class="hero">
	<div class="container hero-inner">
		<h1 class="hero-title">{T.home.hero.title}</h1>
		<p class="hero-subtitle">{T.home.hero.subtitle}</p>

		<div class="hero-actions">
			{#if !data.user}
				<a
					href="/login"
					class="btn btn-primary btn-lg hero-cta"
					data-sveltekit-preload-data="off"
				>
					<GitHubIcon size={18} />
					{T.home.hero.cta}
				</a>
			{:else}
				<a href="/u/{data.user.id}" class="btn btn-ghost btn-lg hero-cta">
					{T.nav.myPage}
					<span class="mi">arrow_forward</span>
				</a>
			{/if}
			<a href="/ranking" class="btn btn-ghost btn-lg hero-cta-sub">
				<span class="mi">leaderboard</span>
				{T.nav.ranking}
			</a>
		</div>

		<div class="uuid-demo" aria-hidden="true">
			<span class="mono uuid-demo-text">
				{#each animatedChars as char, i (i)}
					<span
						class="uuid-char"
						class:uuid-sep={char === '-' || TEMPLATE[i] === '4'}>{char}</span
					>
				{/each}
			</span>
		</div>
	</div>
</section>

{#if data.hasCollision}
	<div class="cosmic-banner">
		<div class="container cosmic-banner-inner">
			<span class="mi mi-sm" style="color: var(--cosmic)">casino</span>
			<p>{T.home.cosmic.banner}</p>
		</div>
	</div>
{/if}

{#if lookupErrorMessage}
	<div class="lookup-error-banner" role="alert" aria-live="polite">
		<div class="container lookup-error-banner-inner">
			<span class="mi mi-sm">error</span>
			<p>{lookupErrorMessage}</p>
		</div>
	</div>
{/if}

<section class="users-section">
	<div class="container">
		<div class="section-header">
			<h2 class="section-title">{T.home.users.title}</h2>
			{#if data.totalCount > 0}
				<span class="user-count"
					>{data.totalCount} {T.home.users.registered}</span
				>
			{/if}
		</div>

		<form class="search-form" onsubmit={handleSearch}>
			<div class="search-input-wrap">
				<span class="mi mi-sm search-icon">search</span>
				<input
					type="text"
					class="search-input"
					placeholder={T.home.users.searchPlaceholder}
					bind:value={searchInput}
				/>
				{#if searchInput}
					<button type="button" class="search-clear" onclick={clearSearch}>
						<span class="mi mi-sm">close</span>
					</button>
				{/if}
			</div>
		</form>

		{#if !data.query}
			<div class="sort-row" aria-label="Sort users">
				{#each sortOptions as option}
					<button
						type="button"
						class="sort-chip"
						class:active={option.value === currentSort}
						onclick={() => changeSort(option.value)}
						disabled={isSorting || isLoadingMore}
					>
						{option.label}
					</button>
				{/each}
			</div>
		{/if}

		{#if data.query && visibleUsers.length > 0}
			<p class="search-result-count">
				{T.home.users.searchResults
					.replace('{count}', String(visibleUsers.length))
					.replace('{query}', data.query)}
			</p>
		{/if}

		{#if visibleUsers.length === 0}
			<div class="empty-state">
				{#if data.query}
					<p>{T.home.users.noResults.replace('{query}', data.query)}</p>
				{:else}
					<p>{T.home.users.empty}</p>
				{/if}
			</div>
		{:else}
			<div class="user-grid">
				{#each visibleUsers as user (user.id)}
					<a
						href="/u/{user.id}"
						class="user-card"
						class:cosmic-card={user.collision_detected}
					>
						<div class="user-card-header">
							<img
								src={user.avatar_url}
								alt={user.username}
								class="user-avatar"
								loading="lazy"
							/>
							<div class="user-info">
								<span class="username">@{user.username}</span>
								{#if user.collision_detected}
									<span class="mi mi-sm collision-badge">casino</span>
								{/if}
							</div>
						</div>
						<p class="user-uuid mono">{user.id}</p>
						<div class="user-card-footer">
							<span class="user-date">
								{T.home.users.memberSince}
								{formatDate(user.created_at, data.lang)}
							</span>
							<span class="view-link">
								{T.home.users.viewProfile}
								<span class="mi mi-sm">chevron_right</span>
							</span>
						</div>
					</a>
				{/each}
			</div>

			{#if !data.query && data.totalCount > visibleUsers.length}
				<div class="users-more">
					<button
						type="button"
						class="btn btn-ghost"
						onclick={loadMoreUsers}
						disabled={isLoadingMore || isSorting}
					>
						{#if isLoadingMore}
							{data.lang === 'ja' ? '読み込み中...' : 'Loading...'}
						{:else}
							{showMoreLabel}
						{/if}
					</button>
				</div>
			{/if}

			{#if !data.query}
				<p class="random-hint">{sortHint}</p>
			{/if}
		{/if}
	</div>
</section>

<style>
	.hero {
		padding-block: var(--space-24) var(--space-16);
		text-align: center;
	}

	.hero-inner {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-6);
	}

	.hero-title {
		font-size: clamp(3rem, 8vw, 5.5rem);
		font-weight: 800;
		letter-spacing: -0.04em;
		line-height: 1;
		background: linear-gradient(135deg, #fff 30%, var(--accent) 100%);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	.hero-subtitle {
		font-size: clamp(1rem, 2.5vw, 1.25rem);
		color: var(--text-muted);
		max-width: 480px;
	}

	.hero-cta {
		margin-top: var(--space-2);
	}

	.hero-actions {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-2);
		margin-top: var(--space-2);
	}

	.hero-cta-sub {
		padding-inline: var(--space-6);
	}

	.uuid-demo {
		margin-top: var(--space-8);
		padding: var(--space-3) var(--space-6);
		border: 1px dashed var(--border);
		border-radius: var(--radius);
		background: var(--surface);
		overflow: hidden;
	}

	.uuid-demo-text {
		font-size: 0.875rem;
		letter-spacing: 0.05em;
		display: inline-flex;
	}

	.uuid-char {
		display: inline-block;
		width: 0.65em;
		text-align: center;
		color: var(--accent);
		text-shadow: 0 0 8px rgba(129, 140, 248, 0.5);
		transition: color 0.1s ease;
	}

	.uuid-sep {
		color: var(--text-subtle);
		text-shadow: none;
	}

	.cosmic-banner {
		background: linear-gradient(
			135deg,
			rgba(240, 171, 252, 0.08),
			rgba(129, 140, 248, 0.08)
		);
		border-block: 1px solid rgba(240, 171, 252, 0.2);
		padding-block: var(--space-3);
		text-align: center;
	}

	.cosmic-banner-inner {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-2);
	}

	.cosmic-banner p {
		font-size: 0.875rem;
		color: var(--cosmic);
	}

	.lookup-error-banner {
		background: linear-gradient(
			135deg,
			rgba(239, 68, 68, 0.16),
			rgba(127, 29, 29, 0.2)
		);
		border-block: 1px solid rgba(248, 113, 113, 0.4);
	}

	.lookup-error-banner-inner {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-2);
		padding-block: var(--space-3);
		color: #fecaca;
		text-align: center;
	}

	.lookup-error-banner p {
		font-size: 0.875rem;
		color: inherit;
	}

	.users-section {
		padding-bottom: var(--space-16);
	}

	.section-header {
		display: flex;
		align-items: baseline;
		gap: var(--space-3);
		margin-bottom: var(--space-4);
	}

	.section-title {
		font-size: 1.125rem;
		font-weight: 600;
		color: var(--text-muted);
		text-transform: uppercase;
		letter-spacing: 0.08em;
	}

	.user-count {
		font-size: 0.8125rem;
		color: var(--text-subtle);
	}

	.search-form {
		margin-bottom: var(--space-4);
	}

	.search-input-wrap {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		padding: var(--space-2) var(--space-3);
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--radius);
		transition: border-color 0.15s ease;
	}

	.search-input-wrap:focus-within {
		border-color: var(--accent);
	}

	.search-icon {
		color: var(--text-subtle);
		flex-shrink: 0;
	}

	.search-input {
		flex: 1;
		background: transparent;
		border: none;
		outline: none;
		color: var(--text);
		font-size: 0.875rem;
		font-family: var(--font-sans);
		min-width: 0;
	}

	.search-input::placeholder {
		color: var(--text-subtle);
	}

	.search-clear {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		width: 24px;
		height: 24px;
		border: none;
		background: transparent;
		color: var(--text-muted);
		cursor: pointer;
		border-radius: var(--radius-sm);
		transition: color 0.15s ease;
	}

	.search-clear:hover {
		color: var(--text);
	}

	.search-result-count {
		font-size: 0.8125rem;
		color: var(--text-muted);
		margin-bottom: var(--space-4);
	}

	.sort-row {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
		margin-bottom: var(--space-4);
	}

	.sort-chip {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: var(--space-1) var(--space-3);
		border: 1px solid var(--border);
		border-radius: var(--radius-full);
		background: var(--surface);
		color: var(--text-muted);
		font-size: 0.75rem;
		font-weight: 600;
		letter-spacing: 0.03em;
		transition: all 0.15s ease;
		font-family: var(--font-sans);
		cursor: pointer;
	}

	.sort-chip:hover:not(:disabled) {
		border-color: var(--accent);
		color: var(--text);
	}

	.sort-chip.active {
		background: rgba(129, 140, 248, 0.14);
		border-color: rgba(129, 140, 248, 0.4);
		color: var(--accent);
	}

	.random-hint {
		text-align: center;
		font-size: 0.8125rem;
		color: var(--text-subtle);
		margin-top: var(--space-4);
	}

	.empty-state {
		text-align: center;
		padding-block: var(--space-16);
		color: var(--text-muted);
	}

	.user-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
		gap: var(--space-4);
	}

	.user-card {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
		padding: var(--space-4);
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--radius-lg);
		transition: all 0.2s ease;
		cursor: pointer;
		text-decoration: none;
	}

	.user-card:hover {
		border-color: var(--accent);
		background: var(--surface-2);
		transform: translateY(-2px);
		box-shadow: 0 8px 32px rgba(129, 140, 248, 0.1);
	}

	.cosmic-card {
		border-color: rgba(240, 171, 252, 0.3) !important;
	}

	.cosmic-card:hover {
		border-color: var(--cosmic) !important;
		box-shadow: 0 8px 32px rgba(240, 171, 252, 0.1) !important;
	}

	.user-card-header {
		display: flex;
		align-items: center;
		gap: var(--space-3);
	}

	.user-avatar {
		width: 40px;
		height: 40px;
		border-radius: var(--radius-full);
		object-fit: cover;
		flex-shrink: 0;
	}

	.user-info {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		min-width: 0;
	}

	.username {
		font-weight: 500;
		font-size: 0.9375rem;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.collision-badge {
		flex-shrink: 0;
		color: var(--cosmic);
	}

	.user-uuid {
		font-size: clamp(0.56rem, 1.2vw, 0.75rem);
		color: var(--accent);
		letter-spacing: 0.01em;
		white-space: nowrap;
		line-height: 1.4;
	}

	.user-card-footer {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-top: auto;
	}

	.user-date {
		font-size: 0.75rem;
		color: var(--text-subtle);
	}

	.view-link {
		font-size: 0.75rem;
		color: var(--accent);
		opacity: 0;
		transition: opacity 0.15s ease;
	}

	.user-card:hover .view-link {
		opacity: 1;
	}

	.users-more {
		display: flex;
		justify-content: center;
		margin-top: var(--space-5);
	}
</style>
