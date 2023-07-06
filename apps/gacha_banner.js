import fetch from "node-fetch";
import YAML from 'yaml'
import moment from 'moment'
import Common from "../components/Common.js";
import { Cfg } from "../components/index.js";
import { isV3 } from "../components/Changelog.js";

const _path = process.cwd();
const res_layout_path = `/plugins/windoge-plugin/resources/common/layout/`;
const character_banner_data_url = [
    "https://raw.githubusercontent.com/gxy12345/windoge-plugin/main/config/banner/character.json",
    "https://raw.fastgit.org/KeyPJ/FetchData/main/data/gacha/character.json",
    "https://raw.githubusercontent.com/KeyPJ/FetchData/main/data/gacha/character.json",
    "https://genshin-gacha-banners.52v6.com/data/character.json",
]
const weapon_banner_data_url = [
    "https://raw.githubusercontent.com/gxy12345/windoge-plugin/main/config/banner/weapon.json",
    "https://raw.fastgit.org/KeyPJ/FetchData/main/data/gacha/weapon.json",
    "https://raw.githubusercontent.com/KeyPJ/FetchData/main/data/gacha/weapon.json",
    "https://genshin-gacha-banners.52v6.com/data/weapon.json",
]
const weapon_nickname_data_url = "https://raw.githubusercontent.com/Nwflower/Atlas/master/resource/Forlibrary/Genshin-Atlas/othername/weapon.yaml"

const character_data_api = "https://info.minigg.cn/characters?query="
const weapon_data_api = "https://info.minigg.cn/weapons?query="

const charRedisKey = "windoge:banner:char"
const weaponRedisKey = "windoge:banner:weapon"
const weaponNicknameRedisKey = "windoge:nickname:weapon"

// 常驻角色&武器，用于过滤
const nameBlacklist = [
    "刻晴", "提纳里", "迪希雅",
    "狼的末路", "风鹰剑", "阿莫斯之弓", "四风原典", "和璞鸢",
    "天空之翼", "天空之刃", "天空之傲", "天空之卷", "天空之脊"
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

async function getData(url) {
    let response = await fetch(url, { method: 'get' })
    if (!response.ok) {
        return false
    }
    const res = await response.json()
    return res
}

async function getBannerData(is_character) {
    let redisKey = is_character ? charRedisKey : weaponRedisKey
    let cacheData = await redis.get(redisKey)
    if (cacheData) {
        return JSON.parse(cacheData)
    }
    let banner_data_index = Cfg.get("banner.data_source", 0)
    let target_url = is_character ? character_banner_data_url[banner_data_index] : weapon_banner_data_url[banner_data_index]
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

    redis.set(redisKey, JSON.stringify(banner_data), { EX: 900 });
    return banner_data
}

async function getWeaponNickName() {
    let cacheData = await redis.get(weaponNicknameRedisKey)
    if (cacheData) {
        return JSON.parse(cacheData)
    }
    let response = await fetch(weapon_nickname_data_url, { method: 'get' })
    if (!response.ok) {
        return false
    }
    let response_text = await response.text()
    let weapon_name_data = YAML.parse(response_text)
    redis.set(weaponNicknameRedisKey, JSON.stringify(weapon_name_data), { EX: 1800 });
    return weapon_name_data
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

async function keywordToWeaponFullName(keyword) {
    let weapon_name_data = await getWeaponNickName()
    if (!weapon_name_data) return keyword
    let find_key = (value, inNickname = (a, b) => a.includes(b)) => {
        return Object.keys(weapon_name_data).find(k => inNickname(weapon_name_data[k], value))
    }
    let full_name = find_key(keyword)
    if (Bot?.logger?.mark) {
        Bot.logger.mark(`武器匹配结果: ${full_name}`)
    } else {
        console.log(`武器匹配结果: ${full_name}`)
    }
    if (full_name === undefined) return keyword
    return full_name
}

async function getItemList(is_character = true, level = 5) {
    let banner_data = await getBannerData(is_character)
    let raw_list = banner_data.map(pool => pool.items.filter((val, key, arr) => {
        return val.rankType == level ? true : false
    }).map(item => item.name))
    let unique_list = []
    for (let pool of raw_list) {
        for (let item of pool) {
            let condition = !unique_list.includes(item)
            if (!Cfg.get("banner.show_permanent")) {
                condition = condition && !nameBlacklist.includes(item)
            }
            if (condition) {
                unique_list.push(item)
            }
        }
    }
    return unique_list
}

async function getSingleItemBanner(name, is_character = true) {
    let banner_data = await getBannerData(is_character)
    if (!banner_data) {
        return 0
    }
    let item_index = getFindLatestIndex(banner_data, name)
    if (item_index < 0) {
        return -1
    }
    let total_up_amount = getCountUpAmount(banner_data, name)
    if (total_up_amount == 0) {
        return -1
    }
    let pickUpGacha = banner_data[item_index];
    let item_info = pickUpGacha.items.find(item => item.name == name)
    let days = Math.floor(moment.duration(moment().diff(moment(pickUpGacha.end))).asDays())
    item_info.imageUrl = `https://upload-bbs.mihoyo.com/${item_info.imageUrl}`
    return {
        name: name,
        item_index: item_index,
        total_up_amount: total_up_amount,
        pool: {
            version: pickUpGacha.version.substr(0, 3),
            index: pickUpGacha.version.substr(pickUpGacha.version.length - 1, 1) === "1" ? "上半" : "下半",
            start: pickUpGacha.start,
            end: pickUpGacha.end,
            days: days,
        },
        item_info: item_info
    }
}


export async function getSingleBanner(e, { render }) {
    let keyword = e.msg.replace(/#|＃|复刻|复刻间隔|up|UP|Up/g, "");
    let isCharacter = true;
    let name;

    name = keywordToFullName(keyword)
    if (!name) {
        name = await keywordToWeaponFullName(keyword)
        isCharacter = false
    }

    let item_banner_data = await getSingleItemBanner(name, isCharacter)
    if (item_banner_data === 0) {
        e.reply('无法获取卡池数据，请稍后再试')
        return true
    }
    if (item_banner_data === -1) {
        e.reply('未查询到UP记录, 请检查名称是否正确')
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

export async function getMultipleBanner(e, { render }) {
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
        level: level == 4 ? "四" : "五"
    }
    let show_permanent = Cfg.get("banner.show_permanent")

    return await Common.render_path("banner/multiple", {
        banner_data_list,
        query_params,
        show_permanent,
    }, {
        e,
        render,
        scale: 1.2
    }, res_layout_path)
}

