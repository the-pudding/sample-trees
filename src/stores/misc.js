import { writable, derived } from "svelte/store";
import { base } from "$app/paths";

export const activeController = writable({});
export const activeTree = writable({});
export const crossfades = writable();
export const isMuted = writable(true);
export const playerTimes = writable({});
export const activeSectionId = writable(null);
// export const nodeWidth = writable(0)

export const globalChangeWatcher = writable(0);

// Global audio player store
export const currentAudioSource = writable(null);
export const isPlaying = writable(false);
export const audioElement = writable(null);

// Track number of plays for current audio
let playCount = 0;
const MAX_REPEATS = 3;

// Initialize the global audio player
if (typeof window !== "undefined") {
	const audio = new Audio();
	audio.volume = 1;
	audioElement.set(audio);

	// Update isPlaying state based on audio events
	audio.addEventListener("play", () => isPlaying.set(true));
	audio.addEventListener("pause", () => isPlaying.set(false));

	// Handle ended event with repeat logic
	audio.addEventListener("ended", () => {
		isPlaying.set(false);
	});

	// Handle visibility change
	document.addEventListener("visibilitychange", () => {
		if (document.hidden) {
			// Browser tab is hidden
			const player = audio;
			if (player && !player.paused) {
				player.pause();
				isPlaying.set(false);
			}
		}
	});

	// Handle page blur (when window loses focus)
	window.addEventListener("blur", () => {
		const player = audio;
		if (player && !player.paused) {
			player.pause();
			isPlaying.set(false);
		}
	});
}

// Derived store that combines isMuted with the audio element
export const globalAudioPlayer = derived(
	[audioElement, isMuted, currentAudioSource],
	([$audioElement, $isMuted, $currentAudioSource]) => {
		if ($audioElement) {
			$audioElement.muted = $isMuted;
			if ($currentAudioSource) {
				// Only set source if it's changed
				if ($audioElement.src !== $currentAudioSource) {
					// Reset play count when source changes
					playCount = 0;
					$audioElement.src = $currentAudioSource;
				}
			}
		}
		return $audioElement;
	}
);

export const lastActiveNode = writable(null);

export const sectionBGColors = {
	dna: "#fefbd7",
	beat: "#fae1dd",
	lyrics: "#e8e8e4",
	melody: "#e5fcf5"
};
