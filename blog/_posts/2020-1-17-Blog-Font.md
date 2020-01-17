---
date: 2020-1-17
tag: 
  - css
  - stylus
author: NeroBlackstone
location: NanChang
summary: 并没有云果粉
---

# 关于Buefy的西文字体选择

那天有人看了本人博客的字体设置以为我云果粉了。实际上我并没有特意设置字体相关，这部分样式属性应该是Buefy的组件库在控制，看了下组件库源码也确实如此。

源码是这样的：
``` css
body {
  font-family: BlinkMacSystemFont, -apple-system, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", "Helvetica", "Arial", sans-serif;
}
```

诶，居然是苹果的字体放最先。确实给人一种果粉的错觉。

实际上这是一种十分机智的字体fallback机制，我们都知道浏览器会依次套用`font-family`的字体属性，没有就套下一个，而上面这条css属性，刚刚好可以让不同的设备使用最适合的西文字体。

下面开始逐个解读这里面的字体。

## 解读

### BlinkMacSystemFont, -apple-system

这两个属性是Webkit的私有属性，前者被mac上的chrome识别，后者被safari识别。这两个值可以根据系统版本的不同，渲染不同的字体。（是不是非常神奇）。

### "Segoe UI", "Roboto", "Oxygen", "Ubuntu"，"Cantarell","Fira Sans","Droid Sans"

Segoe UI是由微软公司开发的并且广泛使用的字体，从windows vista开始使用。

Roboto是为Android操作系统设计的一个无衬线字体，从android 4开始启用。

Oxygen是为Linux KDE桌面环境创造的字体。

Ubuntu是从ubuntu 10.10开始使用的系统字体。

Cantarell是Linux GNOME桌面环境3.0版本以后的UI默认字体。

Fira Sans是一个专为Firefox OS移动操作系统所设计的无衬线字体。

Droid是Android 4.0系统之前的标准字体。

好，基本到这里覆盖了从Mac/ios，windows，到各类linux桌面环境，android各版本，甚至还包括了firefox os这种小众设备的系统字体。如果你的设备还不是上述任何一个（讲真真有可能，因为我的小米4用过一段时间Sailfish OS），那么进入后续的fallback。

###  "Helvetica Neue", "Helvetica", "Arial"

Helvetica Neue是Mac OS X El Capitan版本之前的字体。

Helvetica是一种广泛使用于拉丁字母的无衬线字体。

Arial是从windows 3.1开始微软windows系统自带的一个字体。

### sans-serif

最后的fallback，sans-serif放最后这个算是国际惯例（w3c规范）了，在上面的字体全部没有的情况下，使用sans-serif（无衬线字体）。

## 加入抗锯齿

了解了这么多就再新加入一些后续优化吧！

``` stylus
  body
    -webkit-font-smoothing antialiased
    -moz-osx-font-smoothing grayscale
```

为了显示效果可以加入抗锯齿(字体平滑)效果。但是这是一个非标准css属性。

Webkit 实现了名为-webkit-font-smoothing的属性，而Firefox 实现了名为 -moz-osx-font-smoothing 的属性。这两个属性仅在 Mac OS X 下生效。(Mac大法好)

## 加入中文字体fallback

嘛，老外的组件库只考虑了英文，那么我修改一下，也考虑一下中文阅读的情况，加入PingFang SC,Hiragino Sans GB,Microsoft YaHei,SimSun。分别照顾了Mac和windows浏览的情况。

``` stylus
body
    font-family BlinkMacSystemFont, -apple-system, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", "Helvetica", "Arial",PingFang SC,Hiragino Sans GB,Microsoft YaHei,SimSun, sans-serif;
```

