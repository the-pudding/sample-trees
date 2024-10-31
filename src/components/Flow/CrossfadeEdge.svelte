<script>
	import {
		getBezierPath,
		BaseEdge,
		EdgeLabelRenderer,
		useEdges
	} from "@xyflow/svelte";

	import { scaleLinear } from "d3-scale";

	import { activeController, crossfades } from "$stores/misc.js";

	export let source;
	export let target;
	export let id;
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

	$: console.log(targetPosition);

	const edges = useEdges();

	const progressScale = scaleLinear()
		.domain([0, 1])
		.range([sourceY, targetY])
		.clamp(true);

	$: progressY = progressScale($crossfades[`${source}_${target}`]?.progress);
</script>

<!-- <BaseEdge path={edgePath} {markerEnd} {style} /> -->
<EdgeLabelRenderer>
	<div
		class="bar"
		style:transform="translate(-50%, 0%) translate({labelX}px, {sourceY}px)"
		style:height="{targetY - sourceY + 4}px"
	></div>

	<div
		class="crossfader"
		style:transform="translate(-50%, -50%) translate({labelX}px,{progressY}px)"
	>
		<div class="crossfader__playhead" data-sample=""></div>
	</div>
</EdgeLabelRenderer>

<style lang="scss">
	.bar {
		width: 4px;
		background: #cbb600;
		background: linear-gradient(0deg, #517d45 0%, #cbb600 100%);
		position: absolute;
	}
	.crossfader {
		position: absolute;
		font-size: 12pt;
		pointer-events: all;

		&__playhead {
			width: 30px;
			height: 10px;
			background: linear-gradient(
				to bottom,
				#5d5d5d 45%,
				#ffffff 45%,
				#ffffff 60%,
				#5d5d5d 60%
			);
			border-radius: 2px;
			filter: drop-shadow(0px 0px 4px #ddd);
		}
	}
</style>
