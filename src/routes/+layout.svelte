<script>
	import "$styles/app.css";
	import { base } from "$app/paths";
</script>

<main id="content" 	style:--noise-texture-url="url('{base}/assets/noise-light.png')">
	<slot />
</main>
