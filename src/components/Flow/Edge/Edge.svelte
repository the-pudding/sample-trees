<script>
	import {
		getSmoothStepPath,
		BaseEdge,
		EdgeLabelRenderer,
		useEdges
	} from "@xyflow/svelte";
	import { getContext } from "svelte";
	import { scaleLinear } from "d3-scale";

	import Waveform from "./Edge.Waveform.svelte";
	import Crossfade from "./Edge.Crossfade.svelte";

	// Get the stores from context
	const activeController = getContext("activeController");
	const crossfades = getContext("crossfades");
	const dimensions = getContext("dimensions");
	const edgeHighlights = getContext("edgeHighlights");

	export let id;
	export let source;
	export let target;
	export let sourceX;
	export let sourceY;
	export let sourcePosition;
	export let targetX;
	export let targetY;
	export let targetPosition;
	export let markerEnd = undefined;
	export let data;

	$: highlight = $edgeHighlights
		.map((edgeId) => `${edgeId}-${$activeController.tree}`)
		.includes(id);

	$$restProps;

	$: [edgePath, labelX] = getSmoothStepPath({
		sourceX,
		sourceY,
		sourcePosition,
		targetX,
		targetY,
		targetPosition
	});
	// Calculate crossfader dimensions
	$: crossfadeStart =
		sourceY + $dimensions.waveformHeight - $dimensions.waveformGap;
	$: crossfadeEnd =
		targetY - $dimensions.waveformHeight + $dimensions.waveformGap;
	$: crossfadeHeight = crossfadeEnd - crossfadeStart;

	// Scale range maps to twice the crossfade height,
	// starting one crossfade height above the start point
	$: progressScale = scaleLinear()
		.domain([0, 1])
		.range([crossfadeStart - crossfadeHeight, crossfadeEnd])
		.clamp(true);

	$: progressPercentage = $crossfades[id]?.progress;
	$: progressY = progressScale(progressPercentage);
</script>

{#if $activeController?.component?.type == "crossfade" && $activeController?.component?.id == id}
	<EdgeLabelRenderer>
		<!-- <Waveform
			position="top"
			id={source}
			waveColor="#fefbd7"
			progressColor="#CBB600"
			play={progressPercentage >= 0.5 && progressPercentage < 0.75}
			{labelX}
			{sourceY}
			{targetY}
			link_id={id.split("-")[0]}
		/>
 -->
		<!-- <Waveform
			position="bottom"
			id={target}
			waveColor="#a3c69b"
			progressColor="#517D45"
			play={progressPercentage >= 0.75 && progressPercentage < 1}
			{sourceY}
			{labelX}
			{targetY}
			link_id={id.split("-")[0]}
		/> -->

		<Crossfade {labelX} {sourceY} {targetY} {progressY} />
	</EdgeLabelRenderer>
{:else if data?.method === "elk"}
	<BaseEdge
		path={edgePath}
		{markerEnd}
		style="stroke-width: 2px;"
		class="base-edge elk-edge {highlight ? 'highlighted' : ''}"
	/>
{:else}
	<BaseEdge
		path={edgePath}
		{markerEnd}
		style=""
		class="base-edge {highlight ? 'highlighted' : ''}"
	/>
{/if}

<style lang="scss">
	:global(.base-edge) {
		transition:
			stroke 0.2s,
			stroke-width 0.2s;
		stroke: #ccc;
		stroke-width: 3px;
		vector-effect: non-scaling-stroke;
	}

	:global(.base-edge:hover) {
		stroke: #adadad;
		stroke-width: 3px;
	}

	:global(.show-highlighted-edges .base-edge.highlighted) {
		stroke: #ff0000;
		stroke-width: 3px;
		z-index: 10000;
	}

	:global {
		svg:has(.base-edge.highlighted) {
			z-index: 1 !important;
		}
	}
</style>
