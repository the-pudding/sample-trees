<script>
	import { base } from "$app/paths";
	import { Play, Pause } from "lucide-svelte";
	import {
		currentAudioSource,
		globalAudioPlayer,
		playerTimes,
		isMuted
	} from "$stores/misc.js";
	import { handlePlay, handlePause } from "$utils/audio.js";
	import { onMount, onDestroy } from "svelte";

	export let id;
	export let text;

	const audioUrl = `${base}/assets/audio/${id}.mp3`;
	let isToggled = false;

	function togglePlay() {
		isToggled = !isToggled;
		if (isToggled) {
			handlePlay(audioUrl, id);
		} else {
			handlePause(audioUrl, id);
		}
	}

	// Reset toggle state if a different audio source starts playing
	$: if ($currentAudioSource !== audioUrl) {
		isToggled = false;
	}

	// Reset state when audio is muted
	$: if ($isMuted && isToggled) {
		isToggled = false;
		handlePause(audioUrl, id);
	}

	onMount(() => {
		// Reset toggle when our audio finishes playing
		const handleEnded = () => {
			if ($currentAudioSource === audioUrl) {
				isToggled = false;
				// Just reset the stored time in playerTimes
				playerTimes.update((times) => ({ ...times, [id]: 0 }));
			}
		};

		const player = $globalAudioPlayer;
		if (player) {
			player.addEventListener("ended", handleEnded);
		}

		return () => {
			if (player) {
				player.removeEventListener("ended", handleEnded);
			}
		};
	});
</script>

{#if $isMuted}
	{text}
{:else}
	<button class="inline-audio" on:click={togglePlay}>
		{#if isToggled}
			<Pause size={16} color="rgba(0, 0, 0, 0.95)" />
		{:else}
			<Play size={16} color="rgba(0, 0, 0, 0.95)" />
		{/if}
		<span class="text">{text}</span>
	</button>
{/if}

<style lang="scss">
	.inline-audio {
		display: inline-flex;
		align-items: center;
		gap: 0.25rem;
		background: none;
		border: none;
		color: inherit;
		cursor: pointer;
		padding: 0;
		font: inherit;
		background: var(--color-green);
		padding-right: 5px;

		&:hover {
			color: #cbb600;
		}

		.text {
			color: rgba(0, 0, 0, 0.95);
		}
	}

	:global {
		.lucide-play,
		.lucide-pause {
			fill: rgba(0, 0, 0, 0.95);
		}
	}
</style>
