---
date: 2020-2-21
tag: 
  - java
  - kotlin
author: NeroBlackstone
location: NanChang
summary: 延迟版BlockingQueue
---

# java DelayQueue简介

这篇文章将简单介绍java.util.concurrent里的DelayQueue。这也是一个可用于生产者-消费者程序中的阻塞队列。

它有一个很有用的特性 - **只有经过元素指定的延迟以后，当消费者才能队列中取出这个元素。**

## 在DelayQueue中实现元素延迟检索

每个放入DelayQueue的元素都需要实现Delayed接口。假设我们想创建一个叫DelayObject类，这个类的实例将会保存到DelayQueue中。

我们需要把String和delayInMilliseconds作为参数传入构造方法：

``` kotlin
class DelayObject(private val data: String, delayInMilliseconds: Long) : Delayed {
    private val startTime = System.currentTimeMillis() + delayInMilliseconds
    override fun toString(): String = "data=${this.data}, startTime=${this.startTime}"
}
```

上面定义了一个startTime - 这是该元素从队列中被消费的最早开始时间。下面应该实现getDelay()方法 - 它应该以给定的时间单位返回该元素剩余的延迟。

因此，我们需要使用TimeUnit.convert()方法以正确的时间单位返回剩余延迟。

``` kotlin
override fun getDelay(unit: TimeUnit): Long {
    val diff = startTime - System.currentTimeMillis()
    return unit.convert(diff, TimeUnit.MILLISECONDS)
}
```

当消费者尝试从队列中取出元素时，DelayQueue将会执行getDelay()方法来确定这个元素是否允许从队列中取出。如果getDelay()方法返回0或负值，则可以从队列中返回它。

我们还需要实现compareTo()函数，因为DelayQueue队列中的元素需要根据过期时间来排序。先过期的项目将放在队列头，而晚过期的元素将保持在队列尾：

``` kotlin
override fun compareTo(other: Delayed): Int =(startTime - (other as DelayObject).startTime).toInt()
```

## 将DelayQueue用于生产者-消费者模型中

为了测试我们的DelayQueue，可以实现一个生产者-消费者模型。生产者类以需要放入元素的队列，即将生产的元素数量，每个元素的延迟时间（以ms计算）为参数。

当调用run()方法时，它将元素置入队列，然后休眠个500ms，重复多次。

``` kotlin
class DelayQueueProducer(
    private val queue: BlockingQueue<DelayObject>,
    private val numberOfElementsToProduce: Int,
    private val delayOfEachProducedMessageMilliseconds: Long
) : Runnable {
    override fun run() = repeat(numberOfElementsToProduce) {
        val obj = DelayObject(UUID.randomUUID().toString(), delayOfEachProducedMessageMilliseconds)
        println("Put object: $obj")
        try {
            queue.put(obj)
            Thread.sleep(500)
        } catch (ie: InterruptedException) {
            ie.printStackTrace()
        }
    }
}
```

消费者的实现也不难，它会保持计算消费的元素数量：

``` kotlin
class DelayQueueConsumer(private val queue: BlockingQueue<DelayObject>,private val numberOfElementsToTake: Int)
    : Runnable {
    var numberOfConsumedElements = AtomicInteger()
    override fun run() = repeat (numberOfElementsToTake) {
        try {
            val obj = queue.take()
            numberOfConsumedElements.incrementAndGet()
            println("Consumer take: $obj")
        } catch (e: InterruptedException){
            e.printStackTrace()
        }
    }
}
```

## 测试DelayQueue

为了测试DelayQueue的行为，我们需要创建一个生产者线程和一个消费者线程。生产者将使用put()方法将500ms的延迟的元素放入队列。

``` kotlin
@Test
@Throws(InterruptedException::class)
fun givenDelayQueueWhenProduceElementThenShouldConsumeAfterGivenDelay(){
    // given
    val executor = Executors.newFixedThreadPool(2)

    val queue = DelayQueue<DelayObject>()
    val numberOfElementsToProduce = 2
    val delayOfEachProducedMessageMilliseconds = 500
    val consumer = DelayQueueConsumer(queue, numberOfElementsToProduce)
    val producer = DelayQueueProducer(
        queue, numberOfElementsToProduce, delayOfEachProducedMessageMilliseconds.toLong())

    // when
    executor.submit(producer)
    executor.submit(consumer)

    // then
    executor.awaitTermination(5, TimeUnit.SECONDS)
    executor.shutdown()

    assertEquals(consumer.numberOfConsumedElements.get(), numberOfElementsToProduce)
}
```

运行该测试可以观察到将产生下列输出：

```
Put object: data=3144ca57-af8d-42e1-b6a5-8113509fabe6, startTime=1582270569906
Consumer take: data=3144ca57-af8d-42e1-b6a5-8113509fabe6, startTime=1582270569906
Put object: data=64aade38-ec90-4149-ace8-1a1bb6849ac7, startTime=1582270570407
Consumer take: data=64aade38-ec90-4149-ace8-1a1bb6849ac7, startTime=1582270570407
```

生产者放置一个对象，一段时间后，将消耗过期的这个对象。第二个元素也是一样的情况。

## 消费者无法在给定时间内消费会发生什么

假设生产者在生产一个**10秒过期** 的元素。

``` kotlin
val numberOfElementsToProduce = 1
val delayOfEachProducedMessageMilliseconds = 10000
val consumer = DelayQueueConsumer(queue, numberOfElementsToProduce)
val producer = DelayQueueProducer(queue, numberOfElementsToProduce, delayOfEachProducedMessageMilliseconds.toLong())
```

开始测试以后仅仅5秒钟便中止了。由于DelayQueue的特性，消费者迟迟无法消费队列中的元素，因为元素一直没有过期：

``` kotlin
executor.submit(producer)
executor.submit(consumer)

executor.awaitTermination(5, TimeUnit.SECONDS)
executor.shutdown()
assertEquals(consumer.numberOfConsumedElements.get(), 0)
```

注意这个时候numberOfConsumedElements值为0，没有元素被消费。

## 产生立即期的元素

当继承Delayed接口的元素实现getDelay()后返回一个负值，那就意味着这个元素已经过期了。在这种情况下，生产者将会立即消耗该元素。

可以测试一下这种用负值产生元素的情况：

``` kotlin
val numberOfElementsToProduce = 1
val delayOfEachProducedMessageMilliseconds = -10000
val consumer = DelayQueueConsumer(queue, numberOfElementsToProduce)
val producer = DelayQueueProducer(queue, numberOfElementsToProduce, delayOfEachProducedMessageMilliseconds.toLong())
```

启动测试后，消费者将立即消费元素，因为它已经过期了：

``` kotlin
executor.submit(producer)
executor.submit(consumer)

executor.awaitTermination(1, TimeUnit.SECONDS)
executor.shutdown()
assertEquals(consumer.numberOfConsumedElements.get(), 1)
```