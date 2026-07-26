/**
 * SEO 索引开关 —— 只有生产域构建才允许被搜索引擎收录。
 *
 * 预发/预览构建（Astro.site 为 blog-web 等任何非生产源）统一输出
 * noindex,nofollow robots meta 和 Disallow-all 的 robots.txt，
 * 保证预发站不被爬取、不与未来的生产域竞争权重。
 *
 * 割接翻转（一处生效，无需改本文件）：
 * 构建时设置 PUBLIC_SITE_ORIGIN=https://vectorcontrol.tech
 * 或将 src/config/siteConfig.ts 的 site_url 改为生产域，
 * Astro.site 即等于 PRODUCTION_SITE_ORIGIN，索引自动放开。
 */
export const PRODUCTION_SITE_ORIGIN = "https://vectorcontrol.tech";

export function isIndexable(site: URL | string | undefined): boolean {
	if (!site) return false;
	const origin = typeof site === "string" ? new URL(site).origin : site.origin;
	return origin === PRODUCTION_SITE_ORIGIN;
}
