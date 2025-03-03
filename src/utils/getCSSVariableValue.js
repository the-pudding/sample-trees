export default function getCSSVariableValue(
	variableName,
	element = document.documentElement
) {
	return getComputedStyle(element).getPropertyValue(variableName).trim();
}
