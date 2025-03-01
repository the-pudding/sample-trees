<script>
	import { Handle, useSvelteFlow } from "@xyflow/svelte";
	import { base } from "$app/paths";
	import { getContext } from "svelte";
	import coordinates from "$data/coordinates.json";

	$$restProps;

	export let data;
	export let sourcePosition;
	export let targetPosition;

	const spritesheetWidth = 4384;
	const spriteSize = 100;
	const secondaryLabels = getContext("secondaryLabels");
	const { viewport } = useSvelteFlow();

	const scale = (data.circleSize || 20) / spriteSize;

	$: sprite = coordinates[data.id + ".jpeg"] || coordinates["missing.jpeg"];

	$: bgX = -(sprite.x * scale);
	$: bgY = -(sprite.y * scale);

	let fontSize = 14;
	$: adjustedFontSize = fontSize / $viewport.zoom;
</script>

<div class="node simple-node" style:--adjusted-font-size="{adjustedFontSize}px">
	<Handle type="target" position={targetPosition} class="handle" />
	<div
		class="circle"
		title={data.title}
		style="width: {data.circleSize}px; height: {data.circleSize}px;"
	>
		<div class="secondary-labels">
			{#if $secondaryLabels[data.id]}
				<div class="secondary-labels">
					<div class="secondary-label top">
						{$secondaryLabels[data.id].top || ""}
					</div>

					<div class="secondary-label right">
						{$secondaryLabels[data.id].right || ""}
					</div>
					<div class="secondary-label bottom">
						{$secondaryLabels[data.id].bottom || ""}
					</div>
					<div class="secondary-label left">
						{$secondaryLabels[data.id].left || ""}
					</div>
				</div>
			{/if}
		</div>

		<div
			class="sprite"
			style="
				background-image: url({base}/assets/sprites/spritesheet.jpeg);
				background-size: calc({spritesheetWidth}px * {scale}) auto;
				background-position: {bgX}px {bgY}px;
			"
		/>
	</div>
	<Handle type="source" position={sourcePosition} class="handle" />
</div>

<style lang="scss">
	.node {
		display: flex;
		justify-content: center;
		align-items: center;
		position: relative;
		width: 100%;
		height: 100%;
		font-size: var(--adjusted-font-size, 12px);
	}

	.circle {
		background: #fff;
		overflow: hidden; // Added to keep image within circle
		display: flex; // Added for image centering
		align-items: center;
		justify-content: center;
		width: 100%;
		height: 100%;
		flex: 0 0 auto img {
			width: 100%;
			height: 100%;
			object-fit: cover; // Makes image cover the circle area
		}

		&:hover {
			border-color: #999;
			transform: scale(1.1);
			transition: all 0.2s ease;
		}

		.sprite {
			background-repeat: no-repeat;
			width: 100%;
			height: 100%;
		}

		.secondary-label {
			position: absolute;
			font-weight: bold;
			width: max-content;
			font-weight: bold;
			font-size: 1rem;

			&.top {
				text-align: center;
				top: 0px;
				right: 0;
				margin: 0 auto;
				text-align: left;
				transform: translate(-50%, -100%);
				left: 50%;
				right: 0;
				margin: 0 auto;
			}
			&.right {
				right: calc(var(--node-width) * -1);
				text-align: left;
				top: 50%;
				transform: translate(100%, -50%);
				right: -5px;
				left: auto;
				line-height: 1;
			}
			&.bottom {
				text-align: center;
				left: 0;
				right: 0;
				bottom: 0;
				margin: 0 auto;
				transform: translate(0, 100%);
			}
		}
	}

	:global(.handle) {
		opacity: 0;
		width: 0;
		height: 0;
		background: transparent;
		border: none;
	}
</style>
