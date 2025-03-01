<script>
	import { getSmoothStepPath, getBezierPath } from "@xyflow/svelte";
	import { getContext } from "svelte";

	export let id;
	export let sourceX;
	export let sourceY;
	export let targetX;
	export let targetY;
	export let sourcePosition;
	export let targetPosition;
	export let data;

	$$restProps;

	const activeController = getContext("activeController");
	const edgeHighlights = getContext("edgeHighlights");

	$: highlight = $edgeHighlights
		.map((edgeId) => `${edgeId}-${$activeController.tree}`)
		.includes(id);

	// $: $edgeHighlights.length && console.log($edgeHighlights);

	// Create path based on activeTree
	$: path =
		$activeController.tree === "king_2"
			? `M ${sourceX},${sourceY}L ${targetX},${targetY}` // Straight line for king_2
			: $activeController.tree === "funky_3"
				? getBezierPath({
						// Bezier path for funky_3
						sourceX,
						sourceY,
						sourcePosition,
						targetX,
						targetY,
						targetPosition
					})[0]
				: getSmoothStepPath({
						// Smooth step for others
						sourceX,
						sourceY,
						sourcePosition,
						targetX,
						targetY,
						targetPosition
					})[0];
</script>

{#if path}
	<path
		class="simple-edge"
		{id}
		d={path}
		fill="none"
		stroke="#aaa"
		stroke-width="1"
	/>
	{#if highlight}
		<path
			class="simple-edge {highlight ? 'highlighted' : ''}"
			{id}
			d={path}
			fill="none"
			stroke="#ccc"
			stroke-width="1"
		/>
		<path
			class="simple-edge"
			{id}
			d={path}
			fill="none"
			stroke="#333"
			stroke-width="1"
		/>
	{/if}
{/if}

<style lang="scss">
	.simple-edge {
		pointer-events: none;
	}

	:global(.show-highlighted-edges .simple-edge.highlighted) {
		stroke: var(--color-pink);
		stroke-width: 6px;
		stroke-opacity: 0.7;
		z-index: 10000;
	}

	:global {
		svg:has(.simple-edge.highlighted) {
			z-index: 1 !important;
		}
	}

</style>
