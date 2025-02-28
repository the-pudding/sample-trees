import { currentAudioSource, globalAudioPlayer, playerTimes } from '$stores/misc.js';
import { get } from 'svelte/store';

export function handlePlay(audioUrl, id) {
    currentAudioSource.set(audioUrl);
    const player = get(globalAudioPlayer);
    if (player) {
        player.currentTime = get(playerTimes)[id] || 0;
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
