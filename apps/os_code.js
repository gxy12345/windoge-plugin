import fs from "fs";
import fetch from "node-fetch";
import {
    Cfg,
    Data
} from "../components/index.js";
import {
	isV3
} from '../components/Changelog.js'
import common from '../../../lib/common/common.js'

const _path = process.cwd();
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
    let codeList = []
    if (rawCodes) {
        rawCodes.forEach(val => {
            let code = val.replace(/<div class="w-clipboard-copy-ui">|<\/div>/g, "")
            codeList.push(code)
        });
    }
    redis.set(redisKey, JSON.stringify(codeList), { EX: 300 });
    return codeList
}

export async function OSCode(e) {
    if (!/国际服|国服/.test(e.msg)) {
        if (!Cfg.get("os.code")) {
            // 开关未开启，消息继续处理
            return false
        }
        if (isV3) {
            // 只有V3有国服兑换码功能
            e.reply("请回复 #国服兑换码 或 #国际服兑换码 进行查询")
            return true
        }
    }
    let query_region
    if (isV3) {
        query_region = /国际服/.test(e.msg) ? 'os' : 'cn'
    } else {
        query_region = 'os'
    }

    if (query_region === 'os') {
        let codes = await getCode()
        if (codes.length == 0) {
            e.reply("未获取到兑换码")
            return true
        }
        let msgData = []
        msgData.push("当前可用兑换码如下")
        codes.forEach(val => {
            msgData.push(val)
        })
        msgData.push("兑换码兑换网站: https://genshin.hoyoverse.com/zh-tw/gift")
        msgData.push("可使用命令 #兑换码使用+(空格)+兑换码 进行兑换。若兑换失败，请尝试刷新cookie或重新绑定cookie")
        let fwdMsg = await common.makeForwardMsg(e, msgData, msgData[0])
        e.reply(fwdMsg)

        return true
    } else {
        let cn_exchange = await import(`file://${_path}/plugins/genshin/apps/exchange.js`);
        let cn_code = new cn_exchange.exchange()
        cn_code.e = e
        return cn_code.getCode()
    }


}

