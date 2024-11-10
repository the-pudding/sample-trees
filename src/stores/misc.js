import { writable, derived } from "svelte/store";

export const activeController = writable();
export const crossfades = writable();

// export const nodeWidth = writable(0)