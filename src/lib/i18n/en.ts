export const en = {
	meta: {
		siteName: 'JustUUID',
		description: 'Your permanent identity, one UUID at a time.',
		ogDescription: 'Sign in with GitHub and get your own permanent UUID v4. Your identity, forever.',
	},
	nav: {
		home: 'Home',
		myPage: 'My Page',
		ranking: 'Ranking',
		login: 'Login with GitHub',
		logout: 'Sign out',
	},
	lang: {
		en: 'EN',
		ja: 'JA',
	},
	home: {
		hero: {
			title: 'JustUUID',
			subtitle: 'Your permanent identity, one UUID at a time.',
			cta: 'Get your UUID',
		},
		users: {
			title: 'Users',
			empty: 'No users yet. Be the first!',
			viewProfile: 'View',
			memberSince: 'Joined',
			registered: 'registered',
			searchPlaceholder: 'Search by username...',
			searchResults: '{count} results for "{query}"',
			noResults: 'No users found for "{query}".',
			randomHint: 'Showing a random selection. Use search to find specific users.',
		},
		cosmic: {
			banner: 'A UUID v4 collision has been recorded in this system — a 1 in 5.3×10³⁶ event.',
		},
	},
	user: {
		copyUuid: 'Copy UUID',
		copyUrl: 'Copy URL',
		copied: 'Copied!',
		memberSince: 'Member since',
		notFound: 'User not found',
		notFoundDesc: "There's no user with this UUID.",
		yourPage: 'This is your unique page.',
		sharePrompt: 'Share this URL with anyone:',
		ogDescription: '@{username}\'s permanent UUID is {uuid} — assigned on JustUUID.',
		cosmic: {
			badge: 'Cosmic Collision',
			title: 'UUID Collision Detected',
			description:
				'This UUID was generated after a collision — a 1 in 5.3×10³⁶ chance event. The laws of probability have been defied.',
		},
		similar: {
			title: 'Most Similar UUIDs',
			hint: 'Leading bits are weighted more heavily.',
			empty: 'No other users registered yet.',
		},
	},
	ranking: {
		title: 'UUID Similarity Ranking',
		subtitle: 'The most similar UUID pairs. Leading bits carry more weight.',
		empty: 'No pairs yet. Be among the first to join!',
	},
	auth: {
		error: 'Authentication failed. Please try again.',
		invalidState: 'Invalid authentication state. Please try again.',
	},
	errors: {
		notFound: '404 — Not Found',
		notFoundDesc: 'The page you\'re looking for doesn\'t exist.',
		goHome: 'Go Home',
	},
	footer: {
		privacyPolicy: 'Privacy Policy',
		termsOfService: 'Terms of Service',
		tagline: 'UUID v4 • Forever yours',
	},
	privacy: {
		title: 'Privacy Policy',
		lastUpdated: 'Last updated: March 2026',
		sections: {
			collect: {
				title: 'Information We Collect',
				body: 'When you sign in with GitHub, we collect your GitHub user ID, username, and profile avatar URL. We also store a randomly generated UUID v4 that is permanently associated with your account. We do not collect email addresses or any other personal information.',
			},
			use: {
				title: 'How We Use Your Information',
				body: 'Your GitHub username and avatar are displayed on your public profile page. Your UUID serves as your permanent public identifier. We do not sell, share, or use your information for advertising.',
			},
			storage: {
				title: 'Data Storage',
				body: 'Your data is stored in Cloudflare\'s infrastructure. Your UUID and associated profile are retained indefinitely to preserve your permanent identifier.',
			},
			cookies: {
				title: 'Cookies',
				body: 'We use a single session cookie to keep you signed in and a language preference cookie. No tracking or advertising cookies are used.',
			},
			thirdParty: {
				title: 'Third-Party Services',
				body: 'We use GitHub OAuth for authentication. When you sign in, GitHub\'s privacy policy governs data shared during that process.',
			},
			deletion: {
				title: 'Data Deletion',
				body: 'If you wish to have your data removed, please contact the operator. Note that UUID reassignment to another user will not occur even after deletion.',
			},
			contact: {
				title: 'Contact',
				body: 'For privacy concerns, please contact the operator via their GitHub profile (@otoneko1102).',
			},
		},
	},
	terms: {
		title: 'Terms of Service',
		lastUpdated: 'Last updated: March 2026',
		sections: {
			service: {
				title: 'The Service',
				body: 'JustUUID provides each GitHub user with a permanent, unique UUID v4 identifier accessible at a public URL. The service is operated privately and the source code is not publicly available.',
			},
			use: {
				title: 'Acceptable Use',
				body: 'You may use this service for any lawful purpose. You may not attempt to abuse, disrupt, or overload the service. You are responsible for your GitHub account security.',
			},
			availability: {
				title: 'Availability',
				body: 'We strive to keep the service available but do not guarantee uptime. The service is provided free of charge and may change or be discontinued at any time without prior notice.',
			},
			uuid: {
				title: 'UUID Permanence',
				body: 'Your UUID is permanently linked to your GitHub account and will not be reassigned to another user. However, we do not guarantee that the service will remain available indefinitely.',
			},
			intellectual: {
				title: 'Intellectual Property',
				body: 'The source code of this service is proprietary and not publicly available. Unauthorized access to, reproduction of, or reverse engineering of the source code is prohibited.',
			},
			disclaimer: {
				title: 'Disclaimer',
				body: 'The service is provided "as is" without warranties of any kind. We are not liable for any damages arising from your use of the service.',
			},
		},
	},
} as const;

export type Translations = typeof en;
