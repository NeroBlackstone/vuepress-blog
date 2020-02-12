---
date: 2020-2-12
tag: 
  - java
  - kotlin
author: NeroBlackstone
location: NanChang
summary: 这个包里的东西都不太好学
---

# 一次摸清java.util.concurrent包

java.util.concurrent包提供了创建并发应用的工具。

## 主要组件

java.util.concurrent包含了太多功能，一篇文章想要讲完非常难，所以只关注这个包里最有用的工具：

- Executor
- ExecutorService
- ScheduledExecutorService
- Future
- CountDownLatch
- CyclicBarrier
- Semaphore
- ThreadFactory
- BlockingQueue
- DelayQueue
- Locks
- Phaser

## Executor

Executor代表一个可以执行给定任务的对象的接口。任务在当前线程还是新线程中执行，取决于特定的Executor实现。使用这个接口，我们可以将任务执行流从实际任务执行中分离。

这里需要注意的是Executor不严格要求任务执行是异步的。在最简单的情况下，executor在调用线程中，可以立即执行提交的任务。

举个例子，我们可以创建一个实现executor的invoker：

``` kotlin
class Invoker : Executor {
    override fun execute(r: Runnable) = r.run()
}
```

现在，我们可以使用invoker来执行任务：

``` kotlin
fun execute() {
    val executor = Invoker()
    executor.execute {
        // task to be performed
    }
}
```

这里要注意的是，如果executor拒绝执行任务，将会抛出RejectedExecutionException。