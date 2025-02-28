<script>
	export let slides;
	export let slide;
	export let viewportHeight;
	export let i;
	export let sectionIndex;
</script>

<section
	class="slide"
	style="
						height:{!slide.text ? viewportHeight * 0.25 : viewportHeight}px;
						padding-top:{i == 0 ? '' : ''}px;
						padding-bottom:{i == slides.length - 1 ? viewportHeight / 2 : ''}px;
					"
	class:spacer={!slide.text}
>
	{#if slide.text}
		<div
			class="slide-text"
			id={sectionIndex == 0 && i == 0 ? "scroll-to-start" : ""}
		>
			{slide.text}
		</div>
	{/if}
</section>

<style lang="scss">
	.slide {
		display: flex;
		justify-content: flex-start;
		align-items: flex-start;

		pointer-events: none;
		position: relative;

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

			&::after {
				content: "";
				position: absolute;
				top: 0;
				left: 0;
				width: 100%;
				height: 100%;
				background-image: url("assets/noise-light.png");
				opacity: 0.1;
			}
		}
	}
</style>
