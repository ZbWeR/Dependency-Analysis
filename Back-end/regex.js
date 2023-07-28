let data = Object.keys(parseDate.packages).map(item => {
    let tmpArr = item.split('node_modules')
        .map(item => item.replace(/^\/+|\/+$/g, ''));
    const packageName = tmpArr[1];
    const conflictPackageName = tmpArr[2];
    if (conflictPackageName) return conflictPackageName;
    return packageName;
})
let newData = Array.from(new Set(data));
fs.writeFile('test.md', newData.join('\n'), (err) => {
    if (err) console.error(err);
    else console.log('success');
});