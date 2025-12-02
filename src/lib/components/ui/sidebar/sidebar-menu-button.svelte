<script lang="ts" module>
	import { type VariantProps, tv } from 'tailwind-variants';

	export const sidebarMenuButtonVariants = tv({
		base: 'peer/menu-button ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground active:bg-sidebar-accent active:text-sidebar-accent-foreground data-[active=true]:bg-muted data-[active=true]:text-primary data-[state=open]:hover:bg-sidebar-accent data-[state=open]:hover:text-sidebar-accent-foreground flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-none transition-[width,height,padding] focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50 group-has-[[data-sidebar=menu-action]]/menu-item:pr-8 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:font-medium group-data-[collapsible=icon]:!size-8 group-data-[collapsible=icon]:!p-2 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0',
		variants: {
			variant: {
				default: 'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
				primary: cn(
					'hover:bg-muted-foreground/10 dark:hover:bg-muted-foreground/40 text-sidebar-foreground dark:hover:text-primary hover:text-sidebar-foreground',
					'data-[active=true]:bg-muted-foreground/10 dark:data-[active=true]:text-primary dark:data-[active=true]:hover:text-primary data-[active=true]:text-sidebar-foreground data-[active=true]:hover:text-sidebar-foreground',
					// Add a box-shadow for border effect that doesn't affect layout
					'data-[active=true]:shadow-[0_0_0_2px_hsl(var(--ring))]'
				),
				outline:
					'bg-background hover:bg-muted hover:text-primary shadow-[0_0_0_1px_hsl(var(--sidebar-border))] hover:shadow-[0_0_0_1px_hsl(var(--sidebar-accent))]',
			},
			size: {
				default: 'h-8 text-sm',
				sm: 'h-7 text-xs',
				lg: 'h-12 text-sm group-data-[collapsible=icon]:!p-0',
			},
		},
		defaultVariants: {
			variant: 'primary',
			size: 'default',
		},
	});

	export type SidebarMenuButtonVariant = VariantProps<typeof sidebarMenuButtonVariants>['variant'];
	export type SidebarMenuButtonSize = VariantProps<typeof sidebarMenuButtonVariants>['size'];
</script>

<script lang="ts">
	import { type WithElementRef, type WithoutChildrenOrChild, mergeProps } from 'bits-ui';
	import type { ComponentProps, Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { cn } from '$lib/utils.js';
	import * as Tooltip from '$components/ui/tooltip/index.js';
	import { useSidebar } from './context.svelte.js';

	let {
		ref = $bindable(null),
		class: className,
		children,
		child,
		variant = 'primary',
		size = 'default',
		isActive = false,
		tooltipContent,
		tooltipContentProps,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLButtonElement>, HTMLButtonElement> & {
		isActive?: boolean;
		variant?: SidebarMenuButtonVariant;
		size?: SidebarMenuButtonSize;
		tooltipContent?: Snippet;
		tooltipContentProps?: WithoutChildrenOrChild<ComponentProps<typeof Tooltip.Content>>;
		child?: Snippet<[{ props: Record<string, unknown> }]>;
	} = $props();

	const sidebar = useSidebar();

	const buttonProps = $derived({
		class: cn(sidebarMenuButtonVariants({ variant, size }), className),
		'data-sidebar': 'menu-button',
		'data-size': size,
		'data-active': isActive,
		...restProps,
	});
</script>

{#snippet Button({ props }: { props?: Record<string, unknown> })}
	{@const mergedProps = mergeProps(buttonProps, props)}
	{#if child}
		{@render child({ props: mergedProps })}
	{:else}
		<button bind:this={ref} {...mergedProps}>
			{@render children?.()}
		</button>
	{/if}
{/snippet}

{#if !tooltipContent}
	{@render Button({})}
{:else}
	<Tooltip.Root>
		<Tooltip.Trigger>
			{#snippet child({ props })}
				{@render Button({ props })}
			{/snippet}
		</Tooltip.Trigger>
		<Tooltip.Content
			side="right"
			align="center"
			hidden={sidebar.state !== 'collapsed' || sidebar.isMobile}
			children={tooltipContent}
			{...tooltipContentProps}
		/>
	</Tooltip.Root>
{/if}
