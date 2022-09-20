import {
	segment
} from "oicq";
import fs from "fs";
import lodash from "lodash";
import Data from "../components/Data.js"
import { copyFolder, deleteFiles } from "../components/Data.js";
import {
	createRequire
} from "module";
import {
	exec
} from "child_process";
import {
	Cfg
} from "../components/index.js";
import Common from "../components/Common.js";

const require = createRequire(
	import.meta.url);
let cfgMap = {
	"体力": "sys.Note",
	// "帮助": "sys.help",
	"戳一戳":"note.poke",
	"模板": "mb.len",
};
let sysCfgReg = `^#便签设置\s*(${lodash.keys(cfgMap).join("|")})?\s*(.*)$`;
export const rule = {
	updateMiaoPlugin: {
		hashMark: true,
		reg: "^#windoge(强制)?更新$",
		describe: "【#管理】便签更新",
	},
	sysCfg: {
		hashMark: true,
		reg: sysCfgReg,
		describe: "【#管理】系统设置"
	},
	updateNoteRes: {
		hashMark: true,
		reg: "^#便签背景图(强制)?更新$",
		describe: "【#管理】下载背景图资源"
	},
	setNoteRes: {
		hashMark: true,
		reg: "^#导入便签背景图[1-6]$",
		describe: "【#管理】使用下载的背景图资源"
	},
	clearNoteRes: {
		hashMark: true,
		reg: "^#清空便签背景图$",
		describe: "【#管理】清空背景图"
	}
};


const _path = process.cwd();
const resPath = `${_path}/plugins/windoge-plugin/resources/`;

const templatePath = {
	template1: {
		resPath: `${resPath}BJT/xiaoyao-cvs-plugin2/resources/dailyNote/`,
		dstPath: `${resPath}dailyNote/`,
		source: 1
	},
	template2: {
		resPath: `${resPath}BJT/xiaoyao-cvs-plugin3/resources/dailyNote/`,
		dstPath: `${resPath}dailyNote/`,
		source: 1
	},
	template3: {
		resPath: `${resPath}BJT/xiaoyao-cvs-plugin4/resources/dailyNote/`,
		dstPath: `${resPath}dailyNote/`,
		source: 1
	},
	template4: {
		resPath: `${resPath}BJT/xiaoyao-cvs-plugin5/resources/dailyNote/`,
		dstPath: `${resPath}dailyNote/`,
		source: 1
	},
	template5: {
		resPath: `${resPath}BJT-Template/Template/`,
		dstPath: `${resPath}dailyNote/Template/`,
		source: 2
	},
	template6: {
		resPath: `${resPath}BJT/xiaoyao-cvs-plugin2/resources/dailyNote/`,
		dstPath: `${resPath}dailyNote/Template/`,
		source: 2
	},
}

export async function sysCfg(e, {
	render
}) {
	if (!await checkAuth(e)) {
		return true;
	}

	let cfgReg = new RegExp(sysCfgReg);
	let regRet = cfgReg.exec(e.msg);

	if (!regRet) {
		return true;
	}
	if (regRet[1]) {

		// 设置模式
		let val = regRet[2] || "";
		
		let cfgKey = cfgMap[regRet[1]];

		if (cfgKey === "sys.scale") {
			val = Math.min(200, Math.max(50, val * 1 || 100));
		}else if(cfgKey === "mb.len"){
			val= Math.min(2,Math.max(val,0));
		} else {
			val = !/关闭/.test(val);
		}
		if (cfgKey) {
			Cfg.set(cfgKey, val);
		}
	}
	// e.reply("设置成功！！");
	// return true;
	let cfg = {
		Note: getStatus("sys.Note",false),
		len:Cfg.get("mb.len", 0),
		poke: getStatus("note.poke",false),
		bg: await rodom(), //获取底图
	}
	//渲染图像
	return await Common.render("admin/index", {
		...cfg,
	}, {
		e,
		render,
		scale: 1.4
	});
}

const rodom = async function() {
	var image = fs.readdirSync(`./plugins/windoge-plugin/resources/admin/imgs/bg`);
	var list_img = [];
	for (let val of image) {
		list_img.push(val)
	}
	var imgs = list_img.length == 1 ? list_img[0] : list_img[lodash.random(0, list_img.length - 1)];
	return imgs;
}

