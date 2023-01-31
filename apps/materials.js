import { segment } from "oicq";
import fs from "fs";
import path from "path";
import fetch from "node-fetch";
import common from '../../../lib/common/common.js'

//项目路径
const _path = process.cwd();
const material_download_path = `${_path}/plugins/windoge-plugin/resources/materials/download/`

const oss = '?x-oss-process=image//resize,s_1200/quality,q_90/auto-orient,0/interlace,1/format,jpg'
const mys_data_api = 'https://api-static.mihoyo.com/common/blackboard/ys_obc/v1/content/info?app_sn=ys_obc&content_id='

const materialMap = {
    天赋: {
        redisKey: "windoge:material:normal_talent",
        contentId: 1226,
        contentIndex: 0,
    },
    周本: {
        redisKey: "windoge:material:week_talent",
        contentId: 1226,
        contentIndex: 1,
    },
    武器: {
        redisKey: "windoge:material:weapon",
        contentId: 1187,
        contentIndex: 0,
    }
}

export const rule = {
    material_chart: {
        reg: "^#*(天赋|武器|周本)+素材+$",  //匹配消息正则，命令正则
        priority: 50, //优先级，越小优先度越高
        describe: "素材表" //【命令】功能说明
    },
    primogems_expect: {
        reg: "^#*原石(预估|预期)+$",  //匹配消息正则，命令正则
        priority: 50, //优先级，越小优先度越高
        describe: "原石预估" //【命令】功能说明
    },
    pool_interval: {
        reg: "^#*未复刻(角色|武器)*$",  //匹配消息正则，命令正则
        priority: 50, //优先级，越小优先度越高
        describe: "角色未复刻间隔" //【命令】功能说明
    }
};

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

async function getMaterialsPic(type) {
    if (!Object.keys(materialMap).includes(type)) return false
    let api_url = `${mys_data_api}${materialMap[type].contentId}`
    let response = await fetch(api_url, { method: 'get' })
    if (!response.ok) {
        return false
    }
    let response_json = await response.json()
    Bot.logger.debug(`响应:${JSON.stringify(response_json)}`)
    let imgUrls = response_json.data.content.contents[0].text.match(/https?:\/\/\S+\.png/g)
    if (!imgUrls) return false
    Bot.logger.debug(`图片URL列表 ${imgUrls}`)
    let targetImgUrl = imgUrls[materialMap[type].contentIndex]
    Bot.logger.debug(`图片URL ${targetImgUrl}`)

    let cacheData = await redis.get(materialMap[type].redisKey)
    if (!cacheData || cacheData != targetImgUrl) {
        if (!fs.existsSync(material_download_path)) {
            mkdirsSync(material_download_path)
        }
        Bot.logger.debug(`开始下载${type}素材表`)
        if (!await common.downFile(targetImgUrl + oss, `${material_download_path}/${type}素材.jpg`)) {
            return false
        }
        Bot.logger.debug(`下载${type}素材表完成`)
        redis.set(materialMap[type].redisKey, targetImgUrl, { EX: 3600 * 24 * 30 });
    }
    return true
}

export async function material_chart(e) {
    let msg = e.msg.replace(/#|＃|素材|/g, "");
    console.log(msg);
    let name = msg

    let img_status = await getMaterialsPic(name)
    if (!img_status) {
        Bot.logger.mark(`无法下载${type}素材表`)
    }

    let path = `${material_download_path}${name}素材.jpg`;
    console.log(path);
    if (fs.existsSync(path)) {
        //最后回复消息
        let msg = [
            segment.image(path),
            '[来源: 原神观测枢]',
        ];
        //发送消息
        e.reply(msg);
    } else {
        e.reply("查询失败~>_<");
    }
    return true;//返回true 阻挡消息不再往下
}

export async function primogems_expect(e) {
    let path = `${_path}/plugins/windoge-plugin/resources/materials/原石预估.png`;
    console.log(path);
    if (fs.existsSync(path)) {
        //最后回复消息
        let msg = [
            segment.image(path),
        ];
        //发送消息
        e.reply(msg);
    } else {
        e.reply("查询失败~>_<");
    }
    return true;//返回true 阻挡消息不再往下
}


