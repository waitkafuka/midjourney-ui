// pages/post/[id].js

import { useRouter, withRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { requestAliyun } from '../../request/http';
import { ImgCardModel } from '../../scripts/types';
import PureImgCard from '../../components/masonry/PureImgCard';
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
  const defaultDays = 6;
  const [defaultPickerValue, setDefaultPickerValue] = useState<any>([dayjs().subtract(defaultDays, 'day'), dayjs()]);
  const [startDate, setStartDate] = useState<string>(dayjs().subtract(defaultDays, 'day').format(format));
  const [endDate, setEndDate] = useState<string>(dayjs().format(format));
  const [onlybaidu, setOnlybaidu] = useState<boolean>(false);
  const [onlySuccess, setOnlySuccess] = useState<boolean>(true);
  const [appId, setAppId] = useState<number>(-1);
  const [list, setList] = useState<any[]>([]);

  const [domains, setDomains] = useState([]);

  const columns: any = [
    {
      title: 'ID',
      dataIndex: 'id',
    },
    {
      title: '创建时间',
      dataIndex: 'create_time',
      render: (text: string) => <a>{text}</a>,
    },
    {
      title: '商户订单号',
      dataIndex: 'out_trade_no',
      ellipsis: true,
    },
    {
      title: '微信订单号',
      dataIndex: 'transaction_id',
      ellipsis: true,
    },
    {
      title: 'openid',
      dataIndex: 'openid',
      ellipsis: true,
    },
    {
      title: '描述',
      dataIndex: 'description',
    },
    {
      title: '总金额',
      dataIndex: 'payer_total_amount',
      render: (text: number) => <span>{text / 100}</span>,
    },
    {
      title: '支付成功时间',
      dataIndex: 'success_time',
    },
    {
      title: 'source',
      dataIndex: 'source',
      ellipsis: true,
    },
    {
      title: '渠道',
      dataIndex: 'source',
      render: (text: string) => <span>{getQueryFromString(text, 'channel')}</span>,
    },

    {
      title: '套餐 ID',
      dataIndex: 'source',
      render: (text: string) => <span>{getQueryFromString(text, 'pkgId')}</span>,
    },

    {
      title: 'inviter',
      dataIndex: 'inviter',
    },
    {
      title: 'attach',
      dataIndex: 'attach',
      ellipsis: true,
    },
    {
      title: 'email',
      dataIndex: 'email',
    },
    {
      title: 'ip',
      dataIndex: 'ip',
    },

    {
      title: 'secret',
      dataIndex: 'secret',
    },

    {
      title: 'total_amount',
      dataIndex: 'total_amount',
      render: (text: number) => <span>{text / 100}</span>,
    },
    {
      title: 'trade_state',
      dataIndex: 'trade_state',
    },
    {
      title: 'trade_state_desc',
      dataIndex: 'trade_state_desc',
    },
    {
      title: 'trade_type',
      dataIndex: 'trade_type',
    },


  ];

  //查询用户有权限的 app
  async function queryUserApps() {
    const { data } = await requestAliyun('user-auths', null, 'GET');
    console.log('result:', data);
    setDomains(
      data.map((item: any) => {
        return {
          label: item.app_name,
          value: item.app_id,
        };
      })
    );
    //默认选中第一个 app
    if (!data || data.length === 0) {
      message.error('没有权限');
      return;
    }
    setAppId(data[0].app_id);
  }


  const queryOrder = async () => {
    if (appId === -1) {
      return;
    }
    let pkgId = 10;
    if (appId === 40) {
      pkgId = 13;
    }
    if (appId === 101) {
      pkgId = 21;
    }
    const { data } = await requestAliyun('order-list', { startDate, endDate, onlybaidu, appId, pkgId, limit: 10, offset: 0, onlySuccess });
    //添加一个属性key，取值为 ID
    data.list.forEach((item: any) => {
      item.key = item.id;
    });
    setList(data.list);
    console.log('总数量:', data.count);
  };

  const dateOnChange = (dates: DatePickerProps['value'] | RangePickerProps['value'], dateStrings: [string, string]) => {
    setStartDate(dateStrings[0]);
    setEndDate(dateStrings[1]);
  };

  useEffect(() => {
    queryOrder();
  }, [startDate, endDate, onlybaidu, appId, onlySuccess]);

  useEffect(() => {
    queryUserApps();
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ marginBottom: '20px' }}>
        选择日期：
        <RangePicker onChange={dateOnChange} defaultValue={defaultPickerValue} defaultPickerValue={defaultPickerValue} /> &nbsp;&nbsp;&nbsp;&nbsp; 仅统计带百度bd_vid参数：
        <Switch
          defaultChecked={onlybaidu}
          onChange={(checked) => {
            console.log(checked);
            setOnlybaidu(checked);
          }}
        />

        <span style={{ marginLeft: "20px" }}>只看成功订单：</span>
        <Switch
          defaultChecked={onlySuccess}
          onChange={(checked) => {
            setOnlySuccess(checked);
          }}
        />
        &nbsp;&nbsp;&nbsp;&nbsp; 选择应用：
        <Select
          options={domains}
          value={appId}
          style={{ width: 260 }}
          onChange={(v) => {
            setAppId(v);
          }}
        />
      </div>
      {/* 每日订单 */}
      {/* <h2>日订单统计</h2> */}
      <Table
        tableLayout="fixed"

        columns={columns}
        dataSource={list}
      />
    </div>
  );
}
