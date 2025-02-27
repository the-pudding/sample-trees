<script>
	import { onMount } from "svelte";
	import { base } from "$app/paths";
	import WaveSurfer from "wavesurfer.js";
	import { playerTimes, isMuted } from "$stores/misc.js";
	import { getContext } from "svelte";

	$$restProps;

	export let position;
	export let id;
	export let waveColor;
	export let progressColor;
	export let play;
	export let labelX;
	export let sourceY;
	export let targetY;
	export let link_id;

	const dimensions = getContext("dimensions");
	const volume = .1;
	const barHeightPadding = 3;

	let wavesurfer;
	let isReady = false;
	let waveformRef;

	onMount(() => {
		wavesurfer = WaveSurfer.create({
			container: waveformRef,
			waveColor: waveColor,
			progressColor: progressColor,
			volume: $isMuted ? 0 : volume,
			url: `${base}/assets/audio/${link_id}-${id}.mp3`,
			height: $dimensions.waveformHeight - barHeightPadding*2,
			// barWidth: 1,
			barAlign: "center",
			normalize: true,
			// barGap: 1,
			barRadius: 0
		});

		// Mark as ready once the file is loaded
		wavesurfer.on("ready", () => {
			isReady = true;
			if (play) {
				wavesurfer.setVolume($isMuted ? 0 : volume);
				wavesurfer.play();
			}
		});

		// Replay on finish
		wavesurfer.on("finish", () => {
			wavesurfer.play();
		});

		return () => {
			wavesurfer.destroy();
		};
	});

	// Update volume when mute state changes
	$: if (wavesurfer && isReady) {
		wavesurfer.setVolume($isMuted ? 0 : volume);
	}

	// Debounce play/pause changes to avoid conflicts
	let playPauseTimeout;
	$: if (wavesurfer && isReady) {
		clearTimeout(playPauseTimeout);
		playPauseTimeout = setTimeout(() => {
			if (play && !wavesurfer.isPlaying()) {
				wavesurfer.setTime($playerTimes[id] || 0);
				wavesurfer.setVolume($isMuted ? 0 : volume);
				wavesurfer.play();
			} else if (!play && wavesurfer.isPlaying()) {
				$playerTimes[id] = wavesurfer.getCurrentTime();
				wavesurfer.pause();
			}
		}, 100);
	}
</script>

<div
	class="wrapper"
	style:transform="translate(-50%, 0%) {position == 'top'
		? `translate(${labelX}px, ${sourceY - $dimensions.waveformGap}px)`
		: `translate(${labelX}px, ${targetY - $dimensions.waveformHeight + $dimensions.waveformGap}px)`}"
	style:--node-height="{$dimensions.nodeHeight}px"
	style:--node-width="{$dimensions.nodeWidth}px"
	style:--waveform-height="{$dimensions.waveformHeight - barHeightPadding*2}px"
	style:--bar-height-padding="{barHeightPadding}px"
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
		position: absolute;
		z-index: 10000;
	}

	.waveform {
		// height: var(--waveform-height);
		width: 100%;
		background: var(--bg);
		padding-top: var(--bar-height-padding);
		padding-bottom: var(--bar-height-padding);
		:global(canvas) {
			// transform: scale(1, 0.5);
			// transform-origin: 0 0;
		}
	}

	/* Optional: Make sure the canvas inherits the height */
	.waveform canvas {
		height: 100% !important;
	}
</style>
