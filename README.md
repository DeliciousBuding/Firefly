# delicious233 博客

delicious233（美味的布丁）的个人博客，运行在 [vectorcontrol.tech](https://vectorcontrol.tech)。

**主题**：基于 [Firefly](https://github.com/CuteLeaf/Firefly)（Astro 7 博客主题）fork 定制。

## 站点定制

- **视觉**：黑白极简——全站 oklch 饱和度归零（灰阶），仅 `--primary` 保留蓝色点缀（hue 240 天蓝）。颜色体系见 `src/styles/variables.styl`（注意：主题色相是 oklch 色相角，不是 HSL——215 实为青色，蓝色在 240-270）。
- **内容**：`src/content/posts/` 写 Markdown 文章（frontmatter：title/published/tags/category/image/slug 等）。
- **导航/关于/公告**：`src/config/` 下各配置文件。
- **SEO**：`PUBLIC_SITE_ORIGIN` 驱动——生产域构建自动放开索引（robots/canonical），预发一律 noindex。见 `src/utils/seo-utils.ts`。

## 本地开发

```bash
pnpm install
pnpm dev        # 本地预览 http://localhost:4321
pnpm check      # astro check 类型检查
pnpm build      # 生产构建（dist/）
```

## 部署

GitHub Actions 自动部署（`.github/workflows/pages-deploy.yml`）：push 到 `vectorcontrol-blog` 分支 → 构建（带 `PUBLIC_SITE_ORIGIN=https://vectorcontrol.tech`）→ wrangler 上传 Cloudflare Pages（项目 `vectorcontrol-web`，生产分支 main）。

手动部署：

```bash
$env:PUBLIC_SITE_ORIGIN="https://vectorcontrol.tech"; pnpm build
npx wrangler pages deploy dist --project-name=vectorcontrol-web --branch main
```

## 上游

- 主题：[CuteLeaf/Firefly](https://github.com/CuteLeaf/Firefly) · [许可证](LICENSE)（尊重开源协议，页面保留主题署名）
- 基础模板：[Fuwari](https://github.com/saicaca/fuwari)

## 更新上游

```bash
git remote add upstream https://github.com/CuteLeaf/Firefly
git fetch upstream
git merge upstream/main   # 解决冲突后提交
```
