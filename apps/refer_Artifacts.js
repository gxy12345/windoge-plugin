import fs from "fs";
import { isV3 } from "../components/Changelog.js";

//项目路径
const _path = process.cwd ();

//简单应用示例

//1.定义命令规则
export const rule = {
    refer_Artifacts: {
        reg: "^#*[^-~]+参考面板+$",  //匹配消息正则，命令正则
        priority: 1, //优先级，越小优先度越高
        describe: "参考面板" //【命令】功能说明
    }
};

//2.编写功能方法
//方法名字与rule中的sample保持一致
//测试命令 npm test 示例
export async function refer_Artifacts (e) {
    let msg = e.msg.replace(/#|＃|参考面板|/g, "");
    let Botcfg;
    let id;
    if (isV3) {
        Botcfg = (await import(`file://${_path}/plugins/genshin/model/gsCfg.js`)).default;
        id = Botcfg.roleNameToID(msg);
    } else {
        Botcfg = YunzaiApps.mysInfo
        id = Botcfg.roleIdToName(msg);
    }
    let name;
    if (["10000005", "10000007", "20000000"].includes(id)) {
        if (!["风主", "岩主", "雷主", "草主", "水主"].includes(msg)) {
            e.reply("请输入风主/岩主/雷主/草主/水主参考面板~");
            return true;
        }
        name = msg;
    } else {
        if (isV3) {
            name = Botcfg.roleIdToName(id);
        } else {
            name = Botcfg.roleIdToName(id, true);
        }
        if (!name) return true;
    }
    let path = `${_path}/plugins/windoge-plugin/resources/refer_Artifacts/${name}.png`;
    console.log (path);
    if (fs.existsSync (path)) {
        //最后回复消息
        let msg = [
            segment.image (path),
            '[来源:nga @bluemushoom]',
        ];
        //发送消息
        e.reply (msg);
    } else {
        e.reply ("打咩，查无此角色参考面板~>_<");
    }
    return true;//返回true 阻挡消息不再往下
}
