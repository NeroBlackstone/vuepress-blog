---
date: 2020-2-2
tag: 
  - java
  - kotlin
author: NeroBlackstone
location: NanChang
summary: java多线程笔记
---

# java多线程笔记

## 线程安全到底是什么

java/kotlin提供开箱即用的多线程支持，（kotlin还支持协程）。jvm可以通过在多个工作线程中分别运行字节码，提升程序性能。

多线程是一个强大而又麻烦的特性。在多线程环境中我们需要编写线程安全的代码。不同的线程可以同时访问相同的资源，而不发生一些意料之外的错误。

本文将讨论几种线程安全的实现方法。（我全写kotlin代码，java读者可以照着感觉理解）

### 无状态实现

在大多数情况下，多线程程序中的错误，是线程间不正确分享状态的恶果。所以干脆使用**无状态** 来实现线程安全。为了更好的理解，假设现在有一个简单的计算阶乘的单例工具类：

``` kotlin 
object MathUtils {
    fun factorial(number: Int): BigInteger {
        var f=BigInteger("1")
        repeat(number){
            f=f.multiply(BigInteger.valueOf((it+1).toLong()))
        }
        return f
    }
}
```

**factorial()函数就是一个无状态确定性函数。** 给特定的输入，总是产生相同的输出。 

该方法**既不依赖外部状态，也不维护状态** 。因此，这就是一个线程安全的函数，可以同时被多个线程安全的调用。

所有的线程都可以安全地调用factorial()函数，函数将会返回预期的结果而不会彼此干扰，并且不需要明示这个输出是其他线程产生的。

因此，**无状态是实现线程安全的最简单的方法** 。

### 不可变实现

**不变性也是实现线程安全的方法之一。**

**如果我们需要在不同的线程间分享状态，我们可以通过使它们不可变来创建线程安全的类。** 不变性是一个强大且与语言无关的概念，在kotlin中很容易实现。

简单来说，**一个不可变类的实例的内部状态，在它被构造出来以后无法修改** 。在kotlin中创建不可变类的最简单方法是将所有数据域的数据声明为private和val。

``` kotlin
class MessageService(private val message: String)
```

MessageService对象是不可变的，因为它的状态在构造后便不能改变。因此它也是线程安全的。如果MessageService是可变的，但是每个线程对它都是只读的，那么它也是线程安全的。

### 线程局部字段

在oop中，对象需要通过字段和行为（类里的方法）维持状态。如果我们只需要维持状态，**通过将其字段置为线程局部，不分享其状态，就可以创建线程安全的类。** 

通过在Thread类里定义私有字段，就可以创建线程局部的字段。

例如，我们可以定义一个存储整数的数组：

``` kotlin
class ThreadA : Thread() {
    private val numbers = listOf(1, 2, 3, 4, 5, 6)
    override fun run() = numbers.forEach(::println)
}
```

或者是一个存字符串的数组：

``` kotlin
class ThreadB : Thread() {
    private val letters = listOf("a", "b", "c", "d", "e", "f")
    override fun run() = letters.forEach(::println)
}
```

**在这两种实现中，这些类都有自己的状态，但是不与其他线程共享。因此都是线程安全的。** 

同样的，把ThreadLocal实例分配到字段中也可以创建线程局部的字段。

举个例子，有下面的StateHolder类：

``` kotlin
class StateHolder {
    private val state: String? = null
    // standard constructors / getter
}
```

``` kotlin
object ThreadState {
    val statePerThread: ThreadLocal<StateHolder> = object : ThreadLocal<StateHolder>() {
        override fun initialValue()=StateHolder("active")
    }
    val state: StateHolder
        get() = statePerThread.get()
}
```

线程局部字段很像普通的类字段，但是每个通过getter/setter访问它们的线程会获得一个独立初始化的字段副本，所以每个线程都保有自身单独的字段。

### 同步集合（Synchronized Collections）

我们可以通过使用集合类中的一组同步包装器来创建线程安全的集合：

``` kotlin
val syncCollection = Collections.synchronizedCollection(ArrayList<Int>())
thread(start = true){
    syncCollection.addAll(listOf(1, 2, 3, 4, 5, 6))
}
thread(start = true){
    syncCollection.addAll(listOf(7, 8, 9, 10, 11, 12))
}
```

同步集合中每个方法都使用了（intrinsic locking）固有锁定。**这意味着该方法只可以被单独一个线程访问，而其他线程将被阻塞，直到第一个线程解锁为止。**

