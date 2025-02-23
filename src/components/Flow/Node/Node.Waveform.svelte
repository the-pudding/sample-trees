<script>
	import { onMount, onDestroy } from "svelte";
	import { base } from "$app/paths";
	import WaveSurfer from "wavesurfer.js";
	import { playerTimes, isMuted } from "$stores/misc.js";
	import { getContext } from "svelte";

	$$restProps;

	export let id;
	export let waveColor;
	export let progressColor;
	export let play;
	export let loopId;

	const dimensions = getContext("dimensions");
	const advanceLoop = getContext("advanceLoop");
	const volume = .05;

	let wavesurfer;
	let isReady = false;
	let waveformRef;

	onMount(() => {
		const dpr = 1;

		wavesurfer = WaveSurfer.create({
			container: waveformRef,
			waveColor: waveColor,
			progressColor: progressColor,
			url: `${base}/assets/audio/${id}.mp3`,
			height: $dimensions.waveformHeight * dpr,
			volume: $isMuted ? 0 : volume,
			pixelRatio: dpr,
			normalize: true,
			barWidth: 1,
			barGap: 1,
			barRadius: 0
		});

		// Mark as ready once the file is loaded
		wavesurfer.on("ready", () => {
			isReady = true;
			// Start playing if we should be playing
			if (play) {
				wavesurfer.setVolume($isMuted ? 0 : volume);
				wavesurfer.play();
			}
		});

		// When song finishes, advance to next in loop
		wavesurfer.on("finish", () => {
			if (loopId) {
				advanceLoop(loopId);
			}
		});

		wavesurfer.on("timeupdate", (currentTime) => {
			$playerTimes[id] = currentTime;
		});
	});

	onDestroy(() => {
		if (wavesurfer) {
			if (wavesurfer.isPlaying()) {
				$playerTimes[id] = wavesurfer.getCurrentTime();
				wavesurfer.pause();
			}
			wavesurfer.destroy();
		}
	});

	// Handle play/pause changes
	$: if (wavesurfer && isReady) {
		if (play && !wavesurfer.isPlaying()) {
			// Only play if we have a valid time or are starting from the beginning
			const startTime = $playerTimes[id] || 0;
			if (startTime >= 0) {
				wavesurfer.setTime(startTime);
				wavesurfer.setVolume($isMuted ? 0 : volume);
				wavesurfer.play();
			}
		} else if (!play && wavesurfer.isPlaying()) {
			$playerTimes[id] = wavesurfer.getCurrentTime();
			wavesurfer.pause();
		}
	}

	// Update volume when mute state changes
	$: if (wavesurfer && isReady) {
		wavesurfer.setVolume($isMuted ? 0 : volume);
	}
</script>

<div
	class="wrapper"
	style:--node-height="{$dimensions.nodeHeight}px"
	style:--node-width="{$dimensions.nodeWidth}px"
	style:--waveform-height="{$dimensions.waveformHeight}px"
>
	<div
		bind:this={waveformRef}
		id="waveform-{id}"
		style:--bg="{progressColor}30"
		class="waveform"
	>
		<!-- The waveform will be rendered here -->
	</div>
</div>

<style lang="scss">
	.wrapper {
		width: var(--node-width);
		height: var(--waveform-height);
		z-index: 10000;
	}

	.waveform {
		height: var(--waveform-height);
		width: 100%;
		background: var(--bg);

		:global(canvas) {
			transform: scale(1, 0.5);
			transform-origin: 0 0;
		}
	}

	/* Optional: Make sure the canvas inherits the height */
	.waveform canvas {
		height: 100% !important;
	}
</style>
