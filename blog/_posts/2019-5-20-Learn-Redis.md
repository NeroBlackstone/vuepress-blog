---
date: 2019-5-20
tag: 
  - redis
author: NeroBlackstone
location: NanChang
summary: 第一次玩这个东西
---

# redis6学习

## redis可执行文件组成

- redis-benchmark:性能测试
- redis-check-aof:修复有问题的aof文件
- redis-check-rdb:修复有问题的rdb
- redis-sentinel:Redis集群使用
- redis-server:Redis服务器启动命令
- redis-cli:客户端，操作入口

## redis.conf

redis.conf是redis的默认配置文件。在macos下，位于`/usr/local/etc/redis.conf`

使用当前redis.conf的内容来初始化redis: `redis-server redis.conf`

如果不使用redis.conf来初始化redis的启动，redis会开启后会警告 `Warning: no config file specified, using the default config. In order to specify a config file use redis-server /path/to/redis.conf` 如果使用redis.conf来初始化，会提示`Configuration loaded`

默认redis的启动为用户服务，redis将会把启动信息打印在控制台窗口中，如果关闭这个窗口，redis服务也关闭了。

如果将redis.conf文件里面的`deamonize no` 改成 `yes`，就可以让redis服务在后台启动。

## 客户端访问redis-server

启动客户端，直接执行redis-cli即可,如果需要多个客户端端口去连接redis-server，可以使用`redis-cli -p [portNum]`实现。

## 测试客户端连接

在cli中使用`ping`命令，如果是可以正常响应的，会返回`pong`。

## 关闭Server

若cli已经连接，在链接中使用`shutdown`，即可关闭连接。

若没有cli连接server，使用`redis-cli shutdown`也可以关闭server。

## 默认数据库

redis默认有16个数据库。从0开始，默认使用0号库。

## 切换数据库

使用命令 `select <dbid>` 即可切换数据库，例如 `select 8`。

## 密码

redis统一密码库，所有库都是同样的密码。

## redis6线程更改

redis6之后引入了多线程。但是redis6的多线程默认是禁用的。只使用主线程。若开启要修改redis.conf，`io-threads-do-reads yes`

redis6多线程开启后，还需要设置线程数，否则不生效。

`io-threads 4`

线程数一般要小于机器cpu核心数。比如如果是4核那局设置2-3个核心。线程数不是越大越好。

## redis 数据类型

key-value存储，数据类型:

- string
- set
- list
- hash
- zset

- keys * :查询当前库的所有键。
- exists <key> :判断某个键是否存在(存在返回1，不存在返回0)
- type <key> :查看键的类型
- del <key> :删除某个键
- expire <key> <seconds> :为键值设置过期时间，单位为秒
- ttl <key> :查看还有多少秒过期，如果-1表示永不过期，-2表示已过期。
- dbsize :查看当前数据库key的数量
- flushdb :清空当前库数据库
- flushall :清空全部redis库

String类型：

- string是Redis最基本的类型，一个key对应一个value
- string类型是二进制安全的。意味着redis的string可以包含任何数据。比如jpg图片或者序列化的对象。
- string类型是redis最基本的数据类型，一个redis中字符串value最多可以是512M

匹配partten：

- * 全查
- ? 占位符
- *[1-2] 以括号里结尾 