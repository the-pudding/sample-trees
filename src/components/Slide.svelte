<script>
	import { marked } from "marked";

	export let slides;
	export let slide;
	export let viewportHeight;
	export let i;
	export let sectionIndex;
	export let hydrateInlineAudio;
	// Process the markdown and then transform audio spans
	$: processedHtml = slide.text ? marked(slide.text) : "";

	function getPaddingTop(i) {
		return i == 0 ? viewportHeight * 0.25 : '';
	}

	function getPaddingBottom(i) {
		return i == slides.length - 1 ? viewportHeight / 2 : '';
	}

	function getHeight() {
		return !slide.text ? viewportHeight * 0.25 : viewportHeight;
	}

	let fullTrees = ["hit","king_2"];

</script>

<section
	class="slide {fullTrees.indexOf(slide.controller.links) > -1 ? 'full-tree-sizing' : ''}"
	style="
		height:{getHeight()}px;
		padding-top:{getPaddingTop(i)}px;
		padding-bottom:{getPaddingBottom(i)}px;
	"
	class:spacer={!slide.text}
>
	{#if slide.text}
		<div
			class="slide-text noise-overlay"
			id={sectionIndex == 0 && i == 0 ? "scroll-to-start" : ""}
			use:hydrateInlineAudio
		>
			{@html processedHtml}
		</div>
	{/if}
</section>

<style lang="scss">
	#scroll-to-start {
		margin-bottom: 100px;
	}
	.slide {
		display: flex;
		justify-content: flex-start;
		align-items: flex-start;

		pointer-events: none;
		position: relative;


		&::after {
			content: "";
			position: absolute;
			top: 50%;
			right: 1px;
			width: 10px;
			height: 10px;
			background: black;
			opacity: 0.25;
			border-radius: 50%;
		}

		.slide-text {
			width: fit-content;
			height: fit-content;
			max-width: 300px;
			padding: 1rem;
			transform: translateY(25vh);
			margin: 0;
			background: rgba(0, 0, 0, 0.95);
			color: white;
			border-radius: 3px;
			margin-inline-start: 1rem;
			min-width: 300px;
			pointer-events: all;
			z-index: 100;

			@media (max-width: 500px) {
				max-width: none;
				margin: 0 auto;
				width: calc(100vw - 60px);
			}
		}

		&.full-tree-sizing {
			.slide-text {
				transform: translateY(0);
			}
		}
	}

	:global {
		.slide-text {
			p:first-of-type {
				margin-top: 0;
				margin-bottom: 0;
			}

			p:last-of-type {
				margin-bottom: 0;
			}
			@media (max-width: 500px) {
				p {
					line-height: 130%;
				}
			}

			a,
			a:visited {
				color: white;
				text-decoration: 1.5px underline #fff;
			}

			.highlight {
				background: var(--color-pink);
				padding: 0px 3px;
				color: black;
				font-weight: 600;
				border-radius: 3px;
				margin-right: 3px;
				font-weight: 600;
				display: inline-block;
				font-size: 0.95em;
			}

			.melody,
			.lyrics,
			.beats {
				font-weight: 600;
			}

			.melody {
				background: var(--color-melody);
				color: white;
			}

			.lyrics {
				background-color: var(--color-lyrics);
			}

			.beats {
				background-color: var(--color-beats);
			}
		}
	}
</style>
