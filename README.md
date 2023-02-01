# windoge-plugin
自用Yunzai-bot(V2/V3)插件，多为修改适配其他大佬的插件功能


### 安装方法
1. yunzai根目录运行以下命令
```
git clone https://github.com/gxy12345/windoge-plugin.git ./plugins/windoge-plugin/
```
2. 使用`pnpm install --filter=windoge-plugin` 或是 `npm install date-format`安装依赖


### 当前功能
* `#便签` 与yunzai自带的体力区分，使用xiaoyao-cvs-plugin中的体力面板展示
* `#windoge设置` 插件功能的各种配置
* `#便签背景图(强制)更新` 更新背景图库
* `#导入便签背景图+数字` `#清空便签背景图` 导入/清空第三方背景图模板
* `#XX参考面板`  `#参考面板帮助` 来源howe插件，原作者不再维护，将继续维护
* `#天赋素材` `#武器素材` `#周本素材` 素材汇总图
* `#原石预估` 下个版本可以获得的原石预估
* `#未复刻(4星/5星)角色` `#未复刻(4星/5星)武器` 角色/武器未复刻时间汇总图
* `#胡桃复刻` `#胡桃up` `#若水复刻` 查看指定角色或武器的复刻情况
* `#群通知+群号` `#群通知all` `#群列表` `#群通知帮助` 群发通知
* `#国际服羊毛` 获取hoyolab上可以白嫖原石活动的报名信息（注意，本功能需要搭配科学上网使用）
* `#国际服兑换码` 获取当前国际服可用的兑换码（注意，本功能需要搭配科学上网（港或日）使用）
* `#抽卡期望` `#2命期望` 查询指定命座的抽数期望表
* `#充值价格` `#充值汇率` `#Google充值汇率` 查询国际服不同货币充值价格最低的地区。需要自行申请API Key，[申请地址](https://www.exchangerate-api.com/)
* `#3.3深渊攻略(1-3)` `#更新3.3深渊攻略` 从米游社获取深渊攻略图并发送
* 待更新...


### 模块来源
我只是大佬代码的搬运工，本项目中的部分代码来自于以下项目：
* [xiaoyao-cvs-plugin](https://github.com/ctrlcvs/xiaoyao-cvs-plugin)
* [howe-plugin](https://github.com/howe0116/howe-plugin)


### 图像/数据来源
* [背景图仓库1](https://github.com/cv-hunag/BJT)
* [背景图仓库2](https://github.com/SmallK111407/BJT-Template)
* [复刻信息数据](https://github.com/KeyPJ/genshin-gacha-banners)