---
date: 2020-2-17
tag: 
  - kotlin
  - IDEA
author: NeroBlackstone
location: NanChang
summary: 熟悉一下j(et)b(rains)操作
---

# 在IDEA的kotlin项目里创建测试用例

1. 鼠标选中类名，然后alt+ctrl，选中create test。
2. 如果有test文件夹，会在里面创建测试类，没有的话会询问是否就在类所在文件夹下创建测试类。
3. 在Testing library里选择测试框架（一般junit5），然后点fix安装依赖。(一定记得提前挂好vpn)
4. 这个时候呢会发现`import org.junit.jupiter.api.Test`是提示`Unresolved reference: junit`的，我们需要一个`kotlin-test-junit5`依赖，它提供了`kotlin.test`的junit5绑定。（看下源码就知道怎么回事了）
5. 下面就只要把库加到项目里就是了，按快捷键alt+ctrl+shift+s调出project structure，选择project settings里的libraries，点+号，点from maven。会从maven仓库里找到我们想要的包。
6. 在搜索框里输入kotlin-test-junit5，点击搜索，然后在下拉菜单里找到对应kotlin版本的依赖，点击ok下载。
7. 接下来`@Test`标签就可以正常使用了！
8. 注意@Test标记的测试方法必须包裹在测试类中，否则无法执行。