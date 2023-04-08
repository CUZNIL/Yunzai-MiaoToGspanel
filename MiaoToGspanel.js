/*
功能：将miao-plugin产生的面板数据适配到gspanel，以便数据更新。推荐搭配https://gitee.com/CUZNIL/Yunzai-install。
项目地址：https://gitee.com/CUZNIL/Yunzai-MiaoToGspanel
2023年4月8日23:52:00
//*/

let MiaoPath = "data/UserData/"
let GspanelPath = "plugins/py-plugin/data/gspanel/cache/"
let MiaoResourecePath = "plugins/miao-plugin/resources/meta/"

/*
MiaoPath：miao-plugin产生的面板数据路径，一般不用手动修改。
GspanelPath：nonebot-plugin-gspanel产生的面板数据路径，需要手动配置到自己安装的路径。
MiaoResourecePath：miao-plugin安装位置下对应的资料数据存放路径，一般不用修改。
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
    try {
      //调用前已经判断过该uid一定有面板数据，并且所有路径无误，所以接下来就是修改面板数据以适配Gspanel
      //修正面板数据，在对应目录生成文件。返回值表示处理结果(true：转换成功，false：转换失败)
      let Miao = JSON.parse(fs.readFileSync(MiaoPath.concat(`${uid}.json`)))
      //char_data_Gspanel:Gspanel面板的所有角色的资料
      let char_data_Gspanel = JSON.parse(fs.readFileSync(GspanelPath.concat("../char-data.json")))
      let Gspanel = JSON.parse(`{"avatars": [],"next":${Miao._profile}}`)
      for (let i in Miao.avatars) {
        //MiaoChar：喵喵面板的具体一个角色的数据
        let MiaoChar = Miao.avatars[i]
        if (MiaoChar._source == "mys") continue;
        //char_Miao：喵喵面板的具体一个角色的资料
        let char_Miao = JSON.parse(fs.readFileSync(MiaoResourecePath.concat(`character/${MiaoChar.name}/data.json`)))
        //result：Gspanel面板的具体一个角色的数据
        let result = JSON.parse(`{"id":${char_Miao.id},"rarity":${char_Miao.star},"name":"${MiaoChar.name}","slogan":"${char_Miao.title}","element":"${MiaoChar.elem}","cons":${MiaoChar.cons},"fetter":${MiaoChar.fetter},"level":${MiaoChar.level},"icon":"UI_AvatarIcon_Playerboy","gachaAvatarImg": "UI_Gacha_AvatarImg_Playerboy","baseProp":{"生命值":${char_Miao.baseAttr.hp},"攻击力":${char_Miao.baseAttr.atk},"防御力":${char_Miao.baseAttr.def}},
"fightProp":{
  "生命值": 27848.5625,
  "攻击力": 1135.0613049109488,
  "防御力": 1009.6231079101562,
  "暴击率": 86.86199188232422,
  "暴击伤害": 189.45999145507812,
  "治疗加成": 0,
  "元素精通": 69.94000244140625,
  "元素充能效率": 109.7100019454956,
  "物理伤害加成": 0,
  "火元素伤害加成": 61.59999966621399,
  "水元素伤害加成": 0,
  "风元素伤害加成": 0,
  "雷元素伤害加成": 15.000000596046448,
  "草元素伤害加成": 0,
  "冰元素伤害加成": 0,
  "岩元素伤害加成": 0
},
"skills":{"a":{"style":"","icon":"Skill_A_01","level":${MiaoChar.talent.a},"originLvl":${MiaoChar.talent.a}},"e":{"style":"","icon":"Skill_S_Player_01","level":${MiaoChar.talent.e},"originLvl":${MiaoChar.talent.e}},"q":{"style":"","icon":"Skill_E_Player","level":${MiaoChar.talent.q},"originLvl":${MiaoChar.talent.q}}},
"consts":[],
"weapon":{
  "id": 13405,
  "rarity": 5,
  "name": "${MiaoChar.weapon.name}",
  "affix": ${MiaoChar.weapon.affix},
  "level": ${MiaoChar.weapon.level},
  "icon": "UI_EquipIcon_Pole_Gladiator",
  "main": 454,
  "sub": {
    "prop": "暴击率",
    "value": "36.8%"
  }
},
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
        if (result.cons >= char_Miao.talentCons.e) {
          result.skills.e.style = "extra"
          result.skills.e.level += 3
        }
        if (result.cons >= char_Miao.talentCons.q) {
          result.skills.q.style = "extra"
          result.skills.q.level += 3
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
          if (MiaoChar.costume != 0) {
            //有皮肤，用对应图标
            result.icon = char_Gspanel.Costumes[MiaoChar.costume].icon
            result.gachaAvatarImg = char_Gspanel.Costumes[MiaoChar.costume].art
          } else {
            //没皮肤，用默认图标
            result.icon = char_Gspanel.iconName
            result.gachaAvatarImg = `UI_Gacha_AvatarImg_${char_Gspanel.Name}`
          }
          //技能图标
          result.skills.a.icon = char_Gspanel.Skills[char_Gspanel.SkillOrder[0]]
          result.skills.e.icon = char_Gspanel.Skills[char_Gspanel.SkillOrder[1]]
          result.skills.q.icon = char_Gspanel.Skills[char_Gspanel.SkillOrder[2]]
          result.consts = JSON.parse(`[{"style":"","icon":"${char_Gspanel.Consts[0]}"},{"style":"","icon":"${char_Gspanel.Consts[1]}"},{"style":"","icon":"${char_Gspanel.Consts[2]}"},{"style":"","icon":"U${char_Gspanel.Consts[3]}"},{"style":"","icon":"${char_Gspanel.Consts[4]}"},{"style":"","icon":"${char_Gspanel.Consts[5]}"}]`)
        }
        //TODO：fightProp weapon relics relicSet relicCalc damage





        Gspanel.avatars[Gspanel.avatars.length] = result
      }


      fs.writeFileSync(await GspanelPath.concat(`${uid}.json`), JSON.stringify(Gspanel))

    } catch (e) {
      console.log(e)
      return false
    }
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
