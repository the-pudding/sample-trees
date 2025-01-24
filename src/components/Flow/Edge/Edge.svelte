<script>
	import {
		getBezierPath,
		BaseEdge,
		EdgeLabelRenderer,
		useEdges
	} from "@xyflow/svelte";

	import { scaleLinear } from "d3-scale";

	import { activeController, crossfades } from "$stores/misc.js";

	import Waveform from "./Edge.Waveform.svelte";
	import Crossfade from "./Edge.Crossfade.svelte";

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

	let style = "stroke: purple; stroke-width: 5px";

	$: [edgePath, labelX, labelY] = getBezierPath({
		sourceX,
		sourceY,
		sourcePosition,
		targetX,
		targetY,
		targetPosition
	});

	const progressScale = scaleLinear()
		.domain([0, 1])
		.range([sourceY, targetY])
		.clamp(true);

	$: progressY = progressScale($crossfades[`${id}`]?.progress);
</script>

{#if $activeController?.component?.type && $activeController?.component?.id == id}
	<EdgeLabelRenderer>
		<Waveform
			position="top"
			id={source}
			waveColor="#fefbd7"
			progressColor="#CBB600"
			play={$activeController.focusNode == source}
			{labelX}
			{sourceY}
		/>

		<Crossfade {labelX} {sourceY} {targetY} {progressY} />

		<Waveform
			position="bottom"
			id={target}
			waveColor="#a3c69b"
			progressColor="#517D45"
			play={$activeController.focusNode == target}
			{labelX}
			{targetY}
		/>
	</EdgeLabelRenderer>
{:else}
	<BaseEdge path={edgePath} {markerEnd} />
{/if}
