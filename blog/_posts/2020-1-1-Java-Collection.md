---
date: 2020-1-1
tag: 
  - java
  - kotlin
author: NeroBlackstone
location: NanChang
summary: 复习老东西
---

# Java/kotlin 集合类梳理

上次被人问了一些java集合类相关问题，太久没写java（大概快一年没写）记忆模糊，所以结合kotlin集合类来整理一下。

## 集合是什么

编程语言里的所谓集合，不仅支持了一组元素的存储，还定义了这些元素的相关操作（比如搜索，排序，插入删除）。

java为集合提供了Set, List, Queue, Deque（双端队列等）等接口，和ArrayList, Vector, LinkedList, PriorityQueue, HashSet, LinkedHashSet, TreeSet等类。

## java集合的层次结构

![java-collection-hierarchy](./img/java-collection-hierarchy.png)

可以看出先定义了Iterable，Iterable接口被Collection继承，Collection接口再被List，Queue，Set三大接口继承，最后他们的子类实现这些接口，最后就有了我们常用的java集合类。

## List接口

List接口让子类可以有序地存储对象。并且这些对象是可重复的。

List接口由ArrayList, LinkedList, Vector, 和 Stack实现。

### ArrayList类

ArrayList使用了**动态数组**来存储不同的数据类型的元素。ArrayList总是保持插入顺序，并且这个过程是**不同步**的（non-synchronized）。存储的元素可以被随机访问。

### LinkedList类

LinkedList则使用**双向链表**来存储元素。LinkedList同样总是保持插入顺序，并且这个过程也是**不同步**的。

LinkedList相关操作非常快，因为其不需要像动态数组一样移位。

### Vector类
Vector同样使用动态数组来存储数据元素。但是它是**同步**的。

### Stack类
Stack实际上是Vector的子类。它实现了先进后出的结构。

操作函数push（塞入），pop（弹出），peek（读取）。例如：

``` kotlin
fun main() {
    val stack=Stack<String>()
    stack.run {
        push("AAA")
        push("BBB")
        push("CCC")
    }
    println(stack.peek())
    println("--------")
    stack.pop()
    for (item in stack)
        println(item)
}
```

打印：
```
CCC
--------
AAA
BBB
```

## Queue接口

Queue接口定义了先入先出的顺序。它可以被视为一系列待按顺序处理的元素的列表。PriorityQueue, Deque, and ArrayDeque实现了Queue接口
Queue接口定义了先入先出的顺序。它可以被视为一系列待按顺序处理的元素的列表。PriorityQueue, Deque, and ArrayDeque实现了Queue接口

### PriorityQueue

PriorityQueue按照所存储元素的优先级处理元素。它不允许在其中存储空值。

常用操作add，element（用于访问下一个队列元素，队列为空访问抛出异常），peek（访问，队列为空不抛异常），remove（访问并移除下一个队列元素，队列为空抛出异常），poll（访问并移除下一个队列元素，队列为空不抛出异常）

例如：
``` kotlin
fun main() {
    val queue=PriorityQueue<String>()
    queue.run {
        add("AAA")
        add("BBB")
        add("CCC")
        add("DDD")
    }
    println("------")
    println(queue.element())
    println(queue.peek())
    println("------")
    for (item in queue)
        println(item)
    queue.remove()
    queue.poll()
    println("------")
    for (item in queue)
        println(item)
}
```

打印：
```
------
AAA
AAA
------
AAA
BBB
CCC
DDD
------
CCC
DDD
```