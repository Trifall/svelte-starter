<script lang="ts">
	import { PUBLIC_SITE_NAME } from '$env/static/public';
	import { House, LayoutDashboard, SquareUser, Triangle } from '@lucide/svelte';
	import type { ComponentProps } from 'svelte';
	import { ROUTES } from '$src/lib/routes';
	import NavSection from '$components/sidebar/nav-group.svelte';
	import Separator from '$components/ui/separator/separator.svelte';
	import * as Sidebar from '$components/ui/sidebar/index.js';

	const homeNavItems = [
		{
			url: ROUTES.HOME,
			label: 'Home',
			icon: House,
		},
	];

	let {
		ref = $bindable(null),
		collapsible = 'icon',
		...restProps
	}: ComponentProps<typeof Sidebar.Root> = $props();

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
	</Sidebar.Content>
	<Sidebar.Rail />
</Sidebar.Root>
