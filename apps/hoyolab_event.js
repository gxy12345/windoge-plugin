import fs from "fs";
import fetch from "node-fetch";
import { segment } from "oicq";
import {
    Cfg,
    Data
} from "../components/index.js";
import utils from "./utils.js";


const _path = process.cwd();
const HoyolabEventListApiUrl = "https://bbs-api-os.hoyolab.com/community/community_contribution/wapi/event/list?gids=2&size=15"
const HoyolabWebHost = "https://www.hoyolab.com"
const reqHeaders = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36",
    "x-rpc-client_type": 4,
    "x-rpc-language": "zh-cn",
    "x-rpc-show-translated": true,
}

async function getEvent(moreEvent=false) {
    const redisKey = "windoge:hoyolab:event"
    let cacheData = await redis.get(redisKey)
    if (cacheData) {
      return JSON.parse(cacheData)
    }
    let param = {
        headers: reqHeaders,
        timeout: 10000,
        method: 'get',
    }
    let eventList = []

    let response = {}
    try {
        response = await fetch(HoyolabEventListApiUrl, param)
    } catch (error) {
        Bot.logger.error(error.toString())
        return eventList
    }
    if (!response.ok) {
        Bot.logger.error(`Hoyolab event接口请求失败] ${response.status} ${response.statusText}`)
        return eventList
    }
    const res = await response.json()
    if (!res) {
        Bot.logger.mark('Hoyolab Event接口没有返回')
        return eventList
    }

    if (res.retcode !== 0) {
        Bot.logger.mark(`Hoyolab event接口请求错误, 参数:${JSON.stringify(param)}`)
        return eventList``
    }

    let now = Date.now() / 1000

    res.data.list.forEach(val => {
        // hoyo quiz的结束时间约等于答题活动结束
        if (val.name.includes('HoYo Quiz') && val.name.includes('场次公开') && val.end >= now) {
            Bot.logger.debug(`获取到满足条件的活动,${val.name}, ${val.desc}`)
            eventList.push(
                {
                    event_detail: val,
                    event_type: 'HoYo Quiz'
                }
            )
        }
        
        // 直播活动报名结束时间，一般为开始时间后7天
        if (val.name.includes('Twitch创作者成长营') && val.end >= now) {
            Bot.logger.debug(`获取到满足条件的活动,${val.name}, ${val.desc}`)
            let sub_type
            if (now - val.start < 3600 * 24 * 7) {
                sub_type = 'Twitch创作者成长营-报名中'
            } else {
                sub_type = 'Twitch创作者成长营-已开始'
            }

            eventList.push(
                {
                    event_detail: val,
                    event_type: sub_type
                }
            )
        }

        // 网页活动，因为奖励包含抽奖，且不一定准确，开启开关后再显示
        if (moreEvent && val.name.includes('网页活动') && (/原石|游戏内道具/.test(val.desc) || /原石|游戏内道具/.test(val.name)) && val.end >= now) {
            Bot.logger.debug(`获取到满足条件的活动,${val.name}, ${val.desc}`)
            eventList.push(
                {
                    event_detail: val,
                    event_type: '网页活动'
                }
            )
        }
    });
    redis.set(redisKey, JSON.stringify(eventList), { EX: 600 });
    return eventList
}

// 咕咕
export async function eventPushJob(e) {
    if (!Cfg.get("hoyolab.event")) {
        return false;
    }
    if (e.msg) return false; // 注释这一行，master就可以手动发起推送了
    if (e.msg && !e.isMaster) {
        return false;
    }

}

export async function checkEvent(e) {
    let eventList = []
    if (Cfg.get("hoyolab.more_event")) {
        Bot.logger.debug(`查询更多活动`)
        eventList = await getEvent(true)
    } else {
        eventList = await getEvent(false)
    }
    let needMakeMsg = eventList.length > 1

    let msg = ""
    let msgData = []

    if (eventList.length == 0){
        msg = "暂时未查询到hoyolab活动"
    } else {
        let descContent = ""
        msg = "当前hoyolab可获得原石活动如下:"
        if (needMakeMsg) {
            msgData.push(msg)
            msg = ''
        }
        else {
            msg += "\n"
        }
        for (let event of eventList) {
            msg += `[${event.event_type}]${event.event_detail.name}\n`
            descContent = `活动描述:${event.event_detail.desc}`
            if (descContent.length > 75) {
                descContent = `${descContent.substring(0, 72)}...`
            }
            msg += `${descContent}\n`
            msg += `${HoyolabWebHost}${event.event_detail.web_path}`
            if (event.event_type.includes('Twitch创作者成长营')) {
                msg += "\nTwitch创作者成长营参加指南: https://docs.qq.com/doc/DQ3hqQXp4V21idUZJ"
            }
            if (needMakeMsg) {
                msgData.push(msg)
                msg = ''
            }
        }
    }
    if (needMakeMsg) {
        await utils.replyMake(e, msgData, 0)
    } else {
        e.reply(msg)
    }
    return true
}

