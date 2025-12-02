import { type DBUser, session, user } from '$database/schema';
import { gt, sql } from 'drizzle-orm/sql';
import { PERMISSIONS } from '$src/lib/auth/roles-shared';
import { requirePermission } from '$src/lib/server/auth';
import { db } from '$src/lib/server/db';
import { createChildLogger } from '$src/lib/server/logger';
import { type Result, err, ok } from '$src/lib/utils/result';

const logger = createChildLogger('server/stats');

// cache configuration
const CACHE_TTL_MS = 60 * 1000; // 1 minute

// cache entries with timestamp
type CacheEntry<T> = {
	data: T;
	timestamp: number;
};

// in-memory cache for stats
const statsCache = {
	userStats: null as CacheEntry<{ totalUsers: number }> | null,
	sessionStats: null as CacheEntry<{ totalSessions: number }> | null,
	lastBackup: null as CacheEntry<{ lastBackup: Date | null }> | null,
};

// clear all cached statistics
export const clearStatsCache = () => {
	statsCache.userStats = null;
	statsCache.sessionStats = null;
	statsCache.lastBackup = null;
	logger.debug('Stats cache cleared');
};

// check if a cache entry is valid (not expired)
const isCacheValid = <T>(entry: CacheEntry<T> | null): boolean => {
	if (!entry) return false;
	const age = Date.now() - entry.timestamp;
	return age < CACHE_TTL_MS;
};

/**
 * Get user statistics for the admin dashboard
 * @param requestUser The user making the request (for permission check)
 * @returns Promise<Result<{ totalUsers: number }, Error>> The total count of users
 */
export const getUserStats = async (
	requestUser: DBUser
): Promise<Result<{ totalUsers: number }, Error>> => {
	try {
		await requirePermission(requestUser, { user: [PERMISSIONS.user.list] });

		// return cached data if valid
		if (isCacheValid(statsCache.userStats)) {
			return ok(statsCache.userStats!.data);
		}

		// get total user count
		const totalResult = await db.select({ count: sql<number>`count(*)` }).from(user);
		const totalUsers = totalResult[0]?.count || 0;

		const result = { totalUsers };

		// cache the result
		statsCache.userStats = {
			data: result,
			timestamp: Date.now(),
		};

		return ok(result);
	} catch (error) {
		logger.error(`Error getting user stats: ${error}`);
		return err(error instanceof Error ? error : new Error('Failed to get user stats'));
	}
};

/**
 * Get total session count for the admin dashboard
 * @param requestUser The user making the request (for permission check)
 * @returns Promise<Result<{ totalSessions: number }, Error>> The total count of sessions
 */
export const getSessionStats = async (
	requestUser: DBUser
): Promise<Result<{ totalSessions: number }, Error>> => {
	try {
		await requirePermission(requestUser, { user: [PERMISSIONS.user.list] });

		// return cached data if valid
		if (isCacheValid(statsCache.sessionStats)) {
			return ok(statsCache.sessionStats!.data);
		}

		// get total session count (excluding expired sessions)
		const totalResult = await db
			.select({ count: sql<number>`count(*)` })
			.from(session)
			.where(gt(session.expiresAt, new Date()));
		const totalSessions = totalResult[0]?.count || 0;

		const result = { totalSessions };

		// cache the result
		statsCache.sessionStats = {
			data: result,
			timestamp: Date.now(),
		};

		return ok(result);
	} catch (error) {
		logger.error(`Error getting session stats: ${error}`);
		return err(error instanceof Error ? error : new Error('Failed to get session stats'));
	}
};
