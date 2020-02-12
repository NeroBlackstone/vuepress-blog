---
date: 2020-2-8
tag: 
  - java
  - kotlin
author: NeroBlackstone
location: NanChang
summary: 如何创建线程池
---

# Java ExecutorService 简介

ExecutorService是一个jdk提供的框架，用于简化异步模式下任务的执行。ExecutorService提供了线程池和分配任务的API。

## 实例化ExecutorService

### ExecutorService的工厂方法

创建ExecutorService最简单的方法是使用Executors类的工厂方法。举个例子，下面的代码将会创建带有10个线程的线程池。

``` kotlin
val executor = Executors.newFixedThreadPool(10)
```

还有几种其他工厂方法可以用于创建满足特定条件的预定义ExecutorService。

### 直接创建ExecutorService

因为ExecutorService是接口，所以可以使用其所有实现的实例。java.util.concurrent包里有几种实现可供选择，你甚至可以自己去实现一个。

举个例子，ThreadPoolExecutor类有一些构造函数用于配置executor service和内部的线程池。

``` kotlin
val executorService: ExecutorService = ThreadPoolExecutor(
        1, 1, 0L, TimeUnit.MILLISECONDS, LinkedBlockingQueue()
    )
```

### 给ExecutorService分配任务

ExecutorService可以执行Runnable和Callable任务。

``` kotlin
val runnableTask = Runnable {
    try {
        TimeUnit.MILLISECONDS.sleep(300)
    } catch (e: InterruptedException) {
        e.printStackTrace()
    }
}

val callableTask = Callable {
    TimeUnit.MILLISECONDS.sleep(300)
    "Task's execution"
}

val callableTasks= listOf(callableTask,callableTask,callableTask)
```

任务可以通过几个方法分配给ExecutorService，包括execute()（这个方法是从Executor接口继承的），以及submit(), invokeAny(), invokeAll()。

execute()方法返回值为空，无法获得任务执行的结果或是检查任务的状态（正在执行或是已执行）。

``` kotlin
executorService.execute(runnableTask)
```

submit()提交一个Callable或是Runable任务到ExecutorService中，并且以Future返回结果。

```kotlin
val future = executorService.submit(callableTask)
```

invokeAny()将一个任务集合分配到ExecutorService中，并执行所有任务，若任务成功执行，返回任务成功执行后的结果。

``` kotlin
val result = executorService.invokeAny(callableTasks)
```

invokeAll()将任务集合分配到ExecutorService中，每个任务都会被执行，并且以Future对象列表返回任务执行的结果。

``` kotlin
val futures = executorService.invokeAll(callableTasks)
```

## 关闭ExecutorService

通常，当没有任务处理时，ExecutorService不会自动销毁。它将会持续存在并且等待任务执行。

这种特性在某些情况下还是有用的，比如有可能我们的程序需要处理不定时出现的任务，或者在编译的时候不清楚以后要执行的任务量。

但是，副作用是，当程序快运行结束时无法结束，因为ExecutorService持续存在，jvm会持续运行。要正确的关闭ExecutorService，我们需要shotdown和shutdownNow() API。

shutdown方法不会立刻破坏ExecutorService。它将使ExecutorService停止接受新任务，当现有线程工作完成后才会结束ExecutorService。

``` kotlin
executorService.shutdown()
```

shotdownNow()方法会尝试立即销毁ExecutorService，但不能保证所有运行中的线程同时停止。这个方法会返回一个等待处理的任务列表。程序员可以自行决定如何处理这些任务。

``` kotlin
val notExecutedTasks= executorService.shutdownNow()
```

oracle推荐的关闭线程池方法是用awitTermination()方法结合使用上面两个方法。这样ExecutorService会先停止执行新任务，并在指定的时间内等待任务完成，如果超时，执行会立刻停止。

```kotlin
executorService.shutdown()
try {
    if (!executorService.awaitTermination(800, TimeUnit.MILLISECONDS)) {
        executorService.shutdownNow()
    }
} catch (e: InterruptedException) {
    executorService.shutdownNow()
}
```

## Future接口

