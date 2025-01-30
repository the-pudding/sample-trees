<script>
    import { Handle, Position } from '@xyflow/svelte';
    import { base } from "$app/paths";

	$$restProps;

    export let data;
    export let sourcePosition;
    export let targetPosition;

    let imageExists = false;

    // Check if the image exists before rendering it
    async function checkImage() {
        try {
            const response = await fetch(`${base}/assets/cover_art/${data.id}.png`);
            imageExists = response.ok;
        } catch (error) {
            imageExists = false;
        }
    }

    // checkImage();
</script>

<div class="node">
    <Handle 
        type="target" 
        position={targetPosition}
        class="handle"
    />
    <div 
        class="circle" 
        title={data.title}
        style="width: {data.circleSize}px; height: {data.circleSize}px;"
    >
        <!-- {#if imageExists}
            <img src="{base}/assets/cover_art/{data.id}.png" alt={data.title} />
        {:else}
            <img src="{base}/assets/cover_art/missing.png" alt={data.title} />
        {/if} -->
    </div>
    <Handle 
        type="source" 
        position={sourcePosition}
        class="handle"
    />
</div>

<style lang="scss">
    .node {
        display: flex;
        justify-content: center;
        align-items: center;
        position: relative;
        width: 100%;
        height: 100%;
    }

    .circle {
        // border-radius: 50%;
        background: #fff;
        // border: 2px solid #ccc;
        cursor: pointer;
        overflow: hidden;  // Added to keep image within circle
        display: flex;     // Added for image centering
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;

        img {
            width: 100%;
            height: 100%;
            object-fit: cover;  // Makes image cover the circle area
        }

        &:hover {
            border-color: #999;
            transform: scale(1.1);
            transition: all 0.2s ease;
        }
    }

    :global(.handle) {
        opacity: 0;
        width: 0;
        height: 0;
        background: transparent;
        border: none;
    }
</style> 