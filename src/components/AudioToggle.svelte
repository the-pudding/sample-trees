<script>
    import { Volume2, VolumeX } from 'lucide-svelte';
    import { isMuted } from '$stores/misc.js';

    function toggleMute() {
        $isMuted = !$isMuted;
    }
</script>

<button class="audio-toggle" on:click={toggleMute}>
    {#if $isMuted}
        <VolumeX size={20} />
    {:else}
        <Volume2 size={20} />
    {/if}
</button>

<style lang="scss">
    .audio-toggle {
        position: fixed;
        top: 1rem;
        right: 1rem;
        z-index: 10000;
        border-radius: 50%;
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.2s ease;
        filter: drop-shadow(0px 0px 1px rgba(0, 0, 0, 0.10)) drop-shadow(0px 2px 2px rgba(0, 0, 0, 0.09)) drop-shadow(0px 5px 3px rgba(0, 0, 0, 0.05)) drop-shadow(0px 9px 3px rgba(0, 0, 0, 0.01)) drop-shadow(0px 14px 4px rgba(0, 0, 0, 0.00));
        background: rgba(255, 255, 255, 0.9);
        border: none;
    }
</style> 