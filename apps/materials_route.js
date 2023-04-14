import fs from "fs";
import path from "path";
import fetch from "node-fetch";
import common from '../../../lib/common/common.js'
import utils from "./utils.js";
import { Cfg } from "../components/index.js";
import { isV3 } from "../components/Changelog.js";


const _path = process.cwd();

const collection_url = "https://bbs-api.mihoyo.com/post/wapi/getPostFullInCollection?&gids=2&order_type=2&collection_id="
const collection_ids = {
    'material': [1845635, 1902839, 595794],
    'character': [701708, 17465]
}

let Botcfg;
if (isV3) {
    Botcfg = (await import(`file://${_path}/plugins/genshin/model/gsCfg.js`)).default;
} else {
    Botcfg = YunzaiApps.mysInfo
}

async function getData(url) {
    let response = await fetch(url, { method: 'get' })
    if (!response.ok) {
        return false
    }
    const res = await response.json()
    return res
}

export async function MaterialRoute(e) {
    // 防止拦截米游社查询命令
    if (/米游社/.test(e.msg)) {
        return false
    }
    let match = /^#?(.+)(收集|采集|讨伐|收集路线|采集路线|讨伐路线)$/.exec(e.msg)
    let material_name = match[1]
    if (/突破|养成|培养/.test(material_name)) {
        return false
    }

    let post_id = await getMaterialsRoute(e, material_name)
    if (!post_id) {
        return true
    }

    let mysNews = await import(`file://${_path}/plugins/genshin/model/mysNews.js`)
    let mys_news = new mysNews.default(e)
    const param = await mys_news.newsDetail(post_id)
    const img = await mys_news.rander(param)

    let reply_msg = await mys_news.replyMsg(img, `原神${material_name} 素材收集路线`)
    e.reply(reply_msg)
    return true
}

export async function CharMaterialRoute(e) {
    // 防止拦截米游社查询命令
    if (/米游社/.test(e.msg)) {
        return false
    }
    let match = /^#?(.+)(培养|突破|养成)(素材|材料)?收集$/.exec(e.msg)
    let char_name = match[1]

    let post_id = await getMaterialsRoute(e, char_name, 'character')
    if (!post_id) {
        return true
    }
    let mysNews = await import(`file://${_path}/plugins/genshin/model/mysNews.js`)
    let mys_news = new mysNews.default(e)
    const param = await mys_news.newsDetail(post_id)
    const img = await mys_news.rander(param)

    let reply_msg = await mys_news.replyMsg(img, `原神${char_name}收集路线`)
    e.reply(reply_msg)
    return true
}

async function getMaterialsRoute(e, keyword, query_type = 'material') {
    let post_id = false
    let keyword_list = []
    keyword_list.push(keyword)
    if (query_type === 'character') {
        keyword_list.push(keywordToFullName(keyword))
    }
    for (let key of keyword_list) {
        for (let cid of collection_ids[query_type]) {
            let search_res = await searchCollection(cid, key)
            if (search_res === -1) {
                e.reply("查询米游社攻略失败，请检查网络或稍后重试")
                return false
            } else if (search_res === 0) {
                if (Bot?.logger?.mark) {
                    Bot.logger.mark(`collection id ${cid} 未找到指定攻略`)
                } else {
                    console.log(`collection id ${cid} 未找到指定攻略`)
                }
                continue
            } else {
                post_id = search_res
                break
            }
        }
    }

    if (!post_id) {
        if (query_type === 'material') {
            e.reply(`暂未找到指定素材「${keyword}」的路线攻略，请等待作者更新`)
        } else if (query_type === 'character') {
            e.reply(`暂未找到角色「${keyword}」的突破素材攻略，请等待作者更新`)
        }
        return false
    }
    return post_id
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

function keywordToFullName(keyword) {
    let id;
    if (isV3) {
        id = Botcfg.roleNameToID(keyword);
    } else {
        id = Botcfg.roleIdToName(keyword);
    }
    let name;
    if (isV3) {
        name = Botcfg.roleIdToName(id);
    } else {
        name = Botcfg.roleIdToName(id, true);
    }
    if (!name) {
        return false
    }
    return name
}
