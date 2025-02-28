<script>
	import { onMount, onDestroy } from "svelte";
	import { base } from "$app/paths";
	import WaveSurfer from "wavesurfer.js";
	import { playerTimes, isMuted, currentAudioSource, isPlaying, globalAudioPlayer } from "$stores/misc.js";
	import { getContext } from "svelte";
	import { handlePlay, handlePause } from "$utils/audio.js";

	$$restProps;

	export let id;
	export let waveColor;
	export let progressColor;
	export let play;
	export let loopId;

	const dimensions = getContext("dimensions");
	const audioUrl = `${base}/assets/audio/${id}.mp3`;
	let wavesurfer;
	let isReady = false;
	let waveformRef;

	const loops = getContext("loops");
	// Function to advance to next song in loop
	function advanceLoop(loopId) {
		loops.update((loops) => {
			const loop = loops[loopId];
			if (loop && loop.isPlaying) {
				loop.currentIndex = (loop.currentIndex + 1) % loop.sequence.length;
			}
			return loops;
		});
	}

	onMount(() => {
		const dpr = 1;

		wavesurfer = WaveSurfer.create({
			container: waveformRef,
			waveColor: waveColor,
			progressColor: progressColor,
			url: audioUrl,
			height: $dimensions.waveformHeight * dpr,
			volume: 0, // Always muted since we're using global player
			pixelRatio: dpr,
			normalize: true,
			barWidth: 1,
			barGap: 1,
			barRadius: 0
		});

		// Mark as ready once the file is loaded
		wavesurfer.on("ready", () => {
			isReady = true;
			if (play) {
				handlePlay(audioUrl, id);
			}
		});

		// When song finishes in loop mode
		$globalAudioPlayer?.addEventListener('ended', () => {
			if (loopId && $currentAudioSource === audioUrl) {
						advanceLoop(loopId);
			}
		});

		// Sync waveform progress with global player
		const updateTimer = setInterval(() => {
			if (isReady && $globalAudioPlayer && $currentAudioSource === audioUrl) {
				wavesurfer.setTime($globalAudioPlayer.currentTime);
			}
		}, 50);

		return () => {
			clearInterval(updateTimer);
			if (wavesurfer) {
				if ($currentAudioSource === audioUrl) {
					$playerTimes[id] = $globalAudioPlayer?.currentTime || 0;
					handlePause(audioUrl, id);
				}
				wavesurfer.destroy();
			}
		};
	});

	// Handle play/pause changes
	$: if (isReady) {
		if (play && $currentAudioSource !== audioUrl) {
				handlePlay(audioUrl, id);
		} else if (!play && $currentAudioSource === audioUrl) {
			handlePause(audioUrl, id);
		}
	}

	// Keep waveform progress in sync with global player
	$: if (isReady && $globalAudioPlayer && $currentAudioSource === audioUrl) {
		wavesurfer.setTime($globalAudioPlayer.currentTime);
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
