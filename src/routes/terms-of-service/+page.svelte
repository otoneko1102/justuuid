<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	type Section = { title: string; body: string };

	const content = $derived.by(() => {
		if (data.lang === 'ja') {
			return {
				title: '利用規約',
				lastUpdated: '最終更新: 2026年3月',
				sections: [
					{
						title: '本サービスについて',
						body: 'JustUUID は、GitHub アカウントに恒久的な UUID v4 を割り当て、その識別子を公開 URL で表示するサービスです。'
					},
					{
						title: '利用条件',
						body: '本サービスは適法な目的にのみ利用できます。過剰な負荷、不正アクセス、なりすまし、妨害行為は禁止です。'
					},
					{
						title: '公開プロフィール',
						body: 'プロフィールページは公開されます。サービスを通じて表示される情報が公開状態になることを理解したうえで利用してください。'
					},
					{
						title: '提供状況',
						body: '本サービスは無償で提供されており、事前の通知なく変更、中断、終了されることがあります。稼働率や長期的な提供は保証しません。'
					},
					{
						title: 'UUIDの恒久性',
						body: 'UUID は発行を受けた GitHub アカウントに恒久的に結び付けられ、別ユーザーへ再割り当てされることはありません。ただし、サービス自体の永続提供を保証するものではありません。'
					},
					{
						title: '公開ソースコードと権利',
						body: '本サービスのソースコードは公開リポジトリで公開されています。コードの利用、複製、改変、再配布は、そのリポジトリのライセンスに従います。ただし、非公式のデプロイを公式の JustUUID サービスとして偽ることは禁止します。'
					},
					{
						title: '免責事項',
						body: '本サービスは現状有姿で提供され、いかなる保証も行いません。本サービスの利用によって生じた損害について、運営者は責任を負いません。'
					}
				] satisfies Section[]
			};
		}

		return {
			title: 'Terms of Service',
			lastUpdated: 'Last updated: March 2026',
			sections: [
				{
					title: 'The Service',
					body: 'JustUUID assigns a permanent UUID v4 to a GitHub account and exposes that identity through a public URL.'
				},
				{
					title: 'Acceptable Use',
					body: 'You may use this service only for lawful purposes. You may not abuse, overload, disrupt, impersonate others, or attempt unauthorized access to the service or its infrastructure.'
				},
				{
					title: 'Public Profiles',
					body: 'Profile pages are public. You are responsible for understanding that the profile information exposed by the service is publicly accessible.'
				},
				{
					title: 'Availability',
					body: 'The service is provided free of charge and may change, be interrupted, or be discontinued at any time. We do not guarantee uptime or long-term availability.'
				},
				{
					title: 'UUID Permanence',
					body: 'A UUID is permanently linked to the GitHub account that received it and will not be reassigned to another user. This does not guarantee that the service itself will exist forever.'
				},
				{
					title: 'Public Source Code and Rights',
					body: 'The source code for this service is available in a public repository. Use, copying, modification, and redistribution of that code are governed by the repository license. However, you may not misrepresent an unofficial deployment as the official JustUUID service.'
				},
				{
					title: 'Disclaimer',
					body: 'The service is provided "as is" without warranties of any kind. The operator is not liable for damages resulting from use of the service.'
				}
			] satisfies Section[]
		};
	});
</script>

<svelte:head>
	<title>{content.title} - JustUUID</title>
</svelte:head>

<div class="legal-page container">
	<header class="legal-header">
		<h1>{content.title}</h1>
		<p class="updated">{content.lastUpdated}</p>
	</header>

	<article class="legal-content">
		{#each content.sections as section}
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
