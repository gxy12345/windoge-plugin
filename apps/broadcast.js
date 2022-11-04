import {
	segment
} from "oicq";
import utils from "./utils.js";
import moment from 'moment';

// 颜文字列表，用于随机插入消息中，减少群发重复消息导致风控概率
const emoticonList = [
	"(๑•̀ㅂ•́)و✧", "╰(*°▽°*)╯", "（＝。＝）", "ヾ(≧▽≦*)o", "(o゜▽゜)o", " (/≧▽≦)/", "o(^▽^)o", "(๑′ㅂ`๑)",
	"( ＾∀＾）", "(≧∀≦)ゞ", "≡ω≡", "( =•ω•= )m", "ヽ(✿ﾟ▽ﾟ)ノ", "(p≧w≦q)", "o(〃'▽'〃)o", "╰(￣▽￣)╭"
]

export const rule = {
	broadcastHelp: {
		reg: "^#群通知帮助$",
		priority: 50,
		describe: "群通知帮助"
	},
	preGroupBroadcast: {
		reg: "^#群通知(.*)$",
		priority: 100,
		describe: "向群发送通知",
	},
	GroupBroadcast: {
		reg: "",
		priority: 200,
		describe: "向群发送通知",
	},
	getGroupList: {
		reg: "^#群列表$",
		priority: 500,
		describe: "获取群号、群名、群人数"
	}
}

let broadcastUser = {}
let group_id = {}
let is_broadcast = {}

const checkAuth = async function(e) {
	return await e.checkAuth({
		auth: "master",
		replyMsg: `只有主人才能命令我哦~
    (*/ω＼*)`
	});
}

//消息发送监听
export async function preGroupBroadcast(e) {
	if (!await checkAuth(e)) {
		return true;
	}
    group_id[e.user_id] = e.msg.replace("#", "");
    group_id[e.user_id] = group_id[e.user_id].replace("群通知", "");
    Bot.logger.mark(`目标群号：:${group_id[e.user_id]}`);

	if (group_id[e.user_id] == "") {
		e.reply("请在指令中加上群号，例如: #群通知12345678")
		return true
	}

	if (group_id[e.user_id] == "all") {
		Bot.logger.mark(`发布至所有群`);
		is_broadcast[e.user_id] = true
	}
	else {
		let group = Bot.gl.get(Number(group_id[e.user_id]));
		if (!group) {
		  e.reply("我不在这个群里哦");
		  return true;
		}
	}

	if (broadcastUser[e.user_id]) {
		clearTimeout(broadcastUser[e.user_id]);
	}
	broadcastUser[e.user_id] = setTimeout(() => {
		if (broadcastUser[e.user_id]) {
			delete broadcastUser[e.user_id];
			is_broadcast[e.user_id] = false
			e.reply([segment.at(e.user_id), " 群通知已取消"]);
		}
	}, 50000);

	e.reply([segment.at(e.user_id), " 请发送群通知内容"]);
	broadcastUser[e.user_id] = true;
	return GroupBroadcast(e);
}

export async function GroupBroadcast(e) {
	if (!broadcastUser[e.user_id]) return;
	if (!await checkAuth(e)) {
		return true;
	}
	if (e.msg.indexOf("#群通知") != -1) return;

	let emotionIndex = Math.round(Math.random() * (emoticonList.length - 1))
	let boradcast_msg = `以下是来自主人的通知${emoticonList[emotionIndex]}\n${e.msg}`

	if (is_broadcast[e.user_id]){
		e.reply(`开始向所有群发送群消息`)
		for (let group of Bot.gl) {
			await utils.sleepAsync(2000)
			emotionIndex = Math.round(Math.random() * (emoticonList.length - 1))
			boradcast_msg = `以下是来自主人的通知${emoticonList[emotionIndex]}\n${e.msg}`
			Bot.logger.mark(`向 ${group[1].group_id} 发送消息: ${boradcast_msg}`);
			Bot.pickGroup(Number(group[1].group_id))
			.sendMsg(boradcast_msg)
			.catch((err) => {
			  Bot.logger.mark(err);
			  e.reply("发送失败，请检查日志");
			  cancel(e);
			  return true;
			});
		}
		e.reply("群通知发送成功");
		cancel(e);
		return true;
	}
	else {
		e.reply(`开始发送群消息-${group_id[e.user_id]}`)
		Bot.pickGroup(Number(group_id[e.user_id]))
		.sendMsg(boradcast_msg)
		.catch((err) => {
		  Bot.logger.mark(err);
		  e.reply("发送失败，请检查日志");
		  cancel(e);
		  return true;
		});
		e.reply("群通知发送成功");
		cancel(e);
		return true;
	}
}

function cancel(e) {
    if (broadcastUser[e.user_id]) {
        clearTimeout(broadcastUser[e.user_id]);
        delete broadcastUser[e.user_id];
		is_broadcast[e.user_id] = false
    }
}

export async function getGroupList(e) {
	if (!await checkAuth(e)) {
		return true;
	}
	let flag = 1;
	let msg = [];
	Bot.gl.forEach(function(group, groupId, gl) {
	  if (flag) {
		flag = 0;
	  } else {
		msg.push("\n");
	  }
	  msg.push(`群昵称【${group.group_name}】 群号【${groupId}】群人数【${group.member_count}】`);
	})
	e.reply(msg);
  }

  export async function broadcastHelp(e) {
	if (!await checkAuth(e)) {
		return true;
	}
	let msg = "群通知使用帮助"
	msg += '\n【#群通知+群号】向指定群发送通知'
    msg += '\n【#群通知all】向所有群发送通知'
    msg += '\n【#群列表】显示当前机器人加入的群列表'
	e.reply (msg);
	return true;
  }
