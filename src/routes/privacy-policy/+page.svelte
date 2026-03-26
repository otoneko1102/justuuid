<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	type Section = { title: string; body: string };

	const content = $derived.by(() => {
		if (data.lang === 'ja') {
			return {
				title: 'プライバシーポリシー',
				lastUpdated: '最終更新: 2026年3月',
				sections: [
					{
						title: '収集する情報',
						body: 'JustUUID では、GitHub でサインインした際に GitHub ユーザー ID、ユーザー名、プロフィール画像 URL を取得します。また、そのアカウントに恒久的に結び付けられる UUID v4 を保存します。メールアドレスなど、サービス運営に不要な個人情報は収集しません。',
					},
					{
						title: '情報の利用方法',
						body: '取得した GitHub ユーザー名、プロフィール画像、UUID は、公開プロフィールページの表示とアカウント識別のために利用します。広告目的での利用、販売、行動追跡のための共有は行いません。',
					},
					{
						title: '公開プロフィール情報',
						body: 'GitHub ユーザー名、プロフィール画像、UUID、登録日は公開プロフィールページに表示されます。JustUUID を、非公開または機微な識別情報の保管先として利用しないでください。',
					},
					{
						title: 'データの保存',
						body: 'データは Cloudflare のインフラ上に保存されます。UUID の恒久性を保つため、関連データはサービス運営期間中保持される場合があります。',
					},
					{
						title: 'Cookie',
						body: 'ログイン状態の維持と言語設定の保存のために Cookie を使用します。広告 Cookie やクロスサイトトラッキング Cookie は使用しません。',
					},
					{
						title: '第三者サービス',
						body: '認証には GitHub OAuth を使用します。サインイン時にやり取りされる情報には、GitHub のポリシーも適用されます。',
					},
					{
						title: '公開リポジトリ',
						body: '本サービスのソースコードは公開リポジトリで公開されています。ただし、デプロイ用の秘密情報や運用用の認証情報は、そのリポジトリには含まれていません。',
					},
					{
						title: 'お問い合わせ',
						body: 'プライバシーに関する問い合わせは、運営者の GitHub プロフィール（@otoneko1102）からお願いします。',
					},
				] satisfies Section[],
			};
		}

		return {
			title: 'Privacy Policy',
			lastUpdated: 'Last updated: March 2026',
			sections: [
				{
					title: 'Information We Collect',
					body: 'When you sign in with GitHub, JustUUID collects your GitHub user ID, username, and profile avatar URL. We also store a UUID v4 that is permanently associated with that account. We do not collect email addresses or other personal information beyond what is needed to operate the service.',
				},
				{
					title: 'How We Use This Information',
					body: 'Your GitHub username, avatar, and UUID are used to identify your account and display your public profile page. We do not sell your data, use it for advertising, or share it for behavioral tracking.',
				},
				{
					title: 'Public Profile Data',
					body: 'Your GitHub username, avatar, UUID, and joined date are displayed on a public profile page. Do not use JustUUID for private or sensitive identity information.',
				},
				{
					title: 'Data Storage',
					body: 'Data is stored on Cloudflare infrastructure. To preserve UUID permanence, associated account data may be retained for as long as the service operates.',
				},
				{
					title: 'Cookies',
					body: 'We use cookies to keep you signed in and remember your language preference. We do not use advertising or cross-site tracking cookies.',
				},
				{
					title: 'Third-Party Services',
					body: 'Authentication is handled through GitHub OAuth. Information exchanged during sign-in is also subject to GitHub policies.',
				},
				{
					title: 'Public Repository',
					body: 'The source code for this service is available in a public repository. Deployment secrets and operational credentials are not stored in that repository.',
				},
				{
					title: 'Contact',
					body: 'For privacy-related questions, contact the operator through their GitHub profile (@otoneko1102).',
				},
			] satisfies Section[],
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
