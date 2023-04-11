/*
功能：将miao-plugin产生的面板数据适配到gspanel，以便数据更新。推荐搭配https://gitee.com/CUZNIL/Yunzai-install。
项目地址：https://gitee.com/CUZNIL/Yunzai-MiaoToGspanel
2023年4月11日15:17:07
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

武器数据下载地址：https://gitlab.com/Dimbreath/AnimeGameData/-/raw/master/ExcelBinOutput/WeaponExcelConfigData.json?inline=false
如果该插件过时，可以自行修改格式
//*/

let redisStart = "Yz:genshin:mys:qq-uid:"
let errorTIP = "请仔细阅读README，你没有正确配置！可能是以下原因：\n1.你不是通过py-plugin安装的nonebot-plugin-gspanel\n2.你没有正确配置nonebot-plugin-gspanel\n3.你没有正确配置本js插件\n。。。\n为解决本问题请自行阅读https://gitee.com/CUZNIL/Yunzai-MiaoToGspanel"
//resource:该插件产生的中间文件存放的文件夹位置，如需修改请自行创建对应文件夹。
let resource = "resources/MiaoToGspanel/"
if (!fs.existsSync(`${resource}`)) {
  console.log(`【MiaoToGspanel插件】检测到没有文件夹${resource}！即将创建该文件夹用于存放部分数据。`)
  fs.mkdirSync(`${resource}`)
}
//char_data_Gspanel:Gspanel面板的所有角色的资料
let char_data_Gspanel = JSON.parse(fs.readFileSync(GspanelPath.concat("../char-data.json")))
//WeaponID_To_IconName:武器ID到图标名称的映射
let WeaponID_To_IconName
try {
  WeaponID_To_IconName = JSON.parse(fs.readFileSync(resource.concat("WeaponID_To_IconName.json")))
} catch (e) {
  console.log(`【MiaoToGspanel插件】${logger.red(e)}\n【MiaoToGspanel插件】推测报错原因为没有插件运行必要的WeaponID_To_IconName.json，即将尝试下载该文件以便调用！`)
  let ret = await new Promise((resolve, reject) => { exec(`cd ${resource} && curl -O https://gitee.com/CUZNIL/Yunzai-MiaoToGspanel/raw/master/download/WeaponID_To_IconName.json`, (error, stdout, stderr) => { resolve({ error, stdout, stderr }) }) })
  logger.mark(`【MiaoToGspanel插件】尝试下载中。。\n${ret.stdout.trim()}\n${ret.stderr.trim()}`)
  console.log(`【MiaoToGspanel插件】下载完毕！该文件可能过时！\n【MiaoToGspanel插件】如出现武器图标错误请发送#武器数据更新。\n下载位置：${resource}WeaponID_To_IconName.json`)
  try {
    WeaponID_To_IconName = JSON.parse(fs.readFileSync(resource.concat("WeaponID_To_IconName.json")))
  } catch (e2) {
    console.log(`${logger.red(`【MiaoToGspanel插件】${e2}\n【MiaoToGspanel插件】没有解决报错！请将日志反馈到下面的项目地址处！\nhttps://gitee.com/CUZNIL/Yunzai-MiaoToGspanel/issues\n反馈issue可以帮助改善插件！`)}`)
  }
}




let PlayerElem_To_ConsIconName
try {
  PlayerElem_To_ConsIconName = JSON.parse(fs.readFileSync(resource.concat("PlayerElem_To_ConsIconName.json")))
} catch (e) {
  console.log(`【MiaoToGspanel插件】${logger.red(e)}\n【MiaoToGspanel插件】推测报错原因为没有插件运行必要的PlayerElem_To_ConsIconName.json，即将尝试下载该文件以便调用！`)
  let ret = await new Promise((resolve, reject) => { exec(`cd ${resource} && curl -O https://gitee.com/CUZNIL/Yunzai-MiaoToGspanel/raw/master/download/PlayerElem_To_ConsIconName.json`, (error, stdout, stderr) => { resolve({ error, stdout, stderr }) }) })
  logger.mark(`【MiaoToGspanel插件】尝试下载中。。\n${ret.stdout.trim()}\n${ret.stderr.trim()}`)
  console.log(`【MiaoToGspanel插件】下载完毕！该文件可能过时！\n【MiaoToGspanel插件】如出现旅行者命座图标错误请发送#主角命座更新。\n下载位置：${resource}PlayerElem_To_ConsIconName.json`)
  try {
    PlayerElem_To_ConsIconName = JSON.parse(fs.readFileSync(resource.concat("PlayerElem_To_ConsIconName.json")))
  } catch (e2) {
    console.log(`${logger.red(`【MiaoToGspanel插件】${e2}\n【MiaoToGspanel插件】没有解决报错！请将日志反馈到下面的项目地址处！\nhttps://gitee.com/CUZNIL/Yunzai-MiaoToGspanel/issues\n反馈issue可以帮助改善插件！`)}`)
  }
}
import fs from 'node:fs'
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
          reg: '^#?武器数据更新$',
          fnc: 'weaponUpdate',
          permission: 'master'
        },
        {
          reg: '^#?主角命座更新$',
          fnc: 'playerUpdate',
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
      let Gspanel = { "avatars": [], "next": Miao._profile }
      for (let i in Miao.avatars) {
        //MiaoChar：喵喵面板的具体一个角色的数据
        let MiaoChar = Miao.avatars[i]
        if (MiaoChar._source == "mys") continue;
        //char_Miao：喵喵的具体一个角色的资料
        let char_Miao = JSON.parse(fs.readFileSync(MiaoResourecePath.concat(`character/${MiaoChar.name}/data.json`)))
        //result：Gspanel面板的具体一个角色的数据
        let result = JSON.parse(`{"id":${char_Miao.id},"rarity":${char_Miao.star},"name":"${MiaoChar.name}","slogan":"${char_Miao.title}","element":"${MiaoChar.elem}","cons":${MiaoChar.cons},"fetter":${MiaoChar.fetter},"level":${MiaoChar.level},"icon":"UI_AvatarIcon_PlayerBoy","gachaAvatarImg": "UI_Gacha_AvatarImg_PlayerBoy","baseProp":{"生命值":${char_Miao.baseAttr.hp},"攻击力":${char_Miao.baseAttr.atk},"防御力":${char_Miao.baseAttr.def}},
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
"skills":{"a":{"style":"","icon":"Skill_A_01","level":${MiaoChar.talent.a},"originLvl":${MiaoChar.talent.a}},"e":{"style":"","icon":"Skill_S_Player_01","level":${MiaoChar.talent.e},"originLvl":${MiaoChar.talent.e}},"q":{"style":"","icon":"Skill_E_Player","level":${MiaoChar.talent.q},"originLvl":${MiaoChar.talent.q}}},"consts":[],"weapon":{"id":114514,"rarity":1919810,"name":"${MiaoChar.weapon.name}","affix":${MiaoChar.weapon.affix},"level":${MiaoChar.weapon.level},"icon":"牛逼啊","main":32767,"sub":{"prop":"涩涩之力","value":"99.9%"}},
"relics":[],
"relicSet":{},
"relicCalc":{},
"damage":{},
"time":${MiaoChar._time}}`)


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
          //SKIP：result.consts是命座信息，但是旅行者的图标我找不到！开摆！
        } else {
          //char_Gspanel：Gspanel的具体一个角色的资料
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
          result.consts = JSON.parse(`[{"style":"","icon":"${char_Gspanel.Consts[0]}"},{"style":"","icon":"${char_Gspanel.Consts[1]}"},{"style":"","icon":"${char_Gspanel.Consts[2]}"},{"style":"","icon":"${char_Gspanel.Consts[3]}"},{"style":"","icon":"${char_Gspanel.Consts[4]}"},{"style":"","icon":"${char_Gspanel.Consts[5]}"}]`)
          switch (result.cons) {
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
          }
        }

        let weaponType = "catalyst"
        //默认法器
        switch (result.skills.a.icon) {
          case "Skill_A_01":
            //单手剑
            weaponType = "sword"
            break
          case "Skill_A_02":
            //弓
            weaponType = "bow"
            break
          case "Skill_A_03":
            //枪
            weaponType = "polearm"
            break
          case "Skill_A_04":
            //双手剑
            weaponType = "claymore"
            break
        }
        //weapon_miao：Miao具体一个武器的资料
        let weapon_miao = JSON.parse(fs.readFileSync(MiaoResourecePath.concat(`weapon/${weaponType}/${result.weapon.name}/data.json`)))
        result.weapon.id = weapon_miao.id
        result.weapon.rarity = weapon_miao.star
        result.weapon.sub.prop = weapon_miao.attr.bonusKey
        let weaponUP = 20
        let weaponDN = 1
        //默认突破0，weaponUP上界，weaponDN下界
        switch (MiaoChar.weapon.promote) {
          case 6:
            weaponUP = 90
            weaponDN = 80
            break
          case 5:
            weaponUP = 80
            weaponDN = 70
            break
          case 4:
            weaponUP = 70
            weaponDN = 60
            break
          case 3:
            weaponUP = 60
            weaponDN = 50
            break
          case 2:
            weaponUP = 50
            weaponDN = 40
            break
          case 1:
            weaponUP = 40
            weaponDN = 20
            break
          default:
            //如果调用1级数据，为简化代码生成1+级数据。
            weapon_miao.attr.atk["1+"] = weapon_miao.attr.atk["1"]
            weapon_miao.attr.bonusData["1+"] = weapon_miao.attr.bonusData["1"]
        }
        result.weapon.main = await Number((((weapon_miao.attr.atk[`${weaponUP}`] - weapon_miao.attr.atk[`${weaponDN}`]) * result.weapon.level - weapon_miao.attr.atk[`${weaponUP}`] * weaponDN + weapon_miao.attr.atk[`${weaponDN}`] * weaponUP) / (weaponUP - weaponDN)).toFixed(2))
        result.weapon.sub.value = await (((weapon_miao.attr.bonusData[`${weaponUP}`] - weapon_miao.attr.bonusData[`${weaponDN}`]) * result.weapon.level - weapon_miao.attr.bonusData[`${weaponUP}`] * weaponDN + weapon_miao.attr.bonusData[`${weaponDN}`] * weaponUP) / (weaponUP - weaponDN)).toFixed(2)
        result.weapon.icon = WeaponID_To_IconName[result.weapon.id]


        //TODO：fightProp relics relicSet relicCalc damage

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
  async weaponUpdate() {
    //数据来源：https://gitlab.com/Dimbreath/AnimeGameData/-/blob/master/ExcelBinOutput/WeaponExcelConfigData.json
    //还没写完还没写完还没写完还没写完还没写完还没写完
    let ori = JSON.parse(fs.readFileSync(GspanelPath.concat("../WeaponExcelConfigData.json")))
    let WeaponID_To_IconName = {}
    for (let i in ori) {
      WeaponID_To_IconName[ori[i].id] = ori[i].icon
    }
    fs.writeFileSync(GspanelPath.concat(`../WeaponID_To_IconName.json`), JSON.stringify(WeaponID_To_IconName))
  }
  async playerUpdate() {
    //数据来源：https://gitlab.com/Dimbreath/AnimeGameData/-/blob/master/ExcelBinOutput/AvatarTalentExcelConfigData.json
    //还没写完还没写完还没写完还没写完还没写完还没写完
    let ori = JSON.parse(fs.readFileSync(resource.concat("AvatarTalentExcelConfigData.json")))
    let PlayerElem_To_ConsIconName = { "风": [], "岩": [], "雷": [], "草": [] }
    for (let i in ori) {
      if (ori[i].mainCostItemId > 1000) continue
      switch (ori[i].mainCostItemId) {
        case 915:
          PlayerElem_To_ConsIconName.风[PlayerElem_To_ConsIconName.风.length] = ori[i].icon
          break
        case 917:
          PlayerElem_To_ConsIconName.岩[PlayerElem_To_ConsIconName.岩.length] = ori[i].icon
          break
        case 914:
          PlayerElem_To_ConsIconName.雷[PlayerElem_To_ConsIconName.雷.length] = ori[i].icon
          break
        case 913:
          PlayerElem_To_ConsIconName.草[PlayerElem_To_ConsIconName.草.length] = ori[i].icon
          break
      }
    }
    fs.writeFileSync(resource.concat("PlayerElem_To_ConsIconName.json"), JSON.stringify(PlayerElem_To_ConsIconName))
  }
}
