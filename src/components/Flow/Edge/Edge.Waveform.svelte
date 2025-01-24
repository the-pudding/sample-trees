<script>
	import { onMount } from "svelte";
	import { base } from "$app/paths";
	import WaveSurfer from "wavesurfer.js";
	import { activeController, crossfades, playerTimes } from "$stores/misc.js";
	import viewport from "$stores/viewport";
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

	let waveformRef;

	onMount(() => {
		wavesurfer = WaveSurfer.create({
			container: waveformRef,
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

	const textHeight = 30;
	const waveformHeight = 30;
	const nodeHeight = Math.min(
		$viewport.height / 2 - textHeight - waveformHeight,
		260
	);

	const nodeWidth = nodeHeight * 0.75;
</script>

<div
	class="wrapper"
	style:transform="translate(-50%, 0%) {position == 'top'
		? `translate(${labelX}px, ${sourceY }px)`
		: `translate(${labelX}px, ${targetY + 4}px)`}"
	style:--node-height="{nodeHeight}px"
	style:--node-width="{nodeWidth}px"
>
	<div bind:this={waveformRef} id="waveform-{id}" style:--bg="{progressColor}30" class="waveform">
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
