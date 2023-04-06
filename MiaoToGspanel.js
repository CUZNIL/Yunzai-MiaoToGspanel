/*
功能：将miao-plugin产生的面板数据适配到gspanel，以便数据更新。推荐搭配https://gitee.com/CUZNIL/Yunzai-install。
项目地址：https://gitee.com/CUZNIL/Yunzai-MiaoToGspanel
2023年4月7日00:06:18
//*/

let MiaoPath = "data/UserData/"
let GspanelPath = "plugins/py-plugin/data/gspanel/cache/"

/*
MiaoPath：miao-plugin产生的面板数据路径，一般不用手动修改
GspanelPath：nonebot-plugin-gspanel产生的面板数据路径，需要手动配置到自己安装的路径。
如果你搭配我的云崽安装教程来安装gspanel，则不需要更改。教程地址https://gitee.com/CUZNIL/Yunzai-install
修改请注意保留结尾的“/”

以下内容一般不需要你手动修改，除非你需要高度个性化。需要请自行操刀。
//*/

let redisStart = "Yz:genshin:mys:qq-uid:"
let errorTIP = "请仔细阅读README，你没有正确配置！可能是以下原因：\n1.你不是通过py-plugin安装的nonebot-plugin-gspanel\n2.你没有正确配置nonebot-plugin-gspanel\n3.你没有正确配置本js插件\n。。。\n为解决本问题请自行阅读https://gitee.com/CUZNIL/Yunzai-MiaoToGspanel"
import { segment } from "oicq";
import fetch from "node-fetch";
import fs, { readdirSync } from 'node:fs'
import YAML from 'yaml'
import cfg from '../../lib/config/config.js'
export class MiaoToGspanel extends plugin {
  constructor() {
    super({
      name: '面板适配',
      event: 'message',
      priority: -233,
      rule: [
        {
          reg: '^#?转换(全部|所有)(喵喵|PY)?面板$',
          fnc: 'M2G_all',
          permission: 'master'
        },
        {
          reg: '^#?转换(喵喵|PY)?面板(\\d{9})?$',
          fnc: 'M2G_query',
        },
        {
          reg: '^测试$',
          fnc: 'help',
          permission: 'master'
        }
      ]
    })
  }
  async M2G_all() {
    if (!fs.existsSync(GspanelPath)) {
      this.reply(errorTIP)
      return false
    }
    let TimeStart = new Date().getTime()
    let KEYtoUID = await redis.keys(redisStart.concat("*"))
    let qq2uid = JSON.parse(fs.readFileSync(GspanelPath.concat("../qq-uid.json")))
    let succeed = 0
    let fail = 0
    let empty = 0
    for (let key of KEYtoUID) {
      let uid = await redis.get(key)
      if (!fs.existsSync(MiaoPath.concat(`${uid}.json`))) {
        empty++
      } else {
        let qq = await key.match(/\d+/g)
        let result = await this.M2G(uid)
        qq2uid[qq] = uid
        if (result) succeed++
        else fail++
      }
    }
    await fs.writeFileSync(await GspanelPath.concat("../qq-uid.json"), JSON.stringify(qq2uid))
    let TimeEnd = await new Date().getTime()
    this.reply(`报告主人！本次转换总计统计到${succeed + fail + empty}个uid，其中：\n${succeed ? `成功转换${succeed}个面板数据！` : "我超，所有转换都失败了，牛逼！"}\n${empty ? `没有面板数据的有${empty}个` : "没发现没有面板数据的用户"}！\n${fail ? `转换失败的有${fail}个` : "没有出现转换失败(好耶)"}！\n本次转换总计用时${TimeEnd - TimeStart}ms~`)
  }
  async M2G_query() {
    if (!fs.existsSync(GspanelPath)) {
      this.reply(errorTIP)
      return false
    }
    let uid = await this.e.msg.match(/\d+/g)
    let qq = await this.e.user_id
    if (!uid) {
      //如果uid为空，即未输入uid。根据发言人QQ判断其uid，查找失败提示。
      uid = await this.findUID(qq)
      if (!uid) {
        //如果uid为空，即redis没有绑定数据
        this.reply("哎呀！你好像没有绑定原神uid呢！发送“#绑定123456789”来绑定你的原神uid！")
        return false
      }
    } else {
      uid = uid[0]
    }
    if (!fs.existsSync(MiaoPath.concat(`${uid}.json`))) {
      this.reply("没有面板数据是不可以转换的！发送“#更新面板”来更新面板数据~")
      return false
    }
    let result = await this.M2G(uid)
    let qq2uid = JSON.parse(fs.readFileSync(GspanelPath.concat("../qq-uid.json")))
    qq2uid[qq] = uid
    fs.writeFileSync(await GspanelPath.concat("../qq-uid.json"), JSON.stringify(qq2uid))
    if (result) this.reply(`成功转换UID${uid}的面板数据~`)
    else this.reply(`转换UID${uid}的面板数据失败了orz`)
  }
  async M2G(uid) {
    //调用前已经判断过该uid一定有面板数据，并且所有路径无误，所以接下来就是修改面板数据以适配Gspanel
    let Miao = JSON.parse(fs.readFileSync(MiaoPath.concat(`${uid}.json`)))
    let char_data = JSON.parse(fs.readFileSync(GspanelPath.concat("../char-data.json")))

    //TODO 修正面板数据，在对应目录生成文件。返回值表示处理结果(true：转换成功，false：转换失败)
    let Gspanel = JSON.parse(`{"avatars": [],"next":${Miao._profile}}`)
    for (let i in Miao.avatars) {
      let id = Miao.avatars[i].id
      let char = JSON.parse(`{
"id":${id},
"rarity":4,
"name":"${Miao.avatars[i].name}",
"slogan":"123",
"element":"冰",
"cons":${Miao.avatars[i].cons},
"fetter":${Miao.avatars[i].fetter},
"level":${Miao.avatars[i].level},
"icon":"UI_AvatarIcon_AyakaCostumeFruhling",
"gachaAvatarImg": "UI_Costume_AyakaCostumeFruhling",
"baseProp":{},
"fightProp":{},
"skills":{},
"consts":[],
"weapon":{},
"relics":[],
"relicSet":{},
"relicCalc":{},
"damage":{},
"time":${Miao.avatars[i]._time}
}
`)


      char.rarity = 5
      Gspanel.avatars[Gspanel.avatars.length] = char
    }


    fs.writeFileSync(await GspanelPath.concat(`${uid}.json`), JSON.stringify(Gspanel))
    //fs.writeFileSync(await GspanelPath.concat(`${uid}.json`), JSON.stringify(char_data[10000002].Slogan))
    return true
  }
  async findUID(QQ) {
    //根据QQ号判断对应uid，返回null表示没有对应uid。
    let uid = await redis.get(redisStart.concat(`${QQ}`))
    return uid
  }
  async help() {



    await this.reply(` ${fs.readFileSync(GspanelPath.concat("../qq-uid.json"))}`)
  }
}

