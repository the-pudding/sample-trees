<script>
	import { Handle, Position } from "@xyflow/svelte";
	import Waveform from "./Node.Waveform.svelte";
	import CoverArt from "./Node.CoverArt.svelte";
	import { activeController } from "$stores/misc.js";

	export let data;
	export let isConnectable = false;

	$$restProps;

	// Helper function to determine if node is part of active crossfade
	$: isCrossfadeSource =
		$activeController?.component?.type === "crossfade" &&
		$activeController?.component.id.split("_")[0] === data.id;

	$: isCrossfadeTarget =
		$activeController?.component?.type === "crossfade" &&
		$activeController?.component.id.split("_")[1] === data.id;

	$: showWaveform = isCrossfadeSource || isCrossfadeTarget;

	// Waveform props based on crossfade role
	$: waveformProps = isCrossfadeTarget
		? { waveColor: "#a3c69b", progressColor: "#517D45" }
		: { waveColor: "#fefbd7", progressColor: "#CBB600" };
</script>

<Handle
	type="target"
	position={Position.Top}
	style="background: #555; opacity: 0"
	{isConnectable}
/>

<div
	class="node"
	class:source={isCrossfadeSource}
	class:target={isCrossfadeTarget}
	class:focus={$activeController.focusNode == data.id}
>
	{#if !data.eventText}
		<div class="text">
			<div>{data.id}</div>
			<div class="title">{data.title}</div>
			<div class="artist">{data.primary_artist}</div>
		</div>
	{/if}

	<CoverArt {data} />

	{#if showWaveform}
		<Waveform
			id={data.id}
			{...waveformProps}
			play={$activeController.focusNode == data.id}
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
	.node {
		font-size: 12px;

		text-align: center;
		display: flex;
		opacity: 1;
		filter: drop-shadow(0px 0px 10px #ddd);
		// border: 1px solid red;
		// transform: scale(0.7);
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
		}
	}
</style>
