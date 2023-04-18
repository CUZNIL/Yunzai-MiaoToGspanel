/*
功能：将miao-plugin产生的面板数据适配到gspanel，以便数据更新。推荐搭配https://gitee.com/CUZNIL/Yunzai-install。
项目地址：https://gitee.com/CUZNIL/Yunzai-MiaoToGspanel
2023年4月19日00:57:30
//*/

let MiaoPath = "data/UserData/"
let GspanelPath = "plugins/py-plugin/data/gspanel/cache_test/"
//尚未开发完全，新建cache_test文件夹做为测试区域
let MiaoResourecePath = "plugins/miao-plugin/resources/meta/"

/*
MiaoPath：miao-plugin产生的面板数据路径，一般不用手动修改。
GspanelPath：nonebot-plugin-gspanel产生的面板数据路径，需要手动配置到自己安装的路径。
MiaoResourecePath：miao-plugin安装位置下对应的资料数据存放路径，一般不用修改。
如果你搭配我的云崽安装教程来安装gspanel，则不需要更改任何内容。云崽安装教程：https://gitee.com/CUZNIL/Yunzai-install
修改请注意保留结尾的“/”

以下内容一般不需要你手动修改，除非你需要高度个性化。需要请自行操刀。
//*/
import fs from 'node:fs'

