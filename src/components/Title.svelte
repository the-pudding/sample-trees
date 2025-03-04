<script>
	import { fade } from "svelte/transition";
	import { isMuted } from "$stores/misc.js";
	import Header from "./Header.svelte";
	import { base } from "$app/paths";
	export let isReady = false;
	export let onStart;

	function handleStart(muted) {
		$isMuted = muted;
		onStart();
	}
</script>

<div class="title-screen section" data-id="title" transition:fade>
	<div class="header" style="position: absolute; top: 0; left: 0; right:0;margin: 0 auto; width: 170px;">
		<Header />
	</div>
	
	<div class="content">
		<img class="title-tree" src="{base}/assets/tree.jpg" alt="">
		<div class="text-content">
			<h1>This is a project about shared DNA in music.</h1>
			{#if isReady}
				<div class="buttons">
					<button class="primary noise-overlay" on:click={() => handleStart(false)}>
						Begin (with music!)
					</button>
					<button class="secondary noise-overlay" on:click={() => handleStart(true)}>
						Stay Muted
					</button>
				</div>
			{:else}
				<div class="loading">
					<div class="loader"></div>
					Loading...
				</div>
			{/if}
		</div>
	</div>
</div>

<style lang="scss">
	.title-screen {
		width: 100%;
		height: 100vh;
		background: var(--color-bg);
		display: flex;
		flex-direction: column;
		z-index: 9999;
	}

	.content {
		flex: 1;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		padding: 2rem;
		min-height: 0; // Important for Firefox
	}

	.title-tree {
		max-width: 400px;
		width: 100%;
		height: auto;
		object-fit: contain;
		flex: 1;
		min-height: 0; // Important for Firefox
	}

	.text-content {
		text-align: center;
	}

	h1 {
		font-family: var(--sans);
		font-size: 28px;
		letter-spacing: initial;
		font-weight: 400;
		margin-top: 0rem;
		margin-bottom: 1.5rem;

	}

	.loading {
		padding: 0.75rem 1.5rem;
		border-radius: 4px;
		font-family: var(--sans);
		display: flex;
		justify-content: center;
		align-items: center;
		min-width: 200px;
        flex-direction: column;

		.loader {
			position: relative;
			width: 55px;
			height: 55px;
			background-repeat: no-repeat;
			background-image: linear-gradient(#000 50px, transparent 0),
				linear-gradient(#000 50px, transparent 0),
				linear-gradient(#000 50px, transparent 0),
				linear-gradient(#000 50px, transparent 0),
				linear-gradient(#000 50px, transparent 0),
				linear-gradient(#000 50px, transparent 0);
			background-size: 5px 40px;
			background-position:
				0px center,
				10px center,
				20px center,
				30px center,
				40px center,
				50px center;
			animation: spikeUp 1s linear infinite alternate;
		}
		@keyframes spikeUp {
			0% {
				background-size: 5px 40px;
			}
			16% {
				background-size:
					5px 55px,
					5px 40px,
					5px 40px,
					5px 40px,
					5px 40px,
					5px 40px;
			}
			33% {
				background-size:
					5px 40px,
					5px 55px,
					5px 40px,
					5px 40px,
					5px 40px,
					5px 40px;
			}
			50% {
				background-size:
					5px 40px,
					5px 40px,
					5px 55px,
					5px 40px,
					5px 40px,
					5px 40px;
			}
			66% {
				background-size:
					5px 40px,
					5px 40px,
					5px 40px,
					5px 55px,
					5px 40px,
					5px 40px;
			}
			83% {
				background-size:
					5px 40px,
					5px 40px,
					5px 40px,
					5px 40px,
					5px 55px,
					5px 40px;
			}
			100% {
				background-size:
					5px 40px,
					5px 40px,
					5px 40px,
					5px 40px,
					5px 40px,
					5px 55px;
			}
		}
	}

	.buttons {
		display: flex;
		flex-direction: column;
		gap: 10px;
		align-items: center;

	}

	button {
		padding: 0.5rem 2.5rem;
		border-radius: 5px;
		font-family: var(--sans);
		font-size: 1rem;
		cursor: pointer;
		transition: all 0.2s ease;
		min-width: 200px;
		font-weight: 600;
		-webkit-font-smoothing: antialiased;
		z-index: 100;

		&.primary {
			background: var(--color-pink);
			// border: 1.5px solid var(--color-pink-stroke);
			color: #fff;
			font-size: 20px;

			&:hover {
				background: var(--color-pink-stroke);
			}
		}

		&.secondary {
			background: var(--color-dark);
			// border: 1.5px solid var(--color-dark-stroke);
			color: #fff;
			font-size: 16px;

			&:hover {
				background: #000;
			}
		}
	}
</style>
