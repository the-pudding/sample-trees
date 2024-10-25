<script>
	import {
		getBezierPath,
		BaseEdge,
		EdgeLabelRenderer,
		useEdges
	} from "@xyflow/svelte";

	import { scaleLinear } from "d3-scale";

	import { activeController, crossfaders } from "$stores/misc.js";

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
	export let style = undefined;

	$: [edgePath, labelX, labelY] = getBezierPath({
		sourceX,
		sourceY,
		sourcePosition,
		targetX,
		targetY,
		targetPosition
	});

	const edges = useEdges();

	const progressScale = scaleLinear()
		.domain([0, 1.5])
		.range([sourceY, targetY]);

	$: progressY = progressScale($crossfaders[`${source}_${target}`]?.progress);
</script>

<BaseEdge path={edgePath} {markerEnd} {style} />
<EdgeLabelRenderer>
	<div
		class="edgeButtonContainer nodrag nopan"
		style:transform="translate(-50%, -50%) translate({labelX}px,{progressY}px)"
	>
		<div class="crossfader-circle" data-sample=""></div>
	</div>
</EdgeLabelRenderer>

<style>
	.edgeButtonContainer {
		position: absolute;
		font-size: 12pt;
		pointer-events: all;
	}

	.edgeButton {
		width: 20px;
		height: 20px;
		background: #eee;
		border: 1px solid #fff;
		cursor: pointer;
		border-radius: 50%;
		font-size: 12px;
		line-height: 1;
	}

	.edgeButton:hover {
		box-shadow: 0 0 6px 2px rgba(0, 0, 0, 0.08);
	}

	.crossfader-circle {
		border-radius: 50%;
		width: 10px;
		height: 10px;
		background: red;
	}
</style>