submit()和invokeAll方法返回一个类型为Future的对象或对象集合，这使我们能够获取任务执行的结果或检查任务的状态（执行中或已结束）。

Future接口提供了特殊的阻塞方法get()，会返回一个Callable任务执行的结果，对于Runnable任务，返回null。在任务仍在运行时调用get()将导致执行阻塞，直到任务正确执行并且取得结果。

``` kotlin
val future = executorService.submit<String>(callableTask)
var result: String? = null
try {
    result = future.get()
} catch (e: InterruptedException) {
    e.printStackTrace()
} catch (e: ExecutionException) {
    e.printStackTrace()
}
```

由于get()函数长时间的阻塞，程序的性能可能会下降。如果结果不是至关重要的，可以设定时限来避免这样的问题。

``` kotlin
val result = future[200, TimeUnit.MILLISECONDS]
```

如果执行时间超出指定时间（在上面这种情况下为200ms），将会抛出TimeoutException。isDone()方法可以用来检测分配的任务是否已经处理。

Future接口还提供了cancel()方法来取消任务执行，以及检查是否取消的方法isCancelled()：

``` kotlin
val canceled = future.cancel(true)
val isCancelled = future.isCancelled
```

## ScheduledExecutorService接口

ScheduledExecutorService在预定义的延迟之后或是定期运行任务。实例化ScheduledExecutorService的最佳途径是使用Executors类的工厂方法。

下面的代码可以创建单线程的ScheduledExecutorService：

``` kotlin
val executorService = Executors.newSingleThreadScheduledExecutor()
```

要在固定时延后安排单个任务的执行，可以使用ScheduledExecutorService的scheduled()方法。有两个scheduled()函数可以执行Runnable和Callable任务：

``` kotlin
val resultFuture= executorService.schedule<String>(callableTask, 1, TimeUnit.SECONDS)
```

上面的代码在执行callableTask前会延迟1s。

scheduleAtFixedRate()方法可以在固定时延后执行定期任务。下面的代码将延迟100ms后执行任务，之后将以450ms为周期重复执行任务。如果处理器需要比scheduleAtFixedRate() 函数的周期参数更长的时间来执行分配的任务，ScheduledExecutorService将等到现有任务完成才开始下一个：

``` kotlin
val resultFuture= service.scheduleAtFixedRate(runnableTask, 100, 450, TimeUnit.MILLISECONDS)
```

如果必须在任务迭代之间有固定长度的时延，应该使用scheduleWithFixedDelay()。举个例子，以下代码将保证在当前执行任务结束后和另一个任务开始前有150ms的暂停。

``` kotlin
service.scheduleWithFixedDelay(task, 100, 150, TimeUnit.MILLISECONDS)
```

scheduleAtFixedRate()和scheduleWithFixedDelay()方法执行的定期任务将会在ExecutorService结束时结束，或者如果任务执行时有异常抛出，定期任务也将结束。

## ExecutorService与Fork / Join

Java 7发行后，许多开发人员决定将ExecutorService框架替换为fork / join框架。但是，这并不总是正确的决定。尽管使用的简便性和与fork / join相关的频繁的性能提升，开发人员对并发执行的控制量也有所减少。

ExecutorService使开发人员能够控制所生成线程的数量以及应由单独的线程执行的任务的粒度。ExecutorService的最佳用例是按照“一个线程处理一个任务”的方案处理独立任务，例如事务或请求。

相反，根据Oracle的文档，fork / join旨在加快工作速度，该工作可以递归分解为较小的部分。

## 总结

尽管ExecutorService非常容易使用，但是仍然有一些使用时常犯的错误：

- **未使用的ExecutorService未被中止** 可以查看上文如何关闭ExecutorService
- **当使用固定长度的线程池时使用了错误的线程池容量** 确定程序有效执行任务所需的线程数量非常重要。太大的线程池会导致不必要的开销，大多数线程将会处于等待模式。太小的线程池又会导致应用假死，因为队列中的任务往往会等待很长的时间。
- **取消任务后去调用Future的get()方法** 尝试取得已经取消的任务的结果将会引发CancellationException异常。
- **使用Future的get()方法发生了长时间的阻塞** 应该设定超时时间来避免意外的等待。