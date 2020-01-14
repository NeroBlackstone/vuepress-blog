---
date: 2020-1-13
tag: 
  - vuepress
  - GitHub
  - GraphQL
author: NeroBlackstone
location: NanChang
summary: 也欢迎和我交换友链
---

# 让Vuepress博客调用GitHub GraphQL API实现动态更新的友链

目标是去做一个组件，通过GitHub API V4（GraphQL），即时显示朋友在Github上的信息。

本文不会介绍任何[GraphQL](https://graphql.org)相关概念，如果不知道GraphQL是什么怎么用，请自行了解。

其实整个思路和在vue中使用GraphQL客户端思路是一模一样的，这里用到的GraphQL客户端为[Vue-Apollo](https://apollo.vuejs.org/zh-cn/)

## vue-apollo配置

先添加依赖:

``` shell
yarn add vue-apollo graphql apollo-client apollo-link apollo-link-http apollo-cache-inmemory graphql-tag
```

下面遇到了一些SSR问题，等待解决，后续更新。