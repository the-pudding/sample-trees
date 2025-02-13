import { writable, derived } from "svelte/store";

export const activeController = writable({});
export const activeTree = writable({});
export const crossfades = writable();
export const isMuted = writable(true);
export const playerTimes = writable({});
export const activeSectionId = writable(null);
// export const nodeWidth = writable(0)