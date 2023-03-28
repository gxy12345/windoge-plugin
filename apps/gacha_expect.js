import fs from "fs";

//项目路径
const _path = process.cwd ();

export const rule = {
    gacha_expect: {
        reg: "^#(抽卡|[0-6]命)+期望+$",
        priority: 50,
        describe: "抽卡期望表"
    }
};

export async function gacha_expect(e) {
    let target_file_name
    if (/[0-6]命/.test(e.msg)) {
        target_file_name = `c${e.msg.match(/\d/g)[0]}.jpg`
    } else {
        target_file_name = 'all.jpg'
    }

    let path = `${_path}/plugins/windoge-plugin/resources/gachaExpect/${target_file_name}`;
    console.log (path);
    if (fs.existsSync (path)) {
        let msg = [
            segment.image (path),
            '[来源: NGA@一棵平衡树]',
        ];
        e.reply (msg);
    } else {
        e.reply ("查询失败~>_<");
    }
    return true;
}
