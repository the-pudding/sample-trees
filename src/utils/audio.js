import { currentAudioSource, globalAudioPlayer, playerTimes } from '$stores/misc.js';
import { get } from 'svelte/store';

export function handlePlay(audioUrl, id, reset = false) {
    const previousSource = get(currentAudioSource);
    currentAudioSource.set(audioUrl);
    const player = get(globalAudioPlayer);
    if (player) {
        // Reset time if source changed and reset is true
        if (reset && previousSource !== audioUrl) {
            player.currentTime = 0;
        } else {
            player.currentTime = get(playerTimes)[id] || 0;
        }
        player.play();
    }
}

export function handlePause(audioUrl, id) {
    const player = get(globalAudioPlayer);
    if (player) {
        playerTimes.update(times => ({ ...times, [id]: player.currentTime }));
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
            loop.currentIndex = (loop.currentIndex + 1) % loop.sequence.length;
            console.log(loop.currentIndex);
        }
        return loops;
    });
} 
