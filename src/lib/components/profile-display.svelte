<script lang="ts">
	import type { DBUser } from '$database/schema';
	import { Activity, Calendar, User } from '@lucide/svelte';
	import { Badge } from '$lib/components/ui/badge';
	import {
		capitalizeFirstLetter,
		formatEmail,
		formatFormalDate,
		formatUserName,
	} from '$src/lib/utils/format';

	type Props = {
		user: DBUser;
		error?: string | null;
	};

	let { user, error = null }: Props = $props();

	const getAccountAgeString = (createdAt: Date) => {
		const now = new Date();
		const ageInMs = now.getTime() - createdAt.getTime();
		const ageInDays = Math.floor(ageInMs / (1000 * 60 * 60 * 24));
		const ageInYears = Math.floor(ageInDays / 365);

		if (ageInYears > 0) {
			return `${ageInYears} year${ageInYears > 1 ? 's' : ''}`;
		}

		const ageInMonths = Math.floor(ageInDays / 30);
		if (ageInMonths > 0) {
			return `${ageInMonths} month${ageInMonths > 1 ? 's' : ''}`;
		}

		return `${ageInDays} day${ageInDays > 1 || ageInDays === 0 ? 's' : ''}`;
	};
</script>

<div class="min-w-full space-y-6">
	{#if error}
		<div class="mb-4 rounded-md bg-destructive/15 p-4 text-destructive">
			<p>{error}</p>
		</div>
	{/if}

	{#if !user}
		<div class="mb-4 rounded-md bg-destructive/15 p-4 text-destructive">
			<p>User not found</p>
		</div>
	{:else}
		<!-- User Basic Info Card -->
		<div class="rounded-xl bg-white p-6 shadow-lg dark:bg-zinc-900/90">
			<div class="flex items-start gap-4">
				<div class="rounded-full bg-blue-100 p-3 dark:bg-blue-500/20">
					<User class="h-8 w-8 text-blue-500" />
				</div>
				<div class="flex-1">
					<div class="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
						<div>
							<h2 class="text-xl font-bold text-slate-900 dark:text-white">
								{formatUserName(user)}
							</h2>
							<p class="text-sm text-muted-foreground">{formatEmail(user.email)}</p>
						</div>
						<div class="flex flex-wrap gap-2">
							<Badge variant={user.banned ? 'destructive' : 'default'}>
								{user.banned ? 'Banned' : capitalizeFirstLetter(user.role)}
							</Badge>
							{#if user.emailVerified}
								<Badge variant="secondary">Verified</Badge>
							{/if}
						</div>
					</div>
					<div class="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
						<div class="flex items-center gap-2 text-sm text-muted-foreground">
							<Calendar class="h-4 w-4" />
							<span>Joined {formatFormalDate(user.createdAt)}</span>
						</div>
						<div class="flex items-center gap-2 text-sm text-muted-foreground">
							<Activity class="h-4 w-4" />
							<span>Account age: {getAccountAgeString(user.createdAt)}</span>
						</div>
					</div>
					{#if user.banned && user.banReason}
						<div class="mt-4 rounded-md bg-destructive/15 p-3">
							<p class="text-sm text-destructive">
								<strong>Ban Reason:</strong>
								{user.banReason}
							</p>
						</div>
					{/if}
				</div>
			</div>
		</div>
	{/if}
</div>
