<script lang="ts">
	import { CircleUser, Clock, Info, RefreshCw, Users } from '@lucide/svelte';
	import { onDestroy, onMount } from 'svelte';
	import { toast } from 'svelte-sonner';
	import { browser } from '$app/environment';
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import { Button } from '$lib/components/ui/button';
	import {
		Tooltip,
		TooltipContent,
		TooltipProvider,
		TooltipTrigger,
	} from '$lib/components/ui/tooltip';
	import { formatUptime, getPublicSiteName } from '$src/lib/utils/format';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	// client-side uptime tracking
	let uptimeMs = $derived(data.uptime?.milliseconds ?? 0);
	let displayedUptime = $derived(formatUptime(uptimeMs));
	let intervalId = $state<number | null>(null);

	let isRefreshingStats = $state(false);

	onMount(async () => {
		if (browser) {
			// a bit hacky, but it forces a refresh on load, (fixes bug where if you hover dashboard link, it prefetches, and then the data is out-of-sync)
			await invalidateAll();
			// initialize with server-provided uptime
			uptimeMs = data.uptime?.milliseconds ?? 0;

			// update every second
			intervalId = window.setInterval(() => {
				uptimeMs += 1000;
			}, 1000);
		}
	});

	// clean up on component unmount
	onDestroy(() => {
		if (intervalId !== null) {
			window.clearInterval(intervalId);
			intervalId = null;
		}
	});
</script>

<svelte:head>
	<title>Admin - Dashboard - {getPublicSiteName()}</title>
</svelte:head>

<TooltipProvider delayDuration={250}>
	<div class="container mx-auto px-4">
		<div class="mb-6 flex items-center justify-between">
			<h1 class="text-3xl font-bold text-foreground">Admin Dashboard</h1>
			<form
				method="POST"
				action="?/refreshStats"
				use:enhance={() => {
					isRefreshingStats = true;
					const toastId = toast.loading('Refreshing statistics...');

					return async ({ update }) => {
						await update();
						isRefreshingStats = false;
						toast.success('Statistics refreshed successfully!', { id: toastId });
					};
				}}
			>
				<Button
					type="submit"
					disabled={isRefreshingStats}
					variant="outline"
					size="sm"
					class="gap-2"
				>
					<RefreshCw class={`h-4 w-4 ${isRefreshingStats ? 'animate-spin' : ''}`} />
					{isRefreshingStats ? 'Refreshing...' : 'Refresh Stats'}
				</Button>
			</form>
		</div>

		<div class="space-y-6">
			<!-- System Stats Grid -->
			<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
				<!-- Server Uptime Card -->
				<div class="rounded-xl border border-border bg-card p-6 shadow-sm">
					<div class="flex items-center gap-3">
						<div class="rounded-full bg-purple-100 p-2 dark:bg-purple-500/20">
							<Clock class="h-5 w-5 text-purple-500" />
						</div>
						<h3 class="text-sm font-medium text-muted-foreground">Server Uptime</h3>
					</div>
					<div class="mt-3 md:mt-6">
						<p class="text-2xl font-bold text-foreground md:text-4xl">{displayedUptime}</p>
						<p class="mt-1 text-xs text-muted-foreground md:mt-2 md:text-sm">Time running</p>
					</div>
				</div>

				<!-- User Stats Card -->
				<div class="rounded-xl border border-border bg-card p-6 shadow-sm">
					<div class="flex items-center gap-3">
						<div class="rounded-full bg-blue-100 p-2 dark:bg-blue-500/20">
							<Users class="h-5 w-5 text-blue-500" />
						</div>
						<h3 class="text-sm font-medium text-muted-foreground">Total Users</h3>
					</div>
					<div class="mt-3 md:mt-6">
						<p class="text-2xl font-bold text-foreground md:text-4xl">
							+{data.userStats.totalUsers}
						</p>
						<p class="mt-1 text-xs text-muted-foreground md:mt-2 md:text-sm">Active users</p>
					</div>
				</div>

				<!-- Session Stats Card -->
				<div class="rounded-xl border border-border bg-card p-6 shadow-sm">
					<div class="flex items-center gap-2">
						<div class="flex items-center gap-3">
							<div class="rounded-full bg-cyan-100 p-2 dark:bg-cyan-500/20">
								<CircleUser class="h-5 w-5 text-cyan-500" />
							</div>
							<h3 class="text-sm font-medium text-muted-foreground">Sessions</h3>
						</div>
						<Tooltip>
							<TooltipTrigger>
								<Info class="h-4 w-4 text-muted-foreground" />
							</TooltipTrigger>
							<TooltipContent>
								<p class="text-sm text-foreground">
									Sessions are defined as valid session tokens that haven't expired.
								</p>
							</TooltipContent>
						</Tooltip>
					</div>
					<div class="mt-3 md:mt-6">
						<p class="text-2xl font-bold text-foreground md:text-4xl">
							+{data.sessionStats.totalSessions}
						</p>
						<p class="mt-1 text-xs text-muted-foreground md:mt-2 md:text-sm">Valid sessions</p>
					</div>
				</div>
			</div>
		</div>
	</div>
</TooltipProvider>
