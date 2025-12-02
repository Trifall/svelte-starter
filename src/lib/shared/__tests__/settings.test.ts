import { describe, expect, it } from 'vitest';
import {
	type AllSettings,
	type AppSettingKey,
	type InferSettingType,
	SETTINGS_CONFIG,
	SETTING_CATEGORIES,
	SETTING_CATEGORIES_VALUES,
	SETTING_DEFAULT_VALUES,
	SETTING_DESCRIPTIONS,
	SETTING_NAMES,
	type SettingCategory,
	allSettingsSchema,
	getSettingConfig,
	getSettingsByCategory,
	getSettingsEntries,
} from '../settings';

describe('settings.ts', () => {
	describe('SETTING_CATEGORIES', () => {
		it('should contain all category values', () => {
			expect(SETTING_CATEGORIES).toEqual({
				System: 'System',
				Search: 'Search',
				RateLimit: 'RateLimit',
			});
		});

		it('should be readonly', () => {
			expect(Object.keys(SETTING_CATEGORIES).length).toBe(3);
		});
	});

	describe('SETTINGS_CONFIG', () => {
		it('should be defined with all settings', () => {
			expect(SETTINGS_CONFIG).toBeDefined();
			expect(Object.keys(SETTINGS_CONFIG).length).toBeGreaterThan(0);
		});

		it('should have correct structure for each setting', () => {
			Object.entries(SETTINGS_CONFIG).forEach(([_, config]) => {
				expect(config).toHaveProperty('schema');
				expect(config).toHaveProperty('defaultValue');
				expect(config).toHaveProperty('description');
				expect(config).toHaveProperty('category');
				expect(typeof config.description).toBe('string');
			});
		});

		describe('System category settings', () => {
			it('should have firstTimeSetupCompleted setting', () => {
				expect(SETTINGS_CONFIG.firstTimeSetupCompleted).toBeDefined();
				expect(SETTINGS_CONFIG.firstTimeSetupCompleted.defaultValue).toBe(false);
				expect(SETTINGS_CONFIG.firstTimeSetupCompleted.category).toBe(SETTING_CATEGORIES.System);
			});

			it('should have publicRegistration setting', () => {
				expect(SETTINGS_CONFIG.publicRegistration).toBeDefined();
				expect(SETTINGS_CONFIG.publicRegistration.defaultValue).toBe(false);
				expect(SETTINGS_CONFIG.publicRegistration.category).toBe(SETTING_CATEGORIES.System);
			});
		});

		describe('Search category settings', () => {
			it('should have searchResultsLimit setting', () => {
				expect(SETTINGS_CONFIG.searchResultsLimit).toBeDefined();
				expect(SETTINGS_CONFIG.searchResultsLimit.defaultValue).toBe(50);
				expect(SETTINGS_CONFIG.searchResultsLimit.category).toBe(SETTING_CATEGORIES.Search);
			});
		});

		describe('RateLimit category settings', () => {
			it('should have rateLimitingAuthedEnabled setting', () => {
				expect(SETTINGS_CONFIG.rateLimitingAuthedEnabled).toBeDefined();
				expect(SETTINGS_CONFIG.rateLimitingAuthedEnabled.defaultValue).toBe(false);
				expect(SETTINGS_CONFIG.rateLimitingAuthedEnabled.category).toBe(
					SETTING_CATEGORIES.RateLimit
				);
			});

			it('should have rateLimitingAuthedLimit setting', () => {
				expect(SETTINGS_CONFIG.rateLimitingAuthedLimit).toBeDefined();
				expect(SETTINGS_CONFIG.rateLimitingAuthedLimit.defaultValue).toBe(20);
				expect(SETTINGS_CONFIG.rateLimitingAuthedLimit.category).toBe(SETTING_CATEGORIES.RateLimit);
			});

			it('should have rateLimitingUnauthenticatedEnabled setting', () => {
				expect(SETTINGS_CONFIG.rateLimitingUnauthenticatedEnabled).toBeDefined();
				expect(SETTINGS_CONFIG.rateLimitingUnauthenticatedEnabled.defaultValue).toBe(false);
				expect(SETTINGS_CONFIG.rateLimitingUnauthenticatedEnabled.category).toBe(
					SETTING_CATEGORIES.RateLimit
				);
			});

			it('should have rateLimitingUnauthenticatedLimit setting', () => {
				expect(SETTINGS_CONFIG.rateLimitingUnauthenticatedLimit).toBeDefined();
				expect(SETTINGS_CONFIG.rateLimitingUnauthenticatedLimit.defaultValue).toBe(3);
				expect(SETTINGS_CONFIG.rateLimitingUnauthenticatedLimit.category).toBe(
					SETTING_CATEGORIES.RateLimit
				);
			});

			it('should have rateLimitingUnauthenticatedGlobalEnabled setting', () => {
				expect(SETTINGS_CONFIG.rateLimitingUnauthenticatedGlobalEnabled).toBeDefined();
				expect(SETTINGS_CONFIG.rateLimitingUnauthenticatedGlobalEnabled.defaultValue).toBe(false);
				expect(SETTINGS_CONFIG.rateLimitingUnauthenticatedGlobalEnabled.category).toBe(
					SETTING_CATEGORIES.RateLimit
				);
			});

			it('should have rateLimitingUnauthenticatedGlobalLimit setting', () => {
				expect(SETTINGS_CONFIG.rateLimitingUnauthenticatedGlobalLimit).toBeDefined();
				expect(SETTINGS_CONFIG.rateLimitingUnauthenticatedGlobalLimit.defaultValue).toBe(20);
				expect(SETTINGS_CONFIG.rateLimitingUnauthenticatedGlobalLimit.category).toBe(
					SETTING_CATEGORIES.RateLimit
				);
			});
		});
	});

	describe('allSettingsSchema', () => {
		it('should validate valid settings object', () => {
			const validSettings = {
				firstTimeSetupCompleted: true,
				publicRegistration: true,
				searchResultsLimit: 100,
				rateLimitingAuthedEnabled: true,
				rateLimitingAuthedLimit: 50,
				rateLimitingUnauthenticatedEnabled: true,
				rateLimitingUnauthenticatedLimit: 5,
				rateLimitingUnauthenticatedGlobalEnabled: true,
				rateLimitingUnauthenticatedGlobalLimit: 30,
			};

			expect(() => allSettingsSchema.parse(validSettings)).not.toThrow();
		});

		it('should validate default values', () => {
			const defaultSettings = {
				firstTimeSetupCompleted: false,
				publicRegistration: false,
				searchResultsLimit: 50,
				rateLimitingAuthedEnabled: false,
				rateLimitingAuthedLimit: 20,
				rateLimitingUnauthenticatedEnabled: false,
				rateLimitingUnauthenticatedLimit: 3,
				rateLimitingUnauthenticatedGlobalEnabled: false,
				rateLimitingUnauthenticatedGlobalLimit: 20,
			};

			expect(() => allSettingsSchema.parse(defaultSettings)).not.toThrow();
		});

		it('should reject invalid number values', () => {
			const invalidSettings = {
				...SETTING_DEFAULT_VALUES,
				searchResultsLimit: -1, // negative not allowed
			};

			expect(() => allSettingsSchema.parse(invalidSettings)).toThrow();
		});

		it('should reject out of range values', () => {
			const invalidSettings = {
				...SETTING_DEFAULT_VALUES,
				searchResultsLimit: 300, // max is 200
			};

			expect(() => allSettingsSchema.parse(invalidSettings)).toThrow();
		});
	});

	describe('SETTING_NAMES', () => {
		it('should contain all setting keys', () => {
			expect(SETTING_NAMES.length).toBe(Object.keys(SETTINGS_CONFIG).length);
		});

		it('should match SETTINGS_CONFIG keys', () => {
			const configKeys = Object.keys(SETTINGS_CONFIG);
			expect([...SETTING_NAMES].sort()).toEqual(configKeys.sort());
		});
	});

	describe('SETTING_DESCRIPTIONS', () => {
		it('should have descriptions for all settings', () => {
			expect(Object.keys(SETTING_DESCRIPTIONS).length).toBe(Object.keys(SETTINGS_CONFIG).length);
		});

		it('should have non-empty descriptions', () => {
			Object.values(SETTING_DESCRIPTIONS).forEach((description) => {
				expect(description).toBeDefined();
				expect(description.length).toBeGreaterThan(0);
			});
		});

		it('should match descriptions from SETTINGS_CONFIG', () => {
			Object.entries(SETTINGS_CONFIG).forEach(([key, config]) => {
				expect(SETTING_DESCRIPTIONS[key as keyof typeof SETTINGS_CONFIG]).toBe(config.description);
			});
		});
	});

	describe('SETTING_CATEGORIES_VALUES', () => {
		it('should have categories for all settings', () => {
			expect(Object.keys(SETTING_CATEGORIES_VALUES).length).toBe(
				Object.keys(SETTINGS_CONFIG).length
			);
		});

		it('should have valid category values', () => {
			const validCategories = Object.values(SETTING_CATEGORIES);

			Object.values(SETTING_CATEGORIES_VALUES).forEach((category) => {
				expect(validCategories).toContain(category);
			});
		});

		it('should match categories from SETTINGS_CONFIG', () => {
			Object.entries(SETTINGS_CONFIG).forEach(([key, config]) => {
				expect(SETTING_CATEGORIES_VALUES[key as keyof typeof SETTINGS_CONFIG]).toBe(
					config.category
				);
			});
		});
	});

	describe('SETTING_DEFAULT_VALUES', () => {
		it('should have default values for all settings', () => {
			expect(Object.keys(SETTING_DEFAULT_VALUES).length).toBe(Object.keys(SETTINGS_CONFIG).length);
		});

		it('should match default values from SETTINGS_CONFIG', () => {
			Object.entries(SETTINGS_CONFIG).forEach(([key, config]) => {
				expect(SETTING_DEFAULT_VALUES[key as keyof typeof SETTINGS_CONFIG]).toEqual(
					config.defaultValue
				);
			});
		});
	});

	describe('getSettingsEntries', () => {
		it('should return all settings entries', () => {
			const entries = getSettingsEntries();
			expect(entries.length).toBe(Object.keys(SETTINGS_CONFIG).length);
		});

		it('should return properly typed entries', () => {
			const entries = getSettingsEntries();

			entries.forEach(([key, config]) => {
				expect(SETTINGS_CONFIG[key]).toBeDefined();
				expect(config).toHaveProperty('schema');
				expect(config).toHaveProperty('defaultValue');
				expect(config).toHaveProperty('description');
				expect(config).toHaveProperty('category');
			});
		});

		it('should match Object.entries output', () => {
			const entries = getSettingsEntries();
			const objectEntries = Object.entries(SETTINGS_CONFIG);

			expect(entries.length).toBe(objectEntries.length);
		});
	});

	describe('getSettingConfig', () => {
		it('should return config for valid setting key', () => {
			const config = getSettingConfig('publicRegistration');
			expect(config).toBeDefined();
			expect(config.defaultValue).toBe(false);
			expect(config.category).toBe(SETTING_CATEGORIES.System);
		});

		it('should return correct config for all settings', () => {
			SETTING_NAMES.forEach((key) => {
				const config = getSettingConfig(key);
				expect(config).toBe(SETTINGS_CONFIG[key]);
			});
		});

		it('should return config with schema', () => {
			const config = getSettingConfig('searchResultsLimit');
			expect(config.schema).toBeDefined();
			expect(() => config.schema.parse(35)).not.toThrow();
		});
	});

	describe('getSettingsByCategory', () => {
		it('should return settings for System category', () => {
			const systemSettings = getSettingsByCategory(SETTING_CATEGORIES.System);
			expect(systemSettings.length).toBeGreaterThan(0);
			expect(systemSettings).toContain('publicRegistration');
		});

		it('should return settings for Search category', () => {
			const searchSettings = getSettingsByCategory(SETTING_CATEGORIES.Search);
			expect(searchSettings.length).toBe(1);
			expect(searchSettings).toContain('searchResultsLimit');
		});

		it('should return settings for RateLimit category', () => {
			const rateLimitSettings = getSettingsByCategory(SETTING_CATEGORIES.RateLimit);
			expect(rateLimitSettings.length).toBeGreaterThan(0);
			expect(rateLimitSettings).toContain('rateLimitingAuthedEnabled');
			expect(rateLimitSettings).toContain('rateLimitingAuthedLimit');
			expect(rateLimitSettings).toContain('rateLimitingUnauthenticatedEnabled');
			expect(rateLimitSettings).toContain('rateLimitingUnauthenticatedLimit');
		});

		it('should return only settings matching the category', () => {
			const systemSettings = getSettingsByCategory(SETTING_CATEGORIES.System);

			systemSettings.forEach((key) => {
				const config = getSettingConfig(key);
				expect(config.category).toBe(SETTING_CATEGORIES.System);
			});
		});

		it('should return empty array for non-existent category', () => {
			const settings = getSettingsByCategory('NonExistent' as SettingCategory);
			expect(settings).toEqual([]);
		});
	});

	describe('type exports', () => {
		it('should export AllSettings type', () => {
			const settings: AllSettings = {
				firstTimeSetupCompleted: false,
				publicRegistration: false,
				searchResultsLimit: 50,
				rateLimitingAuthedEnabled: false,
				rateLimitingAuthedLimit: 20,
				rateLimitingUnauthenticatedEnabled: false,
				rateLimitingUnauthenticatedLimit: 3,
				rateLimitingUnauthenticatedGlobalEnabled: false,
				rateLimitingUnauthenticatedGlobalLimit: 20,
			};
			expect(settings.publicRegistration).toBe(false);
		});

		it('should export AppSettingKey type', () => {
			const key: AppSettingKey = 'publicRegistration';
			expect(key).toBe('publicRegistration');
		});

		it('should export SettingCategory type', () => {
			const category: SettingCategory = 'System';
			expect(category).toBe('System');
		});

		it('should export InferSettingType helper type', () => {
			type BoolType = InferSettingType<'publicRegistration'>;
			type NumType = InferSettingType<'searchResultsLimit'>;

			const boolVal: BoolType = true;
			const numVal: NumType = 100;

			expect(typeof boolVal).toBe('boolean');
			expect(typeof numVal).toBe('number');
		});
	});

	describe('integration tests', () => {
		it('should maintain consistency between all derived objects', () => {
			const keys = Object.keys(SETTINGS_CONFIG);

			expect(SETTING_NAMES.length).toBe(keys.length);
			expect(Object.keys(SETTING_DESCRIPTIONS).length).toBe(keys.length);
			expect(Object.keys(SETTING_CATEGORIES_VALUES).length).toBe(keys.length);
			expect(Object.keys(SETTING_DEFAULT_VALUES).length).toBe(keys.length);
		});

		it('should have all settings in at least one category', () => {
			const allCategories = Object.values(SETTING_CATEGORIES);
			const allSettingsFromCategories = allCategories.flatMap((category) =>
				getSettingsByCategory(category)
			);

			SETTING_NAMES.forEach((key) => {
				expect(allSettingsFromCategories).toContain(key);
			});
		});

		it('should validate all default values with their schemas', () => {
			Object.entries(SETTINGS_CONFIG).forEach(([key, config]) => {
				const defaultValue = SETTING_DEFAULT_VALUES[key as keyof typeof SETTINGS_CONFIG];
				expect(() => config.schema.parse(defaultValue)).not.toThrow();
			});
		});
	});
});
