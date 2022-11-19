/*
* 请勿直接修改此文件，可能会导致后续更新冲突
* 如需自定义可将文件复制一份，重命名为 help-cfg.js 后编辑
* */

// 帮助配置
export const helpCfg = {
	title: "windoge插件帮助",  // 帮助标题
	subTitle: "Yunzai-Bot & windoge-plugin" // 帮助副标题
};
export const helpList = [{
	"group": "便签查询",
	"list": [{
		"icon": 1,
		"title": "#便签模板列表",
		"desc": "显示当前可用的模板资源"
	},
	{
		"icon": 2,
		"title": "#便签模板设置申鹤1",
		"desc": "根据上条命令数据，发送指定模板名称"
	},

	]
}, {
	"group": "其他信息查詢",
	"list": [{
		"icon": 51,
		"title": "#武器素材",
		"desc": "武器素材一览"
	},
	{
		"icon": 52,
		"title": "#天赋素材",
		"desc": "天赋素材一览"
	},
	{
		"icon": 50,
		"title": "#周本素材",
		"desc": "周本素材一览"
	},
	{
		"icon": 59,
		"title": "#胡桃参考面板",
		"desc": "查询各角色24词条参考面板"
	},
	{
		"icon": 80,
		"title": "#未复刻角色 #未复刻武器",
		"desc": "未复刻限定角色/武器查询"
	},
	{
		"icon": 5,
		"title": "#原石预估",
		"desc": "下版本可获得原石预估"
	},
	{
		"icon": 8,
		"title": "#抽卡期望 #6命期望",
		"desc": "插卡期望表"
	},
	]
}, {
	"group": "国际服信息查询",
	"list": [{
		"icon": 11,
		"title": "#国际服兑换码",
		"desc": "查询目前可用的国际服兑换码"
	},
	{
		"icon": 12,
		"title": "#国际服羊毛",
		"desc": "查询hoyolab可获得原石的活动"
	},
	{
		"icon": 23,
		"title": "#充值价格 #Google充值价格",
		"desc": "查询不同地区充值648所需的价格"
	}
	]
}, {
	"group": "管理命令，仅管理员可用",
	"auth": "master",
	"list": [{
		"icon": 3,
		"title": "windoge(强制)更新",
		"desc": "更新windoge插件"
	}, {
		"icon": 7,
		"title": "#便签背景图更新",
		"desc": "用于获取最新的便签模板图"
	}, {
		"icon": 8,
		"title": "#导入便签背景图+数字",
		"desc": "使用指定的模板图模板资源"
	}, {
		"icon": 9,
		"title": "#清空便签背景图",
		"desc": "清空当前使用的三方便签背景图"
	}, {
		"icon": 10,
		"title": "#windoge设置",
		"desc": "插件设置"
	}, {
		"icon": 94,
		"title": "#群通知 #群通知帮助",
		"desc": "群发通知消息"
	}
	]
}]
