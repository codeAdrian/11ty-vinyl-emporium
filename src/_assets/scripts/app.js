async function getPageContent(url) {
	// This is a really scrappy way to do this.
	// Don't do this in production!
	const response = await fetch(url);
	const text = await response.text();
	// Particularly as it uses regexp
	return /<body[^>]*>([\w\W]*)<\/body>/.exec(text)[1];
}

function isBackNavigation(navigateEvent) {
	if (
		navigateEvent.navigationType === "push" ||
		navigateEvent.navigationType === "replace"
	) {
		return false;
	}
	if (
		navigateEvent.destination.index !== -1 &&
		navigateEvent.destination.index < navigation.currentEntry.index
	) {
		return true;
	}
	return false;
}

// Intercept navigations
// https://developer.chrome.com/docs/web-platform/navigation-api/
// This is a naive usage of the navigation API, to keep things simple.
async function onLinkNavigate(callback) {
	if (!document.createDocumentTransition) return;

	navigation.addEventListener("navigate", (event) => {
		const toUrl = new URL(event.destination.url);

		if (location.origin !== toUrl.origin) return;

		const fromPath = location.pathname;

		event.transitionWhile(
			callback({
				toPath: toUrl.pathname,
				fromPath,
				isBack: isBackNavigation(event),
			})
		);
	});
}

onLinkNavigate(async ({ toPath }) => {
	const content = await getPageContent(toPath);
	const transition = document.createDocumentTransition();

	transition.start(() => {
		window.scrollTo({ left: 0, top: 0 });
		document.body.innerHTML = content;
	});
});

window.applyClass = function () {
	const figure = this.window.event.target.closest("figure");
	const image = figure.querySelector(".card__image");
	image.style.pageTransitionTag = "product-image";

	console.log(image);
};

// C:\Users\Adrian\AppData\Local\Google\Update
