const console = require('console');
const fs = require('fs');
// 写入依赖关系图到 test.md 文件
const readStream = fs.createReadStream('./data/package-lock.json', { encoding: 'utf8' });

let plainData = '';
let packages = null;
let conflictPackages = {};
let isVisit = {};
let maxDepth = 999, thisMaxDepth = -1;
let linksInfo = [];

readStream.on('data', (chunk) => {
    plainData += chunk;
})

readStream.on('end', () => {
    // 数据预处理: 解析 json 数据并提取所需信息
    const parseDate = JSON.parse(plainData);
    packages = {};
    Object.keys(parseDate.packages).forEach((item) => {
        let newName = item.replace("node_modules\/", '');
        packages[newName] = parseDate.packages[item];
    });

    // 提取 packages 空字符串对象中的依赖信息
    let directDependencies = packages?.[""]?.["dependencies"];
    let resObj = {};
    let dependenciesArray = Object.keys(directDependencies);

    // 递归分析依赖
    dependenciesArray.forEach((item) => {
        isVisit = {};
        resObj[item] = dfs(item, item);
    })

    fs.writeFile('./data/dependency.json', JSON.stringify(resObj), (err) => {
        if (err) console.error(err);
        else console.log("-- dependency success --");
    })


    // 生成节点相关信息
    generateNodeInfo();

    // 生成类别信息
    generateCategories(dependenciesArray);

    // 记录依赖冲突信息
    generateConflict();
})

/**
 * 深度优先搜索，生成依赖关系图
 * @param {string} nowPackageName - 根包名
 * @param {number} depth - 深度
 * @param {string} prefix - 前缀
 * @returns {object} - 依赖关系对象
 */
function dfs(rootPackageName, nowPackageName, depth = 0, prefix = 'NotFound') {

    // 先查找前缀的node_modules目录中是否存在依赖
    let payload = `${prefix}/node_modules/${nowPackageName}`;
    let checkPackage = packages?.[payload];
    let packageName = payload;

    // 存在依赖冲突
    if (checkPackage) {
        conflictPackages[nowPackageName] = conflictPackages[nowPackageName] || {};
        conflictPackages[nowPackageName][checkPackage.version] = conflictPackages[nowPackageName][checkPackage.version] || [];
        conflictPackages[nowPackageName][checkPackage.version].push(prefix);
    } else {
        checkPackage = packages?.[nowPackageName];
        packageName = nowPackageName
    }

    // 处理循环引用的情况
    if (isVisit[packageName]) {
        return {
            packageName,
            version: checkPackage.version,
            dependencies: [],
            conflict: true
        }
    }

    isVisit[packageName] = true; // 标记已访问
    packages[packageName].category = packages[packageName].category ? 'shared' : rootPackageName; // 标记属于哪个包
    packages[packageName].depth = depth;    // 记录包的最小深度
    thisMaxDepth = Math.max(thisMaxDepth, depth);
    if (prefix !== 'NotFound')
        linksInfo.push({
            source: prefix,
            target: packageName
        })

    let { version, dependencies } = checkPackage || {};
    let tmpObj = { packageName, version, depth, dependencies: [] }

    // 递归检索依赖关系
    if (dependencies) {
        // 限制递归深度
        if (depth + 1 === maxDepth) {
            tmpObj.dependencies = '...';
        } else if (depth + 1 < maxDepth) {
            tmpObj.dependencies = Object.keys(dependencies).map((item) =>
                dfs(rootPackageName, item, depth + 1, packageName)
            );
        }
    }
    return tmpObj;
}
/**
 * 生成 Echarts 所需的 Node 数据格式
 */
function generateNodeInfo() {
    let nodesInfo = Object.keys(packages).map((item) => {
        let size = (thisMaxDepth - packages[item].depth) || 2;
        if (item)
            return {
                name: item,
                value: `@${packages[item].version}`,
                category: packages[item].category || 'alone',
                symbolSize: Math.pow(1.67, size)
            }
    })

    fs.writeFile('./data/nodesInfo.json', JSON.stringify(nodesInfo.slice(1)), (err) => {
        if (err) console.error(err);
        else console.log("-- nodesInfo success --");
    })

    fs.writeFile('./data/linksInfo.json', JSON.stringify(linksInfo), (err) => {
        if (err) console.error(err);
        else console.log("-- linksInfo success --");
    })
}
/**
 * 生成 Echarts 所需的 categories
 * @param {Array} keys - 包含直接依赖键名信息的数组
 */
function generateCategories(keys) {
    let categories = keys.map((item) => { return { name: item } })
    categories.push({ name: 'alone' });
    categories.push({ name: 'shared' });
    fs.writeFile('./data/categoriesInfo.json', JSON.stringify(categories), (err) => {
        if (err) console.error(err);
        else console.log("-- categoriesInfo success --");
    })
}

/**
 * 生成依赖冲突相关的信息.
 */
function generateConflict() {
    Object.keys(conflictPackages).forEach((item) => {
        conflictPackages[item].rootVersion = packages[item].version;
    })
    fs.writeFile('./data/conflict.json', JSON.stringify(conflictPackages), (err) => {
        if (err) console.error(err);
        else console.log("-- conflict success --");
    })
}

readStream.on('error', (error) => {
    console.error(`Error:${error} `);
})