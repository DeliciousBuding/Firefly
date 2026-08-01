import {
	type NavBarConfig,
	type NavBarLink,
	type NavBarSearchConfig,
	NavBarSearchMethod,
} from "../types/navBarConfig";

// ============================================================================
// 导航栏配置 - delicious233
// ============================================================================
const getDynamicNavBarConfig = (): NavBarConfig => {
	const links: NavBarLink[] = [
		LinkPresets.Home,
	];

	// 文章及其子菜单
	links.push({
		name: "文章",
		url: "#",
		icon: "material-symbols:article",
		children: [
			LinkPresets.Archive,
			LinkPresets.Categories,
			LinkPresets.Tags,
		],
	});

	// 关于我
	links.push(LinkPresets.About);

	// 链接
	links.push({
		name: "链接",
		url: "#",
		icon: "material-symbols:link",
		children: [
			{
				name: "GitHub",
				url: "https://github.com/DeliciousBuding",
				external: true,
				icon: "fa7-brands:github",
			},
			{
				name: "TokenDance Lab",
				url: "https://tokendancelab.com/",
				external: true,
				icon: "material-symbols:hub-outline",
			},
			{
				name: "RSS",
				url: "/rss.xml",
				external: false,
				icon: "fa7-solid:rss",
			},
		],
	});

	return { links } as NavBarConfig;
};

// 导航搜索配置
export const navBarSearchConfig: NavBarSearchConfig = {
	method: NavBarSearchMethod.PageFind,
};

// ============================================================================
// 链接预设
// ============================================================================
export const LinkPresets: Record<string, NavBarLink> = {
	Home: {
		name: "主页",
		url: "/",
		icon: "material-symbols:home",
	},
	Archive: {
		name: "归档",
		url: "/archive/",
		icon: "material-symbols:archive",
	},
	Categories: {
		name: "分类",
		url: "/categories/",
		icon: "material-symbols:folder-open-rounded",
	},
	Tags: {
		name: "标签",
		url: "/tags/",
		icon: "material-symbols:tag-rounded",
	},
	About: {
		name: "关于我",
		url: "/about/",
		icon: "material-symbols:person",
	},
};

export const navBarConfig: NavBarConfig = getDynamicNavBarConfig();
