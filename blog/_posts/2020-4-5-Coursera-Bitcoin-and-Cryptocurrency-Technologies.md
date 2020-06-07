---
date: 2020-4-5
tag: 
  - Coursera
  - Cryptocurrency
author: NeroBlackstone
location: NanChang
summary: 去coursera学区块链啦～
---

# Bitcoin and Cryptocurrency Technologies笔记

## week 1

### Cryptographic Hash Functions

#### Hash function

Takes any string as input fixed-size output (we’ll use 256 bits)
 efficiently computable.

#### Security properties:

- collision-free / 不冲突
- hiding
- puzzle-friendly

[文章解释](https://blog.csdn.net/shu15121856/article/details/90400762)

##### Collision-free

Nobody can find x and y such that
x != y and H(x)=H(y).

How to find a collision: Try 21^30 randomly chosen inputs 99.8% chance that two of them will collide. This works no matter what H is … but it takes too long to matter.

Is there a faster way to find collisions?
- For some possible H’s, yes.
- For others, we don’t know of one.

No H has been **proven** collision-free.

###### Application: Hash as message digest

If we know H(x) = H(y),it’s safe to assume that x = y.To recognize a file that we saw before,just remember its hash.Useful because the hash is small.

##### Hiding

We want something like this: Given H(x), it is infeasible to find x.

If r is chosen from a probability distribution that has high min-entropy(最小熵), then given H(r | x), it is infeasible(不可能的) to find x.

High min-entropy means that the distribution is “very spread out”, so that no particular value is chosen with more than negligible(微不足道的) probability.

###### 补充内容：熵(entropy)和信息

[参考视频](https://youtu.be/qBOXrYorLH8)

当一件事情(宏观态)有多种可能情况（微观态）时，这件事情对某人（观测者）而言具体是哪种情况的**不确定性** 叫做**熵** 。而能够**消除** 该人对这件事情不确定性的事物叫做**信息** 。熵和信息**数量相等** ，**意义相反** ，获取信息意味着消除不确定性。(消除熵=获取信息)