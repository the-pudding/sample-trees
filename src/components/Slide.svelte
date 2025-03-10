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
</script>

<section
	class="slide"
	style="
		height:{!slide.text ? viewportHeight * 0.25 : viewportHeight}px;
		padding-top:{i == 0 ? viewportHeight * 0.25 : ''}px;
		padding-bottom:{i == slides.length - 1 ? viewportHeight / 2 : ''}px;
	"
	class:spacer={!slide.text}
>
	{#if slide.text}
		<div
			class="slide-text"
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

			&::after {
				content: "";
				position: absolute;
				top: 0;
				left: 0;
				width: 100%;
				height: 100%;
				background-image: url("assets/noise-light.png");
				opacity: 0.1;
				pointer-events: none;
			}
		}
	}

	:global {
		.slide-text {
			p:first-of-type {
				margin-top: 0;
				margin-bottom: 0;
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
