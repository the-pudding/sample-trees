<script>
	import { onMount, tick } from "svelte";
	import { setContext } from "svelte";
	import { SvelteFlowProvider } from "@xyflow/svelte";
	import { activeSectionId, globalChangeWatcher } from "$stores/misc.js";
	import { base } from "$app/paths";
	import Footer from "./Footer.svelte";

	import links from "$data/links.csv";
	import "@xyflow/svelte/dist/style.css";
	import { fade } from "svelte/transition";
	import generateFlow from "$utils/flow/generateFlow";
	import groupBy from "$utils/groupBy";
	import flatSlides from "$data/slides.csv";
	import Title from "./Title.svelte";
	import AudioToggle from "./AudioToggle.svelte";
	import viewport from "$stores/viewport";
	import { pauseAllAudio } from "$utils/audio.js";

	import Section from "./Section.svelte";

	let isReady = false;
	let hasStarted = false;
	let viewportHeight = 0;
	let mounted = false;

	let imageUrls;

	// Preload images in batches
	async function preloadImages() {
		const prerenderLinks = flatSlides
			.map((slide) => slide["controller.links"].split(","))
			.flat();

		const prerenderNodes = links
			.filter((link) => prerenderLinks.includes(link.id))
			.map((edge) => [edge.start_node_id, edge.end_node_id])
			.flat();

		// Create array of image URLs for preloading
		imageUrls = prerenderNodes.map(
			(node) => `${base}/assets/cover_art_jpegs/${node}.jpeg`
		);

		const BATCH_SIZE = 100;
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

	async function handleStart() {
		hasStarted = true;

		await tick();
		const el = document.getElementById("scroll-to-start");
		el.scrollIntoView({ behavior: "smooth", block: "center" });

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
			$globalChangeWatcher = ++$globalChangeWatcher;
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
		mounted = true;
		viewportHeight = $viewport.height;
		// Run both tasks in parallel
		await preloadImages();
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

	let previousGlobalChangeWatcher = $globalChangeWatcher;
	
	$: if (previousGlobalChangeWatcher !== $globalChangeWatcher) {
		pauseAllAudio();
		previousGlobalChangeWatcher = $globalChangeWatcher;
	}

</script>

<svelte:head>
	<link
		rel="preload"
		href="{base}/assets/sprites/spritesheet.jpeg"
		as="image"
	/>
	{#if imageUrls?.length}
		{#each imageUrls as url}
			<link rel="preload" href={url} as="image" />
		{/each}
	{/if}
</svelte:head>

<!-- {#if !hasStarted} -->
	<Title {isReady} onStart={handleStart} />
<!-- {/if} -->

{#if mounted}
	<div transition:fade style="display: {hasStarted ? 'block' : 'none'};" class:disable-scroll={!hasStarted}>
		<AudioToggle />
		{#each Object.entries(groupedSlides) as [key, content], i}
			<!-- {#if i == 0} -->
				<Section {key} {content} sectionIndex={i} {viewportHeight} />
			<!-- {/if} -->
		{/each}
	</div>
{/if}


{#if hasStarted}
	<Footer />
{/if}

<div class="noise-overlay" style="background: url('assets/noise-light.png');">
</div>

<style lang="scss">
	.disable-scroll {
		overflow: hidden;
		height: 100dvh;
		width: 100dvw;
		position: fixed;
		pointer-events: none;
	}

	.noise-overlay {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		opacity: 1;
		pointer-events: none;
		z-index: 10000;
	}
</style>
