// pages/post/[id].js

import { useRouter, withRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { requestAliyun, requestAliyunArt } from '../../request/http';
import { ImgCardModel } from '../../scripts/types';
import { getQueryFromString } from '../../scripts/utils';
import { Select, Table, message } from 'antd';
import LineChart from '../../components/charts/LineChart';
import { DatePicker, Checkbox, Switch } from 'antd';
import type { CheckboxChangeEvent } from 'antd/es/checkbox';
import dayjs, { Dayjs } from 'dayjs';
import type { DatePickerProps, RangePickerProps } from 'antd/es/date-picker';

const { RangePicker } = DatePicker;
const format = 'YYYY-MM-DD';

const timeArray: string[] = [];

for (let i = 0; i <= 23; i++) {
  const hour = i.toString().padStart(2, '0');
  const timeString = hour + ':00';
  timeArray.push(timeString);
}

export default function OrderList() {
  const router = useRouter();
  //默认最近几天的数据
  const defaultDays = 30;
  // const defaultDays = 0;
  const [defaultPickerValue, setDefaultPickerValue] = useState<any>([dayjs().subtract(defaultDays, 'day'), dayjs()]);
  const [startDate, setStartDate] = useState<string>(dayjs().subtract(defaultDays, 'day').format(format));
  const [endDate, setEndDate] = useState<string>(dayjs().format(format));
  const [painting_type, setPainting_type] = useState<string>('');
  const [types, setTypes] = useState<any[]>([]);
  const [list, setList] = useState<any[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(20);

  const actions: any = {
    'imagine': '绘图',
    'variation': '变体（V',
    'upscale': '放大（U'
  }

  const painting_type_map: any = [
    { app_name: "全部", app_id: '' },
    { app_name: "midjourney", app_id: 'mj' },
    { app_name: "DALLE·2", app_id: 'dalle' },
    { app_name: "Stable Diffution", app_id: 'sd' },
    { app_name: "AI二维码", app_id: 'qrcode' },
    { app_name: "图片高清放大", app_id: 'upscale' },
    { app_name: "换脸", app_id: 'faceswap' }];

  const columns: any = [
    {
      title: '绘画类型',
      dataIndex: 'painting_type',
      width: 80,
      render: (text: number) => <span>{painting_type_map.find((item: { app_id: number; }) => item.app_id === text).app_name}</span>,
    },
    {
      title: '生成时间',
      dataIndex: 'create_time',
      width: 180,
      //使用dayjs,把时间格式化为 2021-01-01 12:00:00
      render: (time: Date) => <span>{dayjs(time).format('YYYY-MM-DD HH:mm:ss')}</span>
    },
    {
      title: 'MJ 动作',
      dataIndex: 'action',
      width: 200,
      render: (action: string, row: any) => {
        let finalAction = action;
        if (row.painting_type === 'mj') {
          if (action === 'variation') {
            finalAction = `V${row.index}`
          } else if (action === 'upscale') {
            finalAction = `U${row.index}`
          } else {
            finalAction = 'MJ 绘图';
          }
        } else {
          finalAction = '无';
        }
        return <span>{finalAction}</span>
      },
    }, {
      title: '消耗点数',
      dataIndex: 'cost',
      width: 200,
      render: (cost: number, row: any) => {
        let finalCost = 0;
        if (cost) {
          finalCost = cost;
        } else {
          //价格计算策略：如果是绘图，消耗点数为8，如果是变体，消耗点数为8，如果是放大，消耗点数为2；
          if (row.painting_type === 'mj') {
            if (row.action === 'imagine' || row.action === 'variation') {
              finalCost = 8;
            } else if (row.action === 'upscale') {
              finalCost = 2;
            } else {
              finalCost = 0;
            }
          }
          if (row.painting_type === 'dalle') {
            finalCost = 8;
          }
          if (row.painting_type === 'sd') {
            finalCost = -1;
          }
          if (row.painting_type === 'qrcode') {
            finalCost = 30;
          }
          if (row.painting_type === 'faceswap') {
            finalCost = 60;
          }
          if (row.painting_type === 'upscale') {
            // paint_params "{"scale_num":2,"onlineImgUrl":"https://oc.superx.chat/img-tmp/20231013113152747147.png","localImgUrl":"","email":"zhen0578@qq.com","img_url":"https://oc.superx.chat/img-tmp/20231013113152747147.png"}"
            const paint_params = JSON.parse(row.paint_params);
            const scale_num = paint_params.scale_num;
            const price: any = {
              2: 30,
              4: 90,
              6: 190,
              8: 330,
            }
            finalCost = price[scale_num];
          }
        }
        return <span>{finalCost === -1 ? '根据参数计费' : finalCost}</span>
      },
    },
  ];

  //查询用户有权限的 app
  async function queryUserApps() {
    setTypes(
      painting_type_map.map((item: any) => {
        return {
          label: item.app_name,
          value: item.app_id,
        };
      })
    );

    setPainting_type(painting_type_map[0].app_id);
  }


  const queryRecords = async () => {
    const { data } = await requestAliyunArt('my-img-records', { startDate, endDate, painting_type, limit: pageSize, offset: (pageSize * (page - 1)) });
    //添加一个属性key，取值为 ID
    data.rows.forEach((item: any) => {
      item.key = item.id;
    });
    setList(data.rows);
    console.log('总数量:', data.count);
    setTotal(data.count)
  };

  const dateOnChange = (dates: DatePickerProps['value'] | RangePickerProps['value'], dateStrings: [string, string]) => {
    setStartDate(dateStrings[0]);
    setEndDate(dateStrings[1]);
  };

  useEffect(() => {
    queryRecords();
  }, [startDate, endDate, painting_type, page, pageSize]);

  useEffect(() => {
    queryUserApps();
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ marginBottom: '20px' }}>
        选择日期：
        <RangePicker onChange={dateOnChange} defaultValue={defaultPickerValue} defaultPickerValue={defaultPickerValue} /> &nbsp;&nbsp;

        &nbsp;&nbsp;&nbsp;&nbsp; 绘画类型：
        <Select
          options={types}
          value={painting_type}
          style={{ width: 260 }}
          onChange={(v) => {
            setPainting_type(v);
            setPage(1);
          }}
        />
      </div>
      {/* 每日订单 */}
      {/* <h2>日订单统计</h2> */}
      <div style={{ padding: "10px 0" }}>总数量：{total} </div>
      <Table
        // tableLayout="fixed"
        columns={columns}
        bordered
        dataSource={list}
        scroll={{ x: 'max-content' }}
        pagination={{
          total,
          pageSize,
          showTotal: (total, range) => ` 共 ${total} 条数据 当前：${range[0]}-${range[1]}`,
          onChange: (page, pageSize) => {
            console.log(page, pageSize);
            setPage(page);
            setPageSize(pageSize);
          }
        }}
      />
    </div>
  );
}
