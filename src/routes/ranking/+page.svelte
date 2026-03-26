<script lang="ts">
	import { t } from '$lib/i18n';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const T = $derived(t(data.lang));

	const MEDAL = ['🥇', '🥈', '🥉'];

	function rankClass(index: number): string {
		if (index === 0) return 'rank-gold';
		if (index === 1) return 'rank-silver';
		if (index === 2) return 'rank-bronze';
		return '';
	}
</script>

<svelte:head>
	<title>{T.ranking.title} - JustUUID</title>
	<meta name="description" content={T.ranking.subtitle} />
</svelte:head>

<div class="ranking-page container">
	<div class="ranking-header">
		<h1 class="ranking-title">
			<span class="mi" style="color: var(--accent); font-size: 1.5rem;">leaderboard</span>
			{T.ranking.title}
		</h1>
		<p class="ranking-subtitle">{T.ranking.subtitle}</p>
	</div>

	{#if data.pairs.length === 0}
		<div class="empty-state">
			<span class="mi empty-icon">group_add</span>
			<p class="empty-text">{T.ranking.empty}</p>
			<a href="/login" class="btn btn-primary btn-sm">{T.nav.login}</a>
		</div>
	{:else}
		<ol class="pairs-list">
			{#each data.pairs as pair, index}
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
							<img src={pair.avatar_url_a} alt="@{pair.username_a}" class="pair-avatar" />
							<div class="pair-user-info">
								<span class="pair-username">@{pair.username_a}</span>
								<span class="mono pair-uuid">{pair.uuid_a.slice(0, 8)}…</span>
							</div>
						</a>

						<div class="pair-vs">
							<span class="mi mi-sm" style="color: var(--text-subtle)">compare_arrows</span>
						</div>

						<a href="/u/{pair.uuid_b}" class="pair-user">
							<img src={pair.avatar_url_b} alt="@{pair.username_b}" class="pair-avatar" />
							<div class="pair-user-info">
								<span class="pair-username">@{pair.username_b}</span>
								<span class="mono pair-uuid">{pair.uuid_b.slice(0, 8)}…</span>
							</div>
						</a>
					</div>

					<div class="pair-score-wrap">
						<span class="pair-pct">{(pair.score * 100).toFixed(2)}%</span>
						<div class="pair-bar-bg">
							<div class="pair-bar-fill" style="width: {(pair.score * 100).toFixed(2)}%"></div>
						</div>
					</div>
				</li>
			{/each}
		</ol>
	{/if}
</div>

<style>
	.ranking-page {
		display: flex;
		flex-direction: column;
		gap: var(--space-8);
		padding-block: var(--space-12) var(--space-16);
		max-width: 720px;
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
		font-size: 1.75rem;
		font-weight: 700;
		letter-spacing: -0.02em;
	}

	.ranking-subtitle {
		font-size: 0.9375rem;
		color: var(--text-muted);
		line-height: 1.6;
	}

	/* Empty state */
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

	/* Pairs list */
	.pairs-list {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}

	.pair-card {
		display: flex;
		align-items: center;
		gap: var(--space-4);
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--radius-lg);
		padding: var(--space-4) var(--space-5);
		transition: border-color 0.15s ease;
	}

	.pair-card:hover {
		border-color: var(--accent);
	}

	.pair-card.rank-gold {
		border-color: rgba(251, 191, 36, 0.4);
		background: linear-gradient(135deg, rgba(251, 191, 36, 0.05) 0%, var(--surface) 50%);
	}

	.pair-card.rank-silver {
		border-color: rgba(156, 163, 175, 0.4);
		background: linear-gradient(135deg, rgba(156, 163, 175, 0.05) 0%, var(--surface) 50%);
	}

	.pair-card.rank-bronze {
		border-color: rgba(180, 117, 60, 0.4);
		background: linear-gradient(135deg, rgba(180, 117, 60, 0.05) 0%, var(--surface) 50%);
	}

	.pair-rank {
		flex-shrink: 0;
		width: 40px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.medal {
		font-size: 1.5rem;
		line-height: 1;
	}

	.rank-num {
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--text-subtle);
	}

	.pair-users {
		flex: 1;
		display: flex;
		align-items: center;
		gap: var(--space-3);
		min-width: 0;
	}

	.pair-user {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		min-width: 0;
		flex: 1;
		text-decoration: none;
		color: var(--text);
		border-radius: var(--radius-sm);
		padding: var(--space-1);
		transition: background 0.15s ease;
	}

	.pair-user:hover {
		background: var(--bg);
	}

	.pair-avatar {
		width: 36px;
		height: 36px;
		border-radius: var(--radius-full);
		object-fit: cover;
		border: 1px solid var(--border);
		flex-shrink: 0;
	}

	.pair-user-info {
		display: flex;
		flex-direction: column;
		gap: 2px;
		min-width: 0;
	}

	.pair-username {
		font-size: 0.875rem;
		font-weight: 500;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.pair-uuid {
		font-size: 0.5625rem;
		color: var(--text-subtle);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.pair-vs {
		flex-shrink: 0;
		padding-inline: var(--space-2);
	}

	.pair-score-wrap {
		flex-shrink: 0;
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		gap: var(--space-1);
		min-width: 68px;
	}

	.pair-pct {
		font-size: 1rem;
		font-weight: 700;
		color: var(--accent);
	}

	.pair-bar-bg {
		width: 68px;
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

	@media (max-width: 600px) {
		.ranking-page {
			padding-block: var(--space-6) var(--space-8);
		}

		.ranking-title {
			font-size: 1.375rem;
		}

		.pair-card {
			flex-wrap: wrap;
			gap: var(--space-3);
			padding: var(--space-3) var(--space-4);
		}

		.pair-users {
			flex-direction: column;
			align-items: flex-start;
			gap: var(--space-2);
			width: 100%;
		}

		.pair-vs {
			display: none;
		}

		.pair-user {
			width: 100%;
		}

		.pair-score-wrap {
			width: 100%;
			align-items: flex-start;
		}

		.pair-bar-bg {
			width: 100%;
		}

		.pair-uuid {
			font-size: 0.5rem;
		}
	}
</style>
