---
date: 2020-4-15
tag: 
  - Haskell
author: NeroBlackstone
location: NanChang
summary: 星野野天天催我学这个
---

# 从零开始haskell的学习

## 准备工作

安装ghci（Glasgow Haskell Compiler's interactive environment）和stack（haskell的包管理工具）。

## ghci的使用

### 更改默认prompt

默认的prompt是Prelude，可以用下面的指令更改：

```
:set prompt "ghci>"
```

### 简单的数学运算

ghci可以执行简单的四则运算：

```
ghci> 2 + 15  
17  
ghci> 49 * 100  
4900  
ghci> 1892 - 1472  
420  
ghci> 5 / 2  
2.5
```

### 更复杂的数学运算

更复杂的数学运算也是可以的，ghci可以正确判断优先级，也可以使用圆括号来精确描述优先级。（负数最好加上括号）

```
ghci> (50 * 100) - 4999  
1  
ghci> 50 * 100 - 4999  
1  
ghci> 50 * (100 - 4999)  
-244950
```

布尔运算也非常的直观, 可以使用not来对True或False取反(注意一定要大写这两个词)

```
ghci> True && False  
False  
ghci> True && True  
True  
ghci> False || True  
True   
ghci> not False  
True  
ghci> not (True && True)  
False
```

测试相等用==，不相等用/=

```
ghci> 5 == 5  
True  
ghci> 1 == 0  
False  
ghci> 5 /= 5  
False  
ghci> 5 /= 4  
True  
ghci> "hello" == "hello"  
True
```

如果使用不同的数据类型，判断相加或相等，则会报错，例如5+“llama”：

```
No instance for (Num [Char])  
arising from a use of `+' at <interactive>:1:0-9  
Possible fix: add an instance declaration for (Num [Char])  
In the expression: 5 + "llama"  
In the definition of `it': it = 5 + "llama"
```

+只适用于左右均为数字的情况，==只适用于左右均为可比较类型的情况。另外当5+4.0时，5会转为浮点，输出9.0

## 中缀函数（infix function）与前缀函数（prefix function）

中缀函数就是像四则运算符一样，前后接受两个参数。

大多数不参与数学运算的函数为前缀函数。

在haskell中，函数通过写函数名，空格，和参数来调用：

```
ghci> succ 8  
9 
```

`scuu`函数接收任何具有定义的后继的元素作为参数，然后返回它的后继。

`min`和`max`则接收两个可以排序的元素，min返回较小的，而max返回较大的。

```
ghci> min 9 10  
9  
ghci> min 3.4 3.2  
3.2  
ghci> max 100 101  
101   
```

函数具有最高的优先级。也就是说下面两个式子相等：

```
ghci> succ 9 + max 5 4 + 1  
16  
ghci> (succ 9) + (max 5 4) + 1  
16 
```

接收两个参数的函数也可以是中缀的，这要通过将函数名用反引号包裹来实现。比如`div`可以实现两个数的整除。`div 92 10`返回9。但是这样写会搞不清谁除谁。所以可以用中缀函数的形式，即`92 `div` 10 `。

在haskell中，只有空格代表函数调用。**括号只代表运算优先级** 。假如有`bar (bar 3)`这种形式的语句，不代表bar使用bar 3为参数，而是表示先计算bar 3，取得数字，然后再用bar调用那个数字作为参数。在c语言中，会写成`bar(bar(3))`