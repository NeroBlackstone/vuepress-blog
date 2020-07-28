---
date: 2020-7-6
tag: 
  - Golang
author: NeroBlackstone
location: NanChang
summary: 这个东西好奇怪哦
---

# golang中的内嵌（embedding）

本文总结自Effective go里的一小段。

golang不支持子类和继承，但是它却可以把类型“嵌入到结构体和接口中”来借用其他类型的方法。

接口的嵌入非常简单。比如定义有以下两个接口：

``` golang
type Reader interface {
    Read(p []byte) (n int, err error)
}

type Writer interface {
    Write(p []byte) (n int, err error)
}
```

io包还有几个接口，这些接口里面有多种方法。比如io.ReadWriter，它既有reader，又有writer。虽然可以显式的在ReadWriter接口定义里写明这两个函数定义，但是更优雅的方法是嵌入原来的两个接口以实现新的接口。

``` golang
// ReadWriter is the interface that combines the Reader and Writer interfaces.
type ReadWriter interface {
    Reader
    Writer
}
```

ReadWriter可以同时执行reader的操作和writer的操作，他是几个内嵌接口的并集。**必须是不相交的方法集合** 。只有接口才能嵌入到接口中。

相同的思想也可以用在结构体中，bufio包有两个结构体类型，bufio.Reader和bufio.Writer。两个都实现了io包中的类似接口。bufio还实现了带缓冲的readwriter，它通过同时嵌入reader和writer到一个结构体中来实现。它只提供了类型，没提供字段名称。

``` golang
// ReadWriter stores pointers to a Reader and a Writer.
// It implements io.ReadWriter.
type ReadWriter struct {
    *Reader  // *bufio.Reader
    *Writer  // *bufio.Writer
}
```

嵌入元素是指向结构体的指针。使用之前务必初始化。readwriter结构

（待续）