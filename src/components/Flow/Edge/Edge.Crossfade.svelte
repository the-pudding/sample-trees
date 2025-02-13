<script>
	import { getContext } from "svelte";

	const dimensions = getContext("dimensions");

	export let labelX;
	export let sourceY;
	export let targetY;
	export let progressY;
</script>

<div
	class="bar"
	style:transform="translate(-50%, 0%) translate({labelX}px, {sourceY +
		$dimensions.waveformHeight -
		$dimensions.waveformGap}px)"
	style:height="{targetY -
		sourceY -
		$dimensions.waveformHeight * 2 +
		$dimensions.waveformGap * 2}px"
></div>

<div
	class="crossfader"
	style:transform="translate(-50%, -50%) translate({labelX}px,{progressY}px)"
>
	<div
		class="crossfader__playhead"
		style:--playhead-height="{$dimensions.playheadHeight}px"
		data-sample=""
	></div>
</div>

<style lang="scss">
	.bar {
		width: 4px;
		background: #cbb600;
		background: linear-gradient(0deg, #72896B 0%, #4D5F48 50%, #695E01 51%, #CBB600 100%);
		position: absolute;
	}

	.bar::before {
		content: "";
		position: absolute;
		top: 50%;
		left: 50%;
		width: 20px;
		height: .5px;
		background: #111;
		transform: translate(-50%, -50%);
	}


	.bar::after {
		content: "";
		position: absolute;
		top: 50%;
		left: 50%;
		width: 10px;
		height: 1.2px;
		transform: translate(-50%, -50%);
		background: #F0F0F0;
	}

	.crossfader {
		position: absolute;
		font-size: 12pt;
		pointer-events: all;

		&__playhead {
			width: 20px;
			height: var(--playhead-height);
			background: linear-gradient(
				to bottom,
				#5d5d5d 42%,
				#ffffff 42%,
				#ffffff 60%,
				#5d5d5d 60%
			);
			border-radius: 1px;
			box-shadow: -12px 14px 5px 0px rgba(0, 0, 0, 0.00), -8px 9px 5px 0px rgba(0, 0, 0, 0.01), -4px 5px 4px 0px rgba(0, 0, 0, 0.05), -2px 2px 3px 0px rgba(0, 0, 0, 0.09), 0px 1px 2px 0px rgba(0, 0, 0, 0.10);
		}
	}
</style>
