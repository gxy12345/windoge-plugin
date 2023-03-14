import fs from "fs";
import path from "path";
import fetch from "node-fetch";
import common from '../../../lib/common/common.js'
import { segment } from "oicq";
import utils from "./utils.js";
import { Cfg } from "../components/index.js";

const _path = process.cwd();

const collection_url = "https://bbs-api.mihoyo.com/post/wapi/getPostFullInCollection?&gids=2&order_type=2&collection_id="
const collection_id = 1845635

async function getData(url) {
    let response = await fetch(url, { method: 'get' })
    if (!response.ok) {
        return false
    }
    const res = await response.json()
    return res
}

export async function MaterialRoute(e) {
    let match = /^#?(.+)(收集|采集|收集路线|采集路线)$/.exec(e.msg)
    let material_name = match[1]
    Bot.logger.debug(material_name)

    let post_id = await getMaterialsRoute(e, material_name)
    if (!post_id) {
        return true
    }

    let mysNews = await import(`file://${_path}/plugins/genshin/model/mysNews.js`)
    let mys_news = new mysNews.default(e)
    const param = await mys_news.newsDetail(post_id)
    const img = await mys_news.rander(param)

    let reply_msg = await mys_news.replyMsg(img, `原神${material_name}收集路线`)
    e.reply(reply_msg)
}

async function getMaterialsRoute(e, material_name) {
    let strategyUrl = `${collection_url}${collection_id}`
    let res = await getData(strategyUrl)
    if (!res) {
        e.reply('获取攻略信息失败，请稍后重试')
        return false
    }

    let post_id = false
    for (let val of res.data.posts) {
        if (val.post.subject.includes(material_name)) {
            post_id = val.post.post_id
            break
        }
    }
    if (!post_id) {
        e.reply(`暂未找到指定素材「${material_name}」的路线攻略，请等待作者更新`)
        return false
    }
    return post_id  
}
