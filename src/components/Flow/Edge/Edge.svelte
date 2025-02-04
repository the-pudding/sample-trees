<script>
	import {
		getBezierPath,
		BaseEdge,
		EdgeLabelRenderer,
		useEdges
	} from "@xyflow/svelte";
	import { getContext } from "svelte";
	import { scaleLinear } from "d3-scale";

	import Waveform from "./Edge.Waveform.svelte";
	import Crossfade from "./Edge.Crossfade.svelte";

	// Get the stores from context
	const activeController = getContext('activeController');
	const crossfades = getContext('crossfades');

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

	$$restProps;
	
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

	$: progressPercentage = $crossfades[id]?.progress;
	$: progressY = progressScale(progressPercentage);
</script>

{#if $activeController?.component?.type && $activeController?.component?.id == id}
	<EdgeLabelRenderer>
		<Waveform
			position="top"
			id={source}
			waveColor="#fefbd7"
			progressColor="#CBB600"
			play={progressPercentage >= 0.5 && progressPercentage < 0.75}
			{labelX}
			{sourceY}
			{targetY}
			link_id={id.split('-')[0]}
		/>

		<Crossfade {labelX} {sourceY} {targetY} {progressY} />

		<Waveform
			position="bottom"
			id={target}
			waveColor="#a3c69b"
			progressColor="#517D45"
			play={progressPercentage >= 0.75 && progressPercentage < 1}
			{sourceY}
			{labelX}
			{targetY}
			link_id={id.split('-')[0]}
		/>
	</EdgeLabelRenderer>
{:else}
	<BaseEdge path={edgePath} {markerEnd} />
{/if}
