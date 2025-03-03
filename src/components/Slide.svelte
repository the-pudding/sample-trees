<script>
	import { marked } from "marked";
	import InlineAudio from "./Flow/InlineAudio.svelte";

	export let slides;
	export let slide;
	export let viewportHeight;
	export let i;
	export let sectionIndex;

	function transformHtml(html) {
		// Create a temporary div to parse the HTML
		const div = document.createElement("div");
		div.innerHTML = html;

		// Find all spans with data-id
		const audioSpans = div.querySelectorAll("span[data-inline-audio-id]");

		audioSpans.forEach((span) => {
			const id = span.getAttribute("data-inline-audio-id");
			const text = span.textContent;
			// Replace the span with our custom component marker
			span.outerHTML = `<inline-audio data-inline-audio-id="${id}" data-text="${text}"></inline-audio>`;
		});

		return div.innerHTML;
	}

	// Process the markdown and then transform audio spans
	$: processedHtml = slide.text ? transformHtml(marked(slide.text)) : "";
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
		>
			{#each processedHtml.split(/<inline-audio[^>]*>/) as text, index (index)}
				{@html text}
				{#if index < processedHtml.match(/<inline-audio[^>]*>/g)?.length}
					{@const match = processedHtml.match(/<inline-audio[^>]*>/g)[index]}
					{@const id = match.match(/data-inline-audio-id="([^"]*)/)[1]}
					{@const songText = match.match(/data-text="([^"]*)/)[1]}
					<InlineAudio {id} text={songText} />
				{/if}
			{/each}
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
		.slide-text p:first-of-type {
			margin-top: 0;
			margin-bottom: 0;
		}

		.h1-wrapper {
			position: relative;
			margin: 2rem 0;

			h1 {
				margin: 0;
				font-size: 1.5rem;
				line-height: 1.3;
			}

			.h1-decorator {
				position: absolute;
				left: -1rem;
				top: 50%;
				transform: translateY(-50%);
				width: 4px;
				height: 100%;
				background: var(--color-pink);
				border-radius: 2px;
			}
		}

		.highlight {
			background: var(--color-pink);
			padding: 2px 3px;
			color: black;
			font-weight: 600;
			border-radius: 3px;
			margin-right: 3px;
		}
	}
</style>
