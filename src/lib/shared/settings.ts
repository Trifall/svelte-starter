import * as z from 'zod';

// --  settings

export const SETTING_CATEGORIES = {
	System: 'System',
	Search: 'Search',
	RateLimit: 'RateLimit',
} as const;

export type SettingCategory = (typeof SETTING_CATEGORIES)[keyof typeof SETTING_CATEGORIES];

export const SETTINGS_CONFIG = {
	firstTimeSetupCompleted: {
		schema: z.boolean(),
		defaultValue: false,
		description: 'Flag to indicate if the initial application setup has been completed.',
		category: SETTING_CATEGORIES.System,
	},
	publicRegistration: {
		schema: z.boolean(),
		defaultValue: false,
		description: 'Allow new users to register.',
		category: SETTING_CATEGORIES.System,
	},
	searchResultsLimit: {
		schema: z.number().int().min(1).max(200),
		defaultValue: 50,
		description: 'Maximum number of search results to return',
		category: SETTING_CATEGORIES.Search,
	},
	rateLimitingAuthedEnabled: {
		schema: z.boolean(),
		defaultValue: false,
		description: 'Enable rate limiting for authenticated users on operations',
		category: SETTING_CATEGORIES.RateLimit,
	},
	rateLimitingAuthedLimit: {
		schema: z.number().int().min(1).max(100000),
		defaultValue: 20,
		description:
			'Maximum number of operations allowed per authenticated user in a 1-minute sliding window',
		category: SETTING_CATEGORIES.RateLimit,
	},
	rateLimitingUnauthenticatedEnabled: {
		schema: z.boolean(),
		defaultValue: false,
		description: 'Enable rate limiting per unauthenticated user (by browser fingerprint)',
		category: SETTING_CATEGORIES.RateLimit,
	},
	rateLimitingUnauthenticatedLimit: {
		schema: z.number().int().min(1).max(100000),
		defaultValue: 3,
		description:
			'Maximum number of operations allowed per unauthenticated user in a 1-minute sliding window',
		category: SETTING_CATEGORIES.RateLimit,
	},
	rateLimitingUnauthenticatedGlobalEnabled: {
		schema: z.boolean(),
		defaultValue: false,
		description: 'Enable global rate limiting for all unauthenticated users combined',
		category: SETTING_CATEGORIES.RateLimit,
	},
	rateLimitingUnauthenticatedGlobalLimit: {
		schema: z.number().int().min(1).max(100000),
		defaultValue: 20,
		description:
			'Maximum number of operations allowed system-wide for all unauthenticated users in a 1-minute sliding window',
		category: SETTING_CATEGORIES.RateLimit,
	},
} as const;

export const allSettingsSchema = z.object(
	Object.fromEntries(
		Object.entries(SETTINGS_CONFIG).map(([key, config]) => [key, config.schema])
	) as {
		[K in keyof typeof SETTINGS_CONFIG]: (typeof SETTINGS_CONFIG)[K]['schema'];
	}
);

// derive all the objects from single source of truth
export const SETTING_NAMES = Object.keys(SETTINGS_CONFIG) as (keyof typeof SETTINGS_CONFIG)[];

export const SETTING_DESCRIPTIONS = Object.fromEntries(
	Object.entries(SETTINGS_CONFIG).map(([key, config]) => [key, config.description])
) as {
	[_ in keyof typeof SETTINGS_CONFIG]: string;
};

export const SETTING_CATEGORIES_VALUES = Object.fromEntries(
	Object.entries(SETTINGS_CONFIG).map(([key, config]) => [key, config.category])
) as {
	[_ in keyof typeof SETTINGS_CONFIG]: SettingCategory;
};

export const SETTING_DEFAULT_VALUES = Object.fromEntries(
	Object.entries(SETTINGS_CONFIG).map(([key, config]) => [key, config.defaultValue])
) as {
	[_ in keyof typeof SETTINGS_CONFIG]: InferSettingType<_>;
};

// types
export type AllSettings = z.infer<typeof allSettingsSchema>;
export type AppSettingKey = keyof AllSettings;

/**
 * helper type to get the inferred type from a schema, see examples:
 * @example type BooleanType = InferSettingType<'enableAutoConvert'>; // boolean
 * @example type StringType = InferSettingType<'targetFormat'>; // 'epub' | 'mobi' | etc.
 */
export type InferSettingType<T extends keyof typeof SETTINGS_CONFIG> = z.infer<
	(typeof SETTINGS_CONFIG)[T]['schema']
>;

// getters

/**
 * correctly types the entries of SETTINGS_CONFIG
 * @returns Array of [key, value] pairs from SETTINGS_CONFIG
 */
export const getSettingsEntries = () => {
	return Object.entries(SETTINGS_CONFIG) as Array<
		[keyof typeof SETTINGS_CONFIG, (typeof SETTINGS_CONFIG)[keyof typeof SETTINGS_CONFIG]]
	>;
};

/**
 * @param key
 * @returns The configuration object for a specific setting key
 */
export const getSettingConfig = <K extends AppSettingKey>(key: K) =>
	SETTINGS_CONFIG[key as keyof typeof SETTINGS_CONFIG];

/**
 * @param category
 * @returns Array of keys from SETTINGS_CONFIG that match the given category
 */
export const getSettingsByCategory = (category: SettingCategory) =>
	getSettingsEntries()
		.filter(([, config]) => config.category === category)
		.map(([key]) => key as AppSettingKey);