但是由于同步访问的基本逻辑，同步集合的性能会比较低。

### 并发集合（Concurrent Collections）

除了同步集合，还可以使用并发集合来创建线程安全的集合。java提供了java.util.concurrent包，包含了ConcurrentHashMap等多个并发集合。

``` kotlin
val concurrentMap: MutableMap<String, String> = ConcurrentHashMap()
concurrentMap["1"] = "one"
concurrentMap["2"] = "two"
concurrentMap["3"] = "three"
```

与同步集合不同，**并发集合通过将数据分割为段来达到线程安全的目的。** 举个例子，在ConcurrentHashMap中，多个线程可以取得不同映射段上的锁，因此多个线程可以同时访问映射。

由于并发集合内部线程并发访问的优势，**相较于同步集合，并发集合性能更加优秀。** 另外，同步集合和并发集合仅使集合本身具有线程安全性，而非集合内容。

### 原子对象（Atomic Objects）

使用java提供的一组原子类，也可以实现线程安全。（包括AtomicInteger, AtomicLong, AtomicBoolean, and AtomicReference.）

**原子类允许我们执行线程安全的原子操作，而无需使用同步。** 原子操作在单个机器级别的操作中执行。

看一个Counter类的实例：

``` kotlin
class Counter {
    var counter = 0
        private set
    fun incrementCounter() {
        counter += 1
    }
}
```

**假设在竞争条件下，两个线程同时访问incrementCounter()方法。** 从理论上讲，Counter的最终值为2。但是结果是不确定的，因为线程在同一时间执行统一代码块，并且增量是不原子的。

可以使用AtomicInterger实现类型安全的Counter:

``` kotlin
class AtomicCounter {
    private val counter = AtomicInteger()
    fun incrementCounter() = counter.incrementAndGet()
    fun getCounter()=counter.get()
}
```

**这下就是线程安全的了，同时自增会执行多个操作，incrementAndGet是原子的。**

### 同步方法

尽管前面的方法很适合在集合或是原始类型上使用，但是有时候会需要更高的控制权。这时另一个用于实现线程安全的方法是实现同步方法。

简而言之，**一次只有一条线程可以访问同步方法，同时阻止其他线程对该方法的访问。** 其他线程将会保持阻塞状态，直到第一个线程结束或是方法抛出异常。

可以通过将方法转为同步方法来创建线程安全的incrementCounter()：

``` kotlin
@Synchronized
fun incrementCounter() {
    counter += 1
}
```

可以在函数上加上@Synchronize来创建一个同步方法。由于一条线程一次只可以访问一个同步方法，其他线程将会等待，不会有重叠的执行发生。

**同步方法依赖于“内在锁”（或叫“监视锁”）（“intrinsic locks” or “monitor locks”）的使用。** 内在锁是一个与特定类实例相关联的隐式内部实体。

在多线程这个上下文中，监视器（monitor）这个名词，只是锁在关联对象上角色的引申，因为它强制独占访问一系列特定方法或语句。

**当线程调用一个同步方法，它就获取了内在锁。** 线程完成方法执行后，它会释放锁，允许其他线程取得锁并且访问这个方法。我们可以在实例方法，静态方法，和代码块中实现同步。

### 同步语句

有时，如果只需要使方法内的一段语句线程安全，那么同步整个方法就显得多余。例如我们可以这样重构 incrementCounter() 方法：

``` kotlin
fun incrementCounter() { // additional unsynced operations
    synchronized(this) { counter += 1 }
}
```

这个例子简单地演示了如何创建同步语句。假设该方法现在执行了一些其他不需要同步的操作，我们可以通过将代码包裹在synchronized，来仅仅同步有关状态修改的部分。

**同步性能开销非常大，我们可以仅仅同步需要同步的部分。**

### volatile域

