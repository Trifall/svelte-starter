<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { cn } from '$lib/utils';
	import * as Sidebar from '$components/ui/sidebar/index.js';

	let {
		label = 'Group',
		items,
	}: {
		label?: string;
		items: {
			label: string;
			url: string;
			icon: any;
		}[];
	} = $props();

	// Make current pathname reactive
	const currentPathname = $derived(page.url.pathname);

	// Create a reactive map of active states for each item
	const activeStates = $derived(
		Object.fromEntries(items.map((item) => [item.url, currentPathname === item.url]))
	);
</script>

<Sidebar.Group>
	<Sidebar.GroupLabel class="font-bold">{label}</Sidebar.GroupLabel>
	<Sidebar.Menu>
		{#each items as item (item.url)}
			<Sidebar.MenuItem>
				<a
					data-active={activeStates[item.url]}
					href={resolve(item.url as any)}
					class={cn(
						'peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-none ring-sidebar-ring transition-[width,height,padding] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 group-has-[[data-sidebar=menu-action]]/menu-item:pr-8 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:bg-muted data-[active=true]:font-medium data-[active=true]:text-primary data-[state=open]:hover:bg-sidebar-accent data-[state=open]:hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:!size-8 group-data-[collapsible=icon]:!p-2 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0',
						'text-sidebar-foreground hover:bg-muted-foreground/10 hover:text-sidebar-foreground dark:hover:bg-muted-foreground/40 dark:hover:text-primary',
						'data-[active=true]:bg-muted-foreground/10 data-[active=true]:text-sidebar-foreground data-[active=true]:hover:text-sidebar-foreground dark:data-[active=true]:text-primary dark:data-[active=true]:hover:text-primary',
						'data-[active=true]:shadow-[0_0_0_2px_hsl(var(--ring))]'
					)}
					data-sidebar="menu-button"
					data-size="default"
				>
					{#if item.icon}
						<item.icon />
					{/if}
					<span>{item.label}</span>
				</a>
			</Sidebar.MenuItem>
		{/each}
	</Sidebar.Menu>
</Sidebar.Group>
