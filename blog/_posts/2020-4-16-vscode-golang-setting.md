---
date: 2020-4-16
tag: 
  - Golang
  - vscode
  - gvm
author: NeroBlackstone
location: NanChang
summary: goland天下第一
---

# vscode golang环境配置的一些坑

## GVM配置坑

### 第一次安装

首先第一次gvm安装go的话一定要先装go 1.4，因为go1.4之后的版本golang是一个自举的状态（用go编译go），而之前是用c。也就是说你想装go1.4以后的版本，需要先安装一个go1.4。用低版本的go去编译更新版本的go。go1.4在更新的go安装以后，可以删除。

### 默认go版本

首先我是有两个使用GVM安装的go环境，一个1.9（公司环境），一个1.14（自己用）。那么在`gvm use go1.x`的时候一定要选一个版本使用`--default`选项来指定是默认版本。如果不这么做，那么打开终端，go命令是无法找到的，需要重新`gvm use`才能使用go命令。

## vscode配置坑

### tools gopath

首先，vscode的一些golang相关功能需要你去下一些golang工具才能使用，为了让你的gopath不被这些golang工具所搞乱，它有一个专门指定的tools gopath。但是这个tools gopath不是默认有的，需要自行配置，如果不自行配置，那么他会默认使用当前go版本的gopath。

那么在多版本情况下，这个tools gopath能不能随便设置到一个go版本的gopath中呢。答案是不可以，最好指定到最新的go版本的gopath中，并且使用最新的go版本来安装。因为，有一些工具需要更高版本的go来编译，低版本的go无法编译通过。

所以，在vs code中，在go插件的，extension settings，搜索tools gopath，填入最新的go版本即可。

### 代码补全，定义跳转等功能失败

可以尝试重新安装go工具，方法是在 vscode 中，输入快捷键：command(ctrl) + shift + p，在弹出的窗口中，输入：go:install/Update Tools，回车后，选择所有插件(勾一下全选)，点击确认，进行安装（最好翻墙安装）。接着重启vscode。