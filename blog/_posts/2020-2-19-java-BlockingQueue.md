---
date: 2020-2-19
tag: 
  - java
  - kotlin
author: NeroBlackstone
location: NanChang
summary: 优雅的解决并发中的生产者-消费者问题
---

# java BlockingQueue简介

在这篇文章中，会介绍如何使用BlockingQueue来解决并发当中的生产者-消费者问题。我们将研究BlockingQueue接口中提供的api，以及这些api如何简化并发编程。

接下来将展示一个简单的程序示例，有多个生产者和消费者线程。

## BlockingQueue类型

BlockingQueue有两种类型：

- 无界队列(unbounded queue) 可以近乎无限增长
- 有界队列（bounded queue） 有预定义的最大容量

### 无界队列

创建无界队列非常简单：

``` kotlin
val blockingQueue = LinkedBlockingDeque<String>()
```

这样BlockingQueue的容量将被设为*Int.MAX_VALUE* 。所有将元素添加到无界队列的操作都不会被阻塞，因此队列可能会增长到非常大的值。

当设计一个使用无界BlockingQueue的生产者-消费者程序时，最重要的事情，是消费者消费信息的速度，能够尽可能跟上生产者添加消息到队列的速度。不然内存可能会溢出，抛出OutOfMemory异常。

### 有界队列

第二种队列类型是有界队列。可以通过给构造方法传入容量参数来创建此队列：

``` kotlin
val blockingQueue= LinkedBlockingDeque<String>(10)
```

在这里实例化了一个容量为10的blockingQueue。这意味着如果生产者尝试添加元素到已满队列时，它将保持阻塞，直到有空间可以插入对象。或是直接操作失败。（这取决于用什么方法添加元素，offer(), add() 还是 put()）。

使用有界队列来设计并发程序是比较好的选择，因为我们插入元素到已满队列的话，插入需要等到消费者消费掉队列元素，并且队列有可用空间以后才能进行。相当于自动的达到了拥塞控制。

## BlockingQueue API

BlockingQueue接口里定义了两种方法，负责添加元素到队列中的方法，和检索元素的方法。根据队列是满还是空，这两类方法的行为也不同。

### 添加元素

- add() 如果插入成功返回true，否则抛出一个IllegalStateException异常
- put() 插入指定的元素到队列中，如果需要的话，会等待可用的空间。
- offer() 如果插入成功返回true，否则返回false
- offer(E e, long timeout, TimeUnit unit) 在指定的时间内，尝试将元素插入队列并且等待可用的空间

### 检索元素

- take() 等待队列的头元素，并且移除它。如果队列为空，它会阻塞并等待可用的元素。
- poll() 检索并且移除队列的头元素，如果需要，等待指定的等待时间，直到有元素可用。超时返回null。

在构建生产者-消费者程序时，BlockingQueue接口中的这些方法使用非常频繁。

## 多线程生产者-消费者示例

创建一个包含生产者和消费者的程序。生产者将产生0到100的随机数，并且放入BlockingQueue中。我们设计4个生产者线程，使用put()方法来达到阻塞效果，直到队列中有可用空间为止。

需要记住的最重要的一点，我们需要永久停止等待队列元素的消费者线程。

生产者向消费者发送“没有更多消息需要处理了”信号的最好办法，是发生称为“毒丸”（poison pill）的特殊消息。我们需要发送和消费者线程数量相同的“毒丸”。当一个消费者从队列中接受了特殊的“毒丸”信息，就会停止执行。

生产者类是这样的：

``` kotlin
class NumbersProducer(
    private val numbersQueue: BlockingQueue<Int>,
    private val poisonPill: Int,
    private val poisonPillPerProducer: Int
) : Runnable {

    override fun run() = try {
        generateNumbers()
    } catch (e: InterruptedException) {
        Thread.currentThread().interrupt()
    }

    @Throws(InterruptedException::class)
    private fun generateNumbers() {
        repeat(100) {
            numbersQueue.put(ThreadLocalRandom.current().nextInt(100))
        }
        repeat(poisonPillPerProducer) {
            numbersQueue.put(poisonPill)
        }
    }
}
```

我们的生产者构造函数接受一个BlockingQueue作为参数，用于协调生产者和消费者。可以看到generateNumbers()方法将100个元素放入队列。同样放入的还有“毒丸”信息，这定义了当执行即将结束时，消费者会拿到消息的类型。该消息需要放入poisonPillPerProducer次。

每个消费者都使用take()方法从BlockingQueue中取得元素，因此在队列中有元素送入之前将会阻塞。从队列中拿到Int后，会检查该信息是否为“毒丸”，如果是的话线程直接结束。否则会在标准输出中打印消息结果和当前线程名称。

消费者类是这样的：

``` kotlin
class NumbersConsumer(private val queue: BlockingQueue<Int>, private val poisonPill: Int) : Runnable {
    override fun run() {
        try {
            while (true) {
                val number = queue.take()
                if (number == poisonPill) 
                    return
                println("${Thread.currentThread().name} result: $number")
            }
        } catch (e: InterruptedException) {
            Thread.currentThread().interrupt()
        }
    }
}
```

注意上面队列的使用，与生产者构造函数相同，会将一个队列作为参数传入。我们之所以可以这样做，是因为BlockingQueue可以在线程间共享，而无需任何显式同步。

现在有了生产者和消费者，可以开始写主程序了！我们需要定义队列的容量，并且将其设置为100个元素。我们希望有4个生产者线程，和与处理器核心数量相同的消费者线程。

``` kotlin
val bound = 10
val nPRODUCERS = 4
val nCONSUMERS = Runtime.getRuntime().availableProcessors()
val poisonPill = Int.MAX_VALUE
val poisonPillPerProducer = nCONSUMERS / nPRODUCERS
val mod = nCONSUMERS % nPRODUCERS

val queue = LinkedBlockingQueue<Int>(bound)

repeat(nPRODUCERS-1) {
    //注意这里不能用kotlin的thread包装函数，因为代码块在thread{}内会自动装入Runnable
    //而NumberProducer本身就是Runnable，下同
    Thread(NumbersProducer(queue, poisonPill, poisonPillPerProducer)).start()
}

repeat(nCONSUMERS) {
    Thread(NumbersConsumer(queue, poisonPill)).start()
}

Thread(NumbersProducer(queue, poisonPill, poisonPillPerProducer + mod)).start()

```

BlockingQueue创建时预定义了容量。我们在这里创建了4个生产者和N个消费者。并且将“毒丸”信息设置为Int.MAX_VALUE，因为正常情况下生产者永远不会产生这样的值。BlockingQueue用于协调双方工作。

当我们运行程序时，4个生产者线程将会把随机的Int放入到BlockingQueue中，消费者将从队列中取得这些元素。每个消费者线程将在标准输出中打印消息结果和当前线程名称。