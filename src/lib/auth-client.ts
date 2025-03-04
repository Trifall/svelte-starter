import { PUBLIC_BASE_URL } from "$env/static/public";
import { createAuthClient } from "better-auth/svelte";

export const authClient = createAuthClient({
	baseURL: process.env.RAILWAY_PUBLIC_DOMAIN ? process.env.RAILWAY_PUBLIC_DOMAIN : PUBLIC_BASE_URL,
});
