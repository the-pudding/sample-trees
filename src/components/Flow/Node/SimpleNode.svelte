<script>
    import { Handle, Position } from '@xyflow/svelte';
    export let data;
    export let sourcePosition;
    export let targetPosition;
</script>

<div class="node">
    <Handle type="target" position={targetPosition} />
    <div class="circle" title={data.title}></div>
    <Handle type="source" position={sourcePosition} />
</div>

<style lang="scss">
    .node {
        display: flex;
        justify-content: center;
        align-items: center;
        position: relative;
    }

    .circle {
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: #fff;
        border: 2px solid #ccc;
        cursor: pointer;

        &:hover {
            border-color: #999;
            transform: scale(1.1);
            transition: all 0.2s ease;
        }
    }
</style> 