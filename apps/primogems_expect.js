import fs from "fs";
import path from "path";
import fetch from "node-fetch";
import common from '../../../lib/common/common.js'

const _path = process.cwd();
const resourceDir = `${_path}/plugins/windoge-plugin/resources/primogems_expect`

export async function primogems_expect(e) {
    let match = /^#?([1-9]\.[0-9])?原石(预估|预期)$/.exec(e.msg)
    let versionName
    let fileName
    if (match) {
        versionName = match[1]
    }
    if (!versionName) {
        let res_files = fs.readdirSync(resourceDir)
        res_files = res_files.filter((file)=> {
            return file.endsWith('.png')
        })
        res_files.sort()
        res_files.reverse()
        fileName = res_files[0]
    } else {
        fileName = `${versionName}原石预估.png`
    }
    
    let path = `${resourceDir}/${fileName}`;
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
