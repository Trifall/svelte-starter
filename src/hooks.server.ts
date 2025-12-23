import { createChildLogger } from '@/src/lib/server/logger';
import type { Handle, HandleValidationError } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { building } from '$app/environment';

const logger = createChildLogger('Hooks');

// server startup tasks (only when not building)
if (!building) {
	const isBun = typeof Bun !== 'undefined' || !!process.versions.bun;
	if (isBun) {
		logger.debug('Bun detected!');
	}
}

export const handle: Handle = sequence(
	// protocol fix and debug logging for reverse proxy
	async ({ event, resolve }) => {
		const proto = event.request.headers.get('x-forwarded-proto');
		if (proto === 'https') {
			event.url.protocol = 'https:';
		}

		return resolve(event);
	},
	// setup redirect middleware - check if first-time setup is completed
	async ({ event, resolve }) => {
		// skip during build process
		if (building) {
			return resolve(event);
		}

		const url = new URL(event.request.url);

		// allow access to API routes
		if (url.pathname.startsWith('/api/')) {
			return resolve(event);
		}

		return resolve(event);
	}
);

export const handleValidationError: HandleValidationError = () => {
	return {
		message: 'Bad Request',
	};
};
