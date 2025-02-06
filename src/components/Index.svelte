<script>
	import { setContext } from "svelte";
	import { onMount } from "svelte";
	import { SvelteFlowProvider } from "@xyflow/svelte";
	import { activeSectionId } from "$stores/misc.js";
	import { base } from "$app/paths";
	import nodes from "$data/nodes.csv";
	import "@xyflow/svelte/dist/style.css";
	import { fade } from "svelte/transition";
	import generateFlow from "$utils/flow/generateFlow";
	import groupBy from "$utils/groupBy";
	import flatSlides from "$data/slides.csv";

	import Section from "./Section.svelte";

	let isReady = false;
	let render;

	// Preload images in batches
	async function preloadImages() {
		const BATCH_SIZE = 100;
		const imageUrls = nodes.map(
			(node) => `${base}/assets/cover_art/${node.id}.png`
		);
		const totalImages = imageUrls.length;

		for (let i = 0; i < totalImages; i += BATCH_SIZE) {
			const batch = imageUrls.slice(i, i + BATCH_SIZE);
			await Promise.all(
				batch.map(
					(url) =>
						new Promise((resolve) => {
							const img = new Image();
							img.onload = img.onerror = resolve;
							img.src = url;
						})
				)
			);
		}
	}

	function checkSectionVisibility() {
		const windowHeight = window.innerHeight;
		let maxVisibleRatio = 0;
		let mostVisibleSection = null;

		document.querySelectorAll("section.section").forEach((section) => {
			const rect = section.getBoundingClientRect();
			const visibleHeight =
				Math.min(rect.bottom, windowHeight) - Math.max(rect.top, 0);
			const visibleRatio = visibleHeight / rect.height;

			if (visibleRatio > maxVisibleRatio) {
				maxVisibleRatio = visibleRatio;
				mostVisibleSection = section.dataset.id;
			}
		});

		if (mostVisibleSection && mostVisibleSection !== $activeSectionId) {
			$activeSectionId = mostVisibleSection;
		}
	}

	function flattenToNested(jsonArray) {
		return jsonArray.map((flatObject) => {
			const nestedObject = {};

			Object.keys(flatObject).forEach((key) => {
				const value = flatObject[key];
				if (value === "") return;

				if (key.includes(".")) {
					const keyParts = key.split(".");
					let current = nestedObject;
					keyParts.forEach((part, index) => {
						if (index === keyParts.length - 1) {
							current[part] = value;
						} else {
							current[part] = current[part] || {};
							current = current[part];
						}
					});
				} else {
					nestedObject[key] = value;
				}
			});

			return nestedObject;
		});
	}

	const nestedSlides = flattenToNested(flatSlides);
	const groupedSlides = groupBy(nestedSlides, "section");

	onMount(async () => {
		// Run both tasks in parallel
		await Promise.all([
			Promise.all(nestedSlides.map((slide, i) => generateFlow(slide))).then(
				(result) => {
					render = result;
				}
			),
			preloadImages()
		]);

		isReady = true;

		// Initial check
		checkSectionVisibility();

		// Add scroll listener
		window.addEventListener("scroll", checkSectionVisibility, {
			passive: true
		});

		return () => {
			window.removeEventListener("scroll", checkSectionVisibility);
		};
	});
</script>

{#if isReady}
	<div transition:fade>
		{#each Object.entries(groupedSlides) as [key, content], i}
			<Section {key} {content} sectionIndex={i} />
		{/each}
	</div>
{:else}
	<div class="loading-screen" transition:fade >
		<div class="loader"></div>
	</div>
{/if}

<style lang="scss">
	.loading-screen {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100vh;
		background: #F0F0F0;
		display: flex;
		justify-content: center;
		align-items: center;
		z-index: 9999;
	}

	.loader {
		position: relative;
		width: 55px;
		height: 55px;
		background-repeat: no-repeat;
		background-image: linear-gradient(#000 50px, transparent 0),
			linear-gradient(#000 50px, transparent 0),
			linear-gradient(#000 50px, transparent 0),
			linear-gradient(#000 50px, transparent 0),
			linear-gradient(#000 50px, transparent 0),
			linear-gradient(#000 50px, transparent 0);
		background-size: 5px 40px;
		background-position:
			0px center,
			10px center,
			20px center,
			30px center,
			40px center,
			50px center;
		animation: spikeUp 1s linear infinite alternate;
	}
	@keyframes spikeUp {
		0% {
			background-size: 5px 40px;
		}
		16% {
			background-size:
				5px 55px,
				5px 40px,
				5px 40px,
				5px 40px,
				5px 40px,
				5px 40px;
		}
		33% {
			background-size:
				5px 40px,
				5px 55px,
				5px 40px,
				5px 40px,
				5px 40px,
				5px 40px;
		}
		50% {
			background-size:
				5px 40px,
				5px 40px,
				5px 55px,
				5px 40px,
				5px 40px,
				5px 40px;
		}
		66% {
			background-size:
				5px 40px,
				5px 40px,
				5px 40px,
				5px 55px,
				5px 40px,
				5px 40px;
		}
		83% {
			background-size:
				5px 40px,
				5px 40px,
				5px 40px,
				5px 40px,
				5px 55px,
				5px 40px;
		}
		100% {
			background-size:
				5px 40px,
				5px 40px,
				5px 40px,
				5px 40px,
				5px 40px,
				5px 55px;
		}
	}

	.progress-bar {
		width: 200px;
		height: 4px;
		background: #eee;
		border-radius: 2px;
		overflow: hidden;
		margin: 0 auto;
	}

	.progress {
		height: 100%;
		background: #333;
		transition: width 0.3s ease;
	}

	.progress-text {
		margin-top: 0.5rem;
		font-size: 0.875rem;
		color: #666;
		font-family: var(--sans);
	}
</style>
