import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';

interface Props {
    title: string,
    legendData: string[],
    xAxisData: string[],
    series: any[],
    yMax: number
}

const LineChart = ({ title, legendData, xAxisData, series, yMax }: Props) => {
    const chartRef = useRef<HTMLDivElement>(null);
    const option = {
        title: {
            text: title
        },
        tooltip: {
            trigger: 'axis'
        },
        legend: {
            data: legendData
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        },
        toolbox: {
            feature: {
                saveAsImage: {}
            }
        },
        xAxis: {
            type: 'category',
            boundaryGap: false,
            data: xAxisData
        },
        yAxis: {
            max: yMax,
            type: 'value'
        },
        series
    };

    useEffect(() => {
        if (!chartRef.current) return;
        const myChart = echarts.init(chartRef.current);


        // 初始化图表配置
        myChart.setOption(option);

        // // 更新图表数据
        // myChart.setOption({
        //     series: [{
        //         data: data,
        //     }],
        // });

        // 在组件卸载时销毁图表实例
        return () => {
            myChart.dispose();
        };
    }, [series]);

    return <div ref={chartRef} style={{ width: '100%', height: '400px' }} />;
};

export default LineChart;