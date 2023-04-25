# 云崽Bot面板通用化插件.js

### 介绍
将[喵喵插件](../../../../yoimiya-kokomi/miao-plugin)产生的面板数据适配到[Gspanel](https://github.com/monsterxcn/nonebot-plugin-gspanel)，以便在Gspanel使用。

### 安装教程

请确保你已经正确搭载了[云崽Bot v3](https://gitee.com/yoimiya-kokomi/Yunzai-Bot)、[miao-plugin](../../../../yoimiya-kokomi/miao-plugin)和[nonebot-plugin-gspanel](https://github.com/monsterxcn/nonebot-plugin-gspanel)，尚不清楚其他版本的云崽使用本插件是否会报错。

将[`MiaoToGspanel.js`](MiaoToGspanel.js)文件放入`Yunzai-Bot/plugins/example/`文件夹下。

<details><summary>不知道怎么放？</summary>

首先进入云崽根目录。

然后输入以下指令：

进入js插件目录
```
cd plugins/example/
```
在此处下载本js插件
```
curl -O https://gitee.com/CUZNIL/Yunzai-MiaoToGspanel/raw/master/MiaoToGspanel.js
```
如遇`curl not found`报错请自己百度怎么处理，一般是你没装curl。

实在是不会的话建议看[这篇教程](../../../Yunzai-install/)，如果curl都不会装的话直接用[时雨脚本](https://trss.me/)摆烂多好。

———————————分割线———————————

</details>

### 功能

啊 困了 先睡觉。

先放一下正则匹配：（基本只用得上前俩个命令）


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
          reg: '^#?圣遗物主词条更新$',
          fnc: 'relicMainUpdate',
          permission: 'master'
        },
        {
          reg: '^#?(面板)?(转换|适配|(通用化?))帮助$',
          fnc: 'help'
        },
        {
          reg: '^#?测试',
          fnc: 'test',
          permission: 'master'
        }
