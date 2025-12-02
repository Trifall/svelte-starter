<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import { cn } from '$lib/utils.js';
	import { Separator } from '$components/ui/separator/index.js';

	let {
		ref = $bindable(null),
		class: className,
		...restProps
	}: ComponentProps<typeof Separator> = $props();
</script>

<Separator
	bind:ref
	data-sidebar="separator"
	class={cn('mx-2 w-auto bg-sidebar-border', className)}
	{...restProps}
/>
