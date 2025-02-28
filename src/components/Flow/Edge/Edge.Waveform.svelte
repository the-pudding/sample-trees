<script>
	import { onMount } from "svelte";
	import { base } from "$app/paths";
	import WaveSurfer from "wavesurfer.js";
	import { playerTimes, isMuted, currentAudioSource, isPlaying, globalAudioPlayer } from "$stores/misc.js";
	import { getContext } from "svelte";
	import { handlePlay, handlePause } from "$utils/audio.js";

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
	const barHeightPadding = 3;
	const audioUrl = `${base}/assets/audio/${link_id}-${id}.mp3`;

	let wavesurfer;
	let isReady = false;
	let waveformRef;

	onMount(() => {
		wavesurfer = WaveSurfer.create({
			container: waveformRef,
			waveColor: waveColor,
			progressColor: progressColor,
			volume: 0, // Always muted since we're using global player
			url: audioUrl,
			height: $dimensions.waveformHeight - barHeightPadding * 2,
			barWidth: 1,
			barAlign: "center",
			normalize: true,
			// barGap: 1,
			barRadius: 0
		});

		// Mark as ready once the file is loaded
		wavesurfer.on("ready", () => {
			isReady = true;
			if (play) {
				handlePlay(audioUrl, id);
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

	// Update mute state changes
	$: if (wavesurfer && isReady) {
		wavesurfer.setMuted($isMuted);
	}

	// Debounce play/pause changes to avoid conflicts
	let playPauseTimeout;
	$: if (wavesurfer && isReady) {
		clearTimeout(playPauseTimeout);
		playPauseTimeout = setTimeout(() => {
			if (play && !wavesurfer.isPlaying()) {
				wavesurfer.setTime($playerTimes[id] || 0);
				wavesurfer.setMuted($isMuted);
				handlePlay(audioUrl, id);
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
	style:--waveform-height="{$dimensions.waveformHeight -
		barHeightPadding * 2}px"
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
		width: 100%;
		background: var(--bg);
		padding-top: var(--bar-height-padding);
		padding-bottom: var(--bar-height-padding);
	}

	.waveform canvas {
		height: 100% !important;
	}
</style>
