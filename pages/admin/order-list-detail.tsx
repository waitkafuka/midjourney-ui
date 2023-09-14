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

const pkgIdTypes: any = {
  '10': '1000点数/68元',
  '26': '1000点数/68元',
  '27': '3000点数/188元',
  '28': '5000点数/298元',
  '29': '3000点数/799元',
  '30': '5000点数/999元',
  '31': '10000点数/1299元',
}

const pkgIdOptions = Object.keys(pkgIdTypes).map(key => ({
  label: key,
  value: key
}));
let timerId: NodeJS.Timer;

export default function OrderList() {
  const router = useRouter();
  //默认最近几天的数据
  // const defaultDays = 6;
  const defaultDays = 0;
  const [defaultPickerValue, setDefaultPickerValue] = useState<any>([dayjs().subtract(defaultDays, 'day'), dayjs()]);
  const [startDate, setStartDate] = useState<string>(dayjs().subtract(defaultDays, 'day').format(format));
  const [endDate, setEndDate] = useState<string>(dayjs().format(format));
  const [onlybaidu, setOnlybaidu] = useState<boolean>(false);
  const [onlySuccess, setOnlySuccess] = useState<boolean>(true);
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);
  const [appId, setAppId] = useState<number>(-1);
  const [list, setList] = useState<any[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [pkgIds, setPkgIds] = useState<string[]>(['10', '26', '27', '28']);
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  //最后刷新时间
  const [lastRefreshTime, setLastRefreshTime] = useState<Date>(new Date());

  const [domains, setDomains] = useState([]);


  const columns: any = [
    {
      title: 'ID',
      dataIndex: 'id',
    },
    {
      title: '套餐类型',
      dataIndex: 'source',
      render: (text: string) => {
        const pkgId = getQueryFromString(text, 'pkgId');
        return <span>{`${pkgId} - ${pkgIdTypes[pkgId] || pkgId}`}</span>
      },
    },

    {
      title: '总金额',
      dataIndex: 'total_amount',
      render: (text: number) => <span>{text / 100}</span>,
    },
    {
      title: '创建时间',
      dataIndex: 'create_time',
      render: (time: Date) => <span>{dayjs(time).format('YYYY-MM-DD HH:mm:ss')}</span>
    },
    {
      title: '支付时间',
      dataIndex: 'success_time',
      //使用dayjs,把时间格式化为 2021-01-01 12:00:00
      render: (time: Date) => <span>{dayjs(time).format('YYYY-MM-DD HH:mm:ss')}</span>
    },
    {
      title: '渠道',
      dataIndex: 'source',
      with: 500,
      render: (text: string) => <span>{getQueryFromString(text, 'channel')}</span>,
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
      title: '总支付金额',
      dataIndex: 'payer_total_amount',
      render: (text: number) => <span>{text / 100}</span>,
    },

    {
      title: 'source',
      dataIndex: 'source',
      ellipsis: true,
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

    const { data } = await requestAliyun('order-list', { startDate, endDate, onlybaidu, appId, pkgIds, limit: pageSize, offset: (pageSize * (page - 1)), onlySuccess });
    //添加一个属性key，取值为 ID
    data.list.forEach((item: any) => {
      item.key = item.id;
    });
    setList(data.list);
    console.log('总数量:', data.count);
    setTotal(data.count)
    setLastRefreshTime(new Date());
  };

  const dateOnChange = (dates: DatePickerProps['value'] | RangePickerProps['value'], dateStrings: [string, string]) => {
    setStartDate(dateStrings[0]);
    setEndDate(dateStrings[1]);
  };

  const startTimer = () => {
    timerId = setInterval(() => {
      queryOrder();
    }, 5000)
  }

  const stopTimer = () => {
    console.log('stopTimer', timerId);

    clearInterval(timerId);
  }

  useEffect(() => {
    if (autoRefresh) {
      startTimer();
    } else {
      stopTimer();
    }
  }, [autoRefresh])

  useEffect(() => {
    stopTimer();
    startTimer();
    queryOrder();
  }, [startDate, endDate, onlybaidu, appId, onlySuccess, pkgIds, page, pageSize]);

  useEffect(() => {
    queryUserApps();
    return () => {
      stopTimer();
    }
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
        &nbsp;&nbsp;&nbsp;&nbsp; 选择套餐 ID：
        <Select
          mode="multiple"
          style={{ width: 260 }}
          placeholder="选择套餐"
          defaultValue={['10', '26', '27', '28']}
          onChange={v => {
            setPkgIds(v);
          }}
          options={pkgIdOptions}
          optionLabelProp="label"
        >
        </Select>
        &nbsp;&nbsp;&nbsp;&nbsp; 每 5 秒自动刷新
        <Switch
          defaultChecked={autoRefresh}
          onChange={(checked) => {
            setAutoRefresh(checked);
          }}
        />
      </div>
      {/* 每日订单 */}
      {/* <h2>日订单统计</h2> */}
      <div style={{ padding: "10px 0" }}>总数量：{total} 数据最后刷新时间：{dayjs(lastRefreshTime).format('YYYY-MM-DD HH:mm:ss')}</div>
      <Table
        tableLayout="fixed"
        columns={columns}
        dataSource={list}
        pagination={{
          total,
          pageSize: 10,
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
