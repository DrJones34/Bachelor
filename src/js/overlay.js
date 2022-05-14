import { writable } from "svelte/store"


export function activateOverlay(){
    overlayStore.set({
        show: true,
        content: null
    });
}

export function deactivateOverlay(){
    overlayStore.set({
        show: false,
        content: null
    });
}


export let overlayStore = writable({
    show: false,
    content: null
});