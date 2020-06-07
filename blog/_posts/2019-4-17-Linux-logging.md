---
date: 2019-4-16
tag: 
  - linux
author: NeroBlackstone
location: NanChang
summary: 如何查找命令
---

# 在linux中查看实时生成的日志

## tail命令

tail命令可用于查看文件尾部的内容，有一个常用的参数 `-f`常用于查阅正在改变的日志文件。`-f` 表示循环读取。

`tail -f filename` 会把 filename 文件里的最尾部的内容显示在屏幕上，并且不断刷新，只要 filename 更新就可以看到最新的文件内容。

## grap命令

Linux grep 命令用于查找文件里符合条件的字符串。

grep 指令用于查找内容包含指定的范本样式的文件，如果发现某文件的内容符合所指定的范本样式，预设 grep 指令会把含有范本样式的那一列显示出来。

## pipe命令

## cat命令

## 组合以上命令

tail -f jishuimjsrv_66.log.20200417 | grep UserID:23542342