<script lang="ts">
	import type { WithElementRef } from 'bits-ui';
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { cn } from '$lib/utils.js';

	let {
		ref = $bindable(null),
		children,
		child,
		class: className,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLElement>> & {
		child?: Snippet<[{ props: Record<string, unknown> }]>;
	} = $props();

	const mergedProps = $derived({
		class: cn(
			'text-sidebar-foreground/60 ring-sidebar-ring flex h-8 shrink-0 items-center rounded-md px-2 text-sm font-medium outline-none transition-[margin,opacity] duration-200 ease-linear focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0',
			'group-data-[collapsible=icon]:absolute group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:pointer-events-none group-data-[collapsible=icon]:-translate-y-full',
			className
		),
		'data-sidebar': 'group-label',
		...restProps,
	});
</script>

{#if child}
	{@render child({ props: mergedProps })}
{:else}
	<div bind:this={ref} {...mergedProps}>
		{@render children?.()}
	</div>
{/if}
