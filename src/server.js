const express = require('express');
const fs = require('fs');
const path = require('path')
const app = express();

// 首页
app.get('/', (req, res) => {
    let url = path.join(__dirname, '../dist/index.html')
    fs.readFile(url, (err, data) => {
        if (err) {
            res.status(500).send('Internal Server Error');
        } else {
            res.type('text/html').send(data);
        }
    });
});
// 处理数据请求
app.get('/src/data/*', (req, res) => {
    let url = path.join(__dirname, 'data', req.params[0])
    fs.readFile(url, (err, data) => {
        if (err) {
            res.status(500).send('Internal Server Error');
        } else {
            res.type('application/json').send(data);
        }
    });
});
// 设置静态资源路径
app.use(express.static(path.join(__dirname, '../dist')));
// 其他情况处理
app.use((req, res) => {
    res.status(404).send('Page Not Found');
});

module.exports = app;