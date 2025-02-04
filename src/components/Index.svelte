<script>
	import { getContext } from "svelte";
	import { onMount } from "svelte";
	import { SvelteFlowProvider } from "@xyflow/svelte";

	import "@xyflow/svelte/dist/style.css";


	import generateFlow from "$utils/flow/generateFlow";
	import groupBy from "$utils/groupBy";
	import flatSlides from "$data/slides.csv";

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

	
</script>

{#each Object.entries(groupedSlides) as [key, content], i}
	<Section {key} {content} />
{/each}