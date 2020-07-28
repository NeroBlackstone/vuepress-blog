---
date: 2020-7-24
tag: 
  - rust
author: NeroBlackstone
location: NanChang
summary: rust入门
---

# rust学习笔记

## Hello Rust

``` rust
fn main() {
    println!("Hello World!");
}
```

注意，println！是一个marco（宏），而不是一个函数

## 编译rust程序

rust的编译器叫做rustc。

执行`rustc hello.rs`，即可取得名为hello的可执行文件。

## rust的注释

rust中支持两种注释。

- Regular comments 指经典的//和/*注释，会被编译器忽略
- Doc comments 可以用于生成html文档。

例如

``` rust
/// Generate library docs for the following item.
//! Generate library docs for the enclosing item.
```

可以使用`cargo doc` 来构建文档到target/doc文件夹中。

`cargo test` 可以运行所有测试（包括文档测试）`cargo test --doc` 仅仅只运行文档测试。

这些命令将会按照需要带调用`rustdoc` （和`rustc`）

### 文档注释

当运行`rustdoc`，这些注释将会被编译成文档。注释文档用`///`表示，并且支持markdwon。

（待写）

## 格式化输出

打印由定义在`std::fmt`的一系列`marcos`处理，包括：

- format! : 将格式化文本写入String
- print! : 和format相同但是文字会被打印到控制台(io::stdout)
- println! : 加一个换行符的print!
- eprint! : 和format!相同，但是text被打印到标准错误流(io::stderr)。
- eprintln! : 加一个换行符的eprint！

rust将会在编译时期检查格式正确性。

``` rust
fn main() {
    // {}将会自动替换为后面字符串化的参数。
    println!("{} days", 31);
    // 如果没有后缀的话，31将会被转为i32类型。可以通过提供后缀来改变31的类型。
    // 比如31i64具有类型i64。

    // 有多个需要格式化输出的参数话，可以在{}中填写位置以区分。
    println!("{0}, this is {1}. {1}, this is {0}", "Alice", "Bob");

    // 也可以主动命名参数
    println!("{subject} {verb} {object}",
             object="the lazy dog",
             subject="the quick brown fox",
             verb="jumps over");

    // 可以在{}中使用:来指定特殊的格式化。
    println!("{} of {:b} people know binary, the other half doesn't", 1, 2);

    // 可以向右使用指定宽度对齐文字。下面代码将打印出：
    // "     1" 5个空格和1个“1” （总宽度为6）
    println!("{number:>width$}", number=1, width=6);

    // 可以在数字前添加多余的0。这将打印出"000001"
    println!("{number:>0width$}", number=1, width=6);

    // rust会检查确认使用了正确数目的参数。（下面打印错误）
    // println!("My name is {0}, {1} {0}", "Bond");
    // 打印正确：
    println!("My name is {0}, {1} {0}", "Bond","Nero");

    // 创建一个名为“Structure”的结构体，包含一个i32类型
    #[allow(dead_code)]
    struct Structure(i32);

    // 然而，像上面的自定义类型需要更多编译处理。下面的语句是非法的
    // println!("This struct `{}` won't print...", Structure(3));
}
```

std::fmt 包含很多`traits`来控制文字的显示。下面列出两个重要的基本形式。

- fmt::Debug : 使用{:?}标记。格式化文本来进行debug。
- fmt::Display : 使用{}标记。以更优雅，用户友好的方式设置文本格式。

std库提供了fmt::Display的实现。但是要打印自定义类型，需要更多工作。

实现fmt::Display trait自动实现了ToString trait，允许将类型转换为String.

## fmt::Debug

所有使用std::fmt traits的类型都需要实现可打印。std库中的类型提供了自动实现。**所有**  其他类型必须以某种方式手动实现。

fmt::Debug trait的使用则简单很多。所有类型均可以派生（derive）（或者说自动创建）fmt.Debug的实现。而fmt::Display必须被手动实现。

``` rust
// 这是一个不能用fmt::Display和fmt::Debug打印的结构体
struct UnPrintable(i32);

// derive属性自动创建了使该结构体被fmt::Debug打印的实现。
#[derive(Debug)]
struct DebugPrintable(i32);
```

所有的std库的类型也可以自动的使用{:?}打印：

