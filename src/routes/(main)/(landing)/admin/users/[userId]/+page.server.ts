import type { DBUser } from '$database/schema';
import { createChildLogger } from '@/src/lib/server/logger';
import { error } from '@sveltejs/kit';
import { getUserDetailsById } from '$src/lib/server/users';
import type { PageServerLoad } from './$types';

const logger = createChildLogger('AdminUserSlugPage');

type LoadData = {
	user: DBUser;
	error: string | null;
};

/**
 * Server-side load function for the admin user profile page
 * Fetches user details and comprehensive statistics
 */
export const load: PageServerLoad = async ({ parent, params }) => {
	const { user: currentUser } = await parent();
	const { userId } = params;

	if (!userId) {
		// request didnt have the query param
		throw error(400, 'A valid user ID is required');
	}

	const user = currentUser as DBUser;

	try {
		// fetch user details - function handles its own permission checking
		const userResult = await getUserDetailsById(user, userId);
		if (!userResult.ok) {
			logger.error(`Error fetching user details: ${userResult.error}`);
			throw error(404, 'User not found');
		}

		if (!userResult.value) {
			logger.error(`User not found`);
			throw error(404, 'User not found');
		}

		return {
			user: userResult.value,
			error: null,
		} as LoadData;
	} catch (err) {
		logger.error(`Error in user profile page load function: ${err}`);
		throw error(500, 'An unexpected error occurred while loading user profile');
	}
};
