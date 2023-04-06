import fs from "fs";
import path from "path";
import fetch from "node-fetch";
import common from '../../../lib/common/common.js'
import utils from "./utils.js";
import { Cfg } from "../components/index.js";

const _path = process.cwd();
const abyss_strategy_path = `${_path}/data/AbyssStrategy`

const collection_url = "https://bbs-api.mihoyo.com/post/wapi/getPostFullInCollection?&gids=2&order_type=2&collection_id="
const collection_id = [
    // 原神观测枢
    347388,
    // 李沐瑟
    980743,
    // 茗血茶
    1519172,
    // 素贞丰
    1912768,
]
const source = ['原神观测枢', '李沐瑟', '茗血茶', '素贞丰']

const oss = '?x-oss-process=image//resize,s_1200/quality,q_90/auto-orient,0/interlace,1/format,png'

async function getData(url) {
    let response = await fetch(url, { method: 'get' })
    if (!response.ok) {
        return false
    }
    const res = await response.json()
    return res
}

function mkdirsSync(dirname) {
    if (fs.existsSync(dirname)) {
        return true;
    } else {
        if (mkdirsSync(path.dirname(dirname))) {
            fs.mkdirSync(dirname);
            return true;
        }
    }
}

export async function AbyssStrategy(e) {
    // if (!fs.existsSync(abyss_strategy_path)) {
    //     fs.mkdirSync(abyss_strategy_path)
    // }
    let match = /^#?(更新)?(\d\.\d)深渊攻略([1-4])?$/.exec(e.msg)
    let isUpdate = !!match[1]
    let versionName = match[2]
    let default_group = Number(Cfg.get("abyss_strategy.default", 1))
    let group = match[3] ? match[3] : default_group
    let source_dir = source[group - 1]

    let versionPath = `${abyss_strategy_path}/${versionName}/${source_dir}`
    if (!fs.existsSync(versionPath)) {
        mkdirsSync(versionPath)
    }

    let strategyPics = fs.readdirSync(versionPath)
    if (strategyPics.length > 0 && !isUpdate) {
        Bot.logger.debug(`攻略文件：${strategyPics}`)
        let msgs = []
        for (let img_name of strategyPics) {
            msgs.push(segment.image(`file://${versionPath}/${img_name}`))
        }

        if (Cfg.get("abyss_strategy.forward", false)) {
            await utils.replyMake(e, msgs, 0)
        } else {
            e.reply(msgs)
        }
        return true
    }
    if (await getStrategyImg(e, versionName, group, versionPath)) {
        strategyPics = fs.readdirSync(versionPath)
        let msgs = []
        for (let img_name of strategyPics) {
            msgs.push(segment.image(`file://${versionPath}/${img_name}`))
        }
        if (Cfg.get("abyss_strategy.forward", false)) {
            await utils.replyMake(e, msgs, 0)
        } else {
            e.reply(msgs)
        }
        return true
    }
}

async function getStrategyImg(e, versionName, source_group, versionPath) {
    let strategyUrl = `${collection_url}${collection_id[source_group - 1]}`
    let res = await getData(strategyUrl)
    if (!res) {
        e.reply('暂无该版本攻略数据，请稍后再试')
    }
    let imgs = []
    for (let val of res.data.posts) {
        if (val.post.subject.includes(versionName)) {
            val.image_list.forEach((v, i) => {
                if (Number(v.size) >= 600000 && v.format != 'gif') imgs.push(v.url)
            })
            break
        }
    }
    if (imgs.length == 0) {
        e.reply('暂无该版本攻略数据，请稍后再试')
        return false
    }
    Bot.logger.mark(`下载${versionName}攻略图`)
    let img_idx = 1
    for (let url of imgs) {
        if (!await common.downFile(url + oss, `${versionPath}/${img_idx}.png`)) {
            return false
        }
        img_idx = img_idx + 1
    }
    Bot.logger.mark(`下载${versionName}攻略成功`)
    return true
}
