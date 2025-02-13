<script>
	import { Handle, Position } from "@xyflow/svelte";
	import CoverArt from "./Node.CoverArt.svelte";
	import { getContext } from "svelte";
	import Waveform from "./Node.Waveform.svelte";
	import { activeSectionId } from "$stores/misc.js";

	export let data;
	export let isConnectable = false;

	$$restProps;

	const activeController = getContext("activeController");
	const dimensions = getContext("dimensions");
	const loops = getContext("loops");
	const sectionId = getContext("sectionId");

	// Helper function to determine if node is part of active
	$: isSource = $activeController?.fitViewNodes?.split(",")[0] === data.id;
	$: isTarget = $activeController?.fitViewNodes?.split(",")[1] === data.id;

	// Determine if this node should be playing in a loop
	$: isInLoop =
		$activeController?.component?.type === "loop" &&
		$activeController?.component?.id.split(",").includes(data.id) &&
		sectionId === $activeSectionId;

	


	$: loopId = $activeController?.component?.id;

	// Determine if this node should be playing
	$: isCurrentlyPlaying =
		isInLoop &&
		$loops[loopId]?.isPlaying &&
		$loops[loopId]?.sequence[$loops[loopId]?.currentIndex] === data.id;

	// Determine if node should be faded
	$: shouldBeFaded =
		$activeController?.fadedNodes?.split(",").includes(data.id) ||
		($activeController?.component?.type === "loop" && !isCurrentlyPlaying);
</script>

<Handle
	type="target"
	position={Position.Top}
	style="background: #555; opacity: 0"
	{isConnectable}
/>

<div
	class="node {$activeController?.component?.type || ''}"
	class:source={isSource}
	class:target={isTarget}
	class:focus={$activeController.focusNode == data.id}
	class:faded={shouldBeFaded}
	style:--node-height="{$dimensions.nodeHeight}px"
	style:--node-width="{$dimensions.nodeWidth}px"
	data-id={data.id}
>
	{#if $activeController.tree != $activeController.links}
		<div class="text">
			<div class="title">{data.title}</div>
			<div class="artist">{data.primary_artist} ({data.release_date.slice(0,4)})</div>
		</div>
	{/if}
	<CoverArt {data} />

	{#if isInLoop}
		<Waveform
			id={data.id}
			waveColor="#fefbd7"
			progressColor="#CBB600"
			play={isCurrentlyPlaying}
			{loopId}
		/>
	{/if}
</div>

<Handle
	type="source"
	position={Position.Bottom}
	id="a"
	style="bottom: 0px; background: #555; opacity: 0"
	{isConnectable}
/>

<style lang="scss">
	:global(.svelte-flow__nodes) {
		z-index: 100;
	}

	:global(.svelte-flow__node) {
		transition: transform 0.5s ease;
	}

	.node {
		max-width: var(--node-width);
		max-height: var(--node-height);
		position: relative;
		font-size: 12px;
		z-index: 1000;
		text-align: center;
		display: flex;
		opacity: 1;
		height: 100%;
		width: 100%;
		flex-direction: column;
		transition: opacity 0.5s;

		&.source.crossfade {
			flex-direction: column-reverse;
			:global(.text) {
				transform: translate(0px, 5px);
			}

		}

		&.target.crossfade {
			flex-direction: column;
		}

		&.focus {
			transform: scale(1);
		}

		&.faded {
			opacity: 0.25;
		}

		.title {
			font-weight: bold;
		}

		.artist {
			font-size: 10px;
		}

		.cover-art {
			flex: 1 1 100%;
			img {
				width: 100%;
				height: 100%;
				object-fit: contain;
			}
		}

		.text {
			font-family: var(--sans);
			text-align: center;
			line-height: 1.2;
			z-index: 1000;
			transform: translateY(-5px);

			* {
				white-space: nowrap;
				text-align: center;
				margin-left: -100%;
				margin-right: -100%;
			}
		}
	}
</style>