let redisStart = "Yz:genshin:mys:qq-uid:"
let errorTIP = "请仔细阅读README，你没有正确配置！可能是以下原因：\n1.你不是通过py-plugin安装的nonebot-plugin-gspanel\n2.你没有正确配置nonebot-plugin-gspanel\n3.你没有正确配置本js插件\n。。。\n为解决本问题请自行阅读https://gitee.com/CUZNIL/Yunzai-MiaoToGspanel"
let pluginINFO = "【MiaoToGspanel插件】"
//resource:该插件产生的中间文件存放的文件夹位置，如需修改请自行创建对应文件夹。
let resource = "resources/MiaoToGspanel/"
if (!fs.existsSync(`${resource}`)) {
  console.log(`${pluginINFO}检测到没有文件夹${resource}！即将创建该文件夹用于存放部分数据。`)
  fs.mkdirSync(`${resource}`)
}
//char_data_Gspanel:Gspanel面板的所有角色的资料
let char_data_Gspanel = JSON.parse(fs.readFileSync(GspanelPath.concat("../char-data.json")))
//WeaponID_To_IconName:武器ID到图标名称的映射
let WeaponID_To_IconName
try {
  WeaponID_To_IconName = JSON.parse(fs.readFileSync(resource.concat("WeaponID_To_IconName.json")))
} catch (e) {
  console.log(`${pluginINFO}${logger.red(e)}\n${pluginINFO}推测报错原因为没有插件运行必要的WeaponID_To_IconName.json，即将尝试下载该文件以便调用！`)
  let ret = await new Promise((resolve, reject) => { exec(`cd ${resource} && curl -O https://gitee.com/CUZNIL/Yunzai-MiaoToGspanel/raw/master/download/WeaponID_To_IconName.json`, (error, stdout, stderr) => { resolve({ error, stdout, stderr }) }) })
  logger.mark(`${pluginINFO}尝试下载中。。\n${ret.stdout.trim()}\n${ret.stderr.trim()}`)
  console.log(`${pluginINFO}下载完毕！该文件可能过时！\n${pluginINFO}如出现武器图标错误请发送#武器数据更新 。\n下载位置：${resource}WeaponID_To_IconName.json`)
  try {
    WeaponID_To_IconName = JSON.parse(fs.readFileSync(resource.concat("WeaponID_To_IconName.json")))
  } catch (e2) {
    console.log(`${logger.red(`${pluginINFO}${e2}\n${pluginINFO}没有解决报错！请将日志反馈到下面的项目地址处！\nhttps://gitee.com/CUZNIL/Yunzai-MiaoToGspanel/issues\n反馈issue可以帮助改善插件！`)}`)
  }
}
//PlayerElem_To_ConsIconName:旅行者元素到命座图标的映射
let PlayerElem_To_ConsIconName
try {
  PlayerElem_To_ConsIconName = JSON.parse(fs.readFileSync(resource.concat("PlayerElem_To_ConsIconName.json")))
} catch (e) {
  console.log(`${pluginINFO}${logger.red(e)}\n${pluginINFO}推测报错原因为没有插件运行必要的PlayerElem_To_ConsIconName.json，即将尝试下载该文件以便调用！`)
  let ret = await new Promise((resolve, reject) => { exec(`cd ${resource} && curl -O https://gitee.com/CUZNIL/Yunzai-MiaoToGspanel/raw/master/download/PlayerElem_To_ConsIconName.json`, (error, stdout, stderr) => { resolve({ error, stdout, stderr }) }) })
  logger.mark(`${pluginINFO}尝试下载中。。\n${ret.stdout.trim()}\n${ret.stderr.trim()}`)
  console.log(`${pluginINFO}下载完毕！该文件可能过时！\n${pluginINFO}如出现旅行者命座图标错误请发送#主角命座更新 。\n下载位置：${resource}PlayerElem_To_ConsIconName.json`)
  try {
    PlayerElem_To_ConsIconName = JSON.parse(fs.readFileSync(resource.concat("PlayerElem_To_ConsIconName.json")))
  } catch (e2) {
    console.log(`${logger.red(`${pluginINFO}${e2}\n${pluginINFO}没有解决报错！请将日志反馈到下面的项目地址处！\nhttps://gitee.com/CUZNIL/Yunzai-MiaoToGspanel/issues\n反馈issue可以帮助改善插件！`)}`)
  }
}
//attr_map:属性id到属性英文的映射+属性英文到属性中文的映射
let attr_map
try {
  attr_map = JSON.parse(fs.readFileSync(resource.concat("attr_map.json")))
} catch (e) {
  console.log(`${pluginINFO}${logger.red(e)}\n${pluginINFO}推测报错原因为没有插件运行必要的attr_map.json，即将尝试下载该文件以便调用！`)
  let ret = await new Promise((resolve, reject) => { exec(`cd ${resource} && curl -O https://gitee.com/CUZNIL/Yunzai-MiaoToGspanel/raw/master/download/attr_map.json`, (error, stdout, stderr) => { resolve({ error, stdout, stderr }) }) })
  logger.mark(`${pluginINFO}尝试下载中。。\n${ret.stdout.trim()}\n${ret.stderr.trim()}`)
  console.log(`${pluginINFO}下载完毕！该文件可能过时！\n${pluginINFO}如出现属性昵称错误请发送#属性映射更新 。\n下载位置：${resource}attr_map.json`)
  try {
    attr_map = JSON.parse(fs.readFileSync(resource.concat("attr_map.json")))
  } catch (e2) {
    console.log(`${logger.red(`${pluginINFO}${e2}\n${pluginINFO}没有解决报错！请将日志反馈到下面的项目地址处！\nhttps://gitee.com/CUZNIL/Yunzai-MiaoToGspanel/issues\n反馈issue可以帮助改善插件！`)}`)
  }
}
//dataRelicSet:圣遗物名称→套装名称 套装名称→套装id 套装id→套装效果
let dataRelicSet
try {
  dataRelicSet = JSON.parse(fs.readFileSync(resource.concat("dataRelicSet.json")))
} catch (e) {
  console.log(`${pluginINFO}${logger.red(e)}\n${pluginINFO}推测报错原因为没有插件运行必要的dataRelicSet.json，即将尝试下载该文件以便调用！`)
  let ret = await new Promise((resolve, reject) => { exec(`cd ${resource} && curl -O https://gitee.com/CUZNIL/Yunzai-MiaoToGspanel/raw/master/download/dataRelicSet.json`, (error, stdout, stderr) => { resolve({ error, stdout, stderr }) }) })
  logger.mark(`${pluginINFO}尝试下载中。。\n${ret.stdout.trim()}\n${ret.stderr.trim()}`)
  console.log(`${pluginINFO}下载完毕！该文件可能过时！\n${pluginINFO}如出现圣遗物套装错误请发送#圣遗物套装更新 。\n下载位置：${resource}dataRelicSet.json`)
  try {
    dataRelicSet = JSON.parse(fs.readFileSync(resource.concat("dataRelicSet.json")))
  } catch (e2) {
    console.log(`${logger.red(`${pluginINFO}${e2}\n${pluginINFO}没有解决报错！请将日志反馈到下面的项目地址处！\nhttps://gitee.com/CUZNIL/Yunzai-MiaoToGspanel/issues\n反馈issue可以帮助改善插件！`)}`)
  }
}
//部分没必要更新的数据，直接写在这里拿来用了。transElement和trans。
let transElement = {
  "pyro": "火", "hydro": "水", "cryo": "冰", "electro": "雷", "anemo": "风", "geo": "岩", "dendro": "草",
}
let trans = {
  //技能A图标→武器类型
  "Skill_A_Catalyst_MD": "catalyst", "Skill_A_01": "sword", "Skill_A_02": "bow", "Skill_A_03": "polearm", "Skill_A_04": "claymore",
  //武器突破等级
  "WeaponPromote": [1, 20, 40, 50, 60, 70, 80, 90],
  //属性翻译，用于圣遗物副词条。
  "hpPlus": "生命值", "hp": "生命值百分比", "atkPlus": "攻击力", "atk": "攻击力百分比", "defPlus": "防御力", "def": "防御力百分比", "recharge": "充能效率", "mastery": "元素精通", "cpct": "暴击率", "cdmg": "暴击伤害", "heal": "治疗加成", "pyro": "火伤加成", "electro": "雷伤加成", "cryo": "冰伤加成", "hydro": "水伤加成", "anemo": "风伤加成", "geo": "岩伤加成", "dendro": "草伤加成", "phy": "物伤加成",
  //圣遗物位置→圣遗物id结尾
  "1": 4, "2": 2, "3": 5, "4": 1, "5": 3,
}
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
          fnc: 'M2G_query'
        },
        //以下命令都是尝试主动更新数据，如果你没有遇到BUG请不要尝试发送以下命令(以免bug)
        {
          reg: '^#?武器数据更新$',
          fnc: 'weaponUpdate',
          permission: 'master'
        },
        {
          reg: '^#?主角命座更新$',
          fnc: 'playerUpdate',
          permission: 'master'
        },
        {
          reg: '^#?属性映射更新$',
          fnc: 'attrUpdate',
          permission: 'master'
        },
        {
          reg: '^#?圣遗物套装更新$',
          fnc: 'relicUpdate',
          permission: 'master'
        },
        {
          reg: '^#?测试$',
          fnc: 'test',
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
    console.log(pluginINFO.concat(`开始转换${KEYtoUID.length}个uid，下面是转换失败的数据对应的uid和报错信息。`))
    if (KEYtoUID.length > 200) this.reply(`redis里存了${KEYtoUID.length}个uid呢，可能要转换半分钟左右哦。`)
    for (let key of KEYtoUID) {
      let uid = await redis.get(key)
      if (!fs.existsSync(MiaoPath.concat(`${uid}.json`))) {
        empty++
      } else {
        let qq = await key.match(/\d+/g)
        let result = await this.M2G(uid)
        qq2uid[qq] = uid
        if (result) succeed++
        else
          fail++
      }
    }
    await fs.writeFileSync(await GspanelPath.concat("../qq-uid.json"), JSON.stringify(qq2uid))
    let TimeEnd = await new Date().getTime()
    this.reply(`报告主人！本次转换总计统计到${succeed + fail + empty}个uid，其中：\n${succeed ? `成功转换${succeed}个面板数据！` : "我超，所有转换都失败了，牛逼！"}\n${empty ? `没有面板数据的有${empty}个` : "没发现没有面板数据的用户"}！\n${fail ? `转换失败的有${fail}个(请检查日志输出)` : "没有出现转换失败(好耶)"}！\n本次转换总计用时${TimeEnd - TimeStart}ms~`)
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
      let Gspanel = { "avatars": [], "next": Miao._profile }
      for (let i in Miao.avatars) {
        //MiaoChar：喵喵面板的具体一个角色的数据
        let MiaoChar = Miao.avatars[i]
        //如果数据来源是米游社，那根本就不会有带圣遗物的面板数据，取消执行。Miao的数据似乎有点问题，米游社来源可能误标enka，需要后期检查。
        if (MiaoChar._source == "mys") continue;
        //char_Miao：喵喵的具体一个角色的资料
        let char_Miao = JSON.parse(fs.readFileSync(MiaoResourecePath.concat(`character/${MiaoChar.name}/data.json`)))
        //result：Gspanel面板的具体一个角色的数据
        let result = {
          "id": char_Miao.id,
          "rarity": char_Miao.star,
          "name": MiaoChar.name,
          "slogan": char_Miao.title,
          "element": transElement[MiaoChar.elem],
          "cons": MiaoChar.cons,
          "fetter": MiaoChar.fetter,
          "level": MiaoChar.level,
          "icon": "UI_AvatarIcon_PlayerBoy",
          "gachaAvatarImg": "UI_Gacha_AvatarImg_PlayerBoy",
          "baseProp": {
            "生命值": char_Miao.baseAttr.hp,
            "攻击力": char_Miao.baseAttr.atk,
            "防御力": char_Miao.baseAttr.def
          },
          "fightProp": {
            "生命值": char_Miao.baseAttr.hp,
            "攻击力": char_Miao.baseAttr.atk,
            "防御力": char_Miao.baseAttr.def,
            "暴击率": 5,
            "暴击伤害": 50,
            "治疗加成": 0,
            "元素精通": 0,
            "元素充能效率": 100,
            "物理伤害加成": 0,
            "火元素伤害加成": 0,
            "水元素伤害加成": 0,
            "风元素伤害加成": 0,
            "雷元素伤害加成": 0,
            "草元素伤害加成": 0,
            "冰元素伤害加成": 0,
            "岩元素伤害加成": 0
          },
          "skills": { "a": { "style": "", "icon": "Skill_A_01", "level": MiaoChar.talent.a, "originLvl": MiaoChar.talent.a }, "e": { "style": "", "icon": "Skill_S_Player_01", "level": MiaoChar.talent.e, "originLvl": MiaoChar.talent.e }, "q": { "style": "", "icon": "Skill_E_Player", "level": MiaoChar.talent.q, "originLvl": MiaoChar.talent.q } }, "consts": [],
          "weapon": {
            "id": 114514,
            "rarity": 1919810,
            "name": MiaoChar.weapon.name,
            "affix": MiaoChar.weapon.affix,
            "level": MiaoChar.weapon.level,
            "icon": "牛逼啊",
            "main": 32767,
            "sub": {
              "prop":
                "涩涩之力",
              "value": "99.9%"
            }
          },
          "relics": [],
          "relicSet": {},
          "relicCalc": {
            "rank": "ACE",
            "total": 233.3
          },
          "damage": {
            "level": "玩得好就是挂？",
            "data": [
              [
                "普攻第一段伤害",
                "2147483647",
                "2147483647"
              ]
            ],
            "buff": [
              [
                "大伟哥的注视",
                "所有伤害都能对怪物造成即死效果，且跳过死亡动画。"
              ]
            ]
          },
          "time": MiaoChar._time
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
            result.icon = "UI_AvatarIcon_PlayerGirl"
            result.gachaAvatarImg = "UI_Gacha_AvatarImg_PlayerGirl"
          }
          result.consts = [{ "style": "", "icon": PlayerElem_To_ConsIconName[`${result.element}`][0] }, { "style": "", "icon": PlayerElem_To_ConsIconName[`${result.element}`][1] }, { "style": "", "icon": PlayerElem_To_ConsIconName[`${result.element}`][2] }, { "style": "", "icon": PlayerElem_To_ConsIconName[`${result.element}`][3] }, { "style": "", "icon": PlayerElem_To_ConsIconName[`${result.element}`][4] }, { "style": "", "icon": PlayerElem_To_ConsIconName[`${result.element}`][5] }]
        } else {
          //char_Gspanel：Gspanel的具体一个角色的资料
          let char_Gspanel = char_data_Gspanel[MiaoChar.id]
          try {
            //有皮肤，用对应图标
            result.icon = char_Gspanel.Costumes[MiaoChar.costume].icon
            result.gachaAvatarImg = char_Gspanel.Costumes[MiaoChar.costume].art
            //用try是因为Miao面板数据早期数据和新数据格式差距过大。。原来用的if一堆毛病
          } catch (JiuMingA) {
            //没皮肤，用默认图标
            result.icon = char_Gspanel.iconName
            result.gachaAvatarImg = `UI_Gacha_AvatarImg_${char_Gspanel.Name}`
          }
          //技能图标
          result.skills.a.icon = char_Gspanel.Skills[char_Gspanel.SkillOrder[0]]
          result.skills.e.icon = char_Gspanel.Skills[char_Gspanel.SkillOrder[1]]
          result.skills.q.icon = char_Gspanel.Skills[char_Gspanel.SkillOrder[2]]
          result.consts = [{ "style": "", "icon": char_Gspanel.Consts[0] }, { "style": "", "icon": char_Gspanel.Consts[1] }, { "style": "", "icon": char_Gspanel.Consts[2] }, { "style": "", "icon": char_Gspanel.Consts[3] }, { "style": "", "icon": char_Gspanel.Consts[4] }, { "style": "", "icon": char_Gspanel.Consts[5] }]
        }
        switch (result.cons) {
          //根据命座决定图标是否亮起
          case 0:
            result.consts[0].style = "off"
          case 1:
            result.consts[1].style = "off"
          case 2:
            result.consts[2].style = "off"
          case 3:
            result.consts[3].style = "off"
          case 4:
            result.consts[4].style = "off"
          case 5:
            result.consts[5].style = "off"
          case 6:
          //六命富哥，命座全亮捏。
        }
        let weaponType = trans[result.skills.a.icon]
        //weapon_miao：Miao具体一个武器的资料
        let weapon_miao
        try {
          weapon_miao = JSON.parse(fs.readFileSync(MiaoResourecePath.concat(`weapon/${weaponType}/${result.weapon.name}/data.json`)))
        } catch (errorWeaponData) {
          console.log(logger.red(`${pluginINFO}UID${uid}的${result.name}使用了${result.weapon.name}，还请自行判断该角色是否可以使用该武器。如果该角色在原版游戏中可以携带该武器，请更新miao-plugin来尝试修复该问题。以下是命令执行报错：\n`) + errorWeaponData)
          return false
        }
        result.weapon.id = weapon_miao.id
        try {
          result.weapon.icon = WeaponID_To_IconName[result.weapon.id]
        } catch (errorWeaponIcon) {
          console.log(logger.red(`${pluginINFO}疑似找不到武器id${result.weapon.id}对应的图标数据。请发送`) + "#武器数据更新" + logger.red(`来获取最新武器图标数据尝试修复该问题。以下是命令执行报错：\n`) + errorWeaponIcon)
          return false
        }
        result.weapon.rarity = weapon_miao.star
        result.weapon.sub.prop = weapon_miao.attr.bonusKey
        let weaponUP = trans.WeaponPromote[MiaoChar.weapon.promote + 1]
        let weaponDN = trans.WeaponPromote[MiaoChar.weapon.promote]
        if (!MiaoChar.weapon.promote) {
          //如果调用1级数据，为简化代码生成1+级数据。
          weapon_miao.attr.atk["1+"] = weapon_miao.attr.atk["1"]
          weapon_miao.attr.bonusData["1+"] = weapon_miao.attr.bonusData["1"]
        }
        result.weapon.main = await Number((((weapon_miao.attr.atk[`${weaponUP}`] - weapon_miao.attr.atk[`${weaponDN}+`]) * result.weapon.level - weapon_miao.attr.atk[`${weaponUP}`] * weaponDN + weapon_miao.attr.atk[`${weaponDN}+`] * weaponUP) / (weaponUP - weaponDN)).toFixed(2))
        result.weapon.sub.value = await (((weapon_miao.attr.bonusData[`${weaponUP}`] - weapon_miao.attr.bonusData[`${weaponDN}+`]) * result.weapon.level - weapon_miao.attr.bonusData[`${weaponUP}`] * weaponDN + weapon_miao.attr.bonusData[`${weaponDN}+`] * weaponUP) / (weaponUP - weaponDN)).toFixed(2)
        for (let j in MiaoChar.artis) {
          //MiaoArtis：Miao的具体圣遗物
          let MiaoArtis = MiaoChar.artis[j]
          if (MiaoArtis.main == undefined) {
            //TODO：如果没有主词条数据，则表示是新版喵喵数据，采用属性ID。那么预先处理一下属性ID转为旧版喵喵数据的{key,value}的格式
            MiaoArtis.main = {
              "key": attr_map[MiaoArtis.mainId],
              "value": 0
            }
            console.log(MiaoArtis)
          }
          //artis：Gspanel的具体圣遗物
          let artis = {
            "pos": Number(j),
            "rarity": MiaoArtis.star,
            "name": MiaoArtis.name,
            "setName": dataRelicSet[MiaoArtis.name],
            "level": MiaoArtis.level,
            "main": {
              "prop": "生命值",
              "value": "3571"
            },
            "sub": [
              {
                "prop": "充能效率",
                "value": "13%"
              },
              {
                "prop": "攻击力",
                "value": "3.7%"
              },
              {
                "prop": "生命值",
                "value": "3.7%"
              },
              {
                "prop": "攻击力",
                "value": "12"
              }
            ],
            "calc": {
              //你好！评分部分我先暂时搁置了！因为我个人只需要队伍伤害，该功能不需要评分。
              "rank": "ACE",
              "total": 66.6,
              "nohit": 45,
              "main": 77.7,
              "sub": [
                {
                  "style": "great",
                  "goal": 6.6
                },
                {
                  "style": "use",
                  "goal": 5.5
                },
                {
                  "style": "unuse",
                  "goal": 4.4
                },
                {
                  "style": "great",
                  "goal": 3.3
                }
              ],
              "main_pct": 100.0,
              "total_pct": 98.7
            },
            "icon": `UI_RelicIcon_${dataRelicSet[dataRelicSet[MiaoArtis.name]]}_${trans[j]}`
          }
          if (result.relicSet[artis.setName])
            result.relicSet[artis.setName]++
          else
            result.relicSet[artis.setName] = 1
          //TODO：接下来处理artis.main、artis.sub、fightProp



          result.relics[result.relics.length] = artis
        }
        for (let j in result.relicSet) {
          let Effect = dataRelicSet[dataRelicSet[j]]
          if (Effect != undefined && result.relicSet[j] >= 2) {
            //仅当二件套触发且效果为属性时尝试转换
            if (Effect[0].includes("百分比")) {
              Effect[0] = Effect[0].replace("百分比", "")
              Effect[1] = result.baseProp[Effect[0]] * Effect[1] / 100
            }
            result.fightProp[Effect[0]] += Effect[1]
          }
        }
        //TODO：fightProp relics

        Gspanel.avatars[Gspanel.avatars.length] = result
        //SKIP：relics[i].calc relicCalc damage
      }
      fs.writeFileSync(await GspanelPath.concat(`${uid}.json`), JSON.stringify(Gspanel))
      return true
    } catch (e) {
      console.log(logger.red(`${pluginINFO}UID${uid}报错：\n${e}`))
      return false
    }
  }
  async findUID(QQ) {
    //根据QQ号判断对应uid，返回null表示没有对应uid。
    let uid = await redis.get(redisStart.concat(`${QQ}`))
    return uid
  }
  async weaponUpdate() {
    //#武器数据更新
    //数据来源：https://gitlab.com/Dimbreath/AnimeGameData/-/blob/master/ExcelBinOutput/WeaponExcelConfigData.json
    let TimeStart = await new Date().getTime()
    try {
      await new Promise((resolve, reject) => { exec(`cd ${resource} && curl -O https://gitlab.com/Dimbreath/AnimeGameData/-/raw/master/ExcelBinOutput/WeaponExcelConfigData.json`, (error, stdout, stderr) => { resolve({ error, stdout, stderr }) }) })
      let TimeDownload = await new Date().getTime()
      let ori = JSON.parse(fs.readFileSync(resource.concat("WeaponExcelConfigData.json")))
      let Teamp_WeaponID_To_IconName = await {}
      for (let i in ori) {
        Teamp_WeaponID_To_IconName[ori[i].id] = ori[i].icon
      }
      fs.writeFileSync(resource.concat(`../WeaponID_To_IconName.json`), JSON.stringify(Teamp_WeaponID_To_IconName))
      WeaponID_To_IconName = Teamp_WeaponID_To_IconName
      let FileSize = fs.statSync(resource.concat("WeaponExcelConfigData.json")).size
      fs.rmSync(resource.concat("WeaponExcelConfigData.json"))
      let TimeEnd = await new Date().getTime()
      this.reply(`成功更新武器图标数据~\n本次更新总计用时${TimeEnd - TimeStart}ms~\n其中下载资源花费${TimeDownload - TimeStart}ms~\n为避免空间浪费删除了非必要文件：\nWeaponExcelConfigData.json\n文件大小${(FileSize / 1024).toFixed(2)}KB`)
    } catch (e) {
      console.log(pluginINFO.concat(e))
      let TimeEnd = await new Date().getTime()
      this.reply(`更新失败了呜呜呜，请检查后台日志确认原因。用时${TimeEnd - TimeStart}ms`)
    }
  }
  async playerUpdate() {
    //#主角命座更新
    //数据来源：https://gitlab.com/Dimbreath/AnimeGameData/-/blob/master/ExcelBinOutput/AvatarTalentExcelConfigData.json
    let TimeStart = await new Date().getTime()
    try {
      await new Promise((resolve, reject) => { exec(`cd ${resource} && curl -O https://gitlab.com/Dimbreath/AnimeGameData/-/raw/master/ExcelBinOutput/AvatarTalentExcelConfigData.json`, (error, stdout, stderr) => { resolve({ error, stdout, stderr }) }) })
      let TimeDownload = await new Date().getTime()
      let ori = JSON.parse(fs.readFileSync(resource.concat("AvatarTalentExcelConfigData.json")))
      let Temp_PlayerElem_To_ConsIconName = { "风": [], "岩": [], "雷": [], "草": [] }
      let transElem = { "915": "风", "917": "岩", "914": "雷", "913": "草" }
      for (let i in ori) {
        if (ori[i].mainCostItemId > 1000) continue
        let element = transElem[ori[i].mainCostItemId]
        Temp_PlayerElem_To_ConsIconName[element][Temp_PlayerElem_To_ConsIconName[element].length] = ori[i].icon
      }
      fs.writeFileSync(resource.concat("PlayerElem_To_ConsIconName.json"), JSON.stringify(Temp_PlayerElem_To_ConsIconName))
      PlayerElem_To_ConsIconName = Temp_PlayerElem_To_ConsIconName
      let FileSize = fs.statSync(resource.concat("AvatarTalentExcelConfigData.json")).size
      fs.rmSync(resource.concat("AvatarTalentExcelConfigData.json"))
      let TimeEnd = await new Date().getTime()
      this.reply(`成功更新主角命座图标数据~\n本次更新总计用时${TimeEnd - TimeStart}ms~\n其中下载资源花费${TimeDownload - TimeStart}ms~\n为避免空间浪费删除了非必要文件：\nAvatarTalentExcelConfigData.json\n文件大小${(FileSize / 1024).toFixed(2)}KB`)
    } catch (e) {
      console.log(pluginINFO.concat(e))
      let TimeEnd = await new Date().getTime()
      this.reply(`更新失败了呜呜呜，请检查后台日志确认原因。用时${TimeEnd - TimeStart}ms`)
    }
  }
  async attrUpdate() {
    //#属性映射更新
    //数据来源：https://gitee.com/yoimiya-kokomi/miao-plugin/blob/master/resources/meta/artifact/meta.js
    let TimeStart = await new Date().getTime()
    try {
      let ori = fs.readFileSync(MiaoResourecePath.concat("artifact/meta.js")).toString()
      let startM = ori.indexOf("mainIdMap")
      startM = ori.indexOf('{', startM)
      let startA = ori.indexOf("attrIdMap")
      if (startM == -1 || startA == -1) {
        this.reply(`【更新失败】\n怎么辉石呢？没有在文件${MiaoResourecePath}artifact/meta.js里找到mainIdMap、attrIdMap呢orz`)
        return false
      }
      let endM = startA
      startA = ori.indexOf('{', startA)
      let endA = ori.length
      while (ori[endM] != '}') endM--
      ori = ori.substring(startM, endM) + ',' + ori.substring(startA + 1, endA - 1)
      ori = ori.replaceAll("'", "")
      ori = ori.replaceAll(/(\w|\.)+/g, `"$&"`)
      ori = JSON.parse(ori.concat("}"))
      for (let i in ori) try { ori[i].value = Number((Number(ori[i].value)).toFixed(5)) } catch (e) { }
      fs.writeFileSync(resource.concat("attr_map.json"), JSON.stringify(ori))
      attr_map = ori
      let TimeEnd = await new Date().getTime()
      this.reply(`成功更新属性映射数据~\n本次更新总计用时${TimeEnd - TimeStart}ms~`)
    } catch (e) {
      console.log(pluginINFO.concat(e))
      let TimeEnd = await new Date().getTime()
      this.reply(`更新失败了呜呜呜，请检查后台日志确认原因。用时${TimeEnd - TimeStart}ms`)
    }
  }
  async relicUpdate() {
    //#圣遗物套装更新
    //中文数据来源：https://gitee.com/yoimiya-kokomi/miao-plugin/blob/master/resources/meta/artifact/data.json
    //圣遗物属性数据来源：https://gitee.com/yoimiya-kokomi/miao-plugin/blob/master/resources/meta/artifact/calc.js
    //圣遗物id数据来源：https://gitlab.com/Dimbreath/AnimeGameData/-/blob/master/ExcelBinOutput/ReliquaryCodexExcelConfigData.json
    let TimeStart = await new Date().getTime()
    try {
      let data_chs
      try {
        data_chs = JSON.parse(fs.readFileSync(MiaoResourecePath.concat("artifact/data.json")))
      } catch (emiao) {
        console.log(pluginINFO.concat(emiao))
        let TimeEnd = await new Date().getTime()
        this.reply(`更新失败，推测原因为未正确安装喵喵插件或未正确配置本js插件。请检查后台日志确认详细原因。\n用时${TimeEnd - TimeStart}ms`)
        return false
      }
      this.reply(`该文件较大，可能需要下载一段时间。。。`)
      console.log(pluginINFO.concat(`该文件较大，可能需要下载一段时间。。。`))
      let TimeStartDownload = await new Date().getTime()
      await new Promise((resolve, reject) => { exec(`cd ${resource} && curl -O https://gitlab.com/Dimbreath/AnimeGameData/-/raw/master/ExcelBinOutput/ReliquaryCodexExcelConfigData.json`, (error, stdout, stderr) => { resolve({ error, stdout, stderr }) }) })
      let TimeDownload = await new Date().getTime()
      console.log(pluginINFO.concat(`下载完成！用时${TimeDownload - TimeStartDownload}ms`))
      let ori = JSON.parse(fs.readFileSync(resource.concat("ReliquaryCodexExcelConfigData.json")))
      let capId_to_suitId = await {}
      for (let i in ori) {
        capId_to_suitId["n" + ori[i].capId] = ori[i].suitId
      }
      ori = fs.readFileSync(MiaoResourecePath.concat("artifact/calc.js")).toString().replaceAll(`'`, `"`).replaceAll(`Pct`, ``)
      let relic = await {}
      for (let i in data_chs) {
        let set = await data_chs[i].sets
        for (let j in set) {
          //录入：圣遗物名称→套装名称
          relic[set[j].name] = data_chs[i].name
        }
        let SetID = capId_to_suitId[set[5].id]
        //录入：套装名称→套装id
        relic[data_chs[i].name] = SetID
        let start = ori.indexOf(data_chs[i].name)
        let end = ori.indexOf(")", start)
        let SetEffect = ori.substring(start, end)
        if (SetEffect.includes("attr(")) {
          //如果有需要考虑的套装效果再执行。由于所考虑的套装都是二件套，所以内容不再塞入生效套装数量，只存放属性名和数值
          start = SetEffect.indexOf("attr(") + 5
          SetEffect = JSON.parse(`[${SetEffect.substring(start)}]`)
          if (SetEffect[0] == "shield") continue
          if (SetEffect[0] == "dmg") {
            SetEffect[0] = SetEffect[2].concat("元素伤害加成")
          } else {
            if (SetEffect[0] == "phy") {
              SetEffect[0] = "物理伤害加成"
            } else {
              if (SetEffect[0] == "recharge") {
                SetEffect[0] = "元素充能效率"
              } else {
                let t = trans[SetEffect[0]]
                if (t) {
                  SetEffect[0] = t
                } else {
                  console.log(pluginINFO.concat(SetEffect[2]))
                }
              }
            }
          }
          SetEffect = await [SetEffect[0], SetEffect[1]]
          //录入：套装id→套装效果
          relic[SetID] = SetEffect
        }
      }
      let FileSize = fs.statSync(resource.concat("ReliquaryCodexExcelConfigData.json")).size
      fs.rmSync(resource.concat("ReliquaryCodexExcelConfigData.json"))
      fs.writeFileSync(resource.concat("dataRelicSet.json"), JSON.stringify(relic))
      dataRelicSet = relic
      let TimeEnd = await new Date().getTime()
      this.reply(`成功更新圣遗物套装数据~\n本次更新总计用时${TimeEnd - TimeStart}ms~\n其中下载资源花费${TimeDownload - TimeStartDownload}ms~\n为避免空间浪费删除了非必要文件：\nReliquaryCodexExcelConfigData.json\n文件大小${(FileSize / 1024).toFixed(2)}KB`)
    } catch (e) {
      console.log(pluginINFO.concat(e))
      let TimeEnd = await new Date().getTime()
      this.reply(`更新失败了呜呜呜，请检查后台日志确认原因。用时${TimeEnd - TimeStart}ms`)
    }
  }
  async test() {
    //测试函数
    let test = { a: 0 }
    test.a += 1
    let t = 5
    //test.b ? test.b += t : test.b = t
    test.b = t + test.b ? test.b : 0
    fs.writeFileSync(resource.concat("test.json"), JSON.stringify(test))
  }
}
