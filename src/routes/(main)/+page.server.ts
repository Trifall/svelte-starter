import { createChildLogger } from '@/src/lib/server/logger';
import type { PageData, PageServerLoad } from './$types';

const logger = createChildLogger('MainPage');

export const load: PageServerLoad = async (): Promise<PageData> => {
	logger.info('Loading main page');
	return {
		message: 'Message from server!',
	};
};
