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

### List接口

List接口让子类可以有序地存储对象。并且这些对象是可重复的。

List接口由ArrayList, LinkedList, Vector, 和 Stack实现。

#### ArrayList类

ArrayList使用了**动态数组**来存储不同的数据类型的元素。ArrayList总是保持插入顺序，并且这个过程是**不同步**的（non-synchronized）。存储的元素可以被随机访问。

#### LinkedList类

LinkedList则使用**双向链表**来存储元素。LinkedList同样总是保持插入顺序，并且这个过程也是**不同步**的。

LinkedList相关操作非常快，因为其不需要像动态数组一样移位。

#### Vector类
Vector同样使用动态数组来存储数据元素。但是它是**同步**的。

#### Stack类
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

### Queue接口

Queue接口定义了先入先出的顺序。它可以被视为一系列待按顺序处理的元素的列表。PriorityQueue, Deque, and ArrayDeque实现了Queue接口
Queue接口定义了先入先出的顺序。它可以被视为一系列待按顺序处理的元素的列表。PriorityQueue, Deque, and ArrayDeque实现了Queue接口

#### PriorityQueue类

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

### Deque接口
Deque接口继承了Queue接口。在Deque中，我们可以在Queue两端操作元素。

#### ArrayDeque类

ArrayDeque类实现了Deque接口。它比ArrayList和Stack更快，并且没有容量限制。

### Set接口
set接口代表无序的元素集，且**不允许存储重复的项**。因此在Set中最多允许存放一个空值。HashSet, LinkedHashSet, 和 TreeSet实现了set接口。

#### HashSet类

HashSet使用哈希表进行集合的存储。

#### LinkedHashSet类

LinkedHashSet类是Set接口的链表实现。它继承了HashSet类。它保持了插入顺序和空元素。

### SortedSet接口

SortedSet是Set接口的替代。SortedSet的元素以升序排列。

#### TreeSet类

Java的TreeSet类实现了Set接口，使用树这种数据结构来存储数据。TreeSet的访问和遍历时间非常快速。TreeSet的元素以升序排列。

### Map接口
map表示一组键值对。每个键值对被称为一个entry（条目）。map的键是唯一的。

如果需要根据键搜索更新删除元素，map会很方便。

#### Map的结构层次
有两个接口继承了Map接口:Map和SortedMap。
三个类：HashMap, LinkedHashMap, 和TreeMap。

注意map不是由collection接口继承而来。

![java-map-hierarchy](./img/java-map-hierarchy.png)

map里的键是唯一的，但是值不是唯一的。
HashMap和LinkedHashMap运行空值，但是TreeMap不允许空值。

Map不可以被遍历，可以使用keySet()和entrySet() 转换它到Set。

####

## kotlin集合

kotlin集合的sets, lists, 和maps由一对接口组成。

- read-only（只读）接口只提供了集合元素的访问方法
- mutable（可写）接口继承了相应的read-only接口，带有可写的方法，增加，删除或是修改集合的元素。

需要注意的是mutable集合不需要被var修饰：写操作只会更改同一mutable集合对象，集合的引用不会发生更改。

read-only集合类型是**covariant/协变**的。这意味着如果Rectangle类从Shape继承，则可以在需要`List <Shape>`的任何地方使用`List <Rectangle>`。换句话讲，集合的元素类型可以是某个父类型的任意的子类型。

Map只有在value的类型上是协变的，在key的类型上不是协变的。

反之，mutable集合**不是协变的**，否则会导致运行时错误。如果`Rectangle`是`Shape`的子类型，在要求`MutableList <Shape>`的类型中插入其他的shape的子类型（`MutableList <Rectangle>`），会导致运行时错误。

有点复杂，举个栗子就比较清楚：
``` kotlin
open class Shape
class Rectangle:Shape()
class Circle:Shape()
fun foo(list:List<Shape>){}
fun bar(mlist:MutableList<Shape>){}
fun main() {
    val list= listOf(Rectangle(),Circle())
    foo(list)//ok!
    val mlist= mutableListOf(Rectangle())
    bar(mlist)//Error!
}
```