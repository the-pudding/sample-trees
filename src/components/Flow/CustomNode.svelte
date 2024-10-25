<script>
	import { base } from "$app/paths";
	import { Handle, Position } from "@xyflow/svelte";
	import Waveform from "./Waveform.svelte";
	import { activeController, crossfaders } from "$stores/misc.js";

	export let data;
	export let isConnectable = false;

	$$restProps;
</script>

<Handle
	type="target"
	position={Position.Top}
	style="background: #555; opacity: 0"
	{isConnectable}
/>

<div class="node" class:focus={$activeController.focusNode == data.id}>
	{#if $activeController?.component?.type == "crossfade" && $activeController?.component.id.split("_")[1] == data.id}
		<Waveform id={data["id"]} waveColor="#fefbd7" progressColor="#CBB600" play={$activeController.focusNode == data.id}/>
		<div class="cover-art">
			<!-- <img src="{base}/assets/cover_art/{data.id}.png" /> -->
			<img src="{base}/assets/cover_art/64739.png" />
		</div>
		<div>{data["id"]}</div>
		<div class="title">{data.title}</div>
		<div class="artist">{data.primary_artist}</div>
	{:else if $activeController?.component?.type == "crossfade" && $activeController?.component.id.split("_")[0] == data.id}
		<div>{data["id"]}</div>
		<div class="title">{data.title}</div>
		<div class="artist">{data.primary_artist}</div>

		<div class="cover-art">
			<!-- <img src="{base}/assets/cover_art/{data.id}.png" /> -->
			<img src="{base}/assets/cover_art/64739.png" />
		</div>

		<Waveform id={data["id"]} waveColor="#a3c69b" progressColor="#517D45" play={$activeController.focusNode == data.id}/>
	{:else}
		<div>{data["id"]}</div>
		<div class="title">{data.title}</div>
		<div class="artist">{data.primary_artist}</div>

		<div class="cover-art">
			<!-- <img src="{base}/assets/cover_art/{data.id}.png" /> -->
			<img src="{base}/assets/cover_art/64739.png" />
		</div>
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
	:global(.svelte-flow__node-selectorNode) {
	}

	.node {
		font-size: 12px;
		border-radius: 5px;
		text-align: center;
		height: 200px;
		display: flex;
		flex-direction: column;
		transform: scale(0.7);
		transition: transform 0.25s;

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
	}
</style>
