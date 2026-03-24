export const ja = {
	meta: {
		siteName: 'JustUUID',
		description: 'あなただけの永続的なID。',
		ogDescription: 'GitHubでログインして、あなただけの永続的なUUID v4を取得しましょう。',
	},
	nav: {
		home: 'ホーム',
		myPage: 'マイページ',
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
			subtitle: 'あなただけの永続的なID。',
			cta: 'UUIDを取得する',
		},
		users: {
			title: 'ユーザー',
			empty: 'まだユーザーがいません。最初になりましょう！',
			viewProfile: '表示',
			memberSince: '参加',
			registered: '人登録済み',
			searchPlaceholder: 'ユーザー名で検索...',
			searchResults: '「{query}」の検索結果: {count}件',
			noResults: '「{query}」に一致するユーザーは見つかりませんでした。',
			randomHint: 'ランダムに表示しています。検索で特定のユーザーを見つけられます。',
		},
		cosmic: {
			banner: 'このシステムでUUID v4の衝突が記録されました — 5.3×10³⁶分の1の出来事です。',
		},
	},
	user: {
		copyUuid: 'UUIDをコピー',
		copyUrl: 'URLをコピー',
		copied: 'コピーしました！',
		memberSince: '参加日',
		notFound: 'ユーザーが見つかりません',
		notFoundDesc: 'このUUIDに対応するユーザーは存在しません。',
		yourPage: 'これはあなたのページです。',
		sharePrompt: 'このURLを誰かと共有しましょう：',
		ogDescription: '@{username}の永続的なUUIDは {uuid} — JustUUIDにて発行。',
		cosmic: {
			badge: '宇宙的衝突',
			title: 'UUID衝突を検出',
			description:
				'このUUIDは衝突が発生した後に生成されました — 5.3×10³⁶分の1という確率の出来事です。確率の法則が覆されました。',
		},
	},
	auth: {
		error: '認証に失敗しました。もう一度お試しください。',
		invalidState: '認証状態が無効です。もう一度お試しください。',
	},
	errors: {
		notFound: '404 — 見つかりません',
		notFoundDesc: 'お探しのページは存在しません。',
		goHome: 'ホームへ戻る',
	},
	footer: {
		privacyPolicy: 'プライバシーポリシー',
		termsOfService: '利用規約',
		tagline: 'UUID v4 • あなたのものとして永遠に',
	},
	privacy: {
		title: 'プライバシーポリシー',
		lastUpdated: '最終更新：2026年3月',
		sections: {
			collect: {
				title: '収集する情報',
				body: 'GitHubでサインインすると、GitHubユーザーID、ユーザーネーム、プロフィールアバターURLを収集します。また、あなたのアカウントに永続的に関連付けられたランダム生成UUID v4を保存します。メールアドレスや他の個人情報は収集しません。',
			},
			use: {
				title: '情報の利用方法',
				body: 'GitHubのユーザーネームとアバターはあなたの公開プロフィールページに表示されます。UUIDはあなたの永続的な公開識別子として機能します。情報を販売、共有、または広告目的で使用することはありません。',
			},
			storage: {
				title: 'データの保存',
				body: 'データはCloudflareのインフラストラクチャに保存されます。あなたのUUIDと関連プロフィールは、永続的な識別子を維持するために無期限に保持されます。',
			},
			cookies: {
				title: 'Cookie',
				body: 'ログイン状態を維持するためのセッションCookieと言語設定Cookieを使用します。トラッキングや広告用のCookieは使用しません。',
			},
			thirdParty: {
				title: 'サードパーティサービス',
				body: '認証にGitHub OAuthを使用しています。サインイン時にGitHubのプライバシーポリシーがそのプロセスで共有されるデータに適用されます。',
			},
			deletion: {
				title: 'データの削除',
				body: 'データの削除をご希望の場合は、運営者にお問い合わせください。なお、削除後もUUIDが他のユーザーに再割り当てられることはありません。',
			},
			contact: {
				title: 'お問い合わせ',
				body: 'プライバシーに関するご懸念は、運営者のGitHubプロフィール（@otoneko1102）からお問い合わせください。',
			},
		},
	},
	terms: {
		title: '利用規約',
		lastUpdated: '最終更新：2026年3月',
		sections: {
			service: {
				title: 'サービスについて',
				body: 'JustUUIDは各GitHubユーザーに、公開URLでアクセス可能な永続的で一意のUUID v4識別子を提供します。本サービスは非公開で運営されており、ソースコードは公開されていません。',
			},
			use: {
				title: '適切な利用',
				body: 'このサービスは合法的な目的であれば自由にご利用いただけます。サービスの悪用、妨害、過負荷をかけることは禁止します。GitHubアカウントのセキュリティはご自身の責任です。',
			},
			availability: {
				title: '可用性',
				body: 'サービスの可用性維持に努めますが、稼働時間を保証するものではありません。サービスは無料で提供されており、予告なく変更または終了する場合があります。',
			},
			uuid: {
				title: 'UUIDの永続性',
				body: 'あなたのUUIDはGitHubアカウントに永続的にリンクされ、他のユーザーに再割り当てられることはありません。ただし、サービスが無期限に利用可能であることは保証しません。',
			},
			intellectual: {
				title: '知的財産権',
				body: '本サービスのソースコードは非公開であり、無断でのアクセス、複製、リバースエンジニアリングは禁止されています。',
			},
			disclaimer: {
				title: '免責事項',
				body: 'サービスはいかなる種類の保証もなく「現状のまま」提供されます。サービスの利用から生じるいかなる損害についても責任を負いません。',
			},
		},
	},
} as const;
