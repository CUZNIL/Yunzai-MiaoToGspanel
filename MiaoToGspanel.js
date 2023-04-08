/*
功能：将miao-plugin产生的面板数据适配到gspanel，以便数据更新。推荐搭配https://gitee.com/CUZNIL/Yunzai-install。
项目地址：https://gitee.com/CUZNIL/Yunzai-MiaoToGspanel
2023年4月8日16:17:48
//*/

let MiaoPath = "data/UserData/"
let GspanelPath = "plugins/py-plugin/data/gspanel/cache/"
let MiaoResourecePath = "plugins/miao-plugin/resources/meta/character/"

/*
MiaoPath：miao-plugin产生的面板数据路径，一般不用手动修改。
GspanelPath：nonebot-plugin-gspanel产生的面板数据路径，需要手动配置到自己安装的路径。
MiaoResourecePath：miao-plugin安装位置下对应的角色资料数据存放路径，一般不用修改。
如果你搭配我的云崽安装教程来安装gspanel，则不需要更改任何内容。教程地址https://gitee.com/CUZNIL/Yunzai-install
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
    //修正面板数据，在对应目录生成文件。返回值表示处理结果(true：转换成功，false：转换失败)
    let Miao = JSON.parse(fs.readFileSync(MiaoPath.concat(`${uid}.json`)))
    //char_data_Gspanel:Gspanel面板的所有角色的资料
    let char_data_Gspanel = JSON.parse(fs.readFileSync(GspanelPath.concat("../char-data.json")))
    let Gspanel = JSON.parse(`{"avatars": [],"next":${Miao._profile}}`)
    for (let i in Miao.avatars) {
      //MiaoChar：喵喵面板的具体一个角色的数据
      //result：Gspanel面板的具体一个角色的数据
      let MiaoChar = Miao.avatars[i]
      let result = JSON.parse(`{"id":${MiaoChar.id},"rarity":5,"name":"${MiaoChar.name}","slogan":"异界的旅人","element":"${MiaoChar.elem}","cons":${MiaoChar.cons},"fetter":${MiaoChar.fetter},"level":${MiaoChar.level},"icon":"UI_AvatarIcon_Playerboy","gachaAvatarImg": "UI_Gacha_AvatarImg_Playerboy","baseProp":{"生命值": 10875.0,"攻击力": 212.4,"防御力": 682.5},
"fightProp":{},
"skills":{},
"consts":[],
"weapon":{},
"relics":[],
"relicSet":{},
"relicCalc":{},
"damage":{},
"time":${MiaoChar._time}
}
`)
      switch (result.element) {
        case "pyro":
          result.element = "火"
          break
        case "hydro":
          result.element = "水"
          break
        case "cryo":
          result.element = "冰"
          break
        case "electro":
          result.element = "雷"
          break
        case "anemo":
          result.element = "风"
          break
        case "geo":
          result.element = "岩"
          break
        case "dendro":
          result.element = "草"
          break
        default:
      }
      if (MiaoChar.id == "10000007" || MiaoChar.id == "10000005") {
        //主角在Gspanel的char-data.json没有数据！只能单独设置了orz
        if (MiaoChar.id == "10000007") {
          //如果是妹妹
          result.icon = "UI_AvatarIcon_Playergirl"
          result.gachaAvatarImg = "UI_Gacha_AvatarImg_Playergirl"
        }
      } else {
        //char_Gspanel：Gspanel面板的具体一个角色的资料
        let char_Gspanel = char_data_Gspanel[MiaoChar.id]
        /*为了方便编写查阅，下面是一个示例：      
        {
          "Element": "Ice",
          "Name": "Ayaka",
          "NameCN": "神里绫华",
          "Slogan": "白鹭霜华",
          "NameTextMapHash": 1006042610,
          "QualityType": "QUALITY_ORANGE",
          "iconName": "UI_AvatarIcon_Ayaka",
          "SideIconName": "UI_AvatarIcon_Side_Ayaka",
          "Base": {
            "hpBase": 1000.9860229492188,
            "attackBase": 26.62660026550293,
            "defenseBase": 61.0265998840332
          },
          "Consts": [
            "UI_Talent_S_Ayaka_01",
            "UI_Talent_S_Ayaka_02",
            "UI_Talent_U_Ayaka_02",
            "UI_Talent_S_Ayaka_03",
            "UI_Talent_U_Ayaka_01",
            "UI_Talent_S_Ayaka_04"
          ],
          "SkillOrder": [
            10024,
            10018,
            10019
          ],
          "Skills": {
            "10024": "Skill_A_01",
            "10018": "Skill_S_Ayaka_01",
            "10019": "Skill_E_Ayaka"
          },
          "ProudMap": {
            "10024": 231,
            "10018": 232,
            "10019": 239
          },
          "Costumes": {
            "200201": {
              "sideIconName": "UI_AvatarIcon_Side_AyakaCostumeFruhling",
              "icon": "UI_AvatarIcon_AyakaCostumeFruhling",
              "art": "UI_Costume_AyakaCostumeFruhling",
              "avatarId": 10000002
            }
          }
        }
        // */
        if (char_Gspanel.QualityType == "QUALITY_PURPLE") {
          result.rarity = 4
        }
        result.slogan = char_Gspanel.Slogan
        if (MiaoChar.costume != 0) {
          //有皮肤，用对应图标
          result.icon = char_Gspanel.Costumes[MiaoChar.costume].icon
          result.gachaAvatarImg = char_Gspanel.Costumes[MiaoChar.costume].art
        } else {
          //没皮肤，用默认图标
          result.icon = char_Gspanel.iconName
          result.gachaAvatarImg = `UI_Gacha_AvatarImg_${char_Gspanel.Name}`
        }
      }
      //char_Miao：喵喵面板的具体一个角色的资料
      let char_Miao = JSON.parse(fs.readFileSync(MiaoResourecePath.concat(`${result.name}/data.json`)))
      /*为了方便编写查阅，下面是一个示例：
      {
        "id": 10000029,
        "name": "可莉",
        "abbr": "可莉",
        "title": "逃跑的太阳",
        "star": 5,
        "elem": "pyro",
        "allegiance": "西风骑士团",
        "weapon": "catalyst",
        "birth": "7-27",
        "astro": "四叶草座",
        "desc": "西风骑士团禁闭室的常客，蒙德的爆破大师。人称「逃跑的太阳」。",
        "cncv": "花玲",
        "jpcv": "久野美咲",
        "costume": false,
        "ver": 1,
        "baseAttr": {
          "hp": 10287,
          "atk": 310.93,
          "def": 614.84
        },
        "growAttr": {
          "key": "dmg",
          "value": 28.8
        },
        "talentId": {
          "10291": "a",
          "10292": "e",
          "10295": "q"
        },
        "talentCons": {
          "e": 3,
          "q": 5
        },
        "materials": {
          "gem": "燃愿玛瑙",
          "boss": "常燃火种",
          "specialty": "慕风蘑菇",
          "normal": "禁咒绘卷",
          "talent": "「自由」的哲学",
          "weekly": "北风之环"
        }
      }
      //*/








      //TODO：baseProp fightProp skills consts weapon relics relicSet relicCalc damage





      Gspanel.avatars[Gspanel.avatars.length] = result
    }
    fs.writeFileSync(await GspanelPath.concat(`${uid}.json`), JSON.stringify(Gspanel))
    return false
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

