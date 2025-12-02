<script lang="ts">
	import type { Settings } from '@/database/schema/system';
	import { Info } from '@lucide/svelte';
	import { untrack } from 'svelte';
	import { toast } from 'svelte-sonner';
	import { enhance } from '$app/forms';
	import { type AllSettings, SETTING_DEFAULT_VALUES } from '$src/lib/shared/settings';
	import { getPublicSiteName } from '$src/lib/utils/format';
	import { getAllSettingsQuery } from '$src/routes/(main)/(landing)/admin/settings/settings.remote';
	import { Button } from '$components/ui/button';
	import { Card, CardContent, CardHeader, CardTitle } from '$components/ui/card';
	import { Skeleton } from '$components/ui/skeleton';
	import { Switch } from '$components/ui/switch';
	import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '$components/ui/tooltip';

	const getInitialFormState = (): AllSettings => {
		const defaults: Partial<AllSettings> = {};
		const allDefaultSettings = Object.entries(SETTING_DEFAULT_VALUES);

		allDefaultSettings.forEach(([key, value]) => {
			// type assertion to assign to specific keys
			(defaults as any)[key] = value;
		});
		return defaults as AllSettings;
	};

	const INITIAL_FORM_STATE = getInitialFormState();

	const settingsQuery = getAllSettingsQuery();

	let isSubmitting = $state(false);
	let formState = $state<AllSettings>({ ...INITIAL_FORM_STATE });

	const updateFullFormState = (settingsData: Settings[]) => {
		const newFormState = { ...INITIAL_FORM_STATE } satisfies AllSettings;

		if (Array.isArray(settingsData) && settingsData.length > 0) {
			const serverSettingsMap = new Map(settingsData.map((s) => [s.key, s.value]));

			// iterate over the keys of AllSettings
			for (const key of Object.keys(newFormState) as Array<keyof AllSettings>) {
				if (serverSettingsMap.has(key)) {
					const serverValue = serverSettingsMap.get(key);
					// get the type of the default value for THIS key for coercion
					const defaultValueForKey = INITIAL_FORM_STATE[key];

					if (typeof defaultValueForKey === 'number') {
						(newFormState[key] as unknown as number) = Number(serverValue);
					} else if (typeof defaultValueForKey === 'string') {
						// handle different types of string values
						const strValue = String(serverValue);
						// for other string values (like cron expressions), use the server value directly
						(newFormState[key] as unknown as string) = strValue;
					} else if (typeof defaultValueForKey === 'boolean') {
						(newFormState[key] as unknown as boolean) = Boolean(serverValue);
					}
				}
			}
		}

		formState = newFormState;
	};

	$effect(() => {
		const data = settingsQuery.current;
		if (data?.settings) {
			untrack(() => {
				updateFullFormState(data.settings);
			});
		}
	});
</script>

<svelte:head>
	<title>Admin - Settings - {getPublicSiteName()}</title>
</svelte:head>

