---
date: 2020-1-20
tag: 
  - JVM
  - java
author: NeroBlackstone
location: NanChang
summary: 和永久代有什么区别呢？
---

# 简单了解Java8的元空间

元空间（Metaspace）是java8引入的新的内存空间，用于存储类的元信息。**它取代了老的永久代(PermGen)。元空间存放在可自动增长的本地内存中(Natice memory)** ，并且引入了新的选项：

- *MetaspaceSize* 和 *MaxMetaspaceSize* 可以设置元空间的容量上限。
- *MinMetaspaceFreeRatio* 是指GC后，最小可用的类元数据占比。
- *MaxMetaspaceFreeRatio* 指GC后，为避免元空间减少，最大可用的类元数据占比。

新的元空间也有益于GC。一旦类的元数据使用量达到元空间的最大值，GC可以自动触发清理无用的类。

因此，**元空间的出现，让JVM降低了发生OutOfMemory错误的几率。** 不过尽管有这些改进，但是依然需要监视和优化元空间以防潜在的内存泄露。