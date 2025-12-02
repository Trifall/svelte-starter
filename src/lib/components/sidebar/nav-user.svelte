<script lang="ts">
	import type { DBUser } from '$database/schema';
	import BadgeCheck from '@lucide/svelte/icons/badge-check';
	import ChevronsUpDown from '@lucide/svelte/icons/chevrons-up-down';
	import LogOut from '@lucide/svelte/icons/log-out';
	import { goto } from '$app/navigation';
	import { authClient } from '$lib/auth-client';
	import { ROUTES } from '$src/lib/routes';
	import { formatEmail, formatUserName, formatUserNameInitials } from '$src/lib/utils/format';
	import * as Avatar from '$components/ui/avatar/index.js';
	import * as DropdownMenu from '$components/ui/dropdown-menu/index.js';
	import * as Sidebar from '$components/ui/sidebar/index.js';
	import { useSidebar } from '$components/ui/sidebar/index.js';

	let { user }: { user: DBUser | Partial<DBUser> | null } = $props();
	const sidebar = useSidebar();

	async function handleLogout() {
		await authClient.signOut();
		goto(ROUTES.AUTH.SIGNIN);
	}

	const userName = $derived(user ? formatUserName(user) : 'Guest');
	const userInitials = $derived(user ? formatUserNameInitials(user) : 'G');
	const userEmail = $derived(user ? formatEmail(user.email) : null);
</script>

{#if user}
	<Sidebar.Menu>
		<Sidebar.MenuItem>
			<DropdownMenu.Root>
				<DropdownMenu.Trigger>
					{#snippet child({ props })}
						<Sidebar.MenuButton
							size="lg"
							class="data-[state=open]:bg-muted/50 data-[state=open]:text-sidebar-accent-foreground"
							{...props}
						>
							<Avatar.Root class="h-8 w-8 rounded-lg">
								<Avatar.Image src="" alt={userName} />
								<Avatar.Fallback class="rounded-lg">{userInitials}</Avatar.Fallback>
							</Avatar.Root>
							<div class="grid flex-1 text-left text-sm leading-tight">
								<span class="truncate font-semibold">{userName}</span>
								{#if userEmail}
									<span class="truncate text-xs">{userEmail}</span>
								{/if}
							</div>
							<ChevronsUpDown class="ml-auto size-4" />
						</Sidebar.MenuButton>
					{/snippet}
				</DropdownMenu.Trigger>
				<DropdownMenu.Content
					class="w-[var(--bits-dropdown-menu-anchor-width)] min-w-56 rounded-lg"
					side={sidebar.isMobile ? 'bottom' : 'right'}
					align="end"
					sideOffset={4}
				>
					<DropdownMenu.Label class="p-0 font-normal">
						<div class="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
							<Avatar.Root class="h-8 w-8 rounded-lg">
								<Avatar.Image src="" alt={userName} />
								<Avatar.Fallback class="rounded-lg">{userInitials}</Avatar.Fallback>
							</Avatar.Root>
							<div class="grid flex-1 text-left text-sm leading-tight">
								<span class="truncate font-semibold">{userName}</span>
								{#if userEmail}
									<span class="truncate text-xs">{userEmail}</span>
								{/if}
							</div>
						</div>
					</DropdownMenu.Label>

					<DropdownMenu.Separator />
					<DropdownMenu.Group>
						<DropdownMenu.Item>
							<BadgeCheck />
							<a href={ROUTES.PROFILE}>Account</a>
						</DropdownMenu.Item>
						<DropdownMenu.Separator />
						<DropdownMenu.Item onclick={handleLogout}>
							<LogOut />
							Sign out
						</DropdownMenu.Item>
					</DropdownMenu.Group>
				</DropdownMenu.Content>
			</DropdownMenu.Root>
		</Sidebar.MenuItem>
	</Sidebar.Menu>
{/if}
