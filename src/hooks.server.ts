import type { DBUser } from '@/database/schema';
import { createChildLogger } from '@/src/lib/server/logger';
import { type Handle, isRedirect, redirect } from '@sveltejs/kit';
import type { HandleValidationError } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { svelteKitHandler } from 'better-auth/svelte-kit';
import { building } from '$app/environment';
import { auth } from '$lib/server/auth';
import { rateLimitService } from '$lib/server/rate-limit';
import { getSetting } from '$lib/server/settings';
import { RoleNames } from '$src/lib/auth/roles-shared';
import { ROUTES } from '$src/lib/routes';

const logger = createChildLogger('Hooks');

// server startup tasks (only when not building)
if (!building) {
	const isBun = typeof Bun !== 'undefined' || !!process.versions.bun;
	if (isBun) {
		logger.debug('Bun detected!');
	}

	/*
	 * sequential service initialization
	 * settings -> rate limiting
	 */
	(async () => {
		try {
			logger.info('Step 1: Initializing settings service...');
			const { settingsService } = await import('$lib/server/settings');
			await settingsService.get('firstTimeSetupCompleted'); // This triggers initialization
			logger.info('Settings service initialized');

			logger.info('Step 2: Initializing rate limiting service...');
			await rateLimitService.initialize();
			logger.info('Rate limiting service initialized');

			logger.info('All services initialized successfully');
		} catch (error) {
			logger.error(`Fatal: Failed to initialize services: ${error}`);
			process.exit(1);
		}
	})();
}

export const handle: Handle = sequence(
	// setup redirect middleware - check if first-time setup is completed
	async ({ event, resolve }) => {
		// skip during build process
		if (building) {
			return resolve(event);
		}

		const url = new URL(event.request.url);

		// allow access to setup page itself and API routes
		if (url.pathname === '/setup' || url.pathname.startsWith('/api/')) {
			return resolve(event);
		}

		// allow access to static assets
		if (
			url.pathname.startsWith('/_app/') ||
			url.pathname.startsWith('/static/') ||
			url.pathname.match(/\.(css|js|png|jpg|jpeg|svg|ico|webp|gif)$/)
		) {
			return resolve(event);
		}

		// check if setup is completed
		try {
			const setupCompleted = await getSetting('firstTimeSetupCompleted');

			if (!setupCompleted) {
				// redirect to setup page if not completed
				throw redirect(302, ROUTES.SETUP);
			}
		} catch (error) {
			// if it is a redirect, re-throw it
			if (isRedirect(error)) {
				throw error;
			}
			// log other errors but continue (fail-open to avoid blocking access)
			logger.error(`Failed to check setup status: ${JSON.stringify(error)}`);
		}

		return resolve(event);
	},
	// session middleware
	async ({ event, resolve }) => {
		const session = await auth.api.getSession({ headers: event.request.headers });

		if (session && 'user' in session) {
			event.locals.user = session.user as DBUser;
			event.locals.isAdmin = session.user.role === RoleNames.admin;
		} else {
			event.locals.user = null;
			event.locals.isAdmin = false;
		}

		return resolve(event);
	},
	// better-auth handler
	async ({ event, resolve }) => {
		return svelteKitHandler({ event, resolve, auth, building });
	}
);

export const handleValidationError: HandleValidationError = () => {
	return {
		message: 'Bad Request',
	};
};