> 在看下面的内容前可参考[Java中Volatile关键字详解](https://www.cnblogs.com/zhengbin/p/5654805.html)

同步方法和同步代码块非常适合解决线程间的变量可见性问题。即使这样，常规类字段的值也会被cpu缓存。因此，对特定字段的后续更新，即使已经同步，也可能对其他线程不可见。

要防止这种情况，可以使用volatile标签：

``` kotlin
class Counter {
    @Volatile
    var counter = 0
        private set
}
```

**加上volatile标签后，会指示JVM和编译器去存储一个counter变量到主内存中。** 这样可以确保每次jvm读取counter的值是从主内存中读取的，而非cpu缓存。每次jvm写入counter变量值时，这个变量也将写入主内存。

**使用volatile标签可以确保对所有线程来说变量可见，并且变量总是从主内存中读取。**

思考下面的例子：

``` kotlin
class User {
    var name: String? = null
        private set
    @Volatile
    var age = 0
        private set
}
```

在这种情况下，每次JVM都将写入age volatile变量到主内存中，也会将name这个non-volatile变量写入内存。这确保了最新的变量都存在主内存中，所以对变量的后续更新将会自动对其余线程可见。

同样，如果线程读取volatile变量，所有的可见变量也将从主内存中读取。

**volatile变量提供的这种扩展的保证被称为"full volatile visibility guarantee."**

### 外置锁

使用外置锁（Extrinsic Locking）而不是内置锁，可以稍微改善前面Counter类的线程安全实现。外置锁提供了多线程环境中对共享资源的协调访问，**它使用外部实体来强制独占访问资源。**

``` kotlin
class ExtrinsicLockCounter {
    var counter = 0
        private set
    private val lock = Any()
    fun incrementCounter() = synchronized(lock) { counter += 1 }
}
```

这里使用一个简单的Any实例来创建外置锁。这个实现稍微好一点，因为它提高了锁等级的安全性。

使用内置锁的话，同步方法和同步代码块依赖于this引用，**攻击者可以通过获取内部锁并且触发拒绝服务（dos）条件来引发死锁。**

不像内置锁，**外置锁使用私有实体，该私有实体不可从外部访问。** 这使得攻击者更难获得锁，并导致死锁。

> 关于这个问题可以参阅SOF回答[what-is-the-use-of-private-final-object-locking-in-java-multithreading](https://stackoverflow.com/questions/19419702/what-is-the-use-of-private-final-object-locking-in-java-multithreading) ，没有任何中文资料提到这个问题。

### 重入锁

java提供了一组改进过的锁实现，其行为比上面讨论的内置锁稍微复杂一点。

**对于内置锁，锁的获取模型非常严格：** 一个线程获取锁，然后执行一个方法或代码块，最后释放，其余线程才可以获取它并且访问该方法。

没有底层机制来检查排队的线程，好让等待时间最长的线程优先访问。重入锁（ReentrantLock）实例可以解决这个问题，防止入队的线程因为某种程度的资源缺乏而无法执行：

``` kotlin
class ReentrantLockCounter {
    var counter = 0
        private set
    private val reLock = ReentrantLock(true)
    fun incrementCounter() {
        reLock.lock()
        counter += try {
            1
        } finally {
            reLock.unlock()
        }
    }
}
```

重入锁的构造函数有一个可选的布尔变量。当设置为true，且多个进程正在尝试获取锁时，jvm将会优先考虑等待时间最长的线程并且赋予访问锁的权限。

### 读/写锁

我们还可以用读写锁（ReadWriteLock）来实现线程安全。读写锁实际上使用了一对相关联的锁，一个用于只读操作，另一个用于写操作。

**只要没有线程写入，就可以有很多线程读取资源。此外，将线程写入资源将阻止其他线程读取资源。**

我们可以这样使用ReadWriteLock锁：

``` kotlin
class ReentrantReadWriteLockCounter {
    private var counter = 0
    private val rwLock = ReentrantReadWriteLock()
    private val readLock: Lock = rwLock.readLock()
    private val writeLock: Lock = rwLock.writeLock()
    fun incrementCounter() {
        writeLock.lock()
        counter += try {
            1
        } finally {
            writeLock.unlock()
        }
    }
    fun getCounter(): Int {
        readLock.lock()
        return try {
            counter
        } finally {
            readLock.unlock()
        }
    } 
}
```

## java ThreadLocal 简介

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

### 在映射中存储用户数据

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

### 在ThreadLocal存储用户数据

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

### 不要将ThreadLocal和ExecutorService一起用

如果我们要使用ExecutorService并向其提交Runnable，则使用ThreadLocal会产生不确定的结果-因为我们无法保证给定userId的每个Runnable动作每次执行时都会由同一个线程处理。

因此，我们的ThreadLocal将在不同的userId之间共享。这就是为什么我们不应该将TheadLocal与ExecutorService一起使用。仅当我们完全控制哪个线程将选择要执行的可运行操作时，才应使用它。

## Java ExecutorService 简介

ExecutorService是一个jdk提供的框架，用于简化异步模式下任务的执行。ExecutorService提供了线程池和分配任务的API。

### 实例化ExecutorService

### ExecutorService的工厂方法

创建ExecutorService最简单的方法是使用Executors类的工厂方法。举个例子，下面的代码将会创建带有10个线程的线程池。

``` kotlin
val executor = Executors.newFixedThreadPool(10)
```

还有几种其他工厂方法可以用于创建满足特定条件的预定义ExecutorService。

#### 直接创建ExecutorService

因为ExecutorService是接口，所以可以使用其所有实现的实例。java.util.concurrent包里有几种实现可供选择，你甚至可以自己去实现一个。

举个例子，ThreadPoolExecutor类有一些构造函数用于配置executor service和内部的线程池。

``` kotlin
val executorService: ExecutorService = ThreadPoolExecutor(
        1, 1, 0L, TimeUnit.MILLISECONDS, LinkedBlockingQueue()
    )
```

#### 给ExecutorService分配任务

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

### 关闭ExecutorService

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

### Future接口

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

### ScheduledExecutorService接口

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

### ExecutorService与Fork / Join

Java 7发行后，许多开发人员决定将ExecutorService框架替换为fork / join框架。但是，这并不总是正确的决定。尽管使用的简便性和与fork / join相关的频繁的性能提升，开发人员对并发执行的控制量也有所减少。

ExecutorService使开发人员能够控制所生成线程的数量以及应由单独的线程执行的任务的粒度。ExecutorService的最佳用例是按照“一个线程处理一个任务”的方案处理独立任务，例如事务或请求。

相反，根据Oracle的文档，fork / join旨在加快工作速度，该工作可以递归分解为较小的部分。

### 总结

尽管ExecutorService非常容易使用，但是仍然有一些使用时常犯的错误：

- **未使用的ExecutorService未被中止** 可以查看上文如何关闭ExecutorService
- **当使用固定长度的线程池时使用了错误的线程池容量** 确定程序有效执行任务所需的线程数量非常重要。太大的线程池会导致不必要的开销，大多数线程将会处于等待模式。太小的线程池又会导致应用假死，因为队列中的任务往往会等待很长的时间。
- **取消任务后去调用Future的get()方法** 尝试取得已经取消的任务的结果将会引发CancellationException异常。
- **使用Future的get()方法发生了长时间的阻塞** 应该设定超时时间来避免意外的等待。

## java Join/Fork 简介

Join/Fork是java 7时代面世的。它通过尝试使用所有处理器核心，帮助加速并行计算 - **这是通过分而治之的方法实现的** 。

首先Fork会执行，意味着将任务递归地分解成更小的独立子任务，直到这些子任务简单到可以异步执行。

之后Join部分开始，所有子任务递归地合并到单个结果中，或者任务返回空，程序仅执行掉所有子任务。

为了提供有效的并行计算，join/fork使用了名为ForkJoinPool的线程池，该线程池管理ForkJoinWorkerThread类型的工作线程。

### ForkJoinPool

ForkJoinPool是Join/Fork框架的核心。它是ExecutorService的实现，用于管理工作线程，并且使我们可以获取线程池状态和性能的信息。

工作线程每次只能执行一个任务，但是ForkJoinPool不会为每个子任务都创建独立的线程。相反，每个池中的线程都有自己的双端队列来存储任务

借助**工作窃取（work-stealing algorithm）算法**，这种架构设计对于平衡线程负载至关重要。

#### 工作窃取算法

**简单描述工作窃取：空闲线程会尝试从繁忙的线程中"窃取"工作。**

默认情况下，工作线程从自己的双端队列的头取得任务。当自己的队列为空时，线程会从另一个繁忙的线程的双端队列的尾，或是全局条目队列中获取任务，因为这里的工作量一般比较大。

这种算法最小化了线程竞争任务的可能性。由于它首先处理运算量最大的工作，因此也减少了线程寻找工作的次数。

#### 实例化ForkJoinPool

在java8中，最方便的访问ForkJoinPool实例的方法是使用它的静态方法commonPool()。顾名思义，这将提供对公共池（commonPool）引用，该池是每个ForkJoinPool的默认线程池。

使用预定义的公共池可以降低资源消耗，因为这会阻止为每个任务创建单独的线程池。

``` kotlin
val commonPool = ForkJoinPool.commonPool()
```

### ForkJoinTask

ForkJoinTask是ForkJoinPool中执行的基础任务类型。在实践中，应该扩展其两个子类之一：对于没有返回值的类型，使用RecursiveAction，对于带有返回值的任务，使用RecursiveTask。它们都有一个抽象方法compute()，其中定义任务的逻辑。

#### RecursiveAction

在下面的示例中，要处理的工作单元用被称为workload的字符串表示。出于演示目的，该任务没有实际意义：把输入转换为大写并且打印。

为了演示分叉的行为，**这个例子中，如果workload.length()大于指定阈值，将会使用createSubtask()方法拆分任务。**

字符串会递归地分割为子串，创建基于这些字串的 CustomRecursiveTask实例。该方法返回一个列表，这个列表使用invokeAll()方法提交到ForkJoinPool。

``` kotlin
class CustomRecursiveAction(private val workload: String = "") : RecursiveAction() {
    companion object {
        private const val THRESHOLD = 4
        private val logger = Logger.getAnonymousLogger()
    }

    override fun compute() {
        if (workload.length > THRESHOLD)
            ForkJoinTask.invokeAll(createSubtasks())
        else
            processing(workload)
    }

    private fun createSubtasks(): List<CustomRecursiveAction> = listOf(
            CustomRecursiveAction(workload.substring(0, workload.length / 2)),
            CustomRecursiveAction(workload.substring(workload.length / 2, workload.length))
        )

    private fun processing(work: String) {
        val result = work.toUpperCase()
        logger.info("This result - ($result) - was processed by ${Thread.currentThread().name}")
    }
}
```

此模式可以用于开发自己的RecursiveAction类。为此，创建一个代表总工作的对象，选择合适的阈值，定义切分工作的方法，定义执行工作的方法。

#### RecursiveTask

对于有返回值的任务，此处的逻辑是类似的，只是每个子任务都合并为一个结果。

``` kotlin
class CustomRecursiveTask(private val arr: IntArray) : RecursiveTask<Int>() {
    companion object {
        private const val THRESHOLD = 20
    }

    override fun compute(): Int = if (arr.size > THRESHOLD)
        ForkJoinTask.invokeAll(createSubtasks()).map { it.join() }.sum()
        else
            processing(arr)

    private fun createSubtasks(): Collection<CustomRecursiveTask> = listOf(
            CustomRecursiveTask(arr.copyOfRange(0, arr.size / 2)),
            CustomRecursiveTask(arr.copyOfRange(arr.size / 2, arr.size))
        )

    private fun processing(arr: IntArray): Int = arr.filter { it in 11..26 }.map { it * 10 }.sum()
}
```

在此示例中，工作由一个存储于CustomRecursiveTask类的arr字段的数组代表。 createSubtask()方法将任务递归地分为更小的工作，直到每个工作都小于阈值。然后invokeAll（）函数提交子任务给通用请求，返回Future列表。

为了触发执行，为每个子任务调用join()方法。

### 提交任务到ForkJoinPool中

要提交任务到线程池中，可以使用下面几种方法：

submit()或execute()方法（它们的用例是相同的）：

``` kotlin
forkJoinPool.execute(customRecursiveTask)
val result: Int = customRecursiveTask.join()
```

invoke()方法将任务fork并等待结果，且不需要手动join：

``` kotlin
val result: Int = forkJoinPool.invoke(customRecursiveTask)
```

invokeAll()方法是将一系列ForkJoinTask提交给ForkJoinPool最简单的方法。它以任务为参数（可以是多个任务，可变参数，或是一个任务集合），将任务fork并以Future对象产生的顺序，返回Future对象的集合。

另外，也可以单独使用fork()和join()方法。fork()方法提交任务到池中，但是它不会触发执行。join()方法用于执行。在RecursiveAction情况下，join()只返回空，而对于RecursiveTask，他会返回任务执行的结果：

``` kotlin
customRecursiveTaskFirst.fork()
result = customRecursiveTaskLast.join()
```

在RecursiveTask的例子中，我们使用了invokeAll()方法，来提交一系列的子任务到线程池中。可以用fork()和join()达到相同的效果，但是会影响结果的顺序。

为避免混淆，最好使用invokeAll()方法来提交多个任务到线程池中。

### 总结

使用fork/join框架可以加速处理更大的任务，但是要实现此结果，应该遵循一些准则：

- **使用尽可能少的线程池** - 大多数情况下，最佳的选择是每个应用或系统只用一个线程池。
- **使用默认的公共线程池** ，如果没有特定调整的需要的话。
- **使用合理的阈值** 来切分ForkJoinTask为子任务。
- **避免任何ForkJoinTasks的阻塞**

## java Semaphores简介

本文简单讨论java中的信号量(semaphores)和互斥量(mutexes)。

### 信号量

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

### 信号量 VS 互斥量

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
## java BlockingQueue简介

在这篇文章中，会介绍如何使用BlockingQueue来解决并发当中的生产者-消费者问题。我们将研究BlockingQueue接口中提供的api，以及这些api如何简化并发编程。

接下来将展示一个简单的程序示例，有多个生产者和消费者线程。

### BlockingQueue类型

BlockingQueue有两种类型：

- 无界队列(unbounded queue) 可以近乎无限增长
- 有界队列（bounded queue） 有预定义的最大容量

#### 无界队列

创建无界队列非常简单：

``` kotlin
val blockingQueue = LinkedBlockingDeque<String>()
```

这样BlockingQueue的容量将被设为*Int.MAX_VALUE* 。所有将元素添加到无界队列的操作都不会被阻塞，因此队列可能会增长到非常大的值。

当设计一个使用无界BlockingQueue的生产者-消费者程序时，最重要的事情，是消费者消费信息的速度，能够尽可能跟上生产者添加消息到队列的速度。不然内存可能会溢出，抛出OutOfMemory异常。

#### 有界队列

第二种队列类型是有界队列。可以通过给构造方法传入容量参数来创建此队列：

``` kotlin
val blockingQueue= LinkedBlockingDeque<String>(10)
```

在这里实例化了一个容量为10的blockingQueue。这意味着如果生产者尝试添加元素到已满队列时，它将保持阻塞，直到有空间可以插入对象。或是直接操作失败。（这取决于用什么方法添加元素，offer(), add() 还是 put()）。

使用有界队列来设计并发程序是比较好的选择，因为我们插入元素到已满队列的话，插入需要等到消费者消费掉队列元素，并且队列有可用空间以后才能进行。相当于自动的达到了拥塞控制。

### BlockingQueue API

BlockingQueue接口里定义了两种方法，负责添加元素到队列中的方法，和检索元素的方法。根据队列是满还是空，这两类方法的行为也不同。

#### 添加元素

- add() 如果插入成功返回true，否则抛出一个IllegalStateException异常
- put() 插入指定的元素到队列中，如果需要的话，会等待可用的空间。
- offer() 如果插入成功返回true，否则返回false
- offer(E e, long timeout, TimeUnit unit) 在指定的时间内，尝试将元素插入队列并且等待可用的空间

#### 检索元素

- take() 等待队列的头元素，并且移除它。如果队列为空，它会阻塞并等待可用的元素。
- poll() 检索并且移除队列的头元素，如果需要，等待指定的等待时间，直到有元素可用。超时返回null。

在构建生产者-消费者程序时，BlockingQueue接口中的这些方法使用非常频繁。

### 多线程生产者-消费者示例

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

## java DelayQueue简介

这篇文章将简单介绍java.util.concurrent里的DelayQueue。这也是一个可用于生产者-消费者程序中的阻塞队列。

它有一个很有用的特性 - **只有经过元素指定的延迟以后，当消费者才能队列中取出这个元素。**

### 在DelayQueue中实现元素延迟检索

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

### 将DelayQueue用于生产者-消费者模型中

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

### 测试DelayQueue

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

### 消费者无法在给定时间内消费会发生什么

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

### 产生立即期的元素

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

## Java CountDownLatch 简介

本文将介绍CountDownLatch类并且在实际例子中演示如何使用它。通过使用CountDownLatch，我们可以使一个线程阻塞，直到其他线程完成给定的工作。

### 并发编程中的使用场景

简单来说，CountDownLatch有一个counter字段，可以按需减少这个数值。然后它会阻塞线程，直到倒数到0为止。

如果我们正在执行一些并行处理，可以使用和线程数量相同的值做counter实例化CountDownLatch。然后每当线程结束，就调用countdown()，确保调用await()的从属线程将阻塞，直到工作线程完成。

### 等待线程池完成

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

### 等待线程池开始

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

### 尽早结束CountdownLatch

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

## 一次摸清java.util.concurrent包

java.util.concurrent包提供了创建并发应用的工具。

### 主要组件

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

### Executor

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

### CyclicBarrier

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

### ThreadFactory

顾名思义，ThreadFactory可以根据需要创建新线程。它消除了创建线程的模板代码，让创建线程更加快捷。

如果你是kotlin用户，我强烈不建议使用ThreadFactory，因为它能做的kotlin提供的thread包装函数都能做，而且更加简洁。故不再详细介绍。

