<script lang="ts">
	import { t } from '$lib/i18n';
	import type { SimilarityPair } from '$lib/types';
	import type { PageData } from './$types';

	type RankingPageData = PageData & {
		totalCount?: number;
	};

	let { data }: { data: RankingPageData } = $props();

	const T = $derived(t(data.lang));
	const MEDAL = ['#1', '#2', '#3'];
	const loadMoreLabel = $derived(
		data.lang === 'ja' ? 'もっと見る' : 'Load more',
	);
	const loadingLabel = $derived(
		data.lang === 'ja' ? '読み込み中...' : 'Loading...',
	);
	const RANKING_PAGE_SIZE = 20;

	let visiblePairs = $state<SimilarityPair[]>([]);
	let totalCount = $state(0);
	let isLoadingMore = $state(false);

	function rankClass(index: number): string {
		if (index === 0) return 'rank-gold';
		if (index === 1) return 'rank-silver';
		if (index === 2) return 'rank-bronze';
		return '';
	}

	$effect(() => {
		visiblePairs = data.pairs;
		totalCount = data.totalCount ?? data.pairs.length;
		isLoadingMore = false;
	});

	async function loadMorePairs() {
		if (isLoadingMore || visiblePairs.length >= totalCount) {
			return;
		}

		isLoadingMore = true;

		try {
			const response = await fetch('/api/ranking', {
				method: 'POST',
				headers: {
					'content-type': 'application/json',
				},
				body: JSON.stringify({
					offset: visiblePairs.length,
					limit: RANKING_PAGE_SIZE,
				}),
			});

			if (!response.ok) {
				throw new Error('Failed to fetch ranking pairs');
			}

			const payload = (await response.json()) as {
				pairs: SimilarityPair[];
				totalCount: number;
			};
			const existingKeys = new Set(
				visiblePairs.map((pair) => `${pair.uuid_a}:${pair.uuid_b}`),
			);
			visiblePairs = [
				...visiblePairs,
				...payload.pairs.filter(
					(pair) => !existingKeys.has(`${pair.uuid_a}:${pair.uuid_b}`),
				),
			];
			totalCount = payload.totalCount;
		} finally {
			isLoadingMore = false;
		}
	}
</script>

<svelte:head>
	<title>{T.ranking.title} - JustUUID</title>
	<meta name="description" content={T.ranking.subtitle} />
</svelte:head>

