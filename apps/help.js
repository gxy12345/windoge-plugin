import {
	Cfg
} from "../components/index.js";
import {
	segment
} from "oicq";
import lodash from "lodash";
import {
	currentVersion,
	changelogs
} from "../components/Changelog.js";
import Common from "../components/Common.js";
import fs from "fs"
const _path = process.cwd();

const helpPath = `${_path}/plugins/windoge-plugin/resources/help`;
const path_ = `/plugins/windoge-plugin/resources/common/layout/`;

export async function help(e, {
	render
}) {
	if (!/windoge/.test(e.msg) && !Cfg.get("sys.help", false)) {
		return false;
	}
	let custom = {},
		help = {};
	if (fs.existsSync(`${helpPath}/help-cfg.js`)) {
		help = await import(`file://${helpPath}/help-cfg.js?version=${new Date().getTime()}`);
	} else if (fs.existsSync(`${helpPath}/help-list.js`)) {
		help = await import(`file://${helpPath}/help-list.js?version=${new Date().getTime()}`);
	} else {
		help = await import(`file://${helpPath}/help-cfg_default.js?version=${new Date().getTime()}`);
	}

	// 兼容一下旧字段
	if (lodash.isArray(help.helpCfg)) {
		custom = {
			helpList: help.helpCfg,
			helpCfg: {}
		};
	} else {
		custom = help;
	}

	let def = await import(`file://${helpPath}/help-cfg_default.js?version=${new Date().getTime()}`);

	let helpCfg = lodash.defaults(custom.helpCfg, def.helpCfg);
	let helpList = custom.helpList || def.helpList;

	let helpGroup = [];

	lodash.forEach(helpList, (group) => {
		if (group.auth && group.auth === "master" && !e.isMaster) {
			return;
		}

		lodash.forEach(group.list, (help) => {
			let icon = help.icon * 1;
			if (!icon) {
				help.css = `display:none`;
			} else {
				let x = (icon - 1) % 10,
					y = (icon - x - 1) / 10;
				help.css = `background-position:-${x * 50}px -${y * 50}px`;
			}

		});

		helpGroup.push(group);
	});

	return await Common.render_path("help/index", {
		helpCfg,
		helpGroup,
		element: 'default'
	}, {
		e,
		render,
		scale: 1.2
	}, path_)
}

export async function versionInfo(e, {
	render
}) {
	return await Common.render_path("help/version-info", {
		currentVersion,
		changelogs,
		elem: "cryo",
	}, {
		e,
		render,
		scale: 1.2
	}, path_)
}

export async function refer_Artifacts_Desc(e){
	let msg = [
	  segment.image (`${_path}/plugins/windoge-plugin/resources/help/refer_Artifacts_help.png`),]
	e.reply(msg);
}
