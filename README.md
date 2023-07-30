## 🎉 开始使用

1. `npm install @zbwer/analysis-tool `

2. `npx zbwer-cli` 查看所有命令.

3. `npx zbwer-cli analyze` 分析依赖.

## 🎨 Demo 展示

![](https://raw.githubusercontent.com/ZbWeR/Image-hosting/master/Dependency-Analysis/demo-preview.png?token=GHSAT0AAAAAABWIG2LO2QJ5QWUSL6MC5TT2ZGGDL2Q)

## 📝 目录结构

```
  │   index.js                // 入口函数, 用于处理命令接收参数
  │   package.json            // 项目信息
  │
  ├───dist
  │   │   index.html          // 前端可视化基本文件
  │   │
  │   └───js
  │           axios.min.js
  │           echarts.min.js
  │           macarons.js     // Eaharts 主题
  │           renderEcharts.js// 前端渲染主文件
  │
  └───src
   │   analysis.js         // 分析依赖并生成json数据
   │   server.js           // 启动Express服务
   │
   └───data                // 零时存放生成的json数据
```

## 🎯 TODO

目前已实现：

1. 分析依赖关系 / 版本冲突 / 已解决循环依赖的问题

2. 使用 Echarts 对 【依赖关系】进行了可视化

更多功能：

1. 后端

- [ ] index.js ：对于通过命令传入的 depth 和 jsonfile 参数并未做处理
+ [ ] 仅对 dependencies 进行了处理，未考虑开发环境中的依赖，这可能导致了孤立依赖的处理
+ [ ] analysis.js : fs 模块使用上存在一定的冗余
+ [ ] 【共享的依赖】的判定存在问题，例如a 和 b 都是项目的直接依赖，但是 a 又是 b的依赖，会导致 a整体变为共享依赖，在可视化效果上存在问题，可能需要与前端讨论一下.
+ [ ] server.js ：采用的是express搭建服务，或许可以考虑使用原生 http 来优化包的大小

2.前端

+ [ ] 对于 【版本冲突】 的依赖未作可视化处理（不知道用什么结构）
+ [ ] 对于 【孤立依赖】可能需要结合后端方面讨论选择更好的展示方式？
+ [ ] 对于 【共享的依赖】渲染存在一定问题.
+ [ ] 其他用户体验方面的细节....