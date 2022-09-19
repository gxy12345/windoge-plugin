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
	refer_Artifacts
} from "./refer_Artifacts.js";
import {
	material_chart,
	primogems_expect,
	pool_interval
} from "./materials.js";


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
	pool_interval
};
const _path = process.cwd();

let rule = {
	Note: {
		reg: "^#*(便笺|便签|派遣)$",
		describe: "体力",
	},
	Note_appoint: {
		reg: "^#(体力|便笺|便签)模板(设置(.*)|列表)$",
		describe: "体力模板设置",
	},
	help: {
		reg: "^#?(便签)?(命令|帮助|菜单|help|说明|功能|指令|使用说明)$",
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
		reg: "^#*未复刻(角色|统计)*$",
		describe: "角色未复刻间隔"
	},
	
	...adminRule
};

lodash.forEach(rule, (r) => {
	r.priority = r.priority || 51;
	r.prehash = true;
	r.hashMark = true;
});

export {
	rule
};
