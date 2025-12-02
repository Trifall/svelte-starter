import { getSetting, updateSettings } from '@/src/lib/server/settings';
import { fail } from '@sveltejs/kit';
import { createChildLogger } from '$lib/server/logger';
import { reloadRateLimiter } from '$lib/server/rate-limit';
import { type AllSettings, allSettingsSchema } from '$src/lib/shared/settings';
import type { Actions } from './$types';

const logger = createChildLogger('Settings');

export const actions = {
	updateSettings: async ({ request }) => {
		const formData = await request.formData();

		// preserve firstTimeSetupCompleted value - it should never be changed from admin settings
		const currentSetupCompleted = await getSetting('firstTimeSetupCompleted');

		const data = {
			firstTimeSetupCompleted: currentSetupCompleted,
			// system settings
			publicRegistration: formData.get('publicRegistration') === 'true',
			searchResultsLimit: Number(formData.get('searchResultsLimit') || '0'),

			// rate limiting settings
			rateLimitingAuthedEnabled: formData.get('rateLimitingAuthedEnabled') === 'true',
			rateLimitingAuthedLimit: Number(formData.get('rateLimitingAuthedLimit') || '10'),
			rateLimitingUnauthenticatedEnabled:
				formData.get('rateLimitingUnauthenticatedEnabled') === 'true',
			rateLimitingUnauthenticatedLimit: Number(
				formData.get('rateLimitingUnauthenticatedLimit') || '3'
			),
			rateLimitingUnauthenticatedGlobalEnabled:
				formData.get('rateLimitingUnauthenticatedGlobalEnabled') === 'true',
			rateLimitingUnauthenticatedGlobalLimit: Number(
				formData.get('rateLimitingUnauthenticatedGlobalLimit') || '20'
			),
		} satisfies AllSettings;

		try {
			const validatedData = allSettingsSchema.parse(data);

			logger.debug(`Updating settings: ${JSON.stringify(validatedData, null, 2)}`);

			await updateSettings(validatedData);

			// reload rate limiter if rate limiting settings were changed
			try {
				await reloadRateLimiter();
			} catch (error) {
				logger.error(`Failed to reload rate limiter: ${error}`);
				// dont fail the settings update for rate limiter issues
			}

			logger.info('Settings updated successfully');

			return { success: true, message: 'Settings updated successfully' };
		} catch (error) {
			logger.error(`Settings validation error: ${error}`);
			return fail(400, {
				error: 'Invalid settings data',
				data,
			});
		}
	},
} satisfies Actions;
