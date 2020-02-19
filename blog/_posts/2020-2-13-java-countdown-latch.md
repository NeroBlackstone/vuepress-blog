---
date: 2020-2-13
tag: 
  - java
  - kotlin
author: NeroBlackstone
location: NanChang
summary: 我为长者续一秒
---

# Java CountDownLatch 简介

本文将介绍CountDownLatch类并且在实际例子中演示如何使用它。通过使用CountDownLatch，我们可以使一个线程阻塞，直到其他线程完成给定的工作。

## 并发编程中的使用场景

简单来说，CountDownLatch有一个counter字段，可以按需减少这个数值。然后它会阻塞线程，直到倒数到0为止。

如果我们正在执行一些并行处理，可以使用和线程数量相同的值做counter实例化CountDownLatch。然后每当线程结束，就调用countdown()，确保调用await()的从属线程将阻塞，直到工作线程完成。

## 等待线程池完成

创建一个Worker，当它完成任务时，减少CountDownLatch字段：

``` kotlin
class Worker(private val outputScraper: MutableList<String>, private val countDownLatch: CountDownLatch) : Runnable {
    override fun run() {
        doSomeWork()
        outputScraper.add("Counted down")
        countDownLatch.countDown()
    }
}
```

然后创建一个测试，以证明我们可以取得CountDownLatch来等待Worker实例完成：

``` kotlin
@Test
@Throws(InterruptedException::class)
fun whenParallelProcessing_thenMainThreadWillBlockUntilCompletion() {
    val outputScraper = Collections.synchronizedList(mutableListOf<String>())
    val countDownLatch = CountDownLatch(5)
    repeat(5){
        thread(start = true){
            Worker(outputScraper, countDownLatch)
        }
    }
    countDownLatch.await()
    outputScraper.add("Latch released")
    assertThat(outputScraper)
        .containsExactly(
            "Counted down",
            "Counted down",
            "Counted down",
            "Counted down",
            "Counted down",
            "Latch released"
        )
}
```

“Latch released”将会总是最后一个输出，它取决于CountDownLatch何时停止阻塞线程。如果不调用await()，我们将无法保证线程执行的顺序，测试也会无法通过。

## 等待线程池开始

如果扩展一下前面的例子，但是这次不只启动5个线程，而启动上千个线程，有可能很多较早启动的线程会在较迟的线程开始执行前就结束。这会使重现并发故障非常困难，因为我们无法使所有线程都并行运行。

解决这个问题的方法是调整CountdownLatch的工作方式。除了在子线程完成前阻塞主线程，我们也可以在其他线程开始执行前阻塞子进程。

让我们修改run()方法，使之在运行前阻塞：

``` kotlin
class WaitingWorker(
    private val outputScraper: MutableList<String>,
    private val readyThreadCounter: CountDownLatch,
    private val callingThreadBlocker: CountDownLatch,
    private val completedThreadCounter: CountDownLatch
) : Runnable {
    override fun run() {
        readyThreadCounter.countDown()
        try {
            callingThreadBlocker.await()
            doSomeWork()
            outputScraper.add("Counted down")
        } catch (e: InterruptedException) {
            e.printStackTrace()
        } finally {
            completedThreadCounter.countDown()
        }
    }
}
```

现在修改测试，工作线程全部启动之前会进入阻塞状态，之后解除工作线程的阻塞，转为阻塞主线程，直到工作线程都完成任务。

``` kotlin
@Test
@Throws(InterruptedException::class)
fun whenDoingLotsOfThreadsInParallel_thenStartThemAtTheSameTime() {
    val outputScraper = Collections.synchronizedList(mutableListOf<String>())
    val readyThreadCounter = CountDownLatch(5)
    val callingThreadBlocker = CountDownLatch(1)
    val completedThreadCounter = CountDownLatch(5)
    repeat(5){
        thread(start = true){
            WaitingWorker(outputScraper, readyThreadCounter, callingThreadBlocker, completedThreadCounter)
        }
    }
    readyThreadCounter.await()
    outputScraper.add("Workers ready")
    callingThreadBlocker.countDown()
    completedThreadCounter.await()
    outputScraper.add("Workers complete")
    assertThat(outputScraper)
        .containsExactly(
            "Workers ready",
            "Counted down",
            "Counted down",
            "Counted down",
            "Counted down",
            "Counted down",
            "Workers complete"
        )
}
```

## 尽早结束CountdownLatch

有的时候，在CountdownLatch倒数到0之前，可能会遇到工作线程因为错误中止的情况。这可能导致计数器永远不会为0,这样await()永远不会结束。

``` kotlin
override fun run() {
    if (true) 
        throw RuntimeException("Oh dear, I'm a BrokenWorker")
    countDownLatch.countDown()
    outputScraper.add("Counted down")
}
```

修改之前的测试，await()将会永久堵塞。

``` kotlin
@Test
@Throws(InterruptedException::class)
fun whenFailingToParallelProcess_thenMainThreadShouldGetNotGetStuck() {
    val outputScraper = Collections.synchronizedList(mutableListOf<String>())
    val countDownLatch = CountDownLatch(5)
    repeat(5){
        thread(start = true){
            BrokenWorker(outputScraper, countDownLatch)
        }
    }
    countDownLatch.await()
}
```

显然这不是我们想要的行为，程序继续执行总比无限堵塞要好。为了解决这个问题，可以在调用await()时添加一个超时参数。

``` kotlin
val completed = countDownLatch.await(3L, TimeUnit.SECONDS)
assertThat(completed).isFalse()
```

这样超时的await()会返回false。