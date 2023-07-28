var myChart = echarts.init(document.getElementById('main'), 'macarons');
// var myChart = echarts.init(document.getElementById('main'));

/**
 * 从不同的 URL 获取数据，并返回一个包含节点、链接和类别信息的对象。
 * @returns {Promise<Object>} 包含节点、链接和类别信息的对象。
 */
async function getData() {
    try {
        const promises = [
            axios.get('../data/nodesInfo.json'),
            axios.get('../data/linksInfo.json'),
            axios.get('../data/categoriesInfo.json')
        ];

        const [nodesRes, linksRes, categoriesRes] = await Promise.all(promises);

        return {
            nodes: nodesRes.data,
            links: linksRes.data,
            categories: categoriesRes.data
        };
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
}

async function renderEcharts() {
    myChart.showLoading();
    const { nodes, links, categories } = await getData();
    myChart.hideLoading();

    nodes.forEach(function (node) {
        node.label = {
            show: node.symbolSize > 3,
            formatter: function (params) {
                var label = params.name;
                var maxLength = 6;
                if (label.length > maxLength)
                    label = label = label.substring(0, maxLength) + '...';
                return label;
            }
        };
    });

    option = {
        title: {
            text: 'Packages Dependencies',
            subtext: 'npm Analysis Tool',
            top: '5%',
            left: '5%',
        },
        tooltip: {
            show: true,
            trigger: 'item',
            formatter: (params) => {
                if (params.value) {
                    return `
                    <i style="background-color: pink;"></i><b>${params.name}</b><br\>
                    <i style="background-color: #00d1b2;"></i>${params.value}`;
                } else {
                    return `<b>${params.name}</b>`;
                }
            }
        },
        legend: [
            {
                top: 'middle',
                left: '5%',
                icon: 'circle',
                orient: 'vertical',
                data: categories.map(function (a) {
                    return a.name;
                })
            }
        ],
        animationDuration: 1500,
        animationEasingUpdate: 'quinticInOut',
        series: [
            {
                name: 'Version',
                type: 'graph',
                layout: 'force',

                draggable: true,
                roam: true,
                autoCurveness: true,
                scaleLimit: {
                    min: 0.5,
                },
                symbol: "circle",

                data: nodes,
                links: links,
                categories: categories,

                label: {
                    position: 'top',
                    formatter: '{b}'
                },
                labelLayout: {
                    hideOverlap: true,
                },
                lineStyle: {
                    color: 'source',
                },
                emphasis: {
                    focus: 'adjacency',
                    lineStyle: {
                        width: 5
                    },
                    label: {
                        fontSize: 16,
                        formatter: (params) => params.name
                    }
                }
            }
        ]
    };

    myChart.setOption(option);
}

renderEcharts();