// pages/post/[id].js

import { useRouter, withRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { requestAliyun } from '../../request/http';
import { ImgCardModel } from '../../scripts/types';
import PureImgCard from '../../components/masonry/PureImgCard'
import { getQueryString } from '../../scripts/utils';
import { message } from 'antd';
import LineChart from '../../components/charts/LineChart'
import { DatePicker, Checkbox, Switch } from 'antd';
import type { CheckboxChangeEvent } from 'antd/es/checkbox';
import dayjs, { Dayjs } from 'dayjs';
import type { DatePickerProps, RangePickerProps } from 'antd/es/date-picker';

const { RangePicker } = DatePicker;
const format = 'YYYY-MM-DD'

const timeArray: string[] = [];

for (let i = 0; i <= 23; i++) {
    const hour = i.toString().padStart(2, '0');
    const timeString = hour + ':00';
    timeArray.push(timeString);
}


function getDateArray(startDate: string, endDate: string): string[] {
    const dateArray: string[] = [];
    const start = new Date(startDate);
    const end = new Date(endDate);

    for (let date = start; date <= end; date.setDate(date.getDate() + 1)) {
        dateArray.push(date.toISOString().slice(0, 10));
    }
    return dateArray;
}



export default function OrderCount() {
    const router = useRouter();
    //默认最近几天的数据
    const defaultDays = 6;
    const [defaultPickerValue, setDefaultPickerValue] = useState<any>([dayjs().subtract(defaultDays, 'day'), dayjs()]);
    const [startDate, setStartDate] = useState<string>(dayjs().subtract(defaultDays, 'day').format(format));
    const [endDate, setEndDate] = useState<string>(dayjs().format(format));
    const [dateArray, setDateArray] = useState<string[]>(getDateArray(dayjs().subtract(defaultDays, 'day').format(format), dayjs().format(format)));
    const [dayCountSeries, setDayCountSeries] = useState<any[]>([]);
    const [hourCountSeries, setHourCountSeries] = useState<any[]>([]);
    const [hourArray, setHourArray] = useState<string[]>(timeArray);
    const [onlybaidu, setOnlybaidu] = useState<boolean>(false);

    const queryOrder = async () => {
        const result = await requestAliyun('order-count', { startDate, endDate, onlybaidu });
        console.log(result);
        if (result.code !== 0) {
            message.error(result.message, 5);
        }
        //设置日期数据
        setDayCountSeries([{
            name: '订单数',
            type: 'line',
            data: result.dayCount.map((item: any) => item.total_orders)
        }])

        //设置小时数据
        setHourCountSeries(result.hourCount.map((item: any, index: number) => {
            return {
                name: dateArray[index],
                type: 'line',
                data: item.map((hourItem: any) => hourItem.total_orders)
            }
        }))
    }

    const dateOnChange = (dates: DatePickerProps['value'] | RangePickerProps['value'], dateStrings: [string, string]) => {
        console.log('dateOnChange', dates);
        console.log('dateStrings', dateStrings);
        setStartDate(dateStrings[0]);
        setEndDate(dateStrings[1]);
        setDateArray(getDateArray(dateStrings[0], dateStrings[1]));
    }

    useEffect(() => {
        queryOrder();
    }, [startDate, endDate, onlybaidu]);


    return (
        <div style={{ padding: "20px" }}>
            <div style={{ marginBottom: "20px" }}>
                选择日期：<RangePicker onChange={dateOnChange} defaultValue={defaultPickerValue} defaultPickerValue={defaultPickerValue} /> &nbsp;&nbsp;&nbsp;&nbsp;
                仅统计带百度bd_vid参数：<Switch defaultChecked={onlybaidu} onChange={(checked => {
                    console.log(checked);
                    setOnlybaidu(checked);
                })} />
            </div>
            {/* 每日订单 */}
            {/* <h2>日订单统计</h2> */}
            <LineChart title={'每日订单统计'} legendData={['数量']} yMax={200} xAxisData={dateArray} series={dayCountSeries} />
            <div style={{ height: "30px" }}></div>
            <LineChart title={'每日小时明细'} legendData={dateArray} yMax={30} xAxisData={hourArray} series={hourCountSeries} />
        </div>
    );
}