import { env } from "$env/dynamic/private";
import { PUBLIC_BASE_URL } from "$env/static/public";
import { createAuthClient } from "better-auth/svelte";

export const authClient = createAuthClient({
	baseURL: env?.RAILWAY_PUBLIC_DOMAIN ?? PUBLIC_BASE_URL,
});