const checkAuth = async function(e) {
	return await e.checkAuth({
		auth: "master",
		replyMsg: `只有主人才能命令我哦~
    (*/ω＼*)`
	});
}
const getStatus = function(rote, def = true) {
	if (Cfg.get(rote, def)) {
		return `<div class="cfg-status" >已开启</div>`;
	} else {
		return `<div class="cfg-status status-off">已关闭</div>`;
	}

}

export async function updateNoteRes(e) {
	if (!await checkAuth(e)) {
		return true;
	}
	let command = "";
	let resBJTStatus = fs.existsSync(`${resPath}/BJT/`);
	let resBJT2Status = fs.existsSync(`${resPath}/BJT-Template/`);
	Bot.logger.mark(`资源状态: 背景库1:${resBJTStatus}, 背景库2:${resBJT2Status}`);

	if (resBJTStatus && resBJT2Status) {
		command = `git pull`;
		let isForce = e.msg.includes("强制");
		if (isForce) {
			command = "git  checkout . && git  pull";
			// command="git fetch --all && git reset --hard origin/master && git pull "
			e.reply("正在执行强制更新操作，请稍等");
		} else {
			e.reply("正在执行更新操作，请稍等");
		}
		exec(command, {
			cwd: `${resPath}/BJT/`
		}, function(error, stdout, stderr) {
			//console.log(stdout);
			if (/Already up to date/.test(stdout)||stdout.includes("最新")) {
				e.reply("【背景图库1】目前所有图片都已经是最新了~");
				return true;
			}
			let numRet = /(\d*) files changed,/.exec(stdout);
			if (numRet && numRet[1]) {
				e.reply(`【背景图库1】报告主人，更新成功，此次更新了${numRet[1]}个文件~`);
				return true;
			}
			if (error) {
				e.reply("【背景图库1】更新失败！\nError code: " + error.code + "\n" + error.stack + "\n 请稍后重试。");
			} else {
				e.reply("【背景图库1】背景图资源更新成功~");
			}
		});
		exec(command, {
			cwd: `${resPath}/BJT-Template/`
		}, function(error, stdout, stderr) {
			//console.log(stdout);
			if (/Already up to date/.test(stdout)||stdout.includes("最新")) {
				e.reply("【背景图库2】目前所有图片都已经是最新了~");
				return true;
			}
			let numRet = /(\d*) files changed,/.exec(stdout);
			if (numRet && numRet[1]) {
				e.reply(`【背景图库2】报告主人，更新成功，此次更新了${numRet[1]}个文件~`);
				return true;
			}
			if (error) {
				e.reply("【背景图库2】背景图资源库2更新失败！\nError code: " + error.code + "\n" + error.stack + "\n 请稍后重试。");
			} else {
				e.reply("【背景图库2】背景图资源更新成功~");
			}
		});
	} else {
		let BJTDownloadStatus1 = true;
		let BJTDownloadStatus2 = true;
		e.reply("开始尝试安装背景图资源，可能会需要一段时间，请耐心等待~");
		if (!resBJTStatus){
			BJTDownloadStatus1 = false;
			command = `git clone https://github.com/cv-hunag/BJT.git "${resPath}/BJT/"`
			exec(command, function(error, stdout, stderr) {
				if (error) {
					e.reply("【背景图库1】安装失败！\nError code: " + error.code + "\n" + error.stack + "\n 请稍后重试。");
				} else {
					Bot.logger.mark("背景图库1 安装完成");
					BJTDownloadStatus1 = true;
					e.reply(`背景图资源1安装成功！可以使用 #导入便签背景图(1234) 来导入背景图\n您后续也可以通过 #便签背景图更新 命令来更新图像`);
				}
			});
		}
		if (!resBJT2Status){
			BJTDownloadStatus2 = false;
			command = `git clone https://github.com/SmallK111407/BJT-Template.git "${resPath}/BJT-Template/"`
			exec(command, function(error, stdout, stderr) {
				if (error) {
					e.reply("【背景图库2】安装失败！\nError code: " + error.code + "\n" + error.stack + "\n 请稍后重试。");
				} else {
					Bot.logger.mark("背景图库2 安装完成");
					BJTDownloadStatus2 = true;
					e.reply(`背景图资源2安装成功！可以使用 #导入便签背景图(56) 来导入背景图\n您后续也可以通过 #便签背景图更新 命令来更新图像`);
				}
			});
		}
	}
	return true;
}

