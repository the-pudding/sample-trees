<script>
	import { Handle, Position } from "@xyflow/svelte";
	import CoverArt from "./Node.CoverArt.svelte";
	import { getContext } from 'svelte';

	export let data;
	export let isConnectable = false;

	$$restProps;

	const activeController = getContext('activeController');
	const dimensions = getContext('dimensions');

	// Helper function to determine if node is part of active
	$: isSource = $activeController?.fitViewNodes?.split(",")[0] === data.id;
	$: isTarget = $activeController?.fitViewNodes?.split(",")[1] === data.id;

</script>

<Handle
	type="target"
	position={Position.Top}
	style="background: #555; opacity: 0"
	{isConnectable}
/>

<div
	class="node"
	class:source={isSource}
	class:target={isTarget}
	class:focus={$activeController.focusNode == data.id}
	class:faded={$activeController?.fadedNodes?.split(",").includes(data.id)}
	style:--node-height="{$dimensions.nodeHeight}px"
	style:--node-width="{$dimensions.nodeWidth}px"
	data-id={data.id}
>
	{#if $activeController.tree != $activeController.links}
		<div class="text">
			<div class="title">{data.title}</div>
			<div class="artist">{data.primary_artist}</div>
		</div>
	{/if}
	<CoverArt {data} />
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
		filter: drop-shadow(0px 0px 10px #ddd);
		height: 100%;
		width: 100%;
		flex-direction: column;
		transition: opacity 0.5s;

		&.source {
			flex-direction: column-reverse;
		}

		&.target {
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

			* {
				white-space: nowrap;
				text-align: center;
				margin-left: -100%;
				margin-right: -100%;
			}
		}
	}
</style>
