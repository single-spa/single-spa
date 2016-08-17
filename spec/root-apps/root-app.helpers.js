export function resetSingleSpa() {
	delete window.singleSpa;
	const singleSpaScriptTag = document.getElementById("single-spa-distributable");
	if (singleSpaScriptTag) {
		singleSpaScriptTag.parentNode.removeChild(singleSpaScriptTag);
	}
	return new Promise((resolve, reject) => {
		const scriptEl = document.createElement("script");
		scriptEl.setAttribute("id", "single-spa-distributable");
		scriptEl.setAttribute("src", "/base/lib/single-spa.js");
		scriptEl.onload = resolve;
		scriptEl.onerror = reject;
		document.head.appendChild(scriptEl);
	});
}
