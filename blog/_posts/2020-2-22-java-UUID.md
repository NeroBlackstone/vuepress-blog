---
date: 2020-2-22
tag: 
  - java
  - kotlin
author: NeroBlackstone
location: NanChang
summary: 只要发生重复的几率够低，就不会重复（反墨菲定律）
---

# 在java/kotlin中使用UUID

UUID(Universally Unique Identifier)，也被称为GUID（Globally Unique Identifier）代表了**一个128位的值，具有唯一性。** UUID使用十六进制数字（8字节）为标准表示：

> 123e4567-e89b-12d3-a456-556642440000

UUID由32个16进制数字与4个"-"符号组成，**总共是36个字符。** 而Nil UUID是UUID的特殊形式，所有位均为0。

这篇文章将介绍如何在kotlin/java中使用UUID。

## UUID结构

先看一下这个示例UUID：

```
123e4567-e89b-42d3-a456-556642440000
xxxxxxxx-xxxx-Bxxx-Axxx-xxxxxxxxxxxx
```

A代表了决定UUID布局的变体（variant）。UUID中的其他位取决于变量字段的比特位设置。变体由A的3个最高有效位（most significant bit，简称MBS，是指一个n位二进制数字中的n-1位）决定，（后跟13-15 bits 时钟序列） ：

|MSB1 |  MSB2  | MSB3 | |
|-----| ----- | -----|-----|
| 0   |   X    |  X   | reserved (0) |
| 1   |   0    |  X   | current variant (2) |
| 1   |   1    |  0   | reserved for Microsoft (6) |
| 1   |   1    |  1   | reserved for future (7) |

上面UUID中A的值为'a'，二进制等效于1010，但是我们只需要取前面不同的两位也就是10xx，也就是变体为2。B的值代表版本。上面UUID的版本是4。

java提供了取得UUID中变体和版本的方法：

``` kotlin
val variant = uuid.variant()
val version = uuid.version()
```

变体2的UUID有5个不同的版本：基于时间生成的UUIDv1，基于DCE安全生成的UUIDv2，基于名称生成的UUIDv3和UUIDv5，随机生成的UUIDv4。

Java提供了v3和v4的实现，但是也提供了用于生成任何类型UUID的构造函数。

``` kotlin
val uuid=UUID(mostSigBits:Long,leastSigBits:Long)
```

## 版本3和版本5

UUID是使用命名空间和名称的哈希决定的。UUID的命名空间标识符（namespace identifiers）可以是诸如域名系统DNS，或是URL，还可以是对象标识符OIDs(Object Identifiers)。

> UUID = hash(NAMESPACE_IDENTIFIER + NAME)

在UUIDv3和UUIDv5的唯一区别是哈希算法： v3使用MD5(128位)然而v5使用了SHA-1（160位）。

简单来讲，这两个版本的UUID就是将哈希结果值截断为128位，然后替换掉4比特来表示版本，和2比特表示变体。

下面的代码用于生成v3版本的UUID：

``` kotlin
val source: String = namespace + name
val bytes = source.toByteArray(charset("UTF-8"))
val uuid = UUID.nameUUIDFromBytes(bytes)
```

注意java只提供了v3和v4的实现，v5没有提供。

## 版本4

UUIDv4的使用随机数字生成。java使用了SecureRandom来实现UUID生成，以不可用预测的值作为种子来产生随机数，以降低重复的可能性。下面是生成v4 UUID的方法：

``` kotlin
val uuid = UUID.randomUUID()
```

实践中，可以使用'SHA-256'和随机UUID来产生唯一的键值：

``` kotlin
val salt = MessageDigest.getInstance("SHA-256")
salt.update(UUID.randomUUID().toString().toByteArray(charset("UTF-8")))
//将byte array转为16进制字符串
//X 表示以十六进制形式输出 02 表示不足两位,前面补0输出
val digest = salt.digest().joinToString("") { "%02x".format(it) }
```

## 总结

UUIDv3和UUIDv5有一个非常好的特性：在相同的命名空间和相同的名称下，就可以生成相同的UUID。