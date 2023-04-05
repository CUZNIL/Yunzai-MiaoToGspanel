/*
功能：将miao-plugin产生的面板数据适配到gspanel，以便数据更新。推荐搭配https://gitee.com/CUZNIL/Yunzai-install。
项目地址：https://gitee.com/CUZNIL/MiaoToGspanel
2023年4月5日21:58:53
//*/

let MiaoPath = "data/UserData/"
let GspanelPath = "plugins/py-plugin/data/gspanel/cache/"

//MiaoPath：miao-plugin产生的面板数据路径，一般不用手动修改
//GspanelPath：nonebot-plugin-gspanel产生的面板数据路径，需要手动配置到自己安装的路径。
//如果你搭配我的云崽安装教程来安装gspanel，则不需要更改。教程地址https://gitee.com/CUZNIL/Yunzai-install
//修改请注意保留结尾的“/”



import { segment } from "oicq";
import fetch from "node-fetch";
import fs from 'node:fs'
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
          reg: '^#?转换全部(喵喵|PY)?面板$',
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
        }
      ]
    })
  }
  async M2G_all() {
    if (!fs.existsSync(GspanelPath)) {
      this.reply("请仔细阅读README，你没有正确配置！可能是以下原因：\n1.你不是通过py-plugin安装的nonebot-plugin-gspanel\n2.你没有正确配置nonebot-plugin-gspanel\n3.你没有正确配置本js插件\n。。。\n为解决本问题请自行阅读https://gitee.com/CUZNIL/MiaoToGspanel")
      return false
    }
    let uidList = [114514]
    //TODO 获取所有有效uid
    for (let i of uidList) {
      M2G(i)
    }
  }
  async M2G_query() {
    if (!fs.existsSync(GspanelPath)) {
      this.reply("请仔细阅读README，你没有正确配置！可能是以下原因：\n1.你不是通过py-plugin安装的nonebot-plugin-gspanel\n2.你没有正确配置nonebot-plugin-gspanel\n3.你没有正确配置本js插件\n。。。\n为解决本问题请自行阅读https://gitee.com/CUZNIL/MiaoToGspanel")
      return false
    }
    let uid = await this.e.msg.match(/\d+/g)
    if (!uid) {
      //如果uid为空，即未输入uid。需要根据发言人QQ判断其uid，查找失败提示。
      let qq = await this.e.user_id
      uid = await this.findUID(qq)
      if (!uid) {
        //如果uid为0，即redis没有绑定数据
        this.reply("哎呀！你好像没有绑定原神uid呢！发送“#绑定123456789”来绑定你的原神uid！")
        return false
      }
    }
    if (!fs.existsSync(MiaoPath.concat(`${uid}.json`))) {
      this.reply("没有面板数据是不可以转换的！发送“#更新面板”来更新面板数据~")
      return false
    }
    let result = await this.M2G(uid)
  }
  async M2G(UID) {
    //TODO 修正面板数据，在对应目录生成文件。返回值表示处理结果。
  }
  async findUID(QQ) {
    //根据QQ号判断对应uid，返回0表示没有对应uid。
    let uid = 0
    //TODO 通过redis获取QQ对应uid
    return uid
  }
  async help() {
    this.reply(` ${fs.readFileSync(GspanelPath.concat("test.json"))}`)
  }
}

