const console = require('console');
const fs = require('fs');
// 写入依赖关系图到 test.md 文件
const readStream = fs.createReadStream('package-lock.json', { encoding: 'utf8' });

let plainData = '';
let packages = null;
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
    isVisit = {};
    fs.writeFile('dependency.txt', JSON.stringify(dfs('glob')), () => { })
})

/**
     * 深度优先搜索，生成依赖关系图
     * @param {string} rootPackageName - 根包名
     * @param {number} depth - 深度
     * @param {string} prefix - 前缀
     * @returns {string} - 依赖关系图字符串
     */
function dfs(rootPackageName, depth = 0, prefix = '') {

    let payload = `${prefix ? prefix + "/node_modules/" : ""}${rootPackageName}`;
    let checkPackage = packages?.[payload] || packages?.[rootPackageName];
    let packageName = packages?.[payload] ? payload : rootPackageName;
    // console.log(rootPackageName, packageName)
    // 处理循环引用的情况
    if (isVisit[packageName]) {
        console.log(packageName);
        return {
            packageName,
            version: checkPackage.version,
            dependencies: [],
            conflict: true
        }
    }
    isVisit[packageName] = true;

    let { version, dependencies } = packages?.[rootPackageName];
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