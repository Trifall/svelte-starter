import { createChildLogger } from '@/src/lib/server/logger';
import { clearStatsCache, getSessionStats, getUserStats } from '$lib/server/stats';
import { getServerUptime } from '$lib/server/system';
import type { Actions, PageServerLoad } from './$types';

const logger = createChildLogger('AdminPage');

/**
 * Server-side load function for the admin dashboard
 * Fetches server uptime, job stats, user stats, and paste statistics
 */
export const load: PageServerLoad = async ({ parent }) => {
	// get server uptime - not async
	const uptime = getServerUptime();
	const { user } = await parent();

	const defaultUserStats = { totalUsers: 0 };
	const defaultSessionStats = { totalSessions: 0 };

	// run stats concurrently
	const [userStatsResult, sessionStatsResult] = await Promise.all([
		// user stats promise
		getUserStats(user).catch((error) => {
			logger.error(`Error fetching user stats: ${error}`);
			return { ok: false, error: String(error) };
		}),

		// session stats promise
		getSessionStats(user).catch((error) => {
			logger.error(`Error fetching session stats: ${error}`);
			return { ok: false, error: String(error) };
		}),
	]);

	// process user stats result
	let userStats = defaultUserStats;
	if (
		userStatsResult &&
		'ok' in userStatsResult &&
		userStatsResult.ok &&
		'value' in userStatsResult
	) {
		userStats = userStatsResult.value;
	} else if (userStatsResult && 'error' in userStatsResult) {
		logger.error(`Error in user stats result: ${userStatsResult.error}`);
	}

	// process session stats result
	let sessionStats = defaultSessionStats;
	if (
		sessionStatsResult &&
		'ok' in sessionStatsResult &&
		sessionStatsResult.ok &&
		'value' in sessionStatsResult
	) {
		sessionStats = sessionStatsResult.value;
	} else if (sessionStatsResult && 'error' in sessionStatsResult) {
		logger.error(`Error in session stats result: ${sessionStatsResult.error}`);
	}

	return {
		uptime,
		userStats,
		sessionStats,
	};
};

export const actions: Actions = {
	// clear the stats cache and reload data
	refreshStats: async () => {
		logger.debug('Clearing stats cache via form action');
		clearStatsCache();
		return { success: true };
	},
};
