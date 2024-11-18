<script>
	import { onMount } from "svelte";
	import { base } from "$app/paths";
	import WaveSurfer from "wavesurfer.js";
	import { activeController, crossfades, playerTimes } from "$stores/misc.js";

	export let position;
	export let id;
	export let waveColor;
	export let progressColor;
	export let play;
	export let labelX;
	export let sourceY;
	export let targetY;

	const height = 30;

	let wavesurfer;
	let isReady = false;

	onMount(() => {
		wavesurfer = WaveSurfer.create({
			container: `#waveform-${id}`,
			waveColor: waveColor,
			progressColor: progressColor,
			url: `${base}/assets/audio/${id}.mp3`,
			height: height
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
				// console.log("Playing:", id);
				wavesurfer.setTime($playerTimes[id] || 0);

				wavesurfer.play();
			} else if (!play && wavesurfer.isPlaying()) {
				// console.log("Pausing:", id);
				$playerTimes[id] = wavesurfer.getCurrentTime();
				wavesurfer.pause();
			}
		}, 100); // Adjust delay if needed
	}
</script>

<div
	class="wrapper"
	style:transform="translate(-50%, 0%) {position == 'top'
		? `translate(${labelX}px, ${sourceY - height}px)`
		: `translate(${labelX}px, ${targetY + 4}px)`}"
>
	<div id="waveform-{id}" style:--bg="{progressColor}30" class="waveform">
		<!-- The waveform will be rendered here -->
	</div>
</div>

<style lang="scss">
	.wrapper {
		width: var(--node-width);
		height: var(--waveform-height);
		position: absolute;
	}

	.waveform {
		height: 30px;
		width: 100%;
		background: var(--bg);
	}

	/* Optional: Make sure the canvas inherits the height */
	.waveform canvas {
		height: 100% !important;
	}
</style>