export async function setNoteRes(e) {

	if (!await checkAuth(e)) {
		return true;
	}

	let resBJTStatus = fs.existsSync(`${resPath}/BJT/`);
	let resBJT2Status = fs.existsSync(`${resPath}/BJT-Template/`);

	if (!(resBJTStatus || resBJT2Status)) {
		e.reply("未找到背景图资源,请先使用 #便签背景图更新 命令获取背景图")
		return true
	}
	
	let templateIndex = e.msg.replace("#导入便签背景图", "");
	let templateKey = `template${templateIndex}`
	if (!resBJTStatus && templatePath[templateKey].source == 1) {
		e.reply("未找到对应的背景图资源包，请使用 #便签背景图更新 命令获取背景图");
		return true;
	}
	if (!resBJT2Status && templatePath[templateKey].source == 2) {
		e.reply("未找到对应的背景图资源包，请使用 #便签背景图更新 命令获取背景图");
		return true;
	}

	let templateSource = templatePath[templateKey].resPath;
	let templateDest = templatePath[templateKey].dstPath;

	Bot.logger.mark(`选择背景图路径: ${templateSource}`);
	Bot.logger.mark(`替换背景图路径: ${templateDest}`);

	copyFolder(templateSource, templateDest, true)
	e.reply("导入背景图完成");
	return true;
}

export async function clearNoteRes(e) {
	if (!await checkAuth(e)) {
		return true;
	}
	e.reply("开始清空模板目录");
	deleteFiles(`${resPath}/dailyNote/background_image`)
	deleteFiles(`${resPath}/dailyNote/Template`)
	//恢复工程自带模板

	let currentCommitId;
	let command = "git rev-parse HEAD"
	exec(command, {
		cwd: `${_path}/plugins/windoge-plugin/`
	}, function(error, stdout, stderr) {
		Bot.logger.mark(`最新commit-id: ${stdout.replace("\n", "")}`);

		currentCommitId = stdout.replace("\n", "")
		if (error) {
			e.reply("获取git提交失败！\nError code: " + error.code + "\n" + error.stack + "\n 请稍后重试。");
			return true;
		}

		command = `git checkout ${currentCommitId} resources/dailyNote`
		exec(command, {
			cwd: `${_path}/plugins/windoge-plugin/`
		}, function(error, stdout, stderr) {
			if (error) {
				e.reply("恢复默认模板失败！\nError code: " + error.code + "\n" + error.stack + "\n 请稍后重试。");
				return true;
			} else {
				e.reply("清空模板目录完成");
				return true;
			}
		});
	});

}

let timer;

export async function updateMiaoPlugin(e) {
	if (!await checkAuth(e)) {
		return true;
	}
	let isForce = e.msg.includes("强制");
	let command = "git  pull";
	if (isForce) {
		command = "git  checkout . && git  pull";
		e.reply("正在执行强制更新操作，请稍等");
	} else {
		e.reply("正在执行更新操作，请稍等");
	}
	exec(command, {
		cwd: `${_path}/plugins/windoge-plugin/`
	}, function(error, stdout, stderr) {
		//console.log(stdout);
		if (/Already up[ -]to[ -]date/.test(stdout)||stdout.includes("最新")) {
			e.reply("目前已经是最新版windoge插件了~");
			return true;
		}
		if (error) {
			e.reply("windoge插件更新失败！\nError code: " + error.code + "\n" + error.stack + "\n 请稍后重试。");
			return true;
		}
		e.reply("windoge插件更新成功，尝试重新启动Yunzai以应用更新...");
		timer && clearTimeout(timer);
		redis.set("xiaoyao-lite:restart-msg", JSON.stringify({
			msg: "重启成功，新版windoge插件已经生效",
			qq: e.user_id
		}), {
			EX: 30
		});
		timer = setTimeout(function() {
			let command = `npm run start`;
			if (process.argv[1].includes("pm2")) {
				command = `npm run restart`;
			}
			exec(command, function(error, stdout, stderr) {
				if (error) {
					e.reply("自动重启失败，请手动重启以应用新版windoge插件。\nError code: " + error.code + "\n" +
						error.stack + "\n");
					Bot.logger.error('重启失败\n${error.stack}');
					return true;
				} else if (stdout) {
					Bot.logger.mark("重启成功，运行已转为后台，查看日志请用命令：npm run log");
					Bot.logger.mark("停止后台运行命令：npm stop");
					process.exit();
				}
			})
		}, 1000);

	});
	return true;
}
