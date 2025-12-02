<script lang="ts">
	import { ChevronLeft } from '@lucide/svelte';
	import type { ComponentProps } from 'svelte';
	import { cn } from '$lib/utils.js';
	import { Button } from '$components/ui/button/index.js';
	import { useSidebar } from './context.svelte.js';

	let {
		ref = $bindable(null),
		class: className,
		onclick,
		...restProps
	}: ComponentProps<typeof Button> & {
		onclick?: (e: MouseEvent) => void;
	} = $props();

	const sidebar = useSidebar();
</script>

<Button
	type="button"
	onclick={(e) => {
		onclick?.(e);
		sidebar.toggle();
	}}
	data-sidebar="trigger"
	variant="ghost"
	size="icon"
	class={cn('h-7 w-7', className)}
	aria-label="Toggle Sidebar"
	{...restProps}
>
	<ChevronLeft
		class={cn(sidebar.open ? 'rotate-0' : '-rotate-180', 'transition-all duration-200 ease-in-out')}
	/>
</Button>
