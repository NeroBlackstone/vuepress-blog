---
date: 2020-2-2
tag: 
  - java
  - kotlin
author: NeroBlackstone
location: NanChang
summary: 记不清是第几次看这个问题了
---

# 线程安全到底是什么

java/kotlin提供开箱即用的多线程支持，（kotlin还支持协程）。jvm可以通过在多个工作线程中分别运行字节码，提升程序性能。

多线程是一个强大而又麻烦的特性。在多线程环境中我们需要编写线程安全的代码。不同的线程可以同时访问相同的资源，而不发生一些意料之外的错误。

本文将讨论几种线程安全的实现方法。（我全写kotlin代码，java读者可以照着感觉理解）

## 无状态实现

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

## 不可变实现

**不变性也是实现线程安全的方法之一。**

**如果我们需要在不同的线程间分享状态，我们可以通过使它们不可变来创建线程安全的类。** 不变性是一个强大且与语言无关的概念，在kotlin中很容易实现。

简单来说，**一个不可变类的实例的内部状态，在它被构造出来以后无法修改** 。在kotlin中创建不可变类的最简单方法是将所有数据域的数据声明为private和val。

``` kotlin
class MessageService(private val message: String)
```

MessageService对象是不可变的，因为它的状态在构造后便不能改变。因此它也是线程安全的。如果MessageService是可变的，但是每个线程对它都是只读的，那么它也是线程安全的。

## 线程局部字段

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

## 同步集合（Synchronized Collections）

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

## 并发集合（Concurrent Collections）

除了同步集合，还可以使用并发集合来创建线程安全的集合。java提供了java.util.concurrent包，包含了ConcurrentHashMap等多个并发集合。

``` kotlin
val concurrentMap: MutableMap<String, String> = ConcurrentHashMap()
concurrentMap["1"] = "one"
concurrentMap["2"] = "two"
concurrentMap["3"] = "three"
```

与同步集合不同，**并发集合通过将数据分割为段来达到线程安全的目的。** 举个例子，在ConcurrentHashMap中，多个线程可以取得不同映射段上的锁，因此多个线程可以同时访问映射。

由于并发集合内部线程并发访问的优势，**相较于同步集合，并发集合性能更加优秀。** 另外，同步集合和并发集合仅使集合本身具有线程安全性，而非集合内容。

## 原子对象（Atomic Objects）

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

## 同步方法

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

## 同步语句

有时，如果只需要使方法内的一段语句线程安全，那么同步整个方法就显得多余。例如我们可以这样重构 incrementCounter() 方法：

``` kotlin
fun incrementCounter() { // additional unsynced operations
    synchronized(this) { counter += 1 }
}
```

这个例子简单地演示了如何创建同步语句。假设该方法现在执行了一些其他不需要同步的操作，我们可以通过将代码包裹在synchronized，来仅仅同步有关状态修改的部分。

**同步性能开销非常大，我们可以仅仅同步需要同步的部分。**

## volatile域

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

## 外置锁

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

## 重入锁

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

## 读/写锁

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