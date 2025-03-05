<script>
	import { base } from "$app/paths";
	export let text;
</script>

<div class="cover">
	

	<div class="shelf" style="background-image:url({base}/assets/images/shelf-3.png);"></div>
	<div
		class="cover-img cover-img-active"
		data-shadow-color="16,26,64"
		style="transform: perspective(730px) rotateX(4deg) rotateY(0deg); box-shadow: rgba(16, 26, 64, 0) 0px 0px 1px, rgba(16, 26, 64, 0.1) 0px 4px 3px, rgba(16, 26, 64, 0.1) -2px 12px 6px, rgba(16, 26, 64, 0.1) -3px 23px 10px, rgba(16, 26, 64, 0.1) -6px 39px 15px, rgba(16, 26, 64, 0.1) -10px 60px 21px;"
	>
	
		<div class="plastic" style="background-image:url({base}/assets/images/plastic-small.jpg);"></div>
		<div src="" class="img-fake" style=""></div>
		{@html text}
	</div>
</div>

<style lang="scss">
	.cover {
		width: 300px;
		margin: 0 auto;
		-ms-flex-item-align: end;
		align-self: flex-end;
		margin-bottom: 200px;
		margin-top: 200px;
		height: 300px;
		position: relative;
	}
	.cover-img {
		-webkit-transform: perspective(1090px) rotateX(10deg);
		transform: perspective(1090px) rotateX(10deg);
		z-index: -1;
		width: 100%;
		height: 100%;
	}
	.plastic {
		position: absolute;
		top: 0;
		left: 0;
		content: "";
		width: calc(100% + 2px);
		height: calc(100% - 1px);
		// background: url(images/plastic-small.jpg);
		background-size: contain;
		mix-blend-mode: screen;
		opacity: 1;
		z-index: 100000;
		mix-blend-mode: difference;
		opacity: 0.3;
		transform: translate(-1px, 2px);
	}
	.shelf {
		// background: url(images/shelf-3.png);
		width: 155px;
		height: 10px;
		background-size: contain;
		background-repeat: no-repeat;
		height: 17px;
		position: absolute;
		bottom: 0;
		-webkit-transform: translate(-8px, 11px);
		-ms-transform: translate(-8px, 11px);
		transform: translate(-8px, 11px);
		z-index: 100;
		-webkit-transform: translate(
			calc((100% + 15px) * -0.0516129032),
			calc(65%)
		);
		-ms-transform: translate(calc((100% + 15px) * -0.0516129032), calc(65%));
		transform: translate(calc((100% + 15px) * -0.0516129032), calc(65%));
		height: calc((100% + 15px) * 0.109677419);
		width: calc(100% + 34px);
	}

	.img-fake {
		position: absolute;
		z-index: -1;
		top: 0;
		left: 0;
		width: calc(100% + 2px);
		-webkit-transform: translate(-1px, 0) scaleY(0.99);
		-ms-transform: translate(-1px, 0) scaleY(0.99);
		transform: translate(-1px, 0) scaleY(0.99);
		-webkit-filter: brightness(0.94) blur(0.2px) saturate(0.9);
		filter: brightness(0.94) blur(0.2px) saturate(0.9);
		height: 100%;
		background: linear-gradient(3deg, #fbfbfb, #fffaf0);
	}

	.shelf:after {
		content: "";
		width: 100%;
		height: 100%;
		background-repeat: no-repeat;
		position: absolute;
		bottom: 9px;
		left: 0;
		-webkit-transform: translate(0, 100%) scaleY(-0.5) scaleX(0.85);
		-ms-transform: translate(0, 100%) scaleY(-0.5) scaleX(0.85);
		transform: translate(0, 100%) scaleY(-0.5) scaleX(0.85);
		background: rgba(0, 0, 0, 0.5);
		-webkit-filter: blur(6px);
		filter: blur(6px);
	}

	:global {
		.cover h1 {
			margin: 0;
			padding-top: 10px;
			font-size: 24px;
			letter-spacing: -0.7px;
			text-transform: uppercase;
			line-height: 1.1;
			position: absolute;
			text-align: center;
			left: 0;
			width: 100%;
			background-image: linear-gradient(45deg, #000000, #5b5b5b, #000000);
			color: transparent;
			background-clip: text;
			bottom: 20px;
			max-width: calc(100% - 30px);
			right: 0;
			margin: 0 auto;
		}
	}
</style>
