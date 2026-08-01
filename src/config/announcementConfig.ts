import type { AnnouncementConfig } from "../types/announcementConfig";

export const announcementConfig: AnnouncementConfig = {
	// 公告标题
	title: "公告",

	// 公告内容
	content: "🚀 博客刚上线，内容还在慢慢补。欢迎通过 RSS 订阅，或在 GitHub 上找到我。",

	// 是否允许用户关闭公告
	closable: true,

	link: {
		// 启用链接
		enable: true,
		// 链接文本
		text: "GitHub",
		// 链接 URL
		url: "https://github.com/DeliciousBuding",
		// 外部链接
		external: true,
	},
};
