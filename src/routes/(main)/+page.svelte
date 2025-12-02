<script lang="ts">
	import { getPublicSiteName } from '$src/lib/utils/format';
	import type { PageData } from './$types';

	let {
		data,
	}: {
		data: PageData;
	} = $props();
</script>

<svelte:head>
	<title>{getPublicSiteName()}</title>
</svelte:head>

{#if data.error}
	<div class="mb-6 rounded-md bg-destructive/15 p-4 text-destructive">
		<p>{data.error}</p>
	</div>
{/if}

<div class="flex h-full flex-col items-center justify-center">
	<span class="text-2xl font-bold">svelte starter</span>
	<p>Server message: `{data.message}`</p>
</div>
