import {
	currentAudioSource,
	globalAudioPlayer,
	playerTimes
} from "$stores/misc.js";
import { get } from "svelte/store";

// Debounce map to track timeouts for each audio URL
let playTimeouts = {};

export function handlePlay(audioUrl, id, reset = false) {
	// Clear any existing timeout for this audio URL
	if (playTimeouts[audioUrl]) {
		clearTimeout(playTimeouts[audioUrl]);
	}

	// Set new timeout
	playTimeouts[audioUrl] = setTimeout(() => {
		const previousSource = get(currentAudioSource);
		currentAudioSource.set(audioUrl);
		const player = get(globalAudioPlayer);
		if (player) {
			// Reset time if source changed and reset is true
			if (reset && previousSource !== audioUrl) {
				player.currentTime = 0;
			} else {
				const resumeTime = get(playerTimes)[id] || 0;
				player.currentTime = resumeTime;
			}
			player.play();
		}
		// Clear the timeout reference
		delete playTimeouts[audioUrl];
	}, 100); // 100ms debounce
}

export function handlePause(audioUrl, id) {
	const player = get(globalAudioPlayer);
	if (player) {
		const currentTime = player.currentTime;
		playerTimes.update((times) => ({ ...times, [id]: currentTime }));
		player.pause();
	}
}

export function pauseAllAudio() {
	const player = get(globalAudioPlayer);

	if (player) {
		player.pause();
		currentAudioSource.set(null);
	}
}

// Function to advance to next song in loop
export function advanceLoop(loops, loopId) {
	loops.update((loops) => {
		const loop = loops[loopId];
		if (loop && loop.isPlaying) {
			const prevIndex = loop.currentIndex;
			loop.currentIndex = (loop.currentIndex + 1) % loop.sequence.length;
		}
		return loops;
	});
}
