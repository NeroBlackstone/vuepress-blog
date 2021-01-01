---
date: 2021-1-1
tag:
- Linux
- Manjaro
author: NeroBlackstone
location: NanChang
summary: 写下来防止下次忘了
---

# 解决Linux里terminal没法打开的问题

- 如果点开manjaro自带的terminal发现左上角出现图标，且一直在转，但是窗口并没有打开。
- 如果系统自带vpn无法链接，点击gui上的按钮会闪一下，然后立即中断。
- 如果设置里的区域与语言tab里，语言和格式，这两个选项都是空的，且无法选择任何语言。

那么可以确认是`local.gen`的问题。可以按以下操作解决。

1. 打开`/etc/locale.gen`，然后把`en_US.UTF8`前面的注释去掉。其他全部用#注释掉。
2. 然后安装一个其他terminal，比如deepin，执行`sudo locale-gen`

好了。重启机器应该可以打开了。亲测
