import fs from "fs";
import fetch from "node-fetch";
import { segment } from "oicq";
import {
    Cfg,
    Data
} from "../components/index.js";
import utils from "./utils.js";

const sourceUrl = 'https://gamewith.jp/genshin/article/show/231856'


async function getCode() {
    const redisKey = "windoge:web:oscode"
    let cacheData = await redis.get(redisKey)
    if (cacheData) {
      return JSON.parse(cacheData)
    }
    let response = await fetch(sourceUrl);
    let res = await response.text();
    // 过滤掉注释
    res = res.replace(/<!--(.|[\r\n])*?-->/g, "")
    // 提取激活码所在元素
    let rawCodes = res.match(/<div class="w-clipboard-copy-ui">\w+<\/div>/g)
    Bot.logger.mark(`raw codes: ${rawCodes}`)
    let codeList = []
    if (rawCodes) {
        rawCodes.forEach(val => {
            let code = val.replace(/<div class="w-clipboard-copy-ui">|<\/div>/g, "")
            Bot.logger.mark(`get code: ${code}`)
            codeList.push(code)
        });
    }
    redis.set(redisKey, JSON.stringify(codeList), { EX: 1200 });
    return codeList
}

export async function OSCode(e) {
    let codes = await getCode()
    if (codes.length == 0) {
        e.reply("未获取到激活码")
        return true
    }
    if (codes.length > 1) {
        let msgData = []
        msgData.push("当前可用兑换码如下")
        codes.forEach(val => {
            msgData.push(val)
        })
        await utils.replyMake(e, msgData, 0)
    } else {
        e.reply(`当前可用兑换码: ${codes}`)
    }
    return true
}

