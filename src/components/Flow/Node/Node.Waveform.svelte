<script>
	import { onMount, onDestroy } from "svelte";
	import { base } from "$app/paths";
	import WaveSurfer from "wavesurfer.js";
	import { playerTimes, isMuted, currentAudioSource, isPlaying, globalAudioPlayer } from "$stores/misc.js";
	import { getContext } from "svelte";
	import { handlePlay, handlePause, advanceLoop } from "$utils/audio.js";

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
			// Only auto-play if this is the current node in the loop sequence
			if (play && loopId) {
				const loop = $loops[loopId];
				if (loop && loop.sequence[loop.currentIndex] === id) {
					handlePlay(audioUrl, id, true);
				}
			} else if (play && !loopId) {
				// For non-loop playback
				handlePlay(audioUrl, id, true);
			}
		});
		
		// When song finishes in loop mode
		$globalAudioPlayer?.addEventListener('ended', () => {
			if (loopId && $currentAudioSource === audioUrl) {
				advanceLoop(loops, loopId);
			}
		});

		// Sync waveform progress with global player
		const updateTimer = setInterval(() => {
			if (isReady && $globalAudioPlayer && $currentAudioSource === audioUrl) {
				const currentTime = $globalAudioPlayer.currentTime;
				// Only update if the time has actually changed
				if (currentTime !== wavesurfer.getCurrentTime()) {
					wavesurfer.setTime(currentTime);
				}
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
			handlePlay(audioUrl, id, true);
		} else if (!play && $currentAudioSource === audioUrl) {
			handlePause(audioUrl, id);
		}
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