<div class="ranking-page container">
	<div class="ranking-header">
		<h1 class="ranking-title">
			<span class="mi ranking-title-icon">leaderboard</span>
			{T.ranking.title}
		</h1>
		<p class="ranking-subtitle">{T.ranking.subtitle}</p>
	</div>

	{#if visiblePairs.length === 0}
		<div class="empty-state">
			<span class="mi empty-icon">group_add</span>
			<p class="empty-text">{T.ranking.empty}</p>
			{#if !data.user}
				<a href="/login" class="btn btn-primary btn-sm">{T.nav.login}</a>
			{/if}
		</div>
	{:else}
		<ol class="pairs-list">
			{#each visiblePairs as pair, index}
				<li class="pair-card {rankClass(index)}">
					<div class="pair-rank">
						{#if index < 3}
							<span class="medal">{MEDAL[index]}</span>
						{:else}
							<span class="rank-num">#{index + 1}</span>
						{/if}
					</div>

					<div class="pair-users">
						<a href="/u/{pair.uuid_a}" class="pair-user">
							<img
								src={pair.avatar_url_a}
								alt="@{pair.username_a}"
								class="pair-avatar"
							/>
							<div class="pair-user-info">
								<span class="pair-username">@{pair.username_a}</span>
								<span class="mono pair-uuid" title={pair.uuid_a}
									>{pair.uuid_a}</span
								>
							</div>
						</a>

						<div class="pair-vs">
							<span class="mi mi-sm vs-icon">compare_arrows</span>
						</div>

						<a href="/u/{pair.uuid_b}" class="pair-user">
							<img
								src={pair.avatar_url_b}
								alt="@{pair.username_b}"
								class="pair-avatar"
							/>
							<div class="pair-user-info">
								<span class="pair-username">@{pair.username_b}</span>
								<span class="mono pair-uuid" title={pair.uuid_b}
									>{pair.uuid_b}</span
								>
							</div>
						</a>
					</div>

					<div class="pair-score-wrap">
						<span class="pair-pct">{(pair.score * 100).toFixed(2)}%</span>
						<div class="pair-bar-bg">
							<div
								class="pair-bar-fill"
								style="width: {(pair.score * 100).toFixed(2)}%"
							></div>
						</div>
					</div>
				</li>
			{/each}
		</ol>
		{#if visiblePairs.length < totalCount}
			<div class="ranking-more">
				<button
					type="button"
					class="btn btn-ghost"
					onclick={loadMorePairs}
					disabled={isLoadingMore}
				>
					{#if isLoadingMore}
						{loadingLabel}
					{:else}
						{loadMoreLabel}
					{/if}
				</button>
			</div>
		{/if}
	{/if}
</div>

<style>
	.ranking-page {
		display: flex;
		flex-direction: column;
		gap: var(--space-8);
		padding-block: var(--space-12) var(--space-16);
		max-width: 980px;
	}

	.ranking-header {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.ranking-title {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		font-size: clamp(1.5rem, 1.3rem + 0.7vw, 2rem);
		font-weight: 700;
		letter-spacing: -0.02em;
	}

	.ranking-title-icon {
		color: var(--accent);
		font-size: 1.5rem;
	}

	.ranking-subtitle {
		font-size: 0.9375rem;
		color: var(--text-muted);
		line-height: 1.6;
	}

	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-4);
		padding: var(--space-16) var(--space-8);
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--radius-xl);
		text-align: center;
	}

	.empty-icon {
		font-size: 3rem;
		color: var(--text-subtle);
	}

	.empty-text {
		font-size: 1rem;
		color: var(--text-muted);
	}

	.pairs-list {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}

	.ranking-more {
		display: flex;
		justify-content: center;
		margin-top: var(--space-4);
	}

	.pair-card {
		display: grid;
		grid-template-columns: auto minmax(0, 1fr) auto;
		align-items: center;
		gap: var(--space-5);
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--radius-lg);
		padding: var(--space-5) var(--space-6);
		transition: border-color 0.15s ease;
	}

	.pair-card:hover {
		border-color: var(--accent);
	}

	.pair-card.rank-gold {
		border-color: rgba(251, 191, 36, 0.4);
		background: linear-gradient(
			135deg,
			rgba(251, 191, 36, 0.05) 0%,
			var(--surface) 50%
		);
	}

	.pair-card.rank-silver {
		border-color: rgba(156, 163, 175, 0.4);
		background: linear-gradient(
			135deg,
			rgba(156, 163, 175, 0.05) 0%,
			var(--surface) 50%
		);
	}

	.pair-card.rank-bronze {
		border-color: rgba(180, 117, 60, 0.4);
		background: linear-gradient(
			135deg,
			rgba(180, 117, 60, 0.05) 0%,
			var(--surface) 50%
		);
	}

	.pair-rank {
		flex-shrink: 0;
		width: 42px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.medal {
		font-size: 0.8125rem;
		line-height: 1;
		font-weight: 700;
		padding: 0.25rem 0.5rem;
		border-radius: 9999px;
		border: 1px solid var(--border);
		color: var(--text-muted);
		background: var(--bg);
	}

	.rank-gold .medal {
		border-color: rgba(251, 191, 36, 0.5);
		color: rgb(180, 83, 9);
		background: rgba(251, 191, 36, 0.18);
	}

	.rank-silver .medal {
		border-color: rgba(156, 163, 175, 0.5);
		color: rgb(75, 85, 99);
		background: rgba(156, 163, 175, 0.18);
	}

	.rank-bronze .medal {
		border-color: rgba(180, 117, 60, 0.5);
		color: rgb(120, 53, 15);
		background: rgba(180, 117, 60, 0.18);
	}

	.rank-num {
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--text-subtle);
	}

	.pair-users {
		display: grid;
		grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
		align-items: center;
		gap: var(--space-3);
		min-width: 0;
	}

	.pair-user {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		min-width: 0;
		text-decoration: none;
		color: var(--text);
		border-radius: var(--radius-sm);
		padding: var(--space-2);
		transition: background 0.15s ease;
	}

	.pair-user:hover {
		background: var(--bg);
	}

	.pair-avatar {
		width: 38px;
		height: 38px;
		border-radius: var(--radius-full);
		object-fit: cover;
		border: 1px solid var(--border);
		flex-shrink: 0;
	}

	.pair-user-info {
		display: flex;
		flex-direction: column;
		gap: 3px;
		min-width: 0;
		flex: 1;
		overflow: hidden;
	}

	.pair-username {
		font-size: 0.875rem;
		font-weight: 500;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.pair-uuid {
		display: block;
		font-size: clamp(0.58rem, 0.52rem + 0.22vw, 0.76rem);
		color: var(--text-subtle);
		white-space: nowrap;
		overflow-x: auto;
		overflow-y: hidden;
		line-height: 1.35;
		letter-spacing: 0.01em;
		padding-bottom: 1px;
		scrollbar-width: thin;
	}

	.pair-vs {
		flex-shrink: 0;
		padding-inline: var(--space-2);
	}

	.vs-icon {
		color: var(--text-subtle);
	}

	.pair-score-wrap {
		flex-shrink: 0;
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		gap: var(--space-1);
		min-width: 84px;
	}

	.pair-pct {
		font-size: clamp(0.9375rem, 0.88rem + 0.2vw, 1.08rem);
		font-weight: 700;
		color: var(--accent);
	}

	.pair-bar-bg {
		width: 84px;
		height: 5px;
		background: var(--border);
		border-radius: 9999px;
		overflow: hidden;
	}

	.pair-bar-fill {
		height: 100%;
		background: linear-gradient(90deg, var(--accent), rgba(129, 140, 248, 0.6));
		border-radius: 9999px;
	}

	@media (max-width: 820px) {
		.ranking-page {
			padding-block: var(--space-8) var(--space-10);
			gap: var(--space-6);
		}

		.pair-card {
			padding: var(--space-4) var(--space-4);
			gap: var(--space-4);
		}
	}

	@media (max-width: 680px) {
		.ranking-page {
			padding-block: var(--space-6) var(--space-8);
		}

		.pair-card {
			grid-template-columns: auto minmax(0, 1fr);
			gap: var(--space-3);
			padding: var(--space-3) var(--space-3);
		}

		.pair-rank {
			width: 36px;
		}

		.pair-users {
			grid-column: 1 / -1;
			grid-template-columns: minmax(0, 1fr);
			gap: var(--space-2);
		}

		.pair-user {
			width: 100%;
		}

		.pair-vs {
			display: none;
		}

		.pair-score-wrap {
			grid-column: 1 / -1;
			width: 100%;
			align-items: flex-start;
			margin-top: var(--space-1);
		}

		.pair-bar-bg {
			width: 100%;
		}

		.pair-uuid {
			font-size: clamp(0.52rem, 1.7vw, 0.66rem);
		}
	}

	@media (max-width: 420px) {
		.ranking-title {
			font-size: 1.35rem;
		}

		.pair-card {
			padding: var(--space-2) var(--space-2);
		}

		.pair-avatar {
			width: 32px;
			height: 32px;
		}

		.pair-user {
			padding: var(--space-1);
		}

		.pair-username {
			font-size: 0.8125rem;
		}

		.pair-uuid {
			font-size: 0.52rem;
		}
	}
</style>
