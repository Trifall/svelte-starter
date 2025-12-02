<script lang="ts">
	import type { DBUser } from '$database/schema';
	import { PUBLIC_SITE_NAME } from '$env/static/public';
	import {
		House,
		LayoutDashboard,
		PanelsTopLeft,
		Settings,
		SquareUser,
		Triangle,
		UsersIcon,
	} from '@lucide/svelte';
	import type { ComponentProps } from 'svelte';
	import { ROUTES } from '$src/lib/routes';
	import NavSection from '$components/sidebar/nav-group.svelte';
	import NavUser from '$components/sidebar/nav-user.svelte';
	import Separator from '$components/ui/separator/separator.svelte';
	import * as Sidebar from '$components/ui/sidebar/index.js';

	const homeNavItems = [
		{
			url: ROUTES.HOME,
			label: 'Home',
			icon: House,
		},
		{
			url: ROUTES.DASHBOARD,
			label: 'Dashboard',
			icon: LayoutDashboard,
		},
	];

	const settingsNavItems = [
		{
			url: ROUTES.PROFILE,
			label: 'Profile',
			icon: SquareUser,
		},
	];

	const adminNavItems = [
		{
			url: ROUTES.ADMIN.BASE,
			label: 'Dashboard',
			icon: PanelsTopLeft,
		},
		{
			url: ROUTES.ADMIN.USERS.BASE,
			label: 'User Management',
			icon: UsersIcon,
		},
		{
			url: ROUTES.ADMIN.SETTINGS,
			label: 'Settings',
			icon: Settings,
		},
	];

	let {
		ref = $bindable(null),
		collapsible = 'icon',
		isAdmin,
		user,
		...restProps
	}: ComponentProps<typeof Sidebar.Root> & {
		isAdmin: boolean;
		user: DBUser | null;
	} = $props();

	const sidebar = Sidebar.useSidebar();
	const isCollapsed = $derived(sidebar.state === 'collapsed' && !sidebar.isMobile);
</script>

<Sidebar.Root bind:ref {collapsible} {...restProps} class="z-[9999]">
	<Sidebar.Header class="h-16 items-start justify-center border-b border-border">
		<div
			class="flex items-center justify-center px-1 py-0 {isCollapsed
				? 'justify-center'
				: 'justify-between'}"
		>
			<a
				href={ROUTES.HOME}
				class="flex items-center font-semibold transition-all duration-300 {isCollapsed
					? 'mx-auto'
					: 'gap-2'}"
			>
				<div class="flex h-6 w-6 flex-shrink-0 items-center justify-center">
					<Triangle class="h-6 w-6 fill-foreground" />
				</div>
				<span
					class="line-clamp-2 max-w-[180px] overflow-hidden text-ellipsis text-sidebar-foreground transition-all duration-300 {isCollapsed
						? 'w-0 opacity-0'
						: 'w-auto opacity-100'}"
					title={PUBLIC_SITE_NAME && PUBLIC_SITE_NAME.length > 0
						? PUBLIC_SITE_NAME
						: 'Svelte Starter'}
				>
					{PUBLIC_SITE_NAME && PUBLIC_SITE_NAME.length > 0 ? PUBLIC_SITE_NAME : 'Svelte Starter'}
				</span>
			</a>
		</div>
	</Sidebar.Header>
	<Sidebar.Content class="gap-0">
		<NavSection label="Home" items={homeNavItems} />
		{#if isCollapsed}
			<Separator />
		{/if}
		<NavSection label="Settings" items={settingsNavItems} />
		{#if isAdmin}
			{#if isCollapsed}
				<Separator />
			{/if}
			<NavSection label="Admin" items={adminNavItems} />
		{/if}
	</Sidebar.Content>
	<Sidebar.Footer>
		<NavUser user={user ?? null} />
	</Sidebar.Footer>
	<Sidebar.Rail />
</Sidebar.Root>
