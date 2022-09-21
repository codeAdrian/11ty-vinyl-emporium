const Image = require("@11ty/eleventy-img");

function imageShortcode(src, alt = "", className = "") {
	const imgSrc = "./src/_assets/_images/" + src;

	const options = {
		widths: [600],
		formats: ["avif", "png"],
		urlPath: "/assets/images/",
		outputDir: "./dist/assets/images",
	};

	Image(imgSrc, options);

	let imageAttributes = {
		alt,
		loading: "eager",
		decoding: "sync",
		class: className,
	};

	let metadata = Image.statsSync(imgSrc, options);

	return Image.generateHTML(metadata, imageAttributes);
}

module.exports = function (eleventyConfig) {
	// Folders to copy to build dir (See. 1.1)
	eleventyConfig.addPassthroughCopy("src/static");

	// Collections
	eleventyConfig.addCollection("items", function (collection) {
		const coll = collection.getFilteredByTag("items");
		return coll;
	});

	// This allows Eleventy to watch for file changes during local development.
	eleventyConfig.setUseGitIgnore(false);

	// Layout
	eleventyConfig.addLayoutAlias("item", "./src/_layouts/item.njk");

	// Image plugin
	eleventyConfig.addNunjucksShortcode("image", imageShortcode);
	eleventyConfig.addLiquidShortcode("image", imageShortcode);
	eleventyConfig.addJavaScriptFunction("image", imageShortcode);

	return {
		dir: {
			input: "src/",
			output: "dist",
			includes: "_includes",
			layouts: "_layouts",
		},
		templateFormats: ["html", "md", "njk"],
		htmlTemplateEngine: "njk",

		// 1.1 Enable eleventy to pass dirs specified above
		passthroughFileCopy: true,
	};
};
