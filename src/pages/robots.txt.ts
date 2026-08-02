import type { APIRoute } from "astro";
import { isIndexable } from "@/utils/seo-utils";

// 预发/预览构建（site 非生产域）：全站 Disallow 且不输出 Sitemap 行，
// 防止预发站被收录；生产域构建自动恢复放开 + Sitemap。
// 翻转开关见 src/utils/seo-utils.ts（PUBLIC_SITE_ORIGIN / siteConfig.site_url）。
const site = import.meta.env.SITE;

const robotsTxt = (
	isIndexable(site)
		? `
User-agent: *
Allow: /

Sitemap: ${new URL("sitemap-index.xml", site).href}
`
		: `
User-agent: *
Disallow: /
`
).trim();

export const GET: APIRoute = () => {
	return new Response(robotsTxt, {
		headers: {
			"Content-Type": "text/plain; charset=utf-8",
		},
	});
};
