---
date: 2020-1-30
tag: 
  - linux
author: NeroBlackstone
location: NanChang
summary: 记录一下输入法的坑，备查
---

# Fcitx常见问题

Fcitx [ˈfaɪtɪks] 应该是linux下最常用的输入法框惹，但是使用上会有一些坑，写下这篇文章以备日后查阅。

## Fcitx起手最少要哪些包？

至少要：
- Fcitx （输入法本体）
- Fcitx-Configuration
- fcitx-configtool（输入法配置工具）
- fcitx-gtk2 (各种图形库支持)
- fcitx-gtk3
- fcitx-qt5 

若不安装图形库支持，启动后无法看到小图标。安装后重启pc。

若不安装fcitx-configtool，菜单的configure打不开。

## 环境变量配置

``` shell
vim ~/.xprofile

//文件里写：
GTK_IM_MODULE=fcitx
QT_IM_MODULE=fcitx
XMODIFIERS=@im=fcitx
```

不配置的话即使已经安装中文输入法，有的窗口下也无法切换。

## 中文输入法哪家强？

fcitx是自带拼音输入法的！！无需安装三方拼音输入法！！

开启方法configure->+->取消勾选only show current language->搜索pinyin->ok。

sogou拼音作为一个输入法，居然要依赖qtwebkit这样的浏览器引擎，而且这玩意构建起来疯狂报错。搜狗死个妈先，谢谢！

## 中文输入法下打英文字母带空格，且句号为实心

检查全半角设置，直接菜单切换Half Width Character即可。

## 5个侯选词太少了！

菜单configure->Global Config->OutPut->Candidate Word Number->候选词数（最高10个）

