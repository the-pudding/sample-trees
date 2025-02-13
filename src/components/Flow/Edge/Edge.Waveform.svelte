<script>
	import { onMount } from "svelte";
	import { base } from "$app/paths";
	import WaveSurfer from "wavesurfer.js";
	import { playerTimes } from "$stores/misc.js";
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
	const volume = 0.3;

	let wavesurfer;
	let isReady = false;
	let waveformRef;

	onMount(() => {
		const dpr =  1;

		wavesurfer = WaveSurfer.create({
			container: waveformRef,
			waveColor: waveColor,
			progressColor: progressColor,
			url: `${base}/assets/audio/${link_id}-${id}.mp3`,
			height: $dimensions.waveformHeight * dpr,
			volume: volume,
			pixelRatio: dpr,
			normalize: true,
			barWidth: .1,
			barGap: 0,
			barRadius: 0
		});

		// Mark as ready once the file is loaded
		wavesurfer.on("ready", () => {
			isReady = true;
		});

		// Replay on finish
		wavesurfer.on("finish", () => {
			wavesurfer.play();
		});

		wavesurfer.on("timeupdate", (currentTime) => {
			// $playerTimes[id] = currentTime;
			// console.log($playerTimes[id])
		});

		return () => {
			wavesurfer.destroy();
		};
	});

	// Debounce play/pause changes to avoid conflicts
	let playPauseTimeout;
	$: if (wavesurfer && isReady) {
		clearTimeout(playPauseTimeout);
		playPauseTimeout = setTimeout(() => {
			if (play && !wavesurfer.isPlaying()) {
				wavesurfer.setTime($playerTimes[id] || 0);
				wavesurfer.setVolume(volume);
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
		position: absolute;
		z-index: 10000 ;
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
