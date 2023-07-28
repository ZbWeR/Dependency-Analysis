const console = require('console');
const fs = require('fs');
// 写入依赖关系图到 test.md 文件
const readStream = fs.createReadStream('./data/package-lock.json', { encoding: 'utf8' });

let plainData = '';
let packages = null;
let conflictPackages = {};
let isVisit = {};

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
    Object.keys(directDependencies).forEach((item) => {
        isVisit = {};
        resObj[item] = dfs(item);
    })
    fs.writeFile('./data/dependency.json', JSON.stringify(resObj), (err) => {
        if (err) console.error(err);
        else console.log("-- dependency success --");
    })
    fs.writeFile('./data/conflict.json', JSON.stringify(conflictPackages), (err) => {
        if (err) console.error(err);
        else console.log("-- conflict success --");
    })
})

/**
 * 深度优先搜索，生成依赖关系图
 * @param {string} rootPackageName - 根包名
 * @param {number} depth - 深度
 * @param {string} prefix - 前缀
 * @returns {object} - 依赖关系对象
 */
// TODO: 深度还没有用起来 
function dfs(rootPackageName, depth = 0, prefix = 'NotFound') {
    // 先查找前缀的node_modules目录中是否存在依赖
    let payload = `${prefix}/node_modules/${rootPackageName}`;
    let checkPackage = packages?.[payload];
    let packageName = payload;

    // TODO: 依赖冲突没有包含根目录中包的信息.
    // 存在依赖冲突
    if (checkPackage) {
        conflictPackages[rootPackageName] = conflictPackages[rootPackageName] || {};
        conflictPackages[rootPackageName][checkPackage.version] = conflictPackages[rootPackageName][checkPackage.version] || [];
        conflictPackages[rootPackageName][checkPackage.version].push(prefix);
    } else {
        checkPackage = packages?.[rootPackageName];
        packageName = rootPackageName
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

    isVisit[packageName] = true;
    let { version, dependencies } = checkPackage || {};
    let tmpObj = { packageName, version, dependencies: [] }

    // 递归检索依赖关系
    if (dependencies) {
        Object.keys(dependencies).forEach((item) => {
            let res = dfs(item, depth + 1, rootPackageName);
            tmpObj.dependencies.push(res);
        })
    }
    return tmpObj;
}

readStream.on('error', (error) => {
    console.error(`Error:${error} `);
})