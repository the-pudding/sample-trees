<script>
	// Modules
	import { marked } from "marked";
	import Scroller from "@sveltejs/svelte-scroller";
	import { onMount, getContext, setContext } from "svelte";
	import { SvelteFlowProvider } from "@xyflow/svelte";
	import { writable } from "svelte/store";
	import "@xyflow/svelte/dist/style.css";

	// Components
	import Flow from "./Flow/Flow.svelte";

	// Utils
	import generateFlow from "$utils/flow/generateFlow";

	export let key;
	export let content;

	const audioRegistry = getContext('audioRegistry');

	// Create loops store
	const loops = writable({});
	setContext('loops', loops);

	// Function to advance to next song in loop
	function advanceLoop(loopId) {
		loops.update(loops => {
			const loop = loops[loopId];
			if (loop && loop.isPlaying) {
				loop.currentIndex = (loop.currentIndex + 1) % loop.sequence.length;
				return loops;
			}
			return loops;
		});
	}

	// Expose advance function to components
	setContext('advanceLoop', advanceLoop);

	// Separate inline and sticky items
	let inlineBefore = [];
	let inlineAfter = [];
	let slides = null;

	// Divide content into sections reactively
	let index, offset, progress;

	let isReady = false;
	let render;

	let activeSlideContent;
	let activeTree;
	let activeController;

	$: {
		inlineBefore = content.filter(
			(item, index) =>
				item.type === "inline" &&
				index < content.findIndex((i) => i.type === "sticky")
		);

		slides = content.filter((item) => item.type === "sticky");

		inlineAfter = content.filter(
			(item, index) =>
				item.type === "inline" &&
				index > content.findIndex((i) => i.type === "sticky")
		);
	}

	onMount(async () => {
		render = await Promise.all(slides.map((slide, i) => generateFlow(slide)));
		isReady = true;
	});

	$: if (isReady) {
		activeTree = render[index];
		activeSlideContent = slides[index];
	}

	$: {
		activeController = { ...activeSlideContent?.controller, index, progress };
		// Pause all audio when index changes
		if (index !== undefined) {
			audioRegistry.pauseAllExcept();
			
			// Reset all loops
			loops.update(loops => {
				Object.keys(loops).forEach(key => {
					loops[key].isPlaying = false;
					loops[key].currentIndex = 0;
				});
				return loops;
			});

			// Initialize new state if this is a loop controller
			if (activeController?.component?.type === "loop") {
				const loopId = activeController.component.id;
				
				// Set up loop state
				loops.update(loops => {
					if (loops[loopId]) {
						loops[loopId].isPlaying = true;
						loops[loopId].currentIndex = 0;
					}
					return loops;
				});
			}
		}
	}
</script>

<section class="section">
	<!-- Render "inline" items before the sticky component -->
	{#each inlineBefore as item}
		<div class="content">{@html marked(item.text)}</div>
	{/each}

	<Scroller
		top={0}
		bottom={1}
		threshold={0.5}
		bind:index
		bind:offset
		bind:progress
	>
		<div slot="background">
			{#if isReady}
				{#if activeSlideContent}
					{#if activeTree}
						<SvelteFlowProvider>
							<Flow 
								{index} 
								{activeTree} 
								{activeController} 
								{key}
								{slides}
								{offset}
							/>
						</SvelteFlowProvider>
					{/if}
				{/if}
			{/if}
		</div>

		<div class="foreground" slot="foreground">
			{#each slides as slide}
				<section class="slide" class:spacer={!slide.text}>
					{#if slide.text}
						<p>{slide.text}</p>
					{/if}
				</section>
			{/each}
		</div>
	</Scroller>

	{#each inlineAfter as item}
		<div class="content">{@html marked(item.text)}</div>
	{/each}
</section>

<style lang="scss">
	.debug-box {
		position: fixed;
		top: 0;
		left: 0;
		padding: 5px;
		background: #00000050;
		color: white;
		display: flex;
		justify-content: center;
		align-items: center;
		z-index: 10000;
	}

	.full-tree-container {
		background: white;
		width: 100%;
		height: 100%;
		position: absolute;
		top: 0;
		left: 0;
		z-index: 10000;
		opacity: 0;
		transition: 0.5s opacity;
		&.visible {
			opacity: 1;
		}
	}

	.content {
		margin: 0 auto;
		max-width: 700px;
		padding: 1rem;
	}

	.slide {
		height: 100vh;
		display: flex;
		justify-content: center;
		align-items: center;
		pointer-events: none;

		&:first-of-type {
			padding-top: 50vh;
		}

		&:last-of-type {
			padding-bottom: 50vh;
		}

		&.spacer {
			height: 25vh;
		}
		p {
			background: white;
			width: 100%;
			max-width: 400px;
			box-shadow: 5px 5px 15px #ddd;
			padding: 1rem;
		}
	}
</style> 