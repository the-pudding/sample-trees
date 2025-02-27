<script>
	import { getContext, onMount, onDestroy } from "svelte";

	const dimensions = getContext("dimensions");

	export let labelX;
	export let sourceY;
	export let targetY;
	export let progressY;

	let currentY = progressY;
	let targetY_mobile = progressY;
	let rafId;
	let isMobile = false;

	function animate() {
		const diff = targetY_mobile - currentY;
		if (Math.abs(diff) > 0.1) {
			currentY += diff * 0.2;
			rafId = requestAnimationFrame(animate);
		} else {
			currentY = targetY_mobile;
			rafId = null;
		}
	}

	onMount(() => {
		isMobile = window.matchMedia("(max-width: 40rem)").matches;
	});

	onDestroy(() => {
		if (rafId) cancelAnimationFrame(rafId);
	});

	// Update target for mobile animation
	$: {
		if (isMobile) {
			targetY_mobile = progressY;
			if (!rafId) {
				rafId = requestAnimationFrame(animate);
			}
		} else {
			currentY = progressY;
		}
	}
</script>

<div
	class="bar"
	style:--x="{labelX}px"
	style:--y="{sourceY + $dimensions.waveformHeight - $dimensions.waveformGap}px"
	style:height="{targetY -
		sourceY -
		$dimensions.waveformHeight * 2 +
		$dimensions.waveformGap * 2}px"
></div>

<div class="crossfader" style:--x="{labelX}px" style:--y="{currentY}px">
	<div
		class="crossfader__playhead"
		style:--playhead-height="{$dimensions.playheadHeight}px"
		data-sample=""
	></div>
</div>

<style lang="scss">
	.bar {
		width: 4px;
		background: #cbb600;
		background: linear-gradient(
			0deg,
			#72896b 0%,
			#4d5f48 50%,
			#695e01 51%,
			#cbb600 100%
		);
		position: absolute;
		will-change: transform;
		transform: translate3d(-50%, 0%, 0) translate3d(var(--x), var(--y), 0);
	}

	.bar::before {
		content: "";
		position: absolute;
		top: 50%;
		left: 50%;
		width: 20px;
		height: 0.5px;
		background: #111;
		transform: translate(-50%, -50%);
	}

	.bar::after {
		content: "";
		position: absolute;
		top: 50%;
		left: 50%;
		width: 10px;
		height: 1.2px;
		transform: translate(-50%, -50%);
		background: #f0f0f0;
	}

	.crossfader {
		position: absolute;
		// font-size: 12pt;
		// pointer-events: all;
		will-change: transform;
		transform: translate3d(-50%, -50%, 0) translate3d(var(--x), var(--y), 0);
		&__playhead {
			width: 20px;
			height: var(--playhead-height);
			background: linear-gradient(
				to bottom,
				#5d5d5d 42%,
				#ffffff 42%,
				#ffffff 60%,
				#5d5d5d 60%
			);
			border-radius: 1px;
			box-shadow:
				-12px 14px 5px 0px rgba(0, 0, 0, 0),
				-8px 9px 5px 0px rgba(0, 0, 0, 0.01),
				-4px 5px 4px 0px rgba(0, 0, 0, 0.05),
				-2px 2px 3px 0px rgba(0, 0, 0, 0.09),
				0px 1px 2px 0px rgba(0, 0, 0, 0.1);
		}
	}
</style>
