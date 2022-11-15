import fs from "node:fs";
import fetch from "node-fetch";
import {
    Cfg,
    Data
} from "../components/index.js";
import {
    isV3
} from '../components/Changelog.js'
import Common from "../components/Common.js";

const _path = process.cwd();
const path_ = `/plugins/windoge-plugin/resources/common/layout/`;
const web_json = "./plugins/windoge-plugin/config/currency/web_currency.json"
const google_json = "./plugins/windoge-plugin/config/currency/google_currency.json"

function comparePrice(p) {
    return function (m, n) {
        var a = m[p];
        var b = n[p];
        return a - b;
    }
}

async function getRate() {
    const redisKey = "windoge:currency_rate"
    let cacheData = await redis.get(redisKey)
    if (cacheData) {
        return JSON.parse(cacheData)
    }
    //获取汇率
    let currency_list = {}
    let api_key = Cfg.get("os.currency_key")
    let currency_api = `https://v6.exchangerate-api.com/v6/${api_key}/latest/CNY`
    let param = {
        timeout: 10000,
        method: 'get',
    }
    let response = {}
    try {
        response = await fetch(currency_api, param)
    } catch (error) {
        Bot.logger.error(error.toString())
        return currency_list
    }
    if (!response.ok) {
        Bot.logger.error(`汇率接口请求失败] ${response.status} ${response.statusText}`)
        return currency_list
    }
    const res = await response.json()
    Bot.logger.debug(JSON.stringify(res))
    if (!res || !res.conversion_rates) {
        Bot.logger.mark('汇率接口没有返回数据')
        return currency_list
    }
    currency_list = res.conversion_rates

    redis.set(redisKey, JSON.stringify(currency_list), { EX: 1800 });
    return currency_list
}

export async function CurrencyRate(e, {render}) {
    if (!Cfg.get("os.currency_key")) {
        e.reply("未配置API Key，请先注册API Key，并使用【#windoge设置】配置后，再使用此功能。\n注册地址：https://www.exchangerate-api.com/")
        return true;
    }
    let currency_list = await getRate()
    if (Object.keys(currency_list).length === 0 ) {
        e.reply("汇率API请求失败")
        return true
    }
    let price_list = []
    Bot.logger.debug(JSON.stringify(currency_list))

    let json_data_path
    let platform
    if (/Google|谷歌|google|安卓/.test(e.msg)) {
        json_data_path = google_json
        platform = "Google"
    } else {
        json_data_path = web_json
        platform = "官网"
    }

    let currency_price_list = await fs.promises
        .readFile(json_data_path, 'utf8')
        .then((data) => {
            return JSON.parse(data)
        })
        .catch((err) => {
            logger.error('读取失败')
            console.error(err)
            return false
        })
    Bot.logger.debug(JSON.stringify(currency_price_list))

    for (let currency_key in currency_price_list) {
        Bot.logger.debug(`货币:${currency_key}, 价格:${currency_price_list[currency_key]}, 折合RMB价格:${currency_price_list[currency_key] / currency_list[currency_key]}`)
        let price_item = {
            currency: currency_key,
            currency_name: currency_price_list[currency_key].name,
            original_price: currency_price_list[currency_key].price,
            rmb_price: (currency_price_list[currency_key].price / currency_list[currency_key]).toFixed(2),
            discount: `${(currency_price_list[currency_key].price / currency_list[currency_key] / 648 * 100).toFixed(2)}%`
        }
        price_list.push(price_item)
    }

    price_list.sort(comparePrice("rmb_price"))
    let top_price_list = price_list
    if (!/all/.test(e.msg)) {
        top_price_list = price_list.slice(0, 8)
    }

    return await Common.render_path("currency/index", {
        top_price_list,
        platform,
        elem: "cryo",
    }, {
        e,
        render,
        scale: 1.2
    }, path_)
}

