<script>
	// Modules
	import { writable } from "svelte/store";
	import { marked } from "marked";
	import Scroller from "@sveltejs/svelte-scroller";
	import { onMount, getContext, setContext } from "svelte";
	import { SvelteFlowProvider } from "@xyflow/svelte";
	import { activeSectionId } from "$stores/misc.js";
	import "@xyflow/svelte/dist/style.css";
	import { fade } from "svelte/transition";
	import viewport from "$stores/viewport";
	import { globalChangeWatcher } from "$stores/misc.js";
	// Components
	import Flow from "./Flow/Flow.svelte";

	// Utils
	import generateFlow from "$utils/flow/generateFlow";

	export let key;
	export let content;
	export let sectionIndex;
	export let viewportHeight;

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
	$: if (
		isReady &&
		$viewport.width !== 0 &&
		$viewport.width !== previousStoreWidth
	) {
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

	// Create a writable store for the controller
	const controllerStore = writable(activeController);
	setContext("activeController", controllerStore);

	$: {
		activeController = { ...activeSlideContent?.controller, index, progress };
		// Update the store whenever activeController changes
		controllerStore.set(activeController);
	}

	// Create crossfades store
	const crossfades = writable({});
	setContext("crossfades", crossfades);

	// Update crossfades when slides change
	$: {
		const crossfadesObj = slides
			.filter((d) => d?.controller?.component?.type == "crossfade")
			.reduce((acc, item) => {
				const { id } = item.controller?.component;
				const [source, target] = id.split("_");

				acc[id] = {
					source,
					target
				};

				return acc;
			}, {});
		crossfades.set(crossfadesObj);
	}

	// Update progress when offset changes
	$: if ($controllerStore?.component?.type == "crossfade") {
		const id = $controllerStore.component?.id;
		const crossfadeData = $crossfades[id];
		if (crossfadeData) {
			crossfadeData.progress =
				$controllerStore.focusNode == crossfadeData.source
					? offset / 2
					: offset / 2 + 0.5;

			crossfades.set($crossfades);
		}
	}

	// Create loops store
	const loops = writable({});
	setContext("loops", loops);

	// Update loops when slides change
	$: {
		const loopsObj = slides
			.filter((d) => d?.controller?.component?.type == "loop")
			.reduce((acc, item) => {
				const { id } = item.controller?.component;
				const nodeIds = id.split(",");

				acc[id] = {
					sequence: nodeIds,
					currentIndex: 0,
					isPlaying: true
				};

				return acc;
			}, {});
		loops.set(loopsObj);
	}

	let previousIndex = activeController?.index;

	$: if (previousIndex !== activeController?.index) {
		$globalChangeWatcher = ++$globalChangeWatcher;
		previousIndex = activeController.index;
	}

	$: if ($globalChangeWatcher) {
		// Reset all loops
		loops.update((loops) => {
			Object.keys(loops).forEach((key) => {
				loops[key].isPlaying = false;
				loops[key].currentIndex = 0;
			});
			return loops;
		});

		// Initialize new state if this is a loop controller
		if (activeController?.component?.type === "loop") {
			const loopId = activeController.component.id;

			// Set up loop state
			loops.update((loops) => {
				if (loops[loopId]) {
					loops[loopId].isPlaying = true;
					loops[loopId].currentIndex = 0;
				}
				return loops;
			});
		}
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
					{#if $activeSectionId == key}
						<div transition:fade={{ duration: 500 }}>
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
												{viewportHeight}
											/>
										</SvelteFlowProvider>
									{/if}
								{/await}
							</div>

							{#if activeTree}
								<SvelteFlowProvider>
									<Flow {activeTree} {activeController} {slides} {offset} {viewportHeight}/>
								</SvelteFlowProvider>
							{/if}
						</div>

					{/if}
				{/if}
			{/if}
		</div>

		<div class="foreground" slot="foreground">
			{#each slides as slide, i}
				<section
					class="slide"
					style="
						height:{!slide.text ? viewportHeight*.25 : viewportHeight}px;
						padding-top:{i == 0 ? viewportHeight/2 : ''}px;
						padding-bottom:{i == slides.length - 1 ? viewportHeight/2 : ''}px;
					"
					class:spacer={!slide.text}
				>
					{#if slide.text}
						<div class="slide-text"
						id="{sectionIndex == 0 && i == 0 ? 'scroll-to-start' : ''}"
						>{slide.text}
							<div class="noise-slide"></div>
						</div>
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
		max-width: 1200px;
		padding: 1rem;
	}

	.slide {
		display: flex;
		justify-content: center;
		align-items: flex-start;

		pointer-events: none;
		position: relative;

		.slide-text {
			width: 100%;
			height: fit-content;
			max-width: 400px;
			padding: 1rem;
			transform: translateY(25vh);
			margin: 0 auto;
			background: rgba(0, 0, 0, .95);
			color: white;
			border-radius: 3px;

			.noise-slide {
				position: absolute;
				top: 0;
				left: 0;
				width: 100%;
				height: 100%;
				background-image: url('assets/noise-light.png');
				opacity: 0.1;
				
			}
		}
	}
</style>
