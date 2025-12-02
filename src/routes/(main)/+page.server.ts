import type { DBUser } from '$database/schema';
import { createChildLogger } from '@/src/lib/server/logger';
import { formatAuthStatusError, isUnauthenticatedUser } from '@/src/lib/utils/format';
import { redirect } from '@sveltejs/kit';
import type { PageData, PageServerLoad } from './$types';

const logger = createChildLogger('MainPage');

export const load: PageServerLoad = async ({
	parent,
}: {
	parent: () => Promise<{ user: DBUser | null; isAdmin: boolean }>;
	url: URL;
}): Promise<PageData> => {
	try {
		const { user, isAdmin = false } = await parent();

		if (user?.banned) {
			throw redirect(302, `/error?banned=true`);
		}

		if (isUnauthenticatedUser(user)) {
			return {
				user: null,
				isAdmin: false,
			};
		}

		return {
			user,
			isAdmin,
		};
	} catch (error) {
		logger.error(`Error in page server load: ${formatAuthStatusError(error)}`);
		return {
			user: null,
			isAdmin: false,
			error: 'Failed to load page data',
		};
	}
};
