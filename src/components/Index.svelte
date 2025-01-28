<script>
	import { getContext } from "svelte";
	import { onMount } from "svelte";
	import { SvelteFlowProvider } from "@xyflow/svelte";

	import "@xyflow/svelte/dist/style.css";

	import Flow from "./Flow/Flow.svelte";
	// import Footer from "$components/Footer.svelte";

	import generateFlow from "$utils/flow/generateFlow";
	import groupBy from "$utils/groupBy";
	// const copy = getContext("copy");

	import flatSlides from "$data/slides.csv";
	// const data = getContext("data");

	import Scroller from "@sveltejs/svelte-scroller";

	import { activeController, activeTree, crossfades } from "$stores/misc.js";
	import viewport from "../stores/viewport";
	import Section from "./Section.svelte";

	function flattenToNested(jsonArray) {
		return jsonArray.map((flatObject) => {
			const nestedObject = {};

			Object.keys(flatObject).forEach((key) => {
				const value = flatObject[key];
				if (value === "") return; // Skip empty string values

				if (key.includes(".")) {
					const keyParts = key.split(".");
					let current = nestedObject;
					keyParts.forEach((part, index) => {
						if (index === keyParts.length - 1) {
							current[part] = value; // Set the value at the last key part
						} else {
							current[part] = current[part] || {}; // Ensure intermediate levels exist
							current = current[part];
						}
					});
				} else {
					nestedObject[key] = value; // Direct assignment for non-nested keys
				}
			});

			return nestedObject;
		});
	}

	const nestedSlides = flattenToNested(flatSlides);
	const groupedSlides = groupBy(nestedSlides, "section");

	let isReady = false;
	let render;

	onMount(async () => {
		render = await Promise.all(
			nestedSlides.map((slide, i) => generateFlow(slide))
		);

		isReady = true;
	});

	let index, offset, progress;



	// $: $crossfades = nestedSlides
	// 	.filter((d) => d?.controller?.component?.type == "crossfade")
	// 	.reduce((acc, item) => {
	// 		const { id } = item.controller?.component;
	// 		const [source, target] = id.split("_");

	// 		acc[id] = {
	// 			source,
	// 			target
	// 		};

	// 		return acc;
	// 	}, {});

	// $: if ($activeController?.component?.type == "crossfade") {
	// 	$crossfades[$activeController?.component?.id].progress =
	// 		$activeController.focusNode ==
	// 		$crossfades[$activeController.component?.id].source
	// 			? offset / 2
	// 			: offset / 2 + 0.5;
	// }
</script>

{#each Object.entries(groupedSlides) as [key, content], i}
	<Section {key} {content} />
{/each}

<!-- {#await render then renderContent}
	<Scroller
		top={0}
		bottom={1}
		threshold={0.5}
		bind:index
		bind:offset
		bind:progress
	>
		<div slot="background">
			{#if activeSlideContent}
				{#if $activeTree}
					<SvelteFlowProvider>
						<Flow {index} />
					</SvelteFlowProvider>
				{/if}
			{/if}
		</div>

		<div class="foreground" slot="foreground">
			{#each nestedSlides as slide}
				<section class="slide" class:spacer={!slide.text}>
					{#if slide.text}
						<p>{slide.text}</p>
					{/if}
				</section>
			{/each}
		</div>
	</Scroller>
{/await} -->

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
	.content {
		margin: 0 auto;
		max-width: 700px;
		padding: 1rem;
	}
	section {
		height: 100vh;
		display: flex;
		justify-content: center;
		align-items: center;
		// border: 1px solid red;
		pointer-events: none;

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

	:global {
		// .foreground,
		// .svelte-xdbafy {
		// 	pointer-events: none;
		// }
	}
</style>
