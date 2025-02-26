<script>
	import { base } from "$app/paths";
	export let data;

	let imageExists = false;

	// Check if the image exists before rendering it
	async function checkImage() {
		try {
			const response = await fetch(`${base}/assets/cover_art_jpegs/${data.id}.jpeg`);
			imageExists = response.ok;
		} catch (error) {
			imageExists = false;
		}
	}

	checkImage();
</script>

<div class="cover-art">
	{#if imageExists}
		<img src="{base}/assets/cover_art_jpegs/{data.id}.jpeg" alt={data.title} />
	{:else}
		<img src="{base}/assets/cover_art_jpegs/missing.jpeg" alt={data.title} />
	{/if}
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
		transform: translateZ(0);
		backface-visibility: hidden;
		box-shadow: 
			0 48px 26px rgba(0, 0, 0, 0.01),
			0 30px 24px rgba(0, 0, 0, 0.01), 
			0 17px 20px rgba(0, 0, 0, 0.05),
			0 8px 15px rgba(0, 0, 0, 0.05),
			0 -2px 8px rgba(0, 0, 0, 0.05);

		img {
			width: 100%;
			height: 100%;
			object-fit: contain;
			image-rendering: -webkit-optimize-contrast;
			transform: translateZ(0);
		}
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
		-webkit-font-smoothing: antialiased;
		-moz-osx-font-smoothing: grayscale;

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
