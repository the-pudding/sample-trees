<script>
	import { getContext } from "svelte";

	import { SvelteFlowProvider } from "@xyflow/svelte";
	import Flow from "$components/Flow/Flow.svelte";
	import "@xyflow/svelte/dist/style.css";
	// import Footer from "$components/Footer.svelte";

	const copy = getContext("copy");
	// const data = getContext("data");

	import Scroller from "@sveltejs/svelte-scroller";

	import { activeController, crossfades } from "$stores/misc.js";
	import viewport from "../stores/viewport";

	let index, offset, progress;

	$: activeSlideContent = copy.slides[index];

	$: $activeController = { ...activeSlideContent?.controller, index, progress };

	$: $crossfades = copy.slides
		.filter((d) => d?.controller.component?.type == "crossfade")
		.reduce((acc, item) => {
			const { id } = item.controller.component;
			const [source, target] = id.split("_");

			acc[id] = {
				source,
				target
			};

			return acc;
		}, {});

	$: if ($activeController?.component?.type == "crossfade") {
		$crossfades[$activeController.component?.id].progress =
			$activeController.focusNode ==
			$crossfades[$activeController.component?.id].source
				? offset / 2
				: offset / 2 + 0.5;
	}

	let startExperience = true;

	let debugging = false;
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

<div class="debug-box">Index: {index}</div>

{#if startExperience}
	{#if debugging}

			<div style="width:100%; height: 100vh">
				<SvelteFlowProvider>
					<Flow initController={copy.slides[0].controller} />
				</SvelteFlowProvider>
			</div>

	{:else}
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
						<Flow initController={copy.slides[0].controller} />
					</SvelteFlowProvider>
				{/if}
			</div>

			<div class="foreground" slot="foreground">
				{#each copy.slides as slide}
					<section class="slide" class:spacer={!slide.text}>
						{#if slide.text}
							<p>{slide.text}</p>
						{/if}
					</section>
				{/each}
			</div>
		</Scroller>
	{/if}
{/if}

<style lang="scss">
	.debug-box {
		position: fixed;
		top: 0;
		left: 0;
		padding: 5px;
		background: #00000050;
		color: white;
		display: flex;
		justify-content: center;
		align-items: center;
		z-index: 10000;
	}
	.content {
		margin: 0 auto;
		max-width: 700px;
		padding: 1rem;
	}
	section {
		height: 100vh;
		display: flex;
		justify-content: center;
		align-items: start;
		border: 1px solid red;
		pointer-events: none;

		&.spacer {
			height: 25vh;
		}
		p {
			background: white;
			width: 100%;
			max-width: 400px;
			box-shadow: 5px 5px 15px #ddd;
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
