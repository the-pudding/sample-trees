<script>
	export let labelX;
	export let sourceY;
	export let targetY;
	export let progressY;
</script>

<div
	class="bar"
	style:transform="translate(-50%, 0%) translate({labelX}px, {sourceY + 30}px)"
	style:height="{targetY - sourceY - 30 + 4}px"
></div>

<div
	class="crossfader"
	style:transform="translate(-50%, -50%) translate({labelX}px,{progressY}px)"
>
	<div class="crossfader__playhead" data-sample=""></div>
</div>

<style lang="scss">
	.bar {
		width: 4px;
		background: #cbb600;
		background: linear-gradient(0deg, #517d45 0%, #cbb600 100%);
		position: absolute;
	}
	.crossfader {
		position: absolute;
		font-size: 12pt;
		pointer-events: all;

		&__playhead {
			width: 30px;
			height: 10px;
			background: linear-gradient(
				to bottom,
				#5d5d5d 45%,
				#ffffff 45%,
				#ffffff 60%,
				#5d5d5d 60%
			);
			border-radius: 2px;
			filter: drop-shadow(0px 0px 4px #ddd);
		}
	}
</style>
