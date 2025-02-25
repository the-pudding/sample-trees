<script>
	import { fade } from "svelte/transition";
	import { isMuted } from "$stores/misc.js";
	import Header from "./Header.svelte";

	export let isReady = false;
	export let onStart;

	function handleStart(muted) {
		$isMuted = muted;
		onStart();
	}
</script>

<div class="title-screen" transition:fade>
	<Header />
	<h1>The Genealogy of Samples</h1>
	{#if isReady}
		<div class="buttons">
			<button class="primary" on:click={() => handleStart(false)}>
				Begin (with music!)
			</button>
			<button class="secondary" on:click={() => handleStart(true)}>
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

<style lang="scss">
	.title-screen {
		width: 100%;
		height: 100vh;
		background: #f0f0f0;
		display: flex;
		justify-content: space-around;
		align-items: center;
		flex-direction: column;
		z-index: 9999;
		text-align: center;
	}

	h1 {
		font-family: var(--sans);
		font-size: 2.5rem;
		margin-bottom: 2rem;
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
		gap: 1rem;
		align-items: center;
	}

	button {
		padding: 0.75rem 1.5rem;
		border-radius: 4px;
		font-family: var(--sans);
		font-size: 1rem;
		cursor: pointer;
		transition: all 0.2s ease;
		min-width: 200px;

		&.primary {
			background: #4169e1;
			color: white;
			border: none;

			&:hover {
				background: #3158d0;
			}
		}

		&.secondary {
			background: transparent;
			border: 1px solid #666;
			color: #666;

			&:hover {
				background: #eee;
			}
		}
	}
</style>
