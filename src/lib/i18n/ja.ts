export const ja = {
	meta: {
		siteName: 'JustUUID',
		description: 'あなただけの恒久的なIDを、ひとつのUUIDで。',
		ogDescription:
			'GitHubでログインして、あなただけの恒久的なUUID v4を取得しましょう。',
	},
	nav: {
		home: 'ホーム',
		myPage: 'マイページ',
		ranking: 'ランキング',
		login: 'GitHubでログイン',
		logout: 'サインアウト',
	},
	lang: {
		en: 'EN',
		ja: 'JA',
	},
	home: {
		hero: {
			title: 'JustUUID',
			subtitle: 'あなただけの恒久的なIDを、ひとつのUUIDで。',
			cta: 'UUIDを取得',
		},
		users: {
			title: 'ユーザー',
			empty: 'まだユーザーはいません。最初の1人になりましょう。',
			viewProfile: '表示',
			memberSince: '参加',
			registered: '登録済み',
			searchPlaceholder: 'ユーザー名で検索...',
			searchResults: '「{query}」の検索結果: {count}件',
			noResults: '「{query}」に一致するユーザーは見つかりませんでした。',
			randomHint:
				'ランダムに表示しています。特定のユーザーを探すときは検索を使ってください。',
		},
		cosmic: {
			banner:
				'このシステムで UUID v4 の衝突が記録されました。5.3×10^36分の1級の出来事です。',
		},
	},
	user: {
		copyUuid: 'UUIDをコピー',
		copyUrl: 'URLをコピー',
		copied: 'コピーしました',
		memberSince: '登録日',
		notFound: 'ユーザーが見つかりません',
		notFoundDesc: 'このUUIDに対応するユーザーは存在しません。',
		yourPage: 'これはあなたのページです。',
		sharePrompt: 'このURLを共有できます:',
		ogDescription:
			'@{username} の恒久的なUUIDは {uuid} です。JustUUIDで発行されました。',
		badgeLabel: 'GitHub README バッジ',
		badgeHint: 'GitHub の README に貼り付けてください:',
		copyBadge: 'バッジコードをコピー',
		cosmic: {
			badge: '宇宙的衝突',
			title: 'UUIDの衝突が検出されました',
			description:
				'このUUIDは衝突のあとに生成されました。極めて低い確率の出来事です。',
		},
		similar: {
			title: '最も近いUUID',
			empty: 'まだ他のユーザーが登録されていません。',
		},
	},
	ranking: {
		title: 'UUID類似度ランキング',
		subtitle: '全ユーザーの中で最も近いUUIDのペア。',
		empty: 'まだペアがありません。最初の1人になりましょう！',
	},
	auth: {
		error: '認証に失敗しました。もう一度お試しください。',
		invalidState: '認証状態が不正です。もう一度お試しください。',
	},
	errors: {
		notFound: '404 - 見つかりません',
		notFoundDesc: 'お探しのページは存在しません。',
		goHome: 'ホームへ戻る',
	},
	footer: {
		privacyPolicy: 'プライバシーポリシー',
		termsOfService: '利用規約',
		tagline: 'UUID v4 ・ あなただけの恒久的なID',
	},
	privacy: {
		title: 'プライバシーポリシー',
		lastUpdated: '最終更新: 2026年3月',
		sections: {
			collect: {
				title: '収集する情報',
				body: 'GitHubでサインインすると、GitHubユーザーID、ユーザー名、プロフィール画像URLを取得します。また、アカウントに恒久的に関連付けられるUUID v4を保存します。メールアドレスなど、運用に不要な個人情報は収集しません。',
			},
			use: {
				title: '情報の利用方法',
				body: 'GitHubユーザー名、プロフィール画像、UUIDは公開プロフィールページの表示とアカウント識別に利用されます。広告目的での利用、販売、行動追跡のための共有は行いません。',
			},
			storage: {
				title: 'データの保存',
				body: 'データはCloudflareのインフラ上に保存されます。UUIDの恒久性を保つため、関連データはサービス運営期間中保持される場合があります。',
			},
			cookies: {
				title: 'Cookie',
				body: 'ログイン状態の維持と言語設定の保存のためにCookieを使用します。広告CookieやクロスサイトトラッキングCookieは使用しません。',
			},
			thirdParty: {
				title: '第三者サービス',
				body: '認証にはGitHub OAuthを使用します。サインイン時にGitHubへ送信される情報には、GitHubのポリシーも適用されます。',
			},
			deletion: {
				title: 'データ削除',
				body: 'データ削除を希望する場合は運営者へ連絡してください。なお、一度使われたUUIDが別ユーザーへ再割り当てされることはありません。',
			},
			contact: {
				title: 'お問い合わせ',
				body: 'プライバシーに関する問い合わせは、運営者のGitHubプロフィール（@otoneko1102）からお願いします。',
			},
		},
	},
	terms: {
		title: '利用規約',
		lastUpdated: '最終更新: 2026年3月',
		sections: {
			service: {
				title: '本サービスについて',
				body: 'JustUUIDは、GitHubアカウントに恒久的なUUID v4を割り当て、公開URLでその識別子を表示するサービスです。',
			},
			use: {
				title: '利用条件',
				body: '本サービスは適法な目的にのみ利用できます。過剰な負荷、不正アクセス、なりすまし、妨害行為は禁止です。',
			},
			availability: {
				title: '提供状況',
				body: '本サービスは無償で提供されており、事前の通知なく変更、中断、終了されることがあります。稼働率や永続的な提供は保証しません。',
			},
			uuid: {
				title: 'UUIDの恒久性',
				body: 'UUIDは発行を受けたGitHubアカウントに恒久的に結び付けられ、別ユーザーへ再割り当てされることはありません。ただし、サービス自体の永続提供を保証するものではありません。',
			},
			intellectual: {
				title: '公開ソースコードと権利',
				body: '本サービスのソースコードは公開リポジトリで公開されています。コードの利用、複製、改変、再配布は、そのリポジトリのライセンスに従います。ただし、非公式のデプロイを公式のJustUUIDサービスとして偽ることは禁止します。',
			},
			disclaimer: {
				title: '免責事項',
				body: '本サービスは現状有姿で提供され、いかなる保証も行いません。本サービスの利用によって生じた損害について、運営者は責任を負いません。',
			},
		},
	},
} as const;
