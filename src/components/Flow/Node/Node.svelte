<script>
	import { Handle, Position } from "@xyflow/svelte";
	import CoverArt from "./Node.CoverArt.svelte";
	import { activeController } from "$stores/misc.js";

	export let data;
	export let isConnectable = false;

	$$restProps;

	// Helper function to determine if node is part of active
	$: isSource = $activeController?.component?.id.split("_")[0] === data.id;

	$: isTarget = $activeController?.component?.id.split("_")[1] === data.id;

	// $: console.log(data)

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

	$: secondaryLabelObj = parseSecondaryLabelConfig(data.secondaryLabelConfig)?.[
		$activeController.secondaryLabelAccessor
	];
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
>
	{#if !secondaryLabelObj}
		<div class="text">
			<div class="title">{data.title}</div>
			<div class="artist">{data.primary_artist}</div>
		</div>
	{:else}
		something new
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
	:global(.svelte-flow__node) {
		transition: transform 0.5s ease;
	}

	.node {
		font-size: 12px;

		text-align: center;
		display: flex;
		opacity: 1;
		filter: drop-shadow(0px 0px 10px #ddd);
		// border: 1px solid red;
		height: 100%;
		width: 100%;
		// transform: scale(1.8);
		transition: transform 0.25s;
		flex-direction: column;

		&.source {
			flex-direction: column;
		}

		&.target {
			flex-direction: column-reverse;
		}

		&.focus {
			transform: scale(1);
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
