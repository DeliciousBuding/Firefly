import { readdir, readFile } from "node:fs/promises";
import { basename, join, relative, sep } from "node:path";

const outputDir = process.argv[2] || "dist";
const productionOrigin = new URL(
	process.env.PUBLIC_SITE_ORIGIN || "https://blog.vectorcontrol.tech",
).origin;
const forbiddenOrigins = [
	"https://blog-web.vectorcontrol.tech",
	"https://vectorcontrol-web.pages.dev",
];
const errors = [];

function fail(message) {
	errors.push(message);
}

function getAttribute(tag, name) {
	const match = tag.match(
		new RegExp(`\\b${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)')`, "i"),
	);
	return match?.[1] ?? match?.[2];
}

function assertProductionUrl(label, value, file, { allowQuery = true } = {}) {
	if (!value) {
		fail(`${file}: missing ${label} URL`);
		return;
	}
	try {
		const parsed = new URL(value);
		if (parsed.origin !== productionOrigin) {
			fail(`${file}: ${label} uses ${parsed.origin}, expected ${productionOrigin}`);
		}
		if (!allowQuery && (parsed.search || parsed.hash)) {
			fail(`${file}: ${label} must not contain a query or fragment`);
		}
	} catch {
		fail(`${file}: ${label} is not an absolute URL: ${value}`);
	}
}

async function walk(directory) {
	const entries = await readdir(directory, { withFileTypes: true });
	const files = [];
	for (const entry of entries) {
		const path = join(directory, entry.name);
		if (entry.isDirectory()) files.push(...(await walk(path)));
		else files.push(path);
	}
	return files;
}

function displayPath(path) {
	return relative(outputDir, path).split(sep).join("/");
}

const files = await walk(outputDir);
const htmlFiles = files.filter((file) => file.endsWith(".html"));
let htmlDocumentCount = 0;

for (const file of htmlFiles) {
	const html = await readFile(file, "utf8");
	const name = displayPath(file);
	if (!/<html(?:\s|>)/i.test(html)) continue;
	htmlDocumentCount += 1;

	const linkTags = html.match(/<link\b[^>]*>/gi) || [];
	const canonicalTags = linkTags.filter((tag) =>
		(getAttribute(tag, "rel") || "")
			.toLowerCase()
			.split(/\s+/)
			.includes("canonical"),
	);
	if (canonicalTags.length !== 1) {
		fail(`${name}: expected exactly one canonical link, found ${canonicalTags.length}`);
	} else {
		assertProductionUrl(
			"canonical",
			getAttribute(canonicalTags[0], "href"),
			name,
			{ allowQuery: false },
		);
	}

	const metaTags = html.match(/<meta\b[^>]*>/gi) || [];
	for (const property of ["og:url", "twitter:url"]) {
		const matches = metaTags.filter(
			(tag) => (getAttribute(tag, "property") || "").toLowerCase() === property,
		);
		if (matches.length !== 1) {
			fail(`${name}: expected exactly one ${property} meta tag, found ${matches.length}`);
			continue;
		}
		assertProductionUrl(property, getAttribute(matches[0], "content"), name);
	}
}

if (htmlDocumentCount === 0) fail("no complete HTML documents were found");

const requiredFiles = [
	"index.html",
	"rss.xml",
	"robots.txt",
	"sitemap-index.xml",
	"_headers",
];
for (const required of requiredFiles) {
	if (!files.some((file) => displayPath(file) === required)) {
		fail(`missing build artifact: ${required}`);
	}
}

const discoveryFiles = files.filter((file) => {
	const name = basename(file);
	return file.endsWith(".html") || file.endsWith(".xml") || name === "robots.txt";
});
for (const file of discoveryFiles) {
	const content = await readFile(file, "utf8");
	for (const forbiddenOrigin of forbiddenOrigins) {
		if (content.includes(forbiddenOrigin)) {
			fail(`${displayPath(file)}: forbidden staging origin leaked: ${forbiddenOrigin}`);
		}
	}
}

async function requireText(path, literal, label) {
	try {
		const content = await readFile(join(outputDir, path), "utf8");
		if (!content.includes(literal)) fail(`${path}: missing ${label}`);
	} catch {
		// Missing artifacts are reported by the requiredFiles check.
	}
}

await requireText("rss.xml", productionOrigin, "production RSS origin");
await requireText(
	"robots.txt",
	`Sitemap: ${productionOrigin}/sitemap-index.xml`,
	"production sitemap URL",
);
await requireText("sitemap-index.xml", productionOrigin, "production sitemap origin");

try {
	const headers = await readFile(join(outputDir, "_headers"), "utf8");
	const requiredHeaderLines = [
		"/*",
		"  X-Content-Type-Options: nosniff",
		"  Referrer-Policy: strict-origin-when-cross-origin",
		"  Permissions-Policy: camera=(), microphone=(), geolocation=()",
		"https://blog-web.vectorcontrol.tech/*",
		"https://vectorcontrol-web.pages.dev/*",
		"https://:version.vectorcontrol-web.pages.dev/*",
	];
	const lines = headers.split(/\r?\n/);
	for (const line of requiredHeaderLines) {
		if (!lines.includes(line)) fail(`_headers: missing exact rule: ${line}`);
	}
	const noindexRules = lines.filter(
		(line) => line === "  X-Robots-Tag: noindex, nofollow",
	).length;
	if (noindexRules !== 3) {
		fail(`_headers: expected 3 staging noindex rules, found ${noindexRules}`);
	}
	if (
		headers.includes(
			`https://blog.vectorcontrol.tech/*\n  X-Robots-Tag: noindex, nofollow`,
		)
	) {
		fail("_headers: production root must not inherit the staging noindex rule");
	}
} catch {
	// Missing artifact is reported by the requiredFiles check.
}

if (errors.length > 0) {
	console.error("Blog public contract failed:");
	for (const error of errors) console.error(`- ${error}`);
	process.exit(1);
}

console.log(
	`Verified ${htmlDocumentCount} HTML documents, ${discoveryFiles.length} discovery files, RSS, sitemap, robots, and Pages headers.`,
);
