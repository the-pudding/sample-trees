export function adjustHexBrightness(hex, percent) {
	// Ensure hex is in the proper format
	hex = hex.replace(/^#/, "");

	// Convert hex to RGB
	let r = parseInt(hex.substring(0, 2), 16);
	let g = parseInt(hex.substring(2, 4), 16);
	let b = parseInt(hex.substring(4, 6), 16);

	// Adjust brightness
	r = Math.min(255, Math.max(0, r + (r * percent) / 100));
	g = Math.min(255, Math.max(0, g + (g * percent) / 100));
	b = Math.min(255, Math.max(0, b + (b * percent) / 100));

	// Convert back to hex
	let newHex =
		"#" +
		Math.round(r).toString(16).padStart(2, "0") +
		Math.round(g).toString(16).padStart(2, "0") +
		Math.round(b).toString(16).padStart(2, "0");

	return newHex;
}

export function blendHexColors(c1, c2, opacity) {
	// Ensure hex is in the proper format
	c1 = c1.replace(/^#/, "");
	c2 = c2.replace(/^#/, "");

	// Parse RGB values from hex
	let r1 = parseInt(c1.substring(0, 2), 16);
	let g1 = parseInt(c1.substring(2, 4), 16);
	let b1 = parseInt(c1.substring(4, 6), 16);

	let r2 = parseInt(c2.substring(0, 2), 16);
	let g2 = parseInt(c2.substring(2, 4), 16);
	let b2 = parseInt(c2.substring(4, 6), 16);

	// Apply alpha blending formula
	let r = Math.round(r1 * opacity + r2 * (1 - opacity));
	let g = Math.round(g1 * opacity + g2 * (1 - opacity));
	let b = Math.round(b1 * opacity + b2 * (1 - opacity));

	// Convert back to hex
	let blendedHex = `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;

	return blendedHex;
}
