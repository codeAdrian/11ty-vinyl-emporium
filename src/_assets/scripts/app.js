async function getPageContent(url) {
	// This is a really scrappy way to do this.
	// Don't do this in production!
	const response = await fetch(url);
	const text = await response.text();
	// Particularly as it uses regexp
	return /<body[^>]*>([\w\W]*)<\/body>/.exec(text)[1];
}

// Intercept navigations
// https://developer.chrome.com/docs/web-platform/navigation-api/
// This is a naive usage of the navigation API, to keep things simple.
async function onLinkNavigate(callback) {
	if (!document.createDocumentTransition) return;

	navigation.addEventListener("navigate", (event) => {
		const toUrl = new URL(event.destination.url);

		if (location.origin !== toUrl.origin) return;

		applyTag(toUrl);

		const handler = function () {
			return callback({
				toPath: toUrl.pathname,
			});
		};

		if (event.intercept) {
			event.intercept({
				handler,
			});
		} else {
			event.transitionWhile(handler());
		}
	});
}

function applyTag(url) {
	const image = document.querySelector(
		`a[href="${url.pathname}"] .card__image`
	);

	if (!image) {
		return;
	}

	image.style.pageTransitionTag = "product-image";
}

onLinkNavigate(async ({ toPath }) => {
	const content = await getPageContent(toPath);
	const transition = document.createDocumentTransition();
	transition.start(() => {
		window.scrollTo({ left: 0, top: 0 });
		document.body.innerHTML = content;
	});
});
