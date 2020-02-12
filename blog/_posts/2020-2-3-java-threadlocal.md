---
date: 2020-2-3
tag: 
  - java
  - kotlin
author: NeroBlackstone
location: NanChang
summary: 如何存储只被特定线程私有的数据
---

# java ThreadLocal 简介

ThreadLocal允许我们存储**只能被特定线程访问** 的数据。

假设我们现在需要一个与特定线程绑定的Integer值：

``` kotlin
val threadLocalValue = ThreadLocal<Int>()
```

接想从线程中使用该值，只需要调用get()/set()方法。可以理解为ThreadLocal将数据存储在以线程为键的映射中。

可以在threadLocalValue上调用get方法来为当前线程取得整数值：

``` kotlin
threadLocalValue.set(1)
val result = threadLocalValue.get()
```

也可以通过向withInitial静态函数传值来初始化ThreadLocal实例：

``` kotlin
val threadLocal = ThreadLocal.withInitial { 1 }
```

要从ThreadLocal中删除值，我们可以调用remove()方法：

``` kotlin
threadLocal.remove()
```

要了解如何正确使用ThreadLocal，先看一个没用ThreadLocal的例子，然后用ThreadLocal重写这个例子。

## 在映射中存储用户数据

假设有一个需要根据给定的用户id存储特定用户上下文数据的程序：

``` kotlin
class Context(private val userName: String)
```

我们希望每个用户id都交由一个线程去处理。先创建一个SharedMapWithUserContext类实现了Runnable接口。run()方法中，通过UserRepository类调用数据库，用给定的userId返回了一个Context对象。

然后根据userId为键将上下文传入ConcurentHashMap：

``` kotlin
class SharedMapWithUserContext(private val userId: Int) : Runnable {
    private val userRepository= UserRepository()
    override fun run() {
        val userName: String = userRepository.getUserNameForUserId(userId)
        userContextPerUserId[userId] = Context(userName)
    }
    companion object {
        var userContextPerUserId: MutableMap<Int?, Context> = ConcurrentHashMap()
    }
}
```

两个不同的userId分别创建两个线程，并且断言可以看出已经有两个条目在userContextPerUserId映射中:

``` kotlin
thread(start = true) { SharedMapWithUserContext(1) }
thread(start = true) { SharedMapWithUserContext(2) }
assertEquals(SharedMapWithUserContext.userContextPerUserId.size, 2)
```

## 在ThreadLocal存储用户数据

我们可以重写上面的例子，以ThreadLocal存储用户上下文。每个线程将有自己的ThreadLocal实例。

使用ThreadLocal需要非常小心，因为每个ThreadLocal实例都与特定的线程相关。在下面的示例中，每个特定的userId都有专用线程，并且这些线程由我们自己创建，可以完全控制它们。

run()方法将获取用户上下文并用set()方法将其存储在ThreadLocal变量内：

``` kotlin
class ThreadLocalWithUserContext(private val userId: Int) : Runnable {
    private val userRepository= UserRepository()
    override fun run() {
        val userName: String = userRepository.getUserNameForUserId(userId)
        userContext.set(Context(userName))
        println("thread context for given userId: $userId is: ${userContext.get()}")
    }
    companion object {
        private val userContext: ThreadLocal<Context> = ThreadLocal<Context>()
    }
}
```

可以通过启动两个线程对其进行测试，这两个线程都会对给定的userId执行操作：

``` kotlin
thread(start = true) { ThreadLocalWithUserContext(1) }
thread(start = true) { ThreadLocalWithUserContext(2) }
```

运行此段代码后，我们将在标准输出中看到为每个线程设置的ThreadLocal：

```
thread context for given userId: 1 is: Context{userNameSecret='18a78f8e-24d2-4abf-91d6-79eaa198123f'}
thread context for given userId: 2 is: Context{userNameSecret='e19f6a0a-253e-423e-8b2b-bca1f471ae5c'}
```

我们可以看到每个用户都有自己的上下文。

## 不要将ThreadLocal和ExecutorService一起用

如果我们要使用ExecutorService并向其提交Runnable，则使用ThreadLocal会产生不确定的结果-因为我们无法保证给定userId的每个Runnable动作每次执行时都会由同一个线程处理。

因此，我们的ThreadLocal将在不同的userId之间共享。这就是为什么我们不应该将TheadLocal与ExecutorService一起使用。仅当我们完全控制哪个线程将选择要执行的可运行操作时，才应使用它。