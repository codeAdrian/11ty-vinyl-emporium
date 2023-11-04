const Image = require("@11ty/eleventy-img");
const htmlmin = require("html-minifier");

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
	eleventyConfig.addTransform("htmlmin", function (content) {
		// Prior to Eleventy 2.0: use this.outputPath instead
		if (this.page.outputPath && this.page.outputPath.endsWith(".html")) {
			let minified = htmlmin.minify(content, {
				useShortDoctype: true,
				removeComments: true,
				collapseWhitespace: true,
			});
			return minified;
		}

		return content;
	});

	// Folders to copy to build dir (See. 1.1)
	eleventyConfig.addPassthroughCopy("src/static");

	// Collections
	eleventyConfig.addCollection("items", function (collection) {
		const coll = collection.getFilteredByTag("items").sort((a, b) => {
			return (a.data.order || Infinity) - (b.data.order || Infinity);
		});

		for (let i = 0; i < coll.length; i++) {
			let prevPost = coll[i - 1];
			let nextPost = coll[i + 1];
			if (i === 0) {
				prevPost = coll[coll.length - 1];
			}

			if (i === coll.length - 1) {
				nextPost = coll[0];
			}

			coll[i].data["prevPost"] = prevPost;
			coll[i].data["nextPost"] = nextPost;
		}

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
