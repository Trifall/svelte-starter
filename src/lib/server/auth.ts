import { BETTER_AUTH_SECRET, GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET } from "$env/static/private";
import { PUBLIC_BASE_URL } from "$env/static/public";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

import { db } from "./db";

if (!PUBLIC_BASE_URL && !import.meta.env?.RAILWAY_PUBLIC_DOMAIN)
	throw new Error("PUBLIC_BASE_URL is not set");

console.log(`env?.RAILWAY_PUBLIC_DOMAIN ${import.meta.env?.RAILWAY_PUBLIC_DOMAIN}`);

export const auth = betterAuth({
	baseURL: import.meta.env?.RAILWAY_PUBLIC_DOMAIN ?? PUBLIC_BASE_URL!,
	database: drizzleAdapter(db, {
		provider: "pg",
	}),
	secret: BETTER_AUTH_SECRET,
	// https://www.better-auth.com/docs/concepts/session-management#session-caching
	session: {
		cookieCache: {
			enabled: true,
			maxAge: 5 * 60, // 5 minutes
		},
	},

	// https://www.better-auth.com/docs/concepts/oauth
	socialProviders: {
		github: {
			clientId: GITHUB_CLIENT_ID!,
			clientSecret: GITHUB_CLIENT_SECRET!,
		},
		// google: {
		// 	clientId: env.GOOGLE_CLIENT_ID!,
		// 	clientSecret: env.GOOGLE_CLIENT_SECRET!,
		// },
		// discord: {
		// 	clientId: env.DISCORD_CLIENT_ID!,
		// 	clientSecret: env.DISCORD_CLIENT_SECRET!,
		// },
	},

	// https://www.better-auth.com/docs/authentication/email-password
	// emailAndPassword: {
	//   enabled: true,
	// },
});
