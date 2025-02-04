<script>
	import { getSmoothStepPath } from "@xyflow/svelte";

	export let id;
	export let sourceX;
	export let sourceY;
	export let targetX;
	export let targetY;
	export let sourcePosition;
	export let targetPosition;
	export let data;

	$$restProps;

	// Create a straight path between source and target, with null checks
	$: path =
		sourceX != null && sourceY != null && targetX != null && targetY != null
			? `M ${sourceX},${sourceY}L ${targetX},${targetY}`
			: "";
</script>

{#if path}
	<path
		class="simple-edge"
		{id}
		d={path}
		fill="none"
		stroke="#ccc"
		stroke-width="1"
	/>
{/if}

<style>
	.simple-edge {
		pointer-events: none;
	}
</style>
