<script>
	import { onMount } from "svelte";
	import { base } from "$app/paths";
	import WaveSurfer from "wavesurfer.js";
	import { activeController, crossfaders } from "$stores/misc.js";

	export let id;
    export let waveColor;
	export let progressColor;
	export let play;

	let wavesurfer;

	onMount(() => {
		wavesurfer = WaveSurfer.create({
			container: `#waveform-${id}`,
			waveColor: waveColor,
			progressColor: progressColor,
			url: `${base}/assets/mp3/${id}.mp3`,
			height: 50 // Set the height in the WaveSurfer configuration
		});

		wavesurfer.on("finish", () => {
			wavesurfer.play();
		});


		return () => {
			wavesurfer.destroy();
		};
	});

	$: if (wavesurfer) {
		if (play) {
            console.log($crossfaders[$activeController.component?.id].currentTime)
            // wavesurfer.setScrollTime($crossfaders[$activeController.component?.id].currentTime)
			wavesurfer.play();
		} else {
			wavesurfer.pause();

		}
	}
</script>

<div id="waveform-{id}" style:--bg="{progressColor}30" class="waveform">
	<!-- The waveform will be rendered here -->
</div>

<style lang="scss">
	.waveform {
		height: 50px;
		width: 100%;
		background: var(--bg);
	}

	/* Optional: Make sure the canvas inherits the height */
	.waveform canvas {
		height: 100% !important;
	}
</style>
