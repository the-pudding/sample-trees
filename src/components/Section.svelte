<script>
	import { marked } from "marked";

	export let key;
	export let content;

	// Separate inline and sticky items
	let inlineBefore = [];
	let inlineAfter = [];
	let stickyItem = null;

	// Divide content into sections reactively
	$: {
		inlineBefore = content.filter(
			(item, index) =>
				item.type === "inline" &&
				index < content.findIndex((i) => i.type === "sticky")
		);
		stickyItem = content.find((item) => item.type === "sticky");
		inlineAfter = content.filter(
			(item, index) =>
				item.type === "inline" &&
				index > content.findIndex((i) => i.type === "sticky")
		);
	}
</script>

<div>
	<!-- Render "inline" items before the sticky component -->
	{#each inlineBefore as item (item.id)}
		<div class="inline">{@html marked(item.text)}</div>
	{/each}
	<!-- Render the sticky component -->
	{#if stickyItem}
		<div class="sticky">STICKY</div>
	{/if}

	{#each inlineAfter as item (item.id)}
		<div class="inline">{@html marked(item.text)}</div>
	{/each}
</div>

<style>
</style>
