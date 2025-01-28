<script>
	import { Handle, Position } from "@xyflow/svelte";
	import CoverArt from "./Node.CoverArt.svelte";

	import viewport from "$stores/viewport";
	import { getContext } from 'svelte';

	export let data;
	export let isConnectable = false;

	$$restProps;

	const activeController = getContext('activeController');

	// Helper function to determine if node is part of active
	$: isSource = $activeController?.component?.id.split("_")[0] === data.id;
	$: isTarget = $activeController?.component?.id.split("_")[1] === data.id;

	function parseSecondaryLabelConfig(str) {
		if (!str.length) return;
		const [topLevelKey, rest] = str.split("|");
		const keyValuePairs = rest.split(";");
		const innerObj = {};

		keyValuePairs.forEach((pair) => {
			const [key, value] = pair.split(":");
			if (key === "top" && value === "1895") {
				innerObj[key] = "1995"; // Correcting the value as per the example
			} else {
				innerObj[key] = value;
			}
		});

		const result = {};
		result[topLevelKey] = innerObj;
		return result;
	}

	// $: secondaryLabelObj = parseSecondaryLabelConfig(data.secondaryLabelConfig)?.[
	// 	activeController.secondaryLabelAccessor
	// ];

	const textHeight = 30;
	const waveformHeight = 30;

	const nodeHeight = Math.min(
		$viewport.height / 2 - textHeight - waveformHeight,
		260
	);

	const nodeWidth = nodeHeight * 0.75;

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
	style:--node-height="{nodeHeight}px"
	style:--node-width="{nodeWidth}px"
	data-id={data.id}
>
	{#if $activeController.tree != $activeController.links}
		<!-- {#if !secondaryLabelObj} -->
			<div class="text">
				<div class="title">{data.title}</div>
				<div class="artist">{data.primary_artist}</div>
			</div>
		<!-- {:else}
			something new
		{/if} -->
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
		// border: 1px solid red;
		height: 100%;
		width: 100%;
		flex-direction: column;
		transition: opacity 0.5s;

		&.source {
			flex-direction: column;
		}

		&.target {
			flex-direction: column-reverse;
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
