---
date: 2020-1-31
tag: 
  - java
author: NeroBlackstone
location: NanChang
summary: 使用弱引用的实例
---

# WeakHashMap那些事

前面有文章谈了java中的四类引用。WeakHashMap就是其中弱引用的使用实例。

WeakHashMap是基于哈希散列的Map接口的实现，但是它的键是弱引用的。

当这个WeakHashMap的键不再被使用时，对应整个条目会被自动删除。所以这个映射的行为与其他映射有所不同。

为了了解原理，在这篇文章中将自行设计一个简单的缓存实现。但是这仅仅是为了了解这个映射的原理，请不要在代码实践中照搬。

## 使用WeakHashMap做缓存

假设我们想构建一个缓存来存储极大的图片对象，图片名做键名。这时候应该选择一个适当的映射实现。

直接用HashMap显然不是个好主意，因为对象占空间太大了，即使有的对象不使用，它们也不会被回收GC进程从缓存中回收。

因此我们需要一个允许GC自动删除无用对象的Map实现。当图片的键没有被程序使用，整个条目都会从内存中删掉。

WeakHashMap就是我们想要的！下面测试WeakHashMap并且观察它的行为：

``` kotlin
val map = WeakHashMap<UniqueImageName?, BigImage?>()
val bigImage = BigImage("image_id")
var imageName: UniqueImageName? = UniqueImageName("name_of_big_image")

map[imageName] = bigImage
assertTrue(map.containsKey(imageName))

imageName = null
System.gc()

await().atMost(10, TimeUnit.SECONDS).until(map::isEmpty)
```

先创建一个拿来存BigImage对象的WeakHashMap，我们将BigImage作为映射的值，imageName对象引用作为键。imageName将使用弱引用存于映射中。

下面将imageName引用设定为null，因此不再会有引用指向bigImage对象。默认情况下，WeakHashMap会在下一次GC执行时回收没有引用的条目。

之后调用System.go强制触发GC。GC结束后，WeakHashMap便会为空。

``` kotlin
val map = WeakHashMap<UniqueImageName?, BigImage?>()
val bigImageFirst = BigImage("foo")
var imageNameFirst: UniqueImageName? = UniqueImageName("name_of_big_image")

val bigImageSecond = BigImage("foo_2")
val imageNameSecond = UniqueImageName("name_of_big_image_2")

map[imageNameFirst] = bigImageFirst
map[imageNameSecond] = bigImageSecond

assertTrue(map.containsKey(imageNameFirst))
assertTrue(map.containsKey(imageNameSecond))

imageNameFirst = null
System.gc()

await().atMost(10, TimeUnit.SECONDS)
    .until({ map.size == 1 })
await().atMost(10, TimeUnit.SECONDS)
    .until({ map.containsKey(imageNameSecond) })
```

这个例子中，只有imageNameFirst设为空，而imageNameSecond引用未改变。在GC后，整个映射就剩imageNameSecond一个条目了。