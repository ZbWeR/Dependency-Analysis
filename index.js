#!/usr/bin/env node

const { runAnalysis } = require('./src/analysis');
const server = require('./src/server');

const program = require('commander');
const chalk = require('chalk');
const boxen = require('boxen');
const path = require('path')
const fs = require('fs');

const baseUrl = path.join(__dirname, 'src', 'data');

program
    .command('analyze')
    .description('分析 package-lock.json 中的依赖关系')
    .option('--depth [n]', '限制递归深度')
    .option('--json [file-path]', '将依赖关系以json格式导入指定路径中')
    .action(async (options) => {
        const depth = options.depth || 0;
        const jsonFilePath = options.json;
        // // 执行依赖分析
        await runAnalysis();
        // // 启动服务器
        const serverInstance = server.listen(3000, () => {
            console.log(getBeautifulMsg());
        });
        // 监听 Ctrl+C 退出事件
        process.on('SIGINT', () => {
            // 关闭express
            serverInstance.close();
            // 删除临时文件
            const files = fs.readdirSync(baseUrl);
            files.forEach((item) => {
                const filePath = path.join(baseUrl, item);
                fs.unlinkSync(filePath);
            })
            console.log('Bye~');
            process.exit(0);
        });
    })

function getBeautifulMsg() {
    const message = `
    Serving!
    
    - Local:    ${chalk.blue('http://localhost:3000')}
    - Network:  ${chalk.blue('http://192.168.10.10:3000')}
    
    Copied local address to clipboard!
    `;
    const boxedMessage = boxen(message, {
        padding: 1,
        margin: 1,
        borderStyle: 'round',
        borderColor: 'green',
    });
    return boxedMessage;
}

program.parse(process.argv);