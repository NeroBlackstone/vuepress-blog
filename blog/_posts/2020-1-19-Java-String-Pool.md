---
date: 2020-1-19
tag: 
  - JVM
  - java
author: NeroBlackstone
location: NanChang
summary: 看完就懂了
---

# Java字符串池，你懂吗？

String应该是我们在java里用过最多的类了。在这篇文章中，将讨论java的字符串池(String Pool)————**这是一块特殊的内存区域，JVM用其存储字符串。**

## 字符串驻留(String Interning)

由于字符串在java中的不变性，JVM可以通过**在池中仅存储一份每个字符串的拷贝** 来优化内存分配。这个过程就叫做*驻留(literning)* 。

当创建并且给一个*String* 变量赋值时，JVM会在池里搜索等值的*String* 。

**如果找到，Java编译器将直接返回到这个内存地址的引用，而不再分配额外的内存。** 如果未找到，字符串将会填加到池中，然后返回它的引用。

写一段kotlin代码验证一下：

>要使用assert函数必须打开JVM的`-ea`选项

``` kotlin
val constantString1 = "NeroBlackstone"
val constantString2 = "NeroBlackstone"
assert(constantString1===constantString2)
```

可以发现没有抛出`java.lang.AssertionError`异常，说明指向的是同一地址。

## 使用构造函数分配字符串

当使用构造函数创建字符串时，编译器将创建新的对象，并且将其存储到JVM的堆中。每个通过构造函数创建的字符串都会指向不同的内存区域，故有不同的地址。

看一下和上面有和不同：

``` kotlin
val constantString1 = "ABC"
val charArray=charArrayOf('A','B','C')
val constantString2 = String(charArray)
assert(constantString1===constantString2)
```

这次抛出了`java.lang.AssertionError`异常。

## 字符串字面量和字符串对象

**当我们使用构造函数创建字符串对象时，它总是要在堆中创建新对象。而与之相对，如果直接用字符串字面量创建一个对象，如果其在字符串池中已经存在，会直接从池中返回。** 否则将创建一个新的字符串对象，并且放入字符串池以备将来使用。

从顶层上看，都只是字符串对象，主要的区别在构造函数总是创建一个新对象，而使用字面量创建字符串，会优先使用驻留的对象。

``` kotlin
val charArray=charArrayOf('A','B','C')
val constantString1 = String(charArray)
val constantString2 = String(charArray)
assert(constantString1===constantString2)
```

抛出了`java.lang.AssertionError`异常，可以看出使用构造函数的话会是两个不同的地址。

**一般来说应尽可能使用字面量的创建方法。** 它更加易于阅读并且让编译器更容易优化代码。

## 手动驻留

其实我们可以通过在字符串对象上调用intern()函数手动将其驻留到池中。手动驻留字符串将会把它的引用存到池中，如果再需要JVM会返回这个引用。

比如像这样：

``` kotlin
val charArray=charArrayOf('A','B','C')
val constantString1 = String(charArray)
val constantString2 = constantString1.intern()
assert(constantString1===constantString2)
```

并不丢出`java.lang.AssertionError`异常,地址相等。

## java9新特性

java8时代，字符串在底层表示为字符串数组*char[]*，使用*UTF-16*编码，每个字符占用两个字节。

到了java9以后提供了一种新的表示方法，叫做*紧凑字符串(Compact Strings)* 。这种新格式将根据存储内容，在*char[]* 和 *byte[]* 间选择正确的编码。

由于新的紧凑字符串只在需要时才使用*UTF-16* ，因此堆内存的大小将会显著降低，也意味着GC开销会更小。

这是一个默认启用并实现的功能，你无需任何调整就能享受到新的优化。