<script lang="ts">
	import type { Snippet } from 'svelte';
	import AppSidebar from '$components/sidebar/app-sidebar.svelte';
	import ThemeToggle from '$components/theme-toggle.svelte';
	import * as Sidebar from '$components/ui/sidebar';
	import type { LayoutServerData } from './$types';

	const { data, children }: { data: LayoutServerData; children: Snippet } = $props();

	const isAdmin = $derived(data.isAdmin);
	const user = $derived(data.user);
</script>

<Sidebar.Provider>
	<AppSidebar {isAdmin} {user} />
	<Sidebar.Inset>
		<div class="flex h-full flex-col">
			<header
				class="top-0 z-10 flex h-16 w-full items-center border-b border-border bg-background transition-[width,height] ease-linear"
				style="position: fixed; width: 100%; left: inherit; right: inherit;"
			>
				<div class="flex items-center gap-2 px-4">
					<Sidebar.Trigger class="-ml-1" />
					<ThemeToggle />
				</div>
			</header>

			<!-- Spacer to account for fixed header -->
			<div class="h-16"></div>

			<!-- Content area -->
			<div class="flex-1">
				<div class="p-2 lg:p-4">
					{@render children()}
				</div>
			</div>
		</div>
	</Sidebar.Inset>
</Sidebar.Provider>
