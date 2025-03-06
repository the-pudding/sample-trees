<script>
	import { base } from "$app/paths";
	export let html;

	let parser = new DOMParser();
	let doc = parser.parseFromString(html, "text/html");
	let h1Element = doc.querySelector("h1");

	let text = h1Element?.textContent || "";
	let sectionId = h1Element?.getAttribute("data-section-header") || "";
</script>

<div class="section-header">
	<img
		src="{base}/assets/headers/{sectionId}.png"
		alt="A stylized title for the {text} section."
		aria-hidden="true"
	/>
	<h1 class="sr-only">{@html text}</h1>
</div>

<style lang="scss">
	.section-header {
		margin-bottom: 2rem;
	}
</style>
