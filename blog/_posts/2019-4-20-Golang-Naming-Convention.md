---
date: 2019-4-20
tag: 
  - Golang
author: NeroBlackstone
location: NanChang
summary: 均求证于官方资料
---

# 一些常见的Golang命名/编码规范

下列命名规范均求证于官方网站[Effective Go](https://golang.org/doc/effective_go.html#package-names)
及[官方github code review规范](https://github.com/golang/go/wiki/CodeReviewComments#package-comments)。

## 包名

package使用**小写，单个单词** 的命名。不需要下划线和混合多个单词。

可能有人会担心这样很容易重包名，但是包仅仅是导入的默认名称，在源代码中无需独一无二。如果发生冲突，可以局部的使用另一个命名。

**包名需要和存放包源文件的文件夹名相同** 。在src/encoding/base64中的包以"encoding/base64"的方式导入，包命名为base64, 而不是 encoding_base64或是encodingBase64。

## 包注释

在**包名上方必须写一行包注释** 。中间不能有空行。例如

``` go
// Package math provides basic constants and mathematical functions.
package math
```

main包的包注释，写上其生成的二进制可执行文件名称。例如，对于文件夹`seedgen`里的main包，可以这样写注释：

``` go
// Program seedgen ...
package main
```

注意：包注释不能是以小写单词开头的句子，因为它是公共可见的，所以要用正确的英文。当二进制可执行文件名是包注释的第一个单词，也必须对其大写，即使cli里的调用和包注释的拼写不一致。

``` go
// Seedgen ...
package main
```

## 文档注释

所有顶层，且会导出的命名，都应该具有文档注释。不常见的包内私有函数和类型也应该写好文档注释。

## 构造函数名

如果ring包里有一个类型Ring。通常情况，类型的构造函数会被命名为New+类型名：NewRing()。

但在另一种特殊情况下：Ring是ring包导出的唯一类型。并且包名也为ring，那么构造函数可以直接命名为New。用ring.New()来使用构造函数。

## 文件名

文件名的命名遵循**和包名同样** 的规范。但又有下列特殊情况。

1. 文件名由`.`或者`_`开头的话会自动被go tool忽略。
2. 文件名以`_test.go`结束只会被`go test`工具编译。
3. 文件名带有os和处理器架构名只会为指定平台编译。例如name_linux.go只会为linux上构建，name_amd64.go只会为amd64架构的处理器上构建。文件顶部的构建约束注释作用相同。

## 变量名与常量名

基本守则：变量的命名使用的越广，其名称就越应该清晰具体而有描述性。

在go中，对**作用域有限的局部变量** 来说，变量应该短而不是长。。例如使用`c`来指代`lineCounter`，用`i`来指代`sliceIndex`。循环索引或是reader之类的常见变量也可以是单个字母（i，r）。

不常见/全局的变量需要更具描述性的名称。

**变量使用小写字母驼峰命名。常量使用大写字母驼峰命名** 。如mixedCaps和MixedCaps。

变量和常量均不推荐使用下划线来链接多个单词。

## Getter和Setter

Go语言没有内建的Getter和Setter支持（不像kotlin）。在go中自己按需实现getter和setter是通用的做法。但是go中用GetXxxx作为getter名称并不符合规范。

如果有一个名为owner（小写，未导出）的字段，那么getter方法应称为Owner（）（大写，导出），而不是GetOwner。而setter函数，命名为SetOwner。

``` go
owner := obj.Owner()
if owner != user {
    obj.SetOwner(user)
}
```

## 接口命名

按照官方规范，单个方法的接口的命名，是在其方法名后，加上`er`后缀，或者相似的修饰名的**名词** 。例如：Reader, Writer, Formatter, CloseNotifier。

而接口中的方法命名，若标准库中也具有同名方法，例如`Read, Write, Close, Flush, String`等词，那么如果接口的方法签名与标准库中不同，按照规范，不应该使用相同的名字。相反，如果接口的方法与熟知类型上的方法签名相同，则可以使用相同的名字。例如一个字符转换方法命名为`String`而不是`ToString`。

## 接收者命名

方法接受者的命名应该反映其身份。**通常使用一个或两个字母的类型名缩写** 就足够了。例如对Client类型使用"c"或"ci"做为接受者命名。但也要保持一致性，如果已经使用"c"作为接受者的名字，不要再在另一个方法中命名为"ci"。

不要使用一些其他oop语言中具有特殊含义的通用命名，例如"me"，"this","self"。

## 声明空切片

当声明空切片时：

最好使用：
``` go
var t []string
```

而不是：
``` go
t := []string{}
```

前者声明了一个值为nil的切片，而后者值为非nil但长度为0。这两者功能相同，它们的len和cap均为0，但是nil切片是首选。

## 不要使用Painc

对普通错误，不要使用panic。使用error和多返回值。

## 错误处理

不要使用`_`丢弃错误。如果函数返回错误，请检查它以确保函数成功。处理错误，将其返回，或者在真正异常的情况下使用panic。

## 错误字符串

错误字符串不应该应该是大写（除非以专有名词或缩写开头），或者以标点符号结束。 也就是说，使用`fmt.Errorf("something bad")`而不是`fmt.Errorf("Something bad")`。所以`log.Printf("Reading %s: %v", filename, err)`不会中间突然出一个大写字母。

但这不适用于日志，它一般是默认从新行打印。不会在其他消息中合并。

