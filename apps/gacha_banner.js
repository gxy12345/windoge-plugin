import fetch from "node-fetch";
import Common from "../components/Common.js";
import { Cfg } from "../components/index.js";
import { isV3 } from "../components/Changelog.js";

const _path = process.cwd();
const res_layout_path = `/plugins/windoge-plugin/resources/common/layout/`;
const character_banner_data_url = "https://genshin-gacha-banners.52v6.com/data/character.json"
const weapon_banner_data_url = "https://genshin-gacha-banners.52v6.com/data/weapon.json"

const character_data_api = "https://info.minigg.cn/characters?query="
const weapon_data_api = "https://info.minigg.cn/weapons?query="

const charRedisKey = "windoge:banner:char"
const weaponRedisKey = "windoge:banner:weapon"

const nameBlacklist = [
    "刻晴",
    "提纳里"
]

const getFindLatestIndex = (data, name) => {
    return data.map(gacha => gacha.items.map(i => i.name).includes(name)).findIndex(tf => tf);
};

const getCountUpAmount = (data, name) => {
    let up_pool_list = data.map(gacha => gacha.items.map(i => i.name).includes(name))
    let count = 0
    for (let is_up of up_pool_list) {
        if (is_up) count++
    }
    return count
};

let Botcfg;
if (isV3) {
    Botcfg = (await import(`file://${_path}/plugins/genshin/model/gsCfg.js`)).default;
} else {
    Botcfg = YunzaiApps.mysInfo
}

async function getData (url) {
    let response = await fetch(url, { method: 'get' })
    if (!response.ok) {
      return false
    }
    const res = await response.json()
    return res
}

async function getBannerData (is_character) {
    let redisKey = is_character ? charRedisKey : weaponRedisKey
    let cacheData = await redis.get(redisKey)
    if (cacheData) {
      return JSON.parse(cacheData)
    }
    let target_url = is_character ? character_banner_data_url : weapon_banner_data_url
    let banner_data = await getData(target_url)
    // 处理角色名不对应的数据
    if (is_character) {
        banner_data.forEach(pool => {
            pool.items = pool.items.map((val, index, arr) => {
                val.name = keywordToFullName(val.name)
                return val
            })
        });
    }

    Bot.logger.debug(JSON.stringify(banner_data))
    redis.set(redisKey, JSON.stringify(banner_data), { EX: 900 });
    return banner_data
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

async function getItemList (is_character=true, level=5) {
    let banner_data = await getBannerData(is_character)
    let raw_list = banner_data.map(pool => pool.items.filter((val, key, arr) => {
        return val.rankType == level ? true : false
    }).map(item => item.name))
    let unique_list = []
    for (let pool of raw_list) {
        for (let item of pool) {
            if (!unique_list.includes(item) && !nameBlacklist.includes(item)) {
                unique_list.push(item)
            }
        }
    }
    Bot.logger.debug(JSON.stringify(unique_list))
    return unique_list
}

async function getSingleItemBanner(name, is_character=true) {
    let banner_data = await getBannerData(is_character)
    if (!banner_data) {
        return 0
    }
    let item_index = getFindLatestIndex(banner_data, name)
    if (item_index<0) {
        return -1
    }
    let total_up_amount = getCountUpAmount(banner_data, name)
    if (total_up_amount == 0) {
        return -1
    }
    let pickUpGacha = banner_data[item_index];
    let item_info = pickUpGacha.items.find(item => item.name == name)
    item_info.imageUrl = `https://upload-os-bbs.mihoyo.com/${item_info.imageUrl}`
    return {
        name: name,
        item_index: item_index,
        total_up_amount: total_up_amount,
        pool: {
            version: pickUpGacha.version.substr(0, 3),
            index: pickUpGacha.version.substr(pickUpGacha.version.length-1,1) === "1" ? "上半" : "下半",
            start: pickUpGacha.start,
            end: pickUpGacha.end,
        },
        item_info: item_info
    }
}


export async function getSingleBanner(e, {render}) {
    let keyword = e.msg.replace(/#|＃|复刻|复刻间隔|up|UP|Up/g, "");
    let isCharacter = true;
    let name;
    
    name = keywordToFullName(keyword)
    if (!name) {
        name = keyword
        isCharacter = false
    }

    let item_banner_data = await getSingleItemBanner(name, isCharacter)
    if (item_banner_data === 0) {
        e.reply('无法获取卡池数据，请稍后再试')
        return true
    }
    if (item_banner_data === -1) {
        e.reply('未查询到UP记录, 请检查名称是否正确。 注意：武器只支持全名查询')
        return true
    }
    let msg = []
    let bg_elem;
    if (isCharacter) {
        bg_elem = item_banner_data.item_info.element.toLowerCase()
    } else {
        bg_elem = item_banner_data.item_info.rankType === 5 ? "geo" : "electro"
    }

    return await Common.render_path("banner/single", {
        item_banner_data,
        elem: bg_elem,
    }, {
        e,
        render,
        scale: 1.2
    }, res_layout_path)
}

export async function getMultipleBanner(e, {render}) {
    if (!/角色|武器/.test(e.msg)) {
        e.reply("请回复 #未复刻(4星/5星)角色 或 #未复刻(4星/5星)武器 进行查询")
        return true
    }
    let level = /四星|4星/.test(e.msg) ? 4 : 5
    let is_character = /角色/.test(e.msg)
    let full_item_list = await getItemList(is_character, level)

    let banner_data_list = []
    for (let name of full_item_list) {
        let item_banner_info = await getSingleItemBanner(name, is_character)
        if (item_banner_info === 0 || item_banner_info === -1) continue
        banner_data_list.push(item_banner_info)
    }
    banner_data_list.reverse()
    let query_params = {
        is_character: is_character,
        level: level
    }

    Bot.logger.debug(JSON.stringify(banner_data_list))

    return await Common.render_path("banner/multiple", {
        banner_data_list,
        query_params,
    }, {
        e,
        render,
        scale: 1.2
    }, res_layout_path)
}
