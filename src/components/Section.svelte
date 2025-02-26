<script>
	// Modules
	import { marked } from "marked";
	import Scroller from "@sveltejs/svelte-scroller";
	import { onMount, getContext, setContext } from "svelte";
	import { SvelteFlowProvider } from "@xyflow/svelte";
	import { activeSectionId } from "$stores/misc.js";
	import "@xyflow/svelte/dist/style.css";
	import { fade } from "svelte/transition";
	import viewport from "$stores/viewport";


	// Components
	import Flow from "./Flow/Flow.svelte";

	// Utils
	import generateFlow from "$utils/flow/generateFlow";

	export let key;
	export let content;
	export let sectionIndex;

	let sectionRef;

	// Separate inline and sticky items
	let inlineBefore = [];
	let inlineAfter = [];
	let slides = null;

	setContext("sectionId", key);

	// Divide content into sections reactively
	let index, offset, progress;

	let isReady = false;
	let render;
	let fullTree;
	let fullTreeController;

	let activeSlideContent;
	let activeTree;
	let activeController;

	// Track previous width from the store
	let previousStoreWidth = 0;

	// Watch viewport width changes
	$: if (isReady && $viewport.width !== 0 && $viewport.width !== previousStoreWidth) {
		previousStoreWidth = $viewport.width;
		init();
	}

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
		await init();
	});

	$: if (isReady) {
		activeTree = render[index];
		activeSlideContent = slides[index];
	}

	$: {
		activeController = { ...activeSlideContent?.controller, index, progress };
	}


	async function init() {
		isReady = false;
		render = await Promise.all(
			slides.map((slide, i) => {
				if (slide.controller.tree == slide.controller.links) {
					fullTree = generateFlow(slide);
					fullTreeController = { ...slide.controller, index: i, progress: 0 };

					return { nodes: [], edges: [] };
				}
				return generateFlow(slide);
			})
		);

		isReady = true;
	}
</script>

<section class="section" bind:this={sectionRef} data-id={key}>
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
					<div
						class="full-tree-container"
						class:visible={activeController.links == activeController.tree}
						class:show-highlighted-edges={activeController.edgeHighlight}
					>
						{#await fullTree then fullTreeResult}
							{#if fullTreeResult}
								<SvelteFlowProvider>
									<Flow
										activeTree={fullTreeResult}
										activeController={fullTreeController}
										{offset}
										isFullTree={true}
									/>
								</SvelteFlowProvider>
							{/if}
						{/await}
					</div>

					{#if activeTree}
						{#if $activeSectionId == key}
							<div transition:fade={{ duration: 500 }}>
								<SvelteFlowProvider>
									<Flow {activeTree} {activeController} {slides} {offset} />
								</SvelteFlowProvider>
							</div>
						{/if}
					{/if}
				{/if}
			{/if}
		</div>

		<div class="foreground" slot="foreground">
			{#each slides as slide, i}
				<section
					class="slide"
					style="
						height:{!slide.text ? $viewport.height*.25 : $viewport.height}px;
						padding-top:{i == 0 ? $viewport.height/2 : ''}px;
						padding-bottom:{i == slides.length - 1 ? $viewport.height/2 : ''}px;
					"
					class:spacer={!slide.text}
				>
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
		display: flex;
		justify-content: center;
		align-items: flex-start;

		pointer-events: none;

		p {
			background: white;
			width: 100%;
			height: fit-content;
			max-width: 400px;
			padding: 1rem;
			transform: translateY(25vh);
			margin: 0 auto;

		}
	}
</style>
