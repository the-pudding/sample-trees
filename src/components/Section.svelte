<script>
	// Modules
	import { marked } from "marked";
	import Scroller from "@sveltejs/svelte-scroller";
	import { onMount } from "svelte";
	import { SvelteFlowProvider } from "@xyflow/svelte";
	import "@xyflow/svelte/dist/style.css";

	// Components
	import Flow from "./Flow/Flow.svelte";

	// Stores
	// import { activeController, activeTree, crossfades } from "$stores/misc.js";

	// Utils
	import generateFlow from "$utils/flow/generateFlow";

	export let tree;
	export let content;

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
	let activeController

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
		console.log(activeTree)

		activeSlideContent = slides[index];

		// console.log(activeSlideContent);
	}

	$: activeController = { ...activeSlideContent?.controller, index, progress };
</script>

<!-- <div class="debug-box">Index: {index}</div> -->

<section class="section">
	<!-- Render "inline" items before the sticky component -->
	{#each inlineBefore as item (item.id)}
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
							<Flow {index} {activeTree} {activeController}/>
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

	{#each inlineAfter as item (item.id)}
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

	.section {
		border-top: 1px solid red;
		border-bottom: 1px solid green;
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
		border: 1px solid purple;

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
