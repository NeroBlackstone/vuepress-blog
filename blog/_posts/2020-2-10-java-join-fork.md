---
date: 2020-2-8
tag: 
  - java
  - kotlin
author: NeroBlackstone
location: NanChang
summary: 和ExecutorService有点像
---

# java Join/Fork 简介

Join/Fork是java 7时代面世的。它通过尝试使用所有处理器核心，帮助加速并行计算 - **这是通过分而治之的方法实现的** 。

首先Fork会执行，意味着将任务递归地分解成更小的独立子任务，直到这些子任务简单到可以异步执行。

之后Join部分开始，所有子任务递归地合并到单个结果中，或者任务返回空，程序仅执行掉所有子任务。

为了提供有效的并行计算，join/fork使用了名为ForkJoinPool的线程池，该线程池管理ForkJoinWorkerThread类型的工作线程。

## ForkJoinPool

ForkJoinPool是Join/Fork框架的核心。它是ExecutorService的实现，用于管理工作线程，并且使我们可以获取线程池状态和性能的信息。

工作线程每次只能执行一个任务，但是ForkJoinPool不会为每个子任务都创建独立的线程。相反，每个池中的线程都有自己的双端队列来存储任务

借助**工作窃取（work-stealing algorithm）算法**，这种架构设计对于平衡线程负载至关重要。

### 工作窃取算法

**简单描述工作窃取：空闲线程会尝试从繁忙的线程中"窃取"工作。**

默认情况下，工作线程从自己的双端队列的头取得任务。当自己的队列为空时，线程会从另一个繁忙的线程的双端队列的尾，或是全局条目队列中获取任务，因为这里的工作量一般比较大。

这种算法最小化了线程竞争任务的可能性。由于它首先处理运算量最大的工作，因此也减少了线程寻找工作的次数。

### 实例化ForkJoinPool

在java8中，最方便的访问ForkJoinPool实例的方法是使用它的静态方法commonPool()。顾名思义，这将提供对公共池（commonPool）引用，该池是每个ForkJoinPool的默认线程池。

使用预定义的公共池可以降低资源消耗，因为这会阻止为每个任务创建单独的线程池。

``` kotlin
val commonPool = ForkJoinPool.commonPool()
```

## ForkJoinTask

ForkJoinTask是ForkJoinPool中执行的基础任务类型。在实践中，应该扩展其两个子类之一：对于没有返回值的类型，使用RecursiveAction，对于带有返回值的任务，使用RecursiveTask。它们都有一个抽象方法compute()，其中定义任务的逻辑。

### RecursiveAction

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

### RecursiveTask

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

## 提交任务到ForkJoinPool中

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

## 总结

使用fork/join框架可以加速处理更大的任务，但是要实现此结果，应该遵循一些准则：

- **使用尽可能少的线程池** - 大多数情况下，最佳的选择是每个应用或系统只用一个线程池。
- **使用默认的公共线程池** ，如果没有特定调整的需要的话。
- **使用合理的阈值** 来切分ForkJoinTask为子任务。
- **避免任何ForkJoinTasks的阻塞**