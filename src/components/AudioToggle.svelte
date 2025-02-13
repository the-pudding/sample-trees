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
        background: white;
        border: 1px solid #ccc;
        border-radius: 50%;
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.2s ease;

        &:hover {
            background: #f5f5f5;
            border-color: #999;
        }
    }
</style> 