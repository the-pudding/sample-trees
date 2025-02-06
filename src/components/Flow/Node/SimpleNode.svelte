<script>
	import { Handle, Position } from "@xyflow/svelte";
	import { base } from "$app/paths";
	import coordinates from "$data/coordinates.json";

	$$restProps;

	export let data;
	export let sourcePosition;
	export let targetPosition;

	const spritesheetWidth = 4384;
	const spritesheetHeight = 4282;
	const spriteSize = 100;
	const spriteGap = 1;

	let imageExists = false;

	$: spriteCoords =
		coordinates[data.id + ".jpeg"] || coordinates["missing.jpeg"];

	// Check if the image exists before rendering it
	async function checkImage() {
		try {
			const response = await fetch(`${base}/assets/cover_art/${data.id}.png`);
			imageExists = response.ok;
		} catch (error) {
			imageExists = false;
		}
	}

	// background-position: {-spriteCoords.x - spriteCoords.x / (spriteSize + spriteGap)}px
	// {-spriteCoords.y - spriteCoords.y / (spriteSize + spriteGap)}px;

	checkImage();

	let xOffset = (coordinates["10515.jpeg"].x / spritesheetWidth) * 100;
	let yOffset = (coordinates["10516.jpeg"].y / spritesheetHeight) * 100;

</script>

<div class="node simple-node">
	<Handle type="target" position={targetPosition} class="handle" />
	<div
		class="circle"
		title={data.title}
		style="width: {data.circleSize}px; height: {data.circleSize}px;"
	>
		<div
			class="sprite"
			style="
				background-image: url({base}/assets/sprites/spritesheet.jpeg);
				background-position: calc({(spriteCoords.x / spritesheetWidth) *
				100}% + 1px + {xOffset}%) calc({(spriteCoords.y / spritesheetHeight) *
				100}% + 1px + {yOffset}%);
				background-size: {spritesheetWidth}% {spritesheetHeight}%;
				width: 100%;
				height: 100%;
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
	}

	.circle {
		border-radius: 50%;
		background: #fff;
		outline: 1px solid #ccc;
		cursor: pointer;
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
	}

	:global(.handle) {
		opacity: 0;
		width: 0;
		height: 0;
		background: transparent;
		border: none;
	}
</style>
