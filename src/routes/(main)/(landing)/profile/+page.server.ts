import type { DBUser } from '$database/schema';
import { createChildLogger } from '@/src/lib/server/logger';
import { error } from '@sveltejs/kit';
import { getUserDetailsById } from '$src/lib/server/users';
import { isUnauthenticatedUser } from '$src/lib/utils/format';
import type { PageServerLoad } from './$types';

const logger = createChildLogger('ProfilePage');

type LoadData = {
	user: DBUser;
	error: string | null;
};

/**
 * Server-side load function for the user profile page
 * Fetches current user's details and comprehensive statistics
 */
export const load: PageServerLoad = async ({ parent }) => {
	const { user } = await parent();

	// should be handled by layout, check anyway
	if (isUnauthenticatedUser(user)) {
		throw error(401, 'User not authenticated');
	}

	try {
		// fetch user details for current user
		const userResult = await getUserDetailsById(user, user.id);
		if (!userResult.ok) {
			logger.error(`Error fetching user details: ${userResult.error}`);
			throw error(404, 'User data not found');
		}

		if (!userResult.value) {
			logger.error(`User data not found`);
			throw error(404, 'User data not found');
		}

		return {
			user: userResult.value,
			error: null,
		} as LoadData;
	} catch (err) {
		logger.error(`Error in user profile page load function: ${err}`);
		throw error(500, 'An unexpected error occurred while loading your profile');
	}
};