<TooltipProvider delayDuration={0}>
	<div class="container mx-auto px-4">
		<div class="mx-auto mb-6 flex max-w-4xl items-center justify-between">
			<div class="space-y-1">
				<h1 class="text-3xl font-bold">Admin Settings</h1>
			</div>
		</div>

		<!-- Main Content -->
		<div class="mx-auto max-w-4xl space-y-8">
			<form
				method="POST"
				action="?/updateSettings"
				class="space-y-8"
				use:enhance={() => {
					isSubmitting = true;
					const toastId = toast.loading('Saving settings...');

					return async ({ result }) => {
						toast.dismiss(toastId);

						if (result.type === 'success') {
							if (result.data?.success) {
								toast.success('Settings saved successfully!');
								// refresh the settings query to get updated values
								await settingsQuery.refresh();
							} else {
								toast.success('Settings updated');
								// refresh the settings query to get updated values
								await settingsQuery.refresh();
							}
						} else if (result.type === 'failure') {
							toast.error('Failed to save settings');
						} else if (result.type === 'error') {
							toast.error('An error occurred while saving settings');
						}

						isSubmitting = false;
					};
				}}
			>
				<!-- System Settings Section -->
				<Card class="border-none">
					<CardHeader>
						<div class="flex items-center space-x-2">
							<div class="h-2 w-2 rounded-full bg-blue-500"></div>
							<CardTitle class="text-xl font-semibold">System Settings</CardTitle>
						</div>
					</CardHeader>
					<CardContent class="space-y-4">
						<div class="flex items-center justify-between gap-2 rounded-lg border bg-card p-4">
							<div class="space-y-1">
								<label for="publicRegistrationSwitch" class="text-sm font-semibold">
									Public Registration
								</label>
								<p class="text-sm text-muted-foreground">Allow new users to register.</p>
							</div>
							<div>
								{#if !settingsQuery.loading}
									<input
										type="hidden"
										name="publicRegistration"
										value={formState.publicRegistration ? 'true' : 'false'}
									/>
									<Switch
										id="publicRegistrationSwitch"
										bind:checked={formState.publicRegistration}
										disabled={isSubmitting}
									/>
								{:else}
									<Skeleton class="h-6 w-11" />
								{/if}
							</div>
						</div>
					</CardContent>
				</Card>

				<!-- Rate Limiting Settings Section -->
				<Card class="border-none">
					<CardHeader>
						<div class="flex items-center space-x-2">
							<div class="h-2 w-2 rounded-full bg-purple-500"></div>
							<CardTitle class="text-xl font-semibold">Authenticated Rate Limiting</CardTitle>
						</div>
					</CardHeader>
					<CardContent class="space-y-4">
						<!-- Authenticated User Rate Limiting Toggle -->
						<div class="flex items-center justify-between gap-2 rounded-lg border bg-card p-4">
							<div class="space-y-1">
								<label for="rateLimitingAuthedEnabledSwitch" class="text-sm font-semibold">
									Enable Rate Limiting (Authenticated Users)
								</label>
								<p class="text-sm text-muted-foreground">
									When enabled, authenticated users (non-admin) will be limited in the number of
									operations they can perform per minute. This helps prevent abuse and ensures fair
									resource usage.
								</p>
							</div>
							<div>
								{#if !settingsQuery.loading}
									<input
										type="hidden"
										name="rateLimitingAuthedEnabled"
										value={formState.rateLimitingAuthedEnabled ? 'true' : 'false'}
									/>
									<Switch
										id="rateLimitingAuthedEnabledSwitch"
										bind:checked={formState.rateLimitingAuthedEnabled}
										disabled={isSubmitting}
									/>
								{:else}
									<Skeleton class="h-6 w-11" />
								{/if}
							</div>
						</div>

						<!-- Rate Limit Value -->
						<div class="space-y-3 rounded-lg border bg-card p-4">
							<div class="flex items-center">
								<label for="rateLimitingAuthedLimit" class="text-sm font-semibold">
									Rate Limit (Requests per Minute)
								</label>
								{#if !formState.rateLimitingAuthedEnabled}
									<Tooltip>
										<TooltipTrigger>
											<Info class="ml-2 h-4 w-4 text-muted-foreground" />
										</TooltipTrigger>
										<TooltipContent>
											<p class="text-sm text-foreground">
												Disabled if rate limiting is not enabled
											</p>
										</TooltipContent>
									</Tooltip>
								{/if}
							</div>
							<p class="text-sm text-muted-foreground">
								Maximum number of operations an authenticated user can perform in a 1-minute sliding
								window (1-100,000). Admin users are automatically exempt from rate limiting.
							</p>
							{#if !settingsQuery.loading}
								<input
									type="number"
									id="rateLimitingAuthedLimit"
									name="rateLimitingAuthedLimit"
									bind:value={formState.rateLimitingAuthedLimit}
									min="1"
									max="100000"
									class="flex h-10 w-32 max-w-xs rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
									disabled={isSubmitting || !formState.rateLimitingAuthedEnabled}
								/>
							{:else}
								<Skeleton class="h-10" />
							{/if}
						</div>
					</CardContent>
				</Card>

				<!-- Unauthenticated Rate Limiting Settings -->
				<Card class="border-none">
					<CardHeader>
						<div class="flex items-center space-x-2">
							<div class="h-2 w-2 rounded-full bg-green-500"></div>
							<CardTitle class="text-xl font-semibold">Unauthenticated Rate Limiting</CardTitle>
						</div>
					</CardHeader>
					<CardContent class="space-y-4">
						<!-- Per-User Rate Limiting Toggle -->
						<div class="flex items-center justify-between gap-2 rounded-lg border bg-card p-4">
							<div class="space-y-1">
								<div class="flex items-center">
									<label
										for="rateLimitingUnauthenticatedEnabledSwitch"
										class="text-sm font-semibold"
									>
										Enable Per-User Rate Limiting
									</label>
								</div>
								<p class="text-sm text-muted-foreground">
									Limit operations per unauthenticated user (identified by browser fingerprint).
								</p>
							</div>
							<div>
								{#if !settingsQuery.loading}
									<input
										type="hidden"
										name="rateLimitingUnauthenticatedEnabled"
										value={formState.rateLimitingUnauthenticatedEnabled ? 'true' : 'false'}
									/>
									<Switch
										id="rateLimitingUnauthenticatedEnabledSwitch"
										bind:checked={formState.rateLimitingUnauthenticatedEnabled}
										disabled={isSubmitting}
									/>
								{:else}
									<Skeleton class="h-6 w-11" />
								{/if}
							</div>
						</div>

						<!-- Per-User Rate Limit Value -->
						<div class="gap-2 space-y-3 rounded-lg border bg-card p-4">
							<div class="flex items-center">
								<label for="rateLimitingUnauthenticatedLimit" class="text-sm font-semibold">
									Per-User Rate Limit (Requests per Minute)
								</label>
								{#if !formState.rateLimitingUnauthenticatedEnabled}
									<Tooltip>
										<TooltipTrigger>
											<Info class="ml-2 h-4 w-4 text-muted-foreground" />
										</TooltipTrigger>
										<TooltipContent>
											<p class="text-sm text-foreground">
												Disabled if per-user rate limiting is not enabled
											</p>
										</TooltipContent>
									</Tooltip>
								{/if}
							</div>
							<p class="text-sm text-muted-foreground">
								Maximum number of operations each unauthenticated user can perform in a 1-minute
								sliding window (1-100,000).
							</p>
							{#if !settingsQuery.loading}
								<input
									type="number"
									id="rateLimitingUnauthenticatedLimit"
									name="rateLimitingUnauthenticatedLimit"
									bind:value={formState.rateLimitingUnauthenticatedLimit}
									min="1"
									max="100000"
									class="flex h-10 w-32 max-w-xs rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
									disabled={isSubmitting || !formState.rateLimitingUnauthenticatedEnabled}
								/>
							{:else}
								<Skeleton class="h-10" />
							{/if}
						</div>

						<!-- Global Rate Limiting Toggle -->
						<div class="flex items-center justify-between gap-2 rounded-lg border bg-card p-4">
							<div class="space-y-1">
								<div class="flex items-center">
									<label
										for="rateLimitingUnauthenticatedGlobalEnabledSwitch"
										class="text-sm font-semibold"
									>
										Enable Global Rate Limiting
									</label>
								</div>
								<p class="text-sm text-muted-foreground">
									Limit total operations for all unauthenticated users system-wide.
								</p>
							</div>
							<div>
								{#if !settingsQuery.loading}
									<input
										type="hidden"
										name="rateLimitingUnauthenticatedGlobalEnabled"
										value={formState.rateLimitingUnauthenticatedGlobalEnabled ? 'true' : 'false'}
									/>
									<Switch
										id="rateLimitingUnauthenticatedGlobalEnabledSwitch"
										bind:checked={formState.rateLimitingUnauthenticatedGlobalEnabled}
										disabled={isSubmitting}
									/>
								{:else}
									<Skeleton class="h-6 w-11" />
								{/if}
							</div>
						</div>

						<!-- Global Rate Limit Value -->
						<div class="gap-2 space-y-3 rounded-lg border bg-card p-4">
							<div class="flex items-center">
								<label for="rateLimitingUnauthenticatedGlobalLimit" class="text-sm font-semibold">
									Global Rate Limit (Requests per Minute)
								</label>
								{#if !formState.rateLimitingUnauthenticatedGlobalEnabled}
									<Tooltip>
										<TooltipTrigger>
											<Info class="ml-2 h-4 w-4 text-muted-foreground" />
										</TooltipTrigger>
										<TooltipContent>
											<p class="text-sm text-foreground">
												Disabled if global rate limiting is not enabled
											</p>
										</TooltipContent>
									</Tooltip>
								{/if}
							</div>
							<p class="text-sm text-muted-foreground">
								Maximum total number of operations for all unauthenticated users combined in a
								1-minute sliding window (1-100,000).
							</p>
							{#if !settingsQuery.loading}
								<input
									type="number"
									id="rateLimitingUnauthenticatedGlobalLimit"
									name="rateLimitingUnauthenticatedGlobalLimit"
									bind:value={formState.rateLimitingUnauthenticatedGlobalLimit}
									min="1"
									max="100000"
									class="flex h-10 w-32 max-w-xs rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
									disabled={isSubmitting || !formState.rateLimitingUnauthenticatedGlobalEnabled}
								/>
							{:else}
								<Skeleton class="h-10" />
							{/if}
						</div>
					</CardContent>
				</Card>

				<!-- Save Button -->
				<div class="flex justify-end">
					<Button
						type="submit"
						class="min-w-40 px-8 py-2"
						disabled={isSubmitting || settingsQuery.loading}
					>
						{isSubmitting ? 'Saving...' : 'Save Settings'}
					</Button>
				</div>
			</form>
		</div>
	</div>
</TooltipProvider>
