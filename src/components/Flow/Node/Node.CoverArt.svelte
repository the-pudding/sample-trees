<script>
	import { base } from "$app/paths";
	export let data;

	let imageExists = false;

	// Check if the image exists before rendering it
	async function checkImage() {
		try {
			const response = await fetch(`${base}/assets/cover_art/${data.id}.png`);
			imageExists = response.ok; // Sets to true if status is 200-299, false otherwise
		} catch (error) {
			imageExists = false; // If there's a network error, also show the placeholder
		}
	}

	// Run the check when the component is created
	// checkImage();
</script>

<div class="cover-art">
	<!-- {#if imageExists}
		<img src="{base}/assets/cover_art/{data.id}.png" alt={data.title} />
	{:else} -->
	
		<img src="{base}/assets/cover_art/missing.png" alt={data.title} />
	<!-- {/if} -->
	<!-- <div class="placeholder"></div> -->
	{#if data.eventText}
		<div class="secondary {data.eventTextPosition}">{@html data.eventText}</div>
	{/if}
</div>

<style lang="scss">
	.cover-art {
		width: 100%;
		height: auto;
		aspect-ratio: 1/1;
		position: relative;
	}

	.placeholder {
		width: 100%;
		height: 100%;
		aspect-ratio: 1/1;
		background-color: gray;
	}

	.secondary {
		font-family: var(--sans);
		font-weight: bold;
		position: absolute;

		&.right {
			right: -10px;
			text-align: left;
			width: 0px;
			white-space: nowrap;
			top: 50%;
			transform: translateY(-50%);
		}

		&.bottom, &.top {
			text-align: center;
			margin: 0 auto;
			left: 0;
			right: 0;
		}

		&.top {
			top: -40px;
		}
	}
</style>
