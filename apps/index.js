import lodash from "lodash";
import {
	versionInfo,
	help,
	refer_Artifacts_Desc
} from "./help.js";
import {
	Note,
	Note_appoint,
	pokeNote
} from "./Note.js";
import {
	rule as adminRule,
	sysCfg,
	updateMiaoPlugin,
	updateNoteRes,
	setNoteRes,
	clearNoteRes
} from "./admin.js";
import {
	rule as broadcastRule,
	preGroupBroadcast,
	GroupBroadcast,
	getGroupList,
	broadcastHelp
} from "./broadcast.js"
import {
	refer_Artifacts
} from "./refer_Artifacts.js";
import {
	material_chart,
	primogems_expect,
	pool_interval
} from "./materials.js";
import {
	checkEvent
} from "./hoyolab_event.js";
import {
	OSCode
} from "./os_code.js"
import {
	 gacha_expect
} from "./gacha_expect.js";
import { CurrencyRate } from "./currency_rate.js";
import { AbyssStrategy } from "./abyss_strategy.js";

export {
	updateMiaoPlugin,
	versionInfo,
	Note_appoint,
	pokeNote,
	sysCfg,
	help,
	Note,
	updateNoteRes,
	setNoteRes,
	clearNoteRes,
	refer_Artifacts_Desc,
	refer_Artifacts,
	material_chart,
	primogems_expect,
	pool_interval,
	preGroupBroadcast,
	GroupBroadcast,
	getGroupList,
	broadcastHelp,
	checkEvent,
	OSCode,
	gacha_expect,
	CurrencyRate,
	AbyssStrategy,
};
const _path = process.cwd();

let rule = {
	Note: {
		reg: "^#*(便笺|便签|派遣)$",
		describe: "体力",
	},
	Note_appoint: {
		reg: "^#(体力|便笺|便签)模板(设置(.*)|列表(.*))$",
		describe: "体力模板设置",
	},
	help: {
		reg: "^#?(windoge)?(命令|帮助|菜单|help|说明|功能|指令|使用说明)$",
		describe: "查看插件的功能",
	},
	pokeNote: {
		reg: "#poke#",
		describe: "体力",
	},
	refer_Artifacts: {
		reg: "^#*[^-~]+参考面板+$",
		describe: "参考面板",
	},
	material_chart: {
		reg: "^#*(天赋|武器|周本)+素材+$",
		describe: "素材表",
	},
	primogems_expect: {
		reg: "^#*原石(预估|预期)+$",
		describe: "原石预估"
	},
	versionInfo: {
		reg: "^#?windoge版本$",
		describe: "版本",
	},
	refer_Artifacts_Desc: {
		reg: "^#?参考面板说明$",
		priority: 100,
		describe: "参考面板说明",
	},
	pool_interval: {
		reg: "^#*未复刻(角色|武器)*$",
		describe: "角色未复刻间隔"
	},
	checkEvent: {
		reg: "^#*国际服(白嫖|羊毛|活动)$",
		describe: "国际服hoyolab白嫖原石活动"
	},
	OSCode: {
		reg: "^#*(国际服|国服)?兑换码$",
		describe: "国际服当前可用兑换码",
		priority: 100,
	},
	gacha_expect: {
        reg: "^#(抽卡|[0-6]命)+期望+$",
        describe: "抽卡期望表"
	},
	CurrencyRate: {
        reg: "^#(Google|google|谷歌|安卓)?充值(汇率|价格)(all)*$",
        describe: "充值汇率"
	},
	AbyssStrategy: {
		reg: "^#?(更新)?([1-9]\.[0-9])深渊攻略$",
		// reg: "^#debug入口$",
        describe: "深渊攻略",
		priority: 30
	},
	
	...adminRule,
	...broadcastRule
};

lodash.forEach(rule, (r) => {
	r.priority = r.priority || 51;
	r.prehash = true;
	r.hashMark = true;
});

export {
	rule
};
