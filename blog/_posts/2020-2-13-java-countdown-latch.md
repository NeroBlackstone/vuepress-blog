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