``` rust
// 为结构体Structure派生fmt::Debug的实现。该结构体只包含一个i32类型
#[derive(Debug)]
struct Structure(i32);

// 放置Structure结构体到Deep结构体中。使deep也可以打印。
#[derive(Debug)]
struct Deep(Structure);

fn main() {
    // 使用{:?}和{}打印差不多
    println!("{:?} months in a year.", 12);
    println!("{1:?} {0:?} is the {actor:?} name.",
             "Slater",
             "Christian",
             actor="actor's");

    // Structure是可以打印的
    println!("Now {:?} will print!", Structure(3));
    
    // 派生带来的问题是对于输出的样式没有控制。如果下面只想输出一个7呢？
    println!("Now {:?} will print!", Deep(Structure(7)));
}
```

```
12 months in a year.
"Christian" "Slater" is the "actor\'s" name.
Now Structure(3) will print!
Now Deep(Structure(7)) will print!
```

所以fmt::Debug一定会产生可打印的输出，但会牺牲一些优雅性。rust也提供了{:#?}，更好看的打印。

``` rust
#[derive(Debug)]
struct Person<'a> {
    name: &'a str,
    age: u8
}

fn main() {
    let name = "Peter";
    let age = 27;
    let peter = Person { name, age };

    // 更好看的打印方法
    println!("{:#?}", peter);
}
```

```
Person {
    name: "Peter",
    age: 27,
}
```

也可以手动实现fmt::Display来控制显示。

## fmt::Display

通常fmt::Debug难以做到干净和紧凑，所以需要自定义输出。这需要通过手动实现fmt::Display来完成，使用{}来打印。简单的实现看起来像下面这样：

``` rust
// 使用use导入fmt模块
use std::fmt;

// 定义一个实现fmt::Display的结构体。
// 这是一个名为Structure的元组结构体，包含一个i32类型。
struct Structure(i32);

// 要使用{}，必须为类型手动实现fmt::Display这个trait。
impl fmt::Display for Structure {
    // 这个trait需要带有确定签名的fmt
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        // 将第一个元素写入提供的输出流f中。返回fmt::Result来指示操作是成功还是失败。
        // 注意write!的语法和println!的语法很像。
        write!(f, "{}", self.0)
    }
}
```

fmt::Display可能比fmt::Debug干净，但是这为std库带来了问题。我们应该如何显示歧义类型呢？举个例子，如果std库为所有的Vec\<T\> 实现了一个样式，下面两个Vec会正确显示吗？

- Vec\<path\>: /:/etc:/home/username:/bin (split on : )
- Vec\<number\>: 1,2,3 (split on ,)

不，因为没有针对所有类型的理想样式，并且srd库并不假定要指定一种样式。对于Vec\<T\>或其他通用容器来说，都未实现fmt::Display。对于这里都一般情况，必须使用fmt::Debug。

对于任何非通用(not generic)的新容器类型，都可以实现fmt::Display。

``` rust
use std::fmt; // 导入fmt

// 一个存有两个数字的结构体。Debug会被派生，故结果可以和Display比较。
#[derive(Debug)]
struct MinMax(i64, i64);

// 对MinMax实现Display
impl fmt::Display for MinMax {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        // 使用self.number来引用每个位置的数据。
        write!(f, "({}, {})", self.0, self.1)
    }
}

// 定义一个结构体。为了可比较性对每个字段都赋值了。
#[derive(Debug)]
struct Point2D {
    x: f64,
    y: f64,
}

// 相似地，为Point2D实现Display
impl fmt::Display for Point2D {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        // 可以通过自定义x，y
        write!(f, "x: {}, y: {}", self.x, self.y)
    }
}

#[derive(Debug)]
struct Complex {
    real: f64,
    imag: f64,
}

impl fmt::Display for Complex {
    fn fmt(&self,f:&mut fmt::Formatter) -> fmt::Result {
        write!(f,"{}+{}i",self.real,self.imag)
    }
}


fn main() {
    let minmax = MinMax(0, 14);

    println!("Compare structures:");
    println!("Display: {}", minmax);
    println!("Debug: {:?}", minmax);

    let big_range =   MinMax(-300, 300);
    let small_range = MinMax(-3, 3);

    println!("The big range is {big} and the small is {small}",
             small = small_range,
             big = big_range);

    let point = Point2D { x: 3.3, y: 7.2 };

    println!("Compare points:");
    println!("Display: {}", point);
    println!("Debug: {:?}", point);

    let complex=Complex{real:3.3,imag:7.2};

    println!("Display: {}",complex);
    println!("Debug: {:?}",complex);

    // 错误。Debug和Display被实现了，但是{:b}需要实现fmt::Binary。
    // 所以下面对代码无法运行
    // println!("What does Point2D look like in binary: {:b}?", point);
}
```

```
Compare structures:
Display: (0, 14)
Debug: MinMax(0, 14)
The big range is (-300, 300) and the small is (-3, 3)
Compare points:
Display: x: 3.3, y: 7.2
Debug: Point2D { x: 3.3, y: 7.2 }
Display: 3.3+7.2i
Debug: Complex { real: 3.3, imag: 7.2 }
```

fmt::Display已经被实现，但是fmt::Binary没有被实现，因此不能被使用。std::fmt有很多这样的traits并且每一个都需要自己的实现。在[std::fmt](https://doc.rust-lang.org/std/fmt/)中有更详细的说明。

## 测试用例：List

对结构体实现fmt::Display，必须按个处理其中的元素，这很麻烦。问题在于每写一个write!就生成一个fmt::Result。正确处理这个问题需要处理所有的结果。rust提供了?操作符正是出于这个目的。

在write!后使用?看起来像是这样：

``` rust
// 尝试执行write!来观察是否发生来错误。如果发生错误则返回错误，否则继续执行。
write!(f, "{}", value)?;
```

或者也可以使用try!宏，其工作方式相同。这有点冗长，并且不再被推荐，但是在老一点的rust代码中依然可以看到。使用try!看起来像这样：

``` rust
try!(write!(f, "{}", value));
```

由于可以使用?，为Vec实现fmt::Display非常简单：

``` rust
use std::fmt; // 导入fmt模块

// 定义一个名为List的结构体，包含一个Vec
struct List(Vec<i32>);

impl fmt::Display for List {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        // 使用元组索引提取元素，并且创建一个vec的引用
        let vec = &self.0;

        write!(f, "[")?;

        // 用v迭代vec，同时枚举count中的迭代计数。
        for (count, v) in vec.iter().enumerate() {
            // 除第一个元素外，添加一个逗号。使用?操作符或者try!来返回错误。
            if count != 0 { write!(f, ", ")?; }
            write!(f, "{}: {}", count,v)?;
        }

        // 加入右中括号，并且返回一个fmt::Result
        write!(f, "]")
    }
}

fn main() {
    let v = List(vec![1, 2, 3]);
    println!("{}", v);
}
```

```
[0: 1, 1: 2, 2: 3]
```

## 格式化

我们已经看到格式是通过格式字符串指定的。

- format!("{}", foo) -> "3735928559"
- format!("0x{:X}", foo) -> "0xDEADBEEF"
- format!("0o{: o}", foo) -> "0o33653337357"

根据参数类型的使用，同一变量可以被格式化为不同样式。如上x和o和不指定分别格式化为不同的样式。

格式化功能是通过trait实现的，每种参数类型都有一种trait。最常见的格式化trait是Display，它处理未指定参数类型的情况：例如{}。

``` rust
use std::fmt::{self, Formatter, Display};

struct City {
    name: &'static str,
    // 经度
    lat: f32,
    // 纬度
    lon: f32,
}

impl Display for City {
    // f是一个缓冲，这个方法必须把格式化的字符串写入其中
    fn fmt(&self, f: &mut Formatter) -> fmt::Result {
        let lat_c = if self.lat >= 0.0 { 'N' } else { 'S' };
        let lon_c = if self.lon >= 0.0 { 'E' } else { 'W' };

        // write!有点像format!，但是它将写入格式化字符串到一个缓冲内（第一个参数）
        write!(f, "{}: {:.3}°{} {:.3}°{}",
               self.name, self.lat.abs(), lat_c, self.lon.abs(), lon_c)
    }
}

#[derive(Debug)]
struct Color {
    red: u8,
    green: u8,
    blue: u8,
}

impl Display for Color {
    fn fmt(&self,f: &mut Formatter) -> fmt::Result {
        write!(f,"RGB ({0}, {1}, {2}) 0x{0:02X}{1:02X}{2:02X}",
            self.red,self.green,self.blue)
    }
}


fn main() {
    for city in [
        City { name: "Dublin", lat: 53.347778, lon: -6.259722 },
        City { name: "Oslo", lat: 59.95, lon: 10.75 },
        City { name: "Vancouver", lat: 49.25, lon: -123.1 },
    ].iter() {
        println!("{}", *city);
    }
    for color in [
        Color { red: 128, green: 255, blue: 90 },
        Color { red: 0, green: 3, blue: 254 },
        Color { red: 0, green: 0, blue: 0 },
    ].iter() {
        // 添加了fmt::Display的实现后，就可以使用{}了
        println!("{}", *color);
    }
}
```

```
Dublin: 53.348°N 6.260°W
Oslo: 59.950°N 10.750°E
Vancouver: 49.250°N 123.100°W
RGB (128, 255, 90) 0x80FF5A
RGB (0, 3, 254) 0x0003FE
RGB (0, 0, 0) 0x000000
```

## primitives/原始数据类型

Rust提供了对各种原始数据类型的支持。包括：

### 标量类型/Scalar Types

- 有符号整数：`i8`,`i16`,`i32`,`i64`,`i128`和`isize`（指针大小）
- 无符号整数：`u8`,`u16`,`u32`,`u64`,`u128`和`usize`（指针大小）
- 浮点数：`f32`,`f64`
- Unicode标量值 `char`，例如`'a'`,`'α'`（每个标量值4bytes）
- 布尔值 `bool` ，`true`或`false`
- 单位类型/unit type `()` ,唯一可能的值是空元组: `()`

尽管单位类型的值是元组，但由于它不包括多个值，不被视为复合类型(compound type)。

### 复合类型 / Compound Types

- 像 `[1, 2, 3]` 这样的数组
- 像 `(1, true)` 这样的元组

变量始终可以使用类型声明（type annotated）。数字可以通过后缀或者默认方式添加声明。整数默认为i32，浮点数默认f64。Rust也可以从上下文推断类型。

``` rust
fn main() {
    // 变量可以声明类型
    let logical: bool = true;

    let a_float: f64 = 1.0;  // 常规声明
    let an_integer   = 5i32; // 后缀声明

    // 否则使用默认类型
    let default_float   = 3.0; // `f64`
    let default_integer = 7;   // `i32`
    
    // 类型也可以从上下文推断而来
    let mut inferred_type = 12; // i64类型是从另一行推断而来。
    inferred_type = 4294967296i64;
    
    // 可变变量的值可以被更改
    let mut mutable = 12; // 可变的i32
    mutable = 21;
    
    // ERROR错误！变量的类型不能被更改！
    mutable = true;
    
    // 变量可以被重写遮蔽
    let mutable = true;
}

```

## 文字和操作符

整数`1`，浮点数`1.2`，字符`“a”`，字符串`“abc”`，布尔值`true`，单位类型`（）`可以使用文字表示。

数字也可以使用`0x`,`0o`,`0b`前缀来分别表示十六进制，八进制，二进制。

可以在数字文字中插入下划线以提高可读性。例如1_000与1000相同，0.000_001与0.000001相同。

我们需要告诉编译器我们使用的文字类型。比如使用u32后缀表示文字是无符号32位整数，i32后缀表示它是有符号32位整数。

Rust中的操作符优先级与c语言相同。

``` rust
fn main() {
    // 整数加法
    println!("1 + 2 = {}", 1u32 + 2);

    // 整数减法
    println!("1 - 2 = {}", 1i32 - 2);
    // TODO ^ Try changing `1i32` to `1u32` to see why the type is important

    // Short-circuiting boolean logic
    println!("true AND false is {}", true && false);
    println!("true OR false is {}", true || false);
    println!("NOT true is {}", !true);

    // Bitwise operations
    println!("0011 AND 0101 is {:04b}", 0b0011u32 & 0b0101);
    println!("0011 OR 0101 is {:04b}", 0b0011u32 | 0b0101);
    println!("0011 XOR 0101 is {:04b}", 0b0011u32 ^ 0b0101);
    println!("1 << 5 is {}", 1u32 << 5);
    println!("0x80 >> 2 is 0x{:x}", 0x80u32 >> 2);

    // Use underscores to improve readability!
    println!("One million is written as {}", 1_000_000u32);
}
```

```
1 + 2 = 3
1 - 2 = -1
true AND false is false
true OR false is true
NOT true is false
0011 AND 0101 is 0001
0011 OR 0101 is 0111
0011 XOR 0101 is 0110
1 << 5 is 32
0x80 >> 2 is 0x20
One million is written as 1000000
```