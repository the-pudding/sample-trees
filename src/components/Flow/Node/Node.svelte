<script>
	import { Handle, Position } from "@xyflow/svelte";
	import CoverArt from "./Node.CoverArt.svelte";
	import { activeController } from "$stores/misc.js";

	export let data;
	export let isConnectable = false;

	$: console.log(data);

	$$restProps;

	// Helper function to determine if node is part of active
	$: isSource = $activeController?.component?.id.split("_")[0] === data.id;

	$: isTarget = $activeController?.component?.id.split("_")[1] === data.id;
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
	{#if !data.eventText}
		<div class="text">
			<!-- <div>{data.id}</div> -->
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
