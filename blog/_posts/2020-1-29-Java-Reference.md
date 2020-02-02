---
date: 2020-1-29
tag: 
  - java
author: NeroBlackstone
location: NanChang
summary: 写这篇文章的时候系统坏了．．写了两遍
---

# java的强／弱／软／虚引用

这篇文章讨论java的四种引用类型。

## 强引用

强引用是我们最常用的引用类型。类似val obj=Any()的引用即为强引用。任何被强引用指向的对象均不适合于GC。

## 软引用

在jvm绝对需要内存前，软引用指向的对象不会被回收。

建立软引用代码如下：

``` kotlin
val builder = StringBuilder()
val reference1 = SoftReference(builder)
```

软引用的取得与清除:

``` kotlin
val builder1: StringBuilder = reference2.get()
reference2.clear()
val builder2: StringBuilder = reference2.get() // null
```

或是初始化时与引用队列关联：

``` kotlin
val referenceQueue = ReferenceQueue<StringBuilder>()
val reference2 = SoftReference(builder, referenceQueue)
```

软引用使用前要记得判空：

``` kotlin
val builder3: StringBuilder = reference2.get()
if (builder3 != null) 
// GC hasn't removed the instance yet
else 
// GC has cleared the instance
```

## 弱引用

**当弱引用对象不可达时，GC会将其清除。**

弱引用对象会被GC优先回收，GC不会等到需要内存的时候再去回收弱引用对象。

弱可达性意味着**这个对象既没有被强引用指向，也没有被软引用指向。** 唯有遍历弱引用，才能达到该对象。

GC会优先清除弱引用，所以被引用对象将不再可达。然后这个引用会放置在引用队列中（如果事先给弱引用关联了引用队列），我们可以从引用队列中拿到被清除的引用。

与此同时，不可达的软引用对象将被GC回收。

### 使用场景

根据java官方文档，**弱引用最常用于实现规范化的映射。** 如果某映射只有一个特定值的实例，这个映射就是规范化的。

**WeakHashMap就使用了弱引用。** 它实现了*Map*接口，但是每个键都使用弱引用来存储。当GC移除键后，与键关联的实体也一并删除。

另一个使用场景是解决[Lapsed Listener](https://en.wikipedia.org/wiki/Lapsed_listener_problem) 问题。

发布者拥有对所有订阅者的强引用，以此来通知订阅者有事件发生。但是**如果订阅者不能成功地取消订阅，就会出现内存问题。**

因为发布者依然持有对订阅者的强引用，订阅者是不会被GC回收的，这样就产生了内存泄漏。

解决方法是发布者对订阅者持有弱引用，允许订阅者被垃圾回收，而不需要取消订阅。（注意这并不是完整的解决方案，它也会引入一些这里没提到的其他的问题）

### 弱引用代码实例

弱引用由*java.lang.ref.WeakReference*类表示。可以通过传入需要引用的对象来初始化弱引用。也可以提供一个相关联的引用队列。

``` kotlin
val referent = Any()
val referenceQueue = ReferenceQueue<Any>()
val weakReference1: WeakReference<*> = WeakReference(referent)
val weakReference2: WeakReference<*> = WeakReference(referent, referenceQueue)
```

其余操作均与上文的软引用相同。

## 虚引用

**虚引用无法被直接取得。** 这也是为什么一定需要引用队列来使用虚引用。**GC执行finalize()方法后** ，虚引用会被添加到引用队列。但是这时对象示实例仍存在内存中。

### 使用场景

虚引用可以用来**确定一个对象何时从内存中释放** ，我们可以等一个占空间很大的对象被移除再加载另一个对象。虚引用还可以让我们**使用自定义的finalize方法**。

### 代码实例

详细讲一下上文第二个使用场景，首先需要 PhantomReference的子类定义如何清除对象的方法。

``` kotlin
class LargeObjectFinalizer(referent: Any?, q: ReferenceQueue<in Any?>?) : PhantomReference<Any?>(referent, q) {
    fun finalizeResources() { // free resources
        println("clearing ...")
    }
}
```

现在可以控制每一个对象的finalization处理：

``` kotlin
val referenceQueue = ReferenceQueue<Any?>()
val references: MutableList<LargeObjectFinalizer> = ArrayList()
var largeObjects: MutableList<Any?>? = ArrayList()

repeat(10) {
    val largeObject = Any()
    largeObjects!!.add(largeObject)
    references.add(LargeObjectFinalizer(largeObject, referenceQueue))
}

largeObjects = null
System.gc()

var referenceFromQueue: Reference<*>
for (reference in references) 
    println(reference.isEnqueued)

while (referenceQueue.poll().also { referenceFromQueue = it } != null) {
    (referenceFromQueue as LargeObjectFinalizer).finalizeResources()
    referenceFromQueue.clear()
}
```

先初始化所有必须的对象：
- referenceQueue 用于跟踪入队的引用
- references 执行清除工作
- largeObjects 假装是个很大的数据结构

接下来初始化largeObject并且将其加入largeObjects的列表中，再把largeObject与引用队列相关联，构成虚引用，加入到虚引用列表中。

在调用GC前，我们可以通过取消largeObjects的引用，手动释放数据。System.gc()相当于调用Runtime.getRuntime().gc() (可查看java源码得知)。

不过Systm.gc并不会立即触发gc，它只是通知JVM去执行gc。

下面for循环内确保所有虚引用已经进入引用队列。每个引用均会打印true。

最后使用while循环轮讯入队引用并且执行自定义的清除工作。