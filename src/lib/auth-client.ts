import { env } from "$env/dynamic/public";
import { createAuthClient } from "better-auth/svelte";

export const authClient = createAuthClient({
	baseURL: import.meta.env?.RAILWAY_PUBLIC_DOMAIN
		? `https://${import.meta.env?.RAILWAY_PUBLIC_DOMAIN}`
		: env.PUBLIC_BASE_URL,
});
