<script>
	import { setContext } from "svelte";
	import { onMount } from "svelte";
	import { SvelteFlowProvider } from "@xyflow/svelte";
	import { activeSectionId } from "$stores/misc.js";

	import "@xyflow/svelte/dist/style.css";

	import generateFlow from "$utils/flow/generateFlow";
	import groupBy from "$utils/groupBy";
	import flatSlides from "$data/slides.csv";

	import Section from "./Section.svelte";

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

	let isReady = false;
	let render;

	onMount(async () => {
		render = await Promise.all(
			nestedSlides.map((slide, i) => generateFlow(slide))
		);

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

{#each Object.entries(groupedSlides) as [key, content], i}
	<Section {key} {content} sectionIndex={i} />
{/each}
