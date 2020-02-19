---
date: 2020-2-16
tag: 
  - java
  - kotlin
author: NeroBlackstone
location: NanChang
summary: 信号量怎么用
---

# java Semaphores简介

本文简单讨论java中的信号量(semaphores)和互斥量(mutexes)。

## 信号量

信号量来自java.util.concurrent.Semaphore。我们可以使用信号量来限制访问特定资源的并发线程数。在下面的例子里，实现了一个简单的登录队列来限制系统中的用户数量：

``` kotlin
class LoginQueueUsingSemaphore(slotLimit: Int) {
    private val semaphore = Semaphore(slotLimit)
    fun tryLogin(): Boolean = semaphore.tryAcquire()
    fun logout() = semaphore.release()
    fun availableSlots(): Int =semaphore.availablePermits()
}
```

注意下面的方法的作用：
- tryAcquire() - 如果许可可用，且可以立即取得许可，返回true，否则返回false。但是acquire()方法获取许可时会阻塞线程，直到许可可用。
- release() - 返还一个许可
- availablePermits() - 返回可用的许可数

要测试登录队列，我们可以先尝试达到数量上限，并且检查下一次尝试登录是否会被阻塞：

``` kotlin
@Test
fun givenLoginQueue_whenReachLimit_thenBlocked() {
    val slots = 10
    val executorService = Executors.newFixedThreadPool(slots)
    val loginQueue = LoginQueueUsingSemaphore(slots)
    repeat(slots){
        executorService.execute { loginQueue.tryLogin() }
    }
    executorService.shutdown()
    assertEquals(0, loginQueue.availableSlots())
    assertFalse(loginQueue.tryLogin())
}
```

再看看登出以后是否还有slot：

``` kotlin
loginQueue.logout()
assertTrue(loginQueue.availableSlots() > 0)
assertTrue(loginQueue.tryLogin())
```

## 信号量 VS 互斥量

互斥量的行为类似于二进制信号量，我们可以使用它来实现互斥。在下面的例子中，将使用一个简单的二进制信号量来构建一个计数器：

``` kotlin
class CounterUsingMutex {
    private val mutex = Semaphore(1)
    var count = 0
        private set

    @Throws(InterruptedException::class)
    fun increase() {
        mutex.acquire()
        count += 1
        Thread.sleep(1000)
        mutex.release()
    }

    fun hasQueuedThreads(): Boolean = mutex.hasQueuedThreads()
}
```

当有许多线程同时尝试访问计数器，**都会被阻塞到队列中。**

``` kotlin
@Test
@Throws(InterruptedException::class)
fun whenMutexAndMultipleThreadsThenBlocked() {
    val count = 5
    val executorService = Executors.newFixedThreadPool(count)
    val counter = CounterUsingMutex()
    repeat(count) {
        executorService.execute {
            try {
                counter.increase()
            } catch (e: InterruptedException) {
                e.printStackTrace()
            }
        }
    }
    executorService.shutdown()
    assertTrue(counter.hasQueuedThreads())
}
```

如果后面主线程再接着等待，所有线程都会访问计数器，没有线程留在队列中：

``` kotlin
Thread.sleep(5000)
assertFalse(counter.hasQueuedThreads())
assertEquals(count, counter.count)
```