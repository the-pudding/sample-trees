<script>
	import { getContext } from "svelte";
	import Demo from "$components/demo/Demo.svelte";

	import { SvelteFlowProvider } from "@xyflow/svelte";
	import Flow from "$components/Flow/Flow.svelte";
	import "@xyflow/svelte/dist/style.css";
	// import Footer from "$components/Footer.svelte";

	const copy = getContext("copy");
	// const data = getContext("data");

	import Scroller from "@sveltejs/svelte-scroller";

	import { activeController, crossfaders } from "$stores/misc.js";
	import viewport from "../stores/viewport";

	let index, offset, progress, innerProgress;

	$: innerProgress = getInnerStepProgress({
		totalSteps: copy.slides.length,
		stepHeight: $viewport.height,
		scrollProgress: progress,
		currentIndex: index
	});

	$: activeSlideContent = copy.slides[index];

	$: $activeController = { ...activeSlideContent?.controller, index, progress };

	$: $crossfaders = copy.crossfaders;

	$: if ($activeController.component?.type == "crossfade") {
		$crossfaders[$activeController.component?.id].progress =
			$activeController.focusNode ==
			$crossfaders[$activeController.component?.id].source
				? innerProgress / 2
				: innerProgress + 0.5;
	}

	function getInnerStepProgress({
		totalSteps,
		stepHeight,
		scrollProgress,
		currentIndex
	}) {
		console.log();

		// Calculate the total scrollable height
		const totalHeight = totalSteps * stepHeight;

		// Calculate the start and end positions of the current step
		const start = currentIndex * stepHeight;
		const end = start + stepHeight;

		// Calculate the relative scroll position within the current step
		const relativeScroll = scrollProgress * totalHeight - start;

		// Return the progress within the current step, clamped between 0 and 1
		return Math.max(0, Math.min(1, relativeScroll / stepHeight));
	}

	let startExperience = false;
</script>

<div class="content">
	<p>
		Lorem ipsum dolor sit amet, consectetur adipisicing elit. Eligendi non quis
		exercitationem culpa nesciunt nihil aut nostrum explicabo reprehenderit
		optio amet ab temporibus asperiores quasi cupiditate. Voluptatum ducimus
		voluptates voluptas?
	</p>

	<p>
		Lorem ipsum dolor sit amet, consectetur adipisicing elit. Eligendi non quis
		exercitationem culpa nesciunt nihil aut nostrum explicabo reprehenderit
		optio amet ab temporibus asperiores quasi cupiditate. Voluptatum ducimus
		voluptates voluptas?
	</p>

	<p>
		Lorem ipsum dolor sit amet, consectetur adipisicing elit. Eligendi non quis
		exercitationem culpa nesciunt nihil aut nostrum explicabo reprehenderit
		optio amet ab temporibus asperiores quasi cupiditate. Voluptatum ducimus
		voluptates voluptas?
	</p>

	<p>
		Lorem ipsum dolor sit amet, consectetur adipisicing elit. Eligendi non quis
		exercitationem culpa nesciunt nihil aut nostrum explicabo reprehenderit
		optio amet ab temporibus asperiores quasi cupiditate. Voluptatum ducimus
		voluptates voluptas?
	</p>

	<button on:click={() => (startExperience = true)}>Click to start</button>
</div>

{#if startExperience}
	<Scroller
		top={0}
		bottom={1}
		threshold={0.5}
		bind:index
		bind:offset
		bind:progress
	>
		<div slot="background">
			{#if activeSlideContent}
				<SvelteFlowProvider>
					<Flow />
				</SvelteFlowProvider>
			{/if}
		</div>

		<div class="foreground" slot="foreground">
			{#each copy.slides as slide}
				<section class="slide">
					<p>{slide.text}</p>
				</section>
			{/each}
		</div>
	</Scroller>
{/if}

<style lang="scss">
	.content {
		margin: 0 auto;
		max-width: 700px;
		padding: 1rem;
	}
	section {
		height: 100vh;
		display: flex;
		justify-content: center;
		align-items: center;
		border-bottom: 1px solid red;
		p {
			background: white;
			width: 100%;
			max-width: 400px;
			box-shadow: 5px 5px 15px #00000050;
			padding: 1rem;
		}
	}

	:global {
		// .foreground,
		// .svelte-xdbafy {
		// 	pointer-events: none;
		// }
	}
</style>
