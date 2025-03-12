<script>
	import { base } from "$app/paths";
	export let html;

	let parser = new DOMParser();
	let doc = parser.parseFromString(html, "text/html");
	let h1Element = doc.querySelector("h1");

	let text = h1Element?.textContent || "";
	let sectionId = h1Element?.getAttribute("data-section-header") || "";
</script>

<div class="section-header" tabindex="0" role="section-header">
	<img
		src="{base}/assets/headers/{sectionId}.png"
		alt="A stylized title for the {text} section."
	/>
</div>

<style lang="scss">
	.section-header {
		margin-bottom: 2rem;
		img {
			width: 100%;
			height: auto;
			max-width: calc(100% - 3rem);
			max-height: 100%;
			object-fit: contain;
			margin: 0 auto;
		}
	}
</style>
