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

## CyclicBarrier

CyclicBarrier的作用和CountDownLatch几乎相同，但是可以重复使用。不像CountDownLatch，它允许多个线程在结束前使用await()方法（也被称为屏障条件）互相等待。

我们需要一个Runnable任务来初始化屏障条件：

``` kotlin
class Task(private val barrier: CyclicBarrier) : Runnable {
    override fun run() {
        try {
            LOG.info("${Thread.currentThread().name} is waiting")
            barrier.await()
            LOG.info("${Thread.currentThread().name} is released")
        } catch (e: InterruptedException) {
            e.printStackTrace()
        } catch (e: BrokenBarrierException) {
            e.printStackTrace()
        }
    }
}
```

可以开启一些线程来测试屏障：

``` kotlin
fun start() {
    val cyclicBarrier = CyclicBarrier(3, Runnable {
        // ...
        LOG.info("All previous tasks are completed")
    })
    if (!cyclicBarrier.isBroken) 
        repeat(3){
            thread(start = true,name = "T${it+1}") { 
                Task(cyclicBarrier)
             }
        }
}
```

在这里使用isBroken属性来检查在执行是否有线程被中断。在实际运行线程前，都应该做这个检查。

## ThreadFactory

顾名思义，ThreadFactory可以根据需要创建新线程。它消除了创建线程的模板代码，让创建线程更加快捷。

如果你是kotlin用户，我强烈不建议使用ThreadFactory，因为它能做的kotlin提供的thread包装函数都能做，而且更加简洁。故不再详细介绍。

