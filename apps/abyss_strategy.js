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

export async function AbyssStrategy(e) {
    let match = /^#?(更新)?(\d\.\d)深渊攻略([1-4])?$/.exec(e.msg)
    let isUpdate = !!match[1]
    let versionName = match[2]
    let default_group = Number(Cfg.get("abyss_strategy.default", 1))
    let group = match[3] ? match[3] : default_group
    let source_dir = source[group - 1]

    let post_id = await searchCollection(collection_id[group - 1], versionName)
    if (post_id == -1) {
        e.reply("查询米游社攻略失败，请检查网络或稍后重试")
        return true
    } else if (post_id == 0) {
        e.reply('暂无该版本攻略数据，请稍后再试')
        return true
    }

    let mysNews = await import(`file://${_path}/plugins/genshin/model/mysNews.js`)
    let mys_news = new mysNews.default(e)
    const param = await mys_news.newsDetail(post_id)
    let img
    if (mys_news.rander) {
        img = await mys_news.rander(param)
    } else {
        //兼容TRSS
        img = await mys_news.render(param)
    }
    let reply_msg = await mys_news.replyMsg(img, `原神${versionName}深渊攻略`)
    e.reply(reply_msg)
    return true
}

async function searchCollection(cid, keyword) {
    let strategyUrl = `${collection_url}${cid}`
    let res = await getData(strategyUrl)
    if (!res) {
        return -1
    }
    for (let val of res.data.posts) {
        if (val.post.subject.includes(keyword)) {
            return val.post.post_id
        }
    }
    return 0
}