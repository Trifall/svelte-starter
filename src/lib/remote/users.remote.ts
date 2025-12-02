import type { DBUser } from '@/database/schema';
import { user } from '@/database/schema/auth.schema';
import { requirePermission } from '@/src/lib/server/auth';
import { db } from '@/src/lib/server/db';
import { createChildLogger } from '@/src/lib/server/logger';
import { secureSearchQuery } from '@/src/lib/shared/auth';
import { error } from '@sveltejs/kit';
import { and, ilike, ne } from 'drizzle-orm';
import * as z from 'zod';
import { getRequestEvent, query } from '$app/server';
import { PERMISSIONS } from '$src/lib/auth/roles-shared';

const logger = createChildLogger('UsersRemote');

/**
 * Search for users by username
 */
export const searchUsers = query(
	z.object({
		q: z.string().optional(),
		includeSelf: z.boolean().optional().default(false),
	}),
	async ({ q, includeSelf }) => {
		logger.debug(`searchUsers called with q: ${q}, includeSelf: ${includeSelf}`);

		// get the full request event context on the server
		const event = getRequestEvent();
		if (!event) {
			throw error(500, 'Request context not available');
		}

		const { locals } = event;
		const dbUser = (locals.user as DBUser | null) || null;

		// check authentication
		if (!dbUser?.id) {
			logger.warn('Unauthenticated user search attempt');
			throw error(401, 'Authentication required');
		}

		// check permissions
		try {
			await requirePermission(dbUser, {
				user: [PERMISSIONS.user['get:any']],
			});
		} catch {
			throw error(403, 'Insufficient permissions');
		}

		// validate search query - prevent injection attacks
		if (q) {
			const validation = secureSearchQuery.safeParse(q);
			if (!validation.success) {
				throw error(400, 'Invalid search query - contains unsafe characters');
			}
		}

		// if no query provided, return first 10 users (for initial dropdown)
		if (!q) {
			const conditions = [
				ne(user.banned, true), // exclude banned users
			];

			if (!includeSelf) {
				conditions.push(ne(user.id, dbUser.id));
			}

			const users = await db
				.select({
					id: user.id,
					username: user.username,
					displayUsername: user.displayUsername,
					email: user.email,
					name: user.name,
					image: user.image,
				})
				.from(user)
				.where(and(...conditions))
				.limit(10);

			const formattedUsers = users.map((u) => ({
				id: u.id,
				username: u.username,
				displayUsername: u.displayUsername || u.username,
				email: u.email,
				name: u.name,
				image: u.image,
			}));

			// logger.debug(`Returning ${formattedUsers.length} initial users`);
			return { users: formattedUsers };
		}

		// minimum query length
		if (q.trim().length < 2) {
			return { users: [] };
		}

		const searchTerm = `%${q.trim()}%`;

		// build search conditions
		const searchConditions = [
			ne(user.banned, true), // exclude banned users
			ilike(user.username, searchTerm), // search in username
		];

		if (!includeSelf) {
			searchConditions.push(ne(user.id, dbUser.id));
		}

		// search users by conditions
		const users = await db
			.select({
				id: user.id,
				username: user.username,
				displayUsername: user.displayUsername,
				email: user.email,
				name: user.name,
				image: user.image,
			})
			.from(user)
			.where(and(...searchConditions))
			.limit(10);

		const formattedUsers = users.map((u) => ({
			id: u.id,
			username: u.username,
			displayUsername: u.displayUsername || u.username,
			email: u.email,
			name: u.name,
			image: u.image,
		})) as Partial<DBUser>[];

		logger.debug(`Search returned ${formattedUsers.length} users for query: ${q}`);
		return { users: formattedUsers };
	}
);
