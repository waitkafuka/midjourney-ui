import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm'
import moment from 'moment';
import { requestAliyun, requestAliyunArt } from '../request/http';
import { Space, Table, Tag, Tooltip } from 'antd';
import type { ColumnsType } from 'antd/es/table';

const awards: {
    [key: number]: string
} = {
    0: '1000 点绘画点数，ChatGPT 包月会员一个月',
    1: '1000 点绘画点数',
    2: '800 点绘画点数',
    3: '600 点绘画点数',
    4: '500 点绘画点数',
    5: '400 点绘画点数',
    6: '300 点绘画点数',
    7: '200 点绘画点数',
    8: '100 点绘画点数',
    9: '100 点绘画点数',

}

function convertToUpperCaseNumber(number: number) {
    var upperCaseNumbers = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
    var numberString = number.toString();
    var result = '';
    for (var i = 0; i < numberString.length; i++) {
        var digit = parseInt(numberString[i]);
        result += upperCaseNumbers[digit];
    }

    return result;
}

const ActivityResult = () => {
    const [lastMonthArray, setLastMonthArray] = useState<[]>([]);
    const [thisMonthArray, setThisMonthArray] = useState<[]>([]);
    const [lastMonth, setLastMonth] = useState<string>('');

    const columns: ColumnsType<any> = [
        {
            title: "排名",
            dataIndex: "rank",
            key: "rank",
            render: (d, _, index) => <span>{index + 1}</span>,
            width: 80,

        },
        {
            title: '邮箱',
            dataIndex: 'email',
            key: 'email',
            width: 150,
        },
        {
            title: '日期',
            dataIndex: 'create_time',
            key: 'create_time',
            render: (d) => <span>{moment(d).format('YYYY-MM-DD HH:mm:ss')}</span>,
            width: 230,
        },
        {
            title: '提示词',
            dataIndex: 'prompt',
            key: 'prompt',
            render: (d) => <Tooltip title={d}>
                <div style={{ width: '150px', overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis", lineClamp: 1 }}>{d}</div>
            </Tooltip>,
            width: 330,
        },
        {
            title: '图片链接',
            dataIndex: 'img_url',
            key: 'img_url',
            render: (d, _) => <a href={`/art/img/${_.id}`} target='_blank'>点击查看</a>,
            width: 100,
        },
        {
            title: '点赞数量',
            dataIndex: 'thumb_up_count',
            key: 'thumb_up_count',
            width: 100,
        },
        {
            title: '奖励（均已发放到位，如无收到请联系客服邮箱service@superx.chat）',
            dataIndex: 'award',
            key: 'award',
            render: (d, _, index) => <div>
                <div>{awards[index]}</div>
            </div>,

        },
    ]
    //获取本月和上月的点赞top 10
    const queryTop10 = async () => {
        const requests = [requestAliyunArt('get-thumb-up-10', { month: moment().month() }), requestAliyunArt('get-thumb-up-10', { month: moment().month() + 1 })];
        const [r1, r2] = await Promise.all(requests);
        console.log(r1, r2);
        const lastMonthArray = r1.data;
        const thisMonthArray = r2.data;
        setLastMonthArray(lastMonthArray);
        setThisMonthArray(thisMonthArray);
    }

    //编写一个函数，获取上个月的月份并转成大写汉字
    const getLastMonth = () => {
        const lastMonth = moment().month() === 0 ? 12 : moment().month();
        setLastMonth(convertToUpperCaseNumber(lastMonth));
    }

    useEffect(() => {
        queryTop10();
        getLastMonth();
    }, []);


    return (
        <div style={{ padding: "20px" }}>
            <h2>{lastMonth}月份大赛结果公示</h2>
            <p style={{ margin: "10px 0" }}>备注：以下点赞数量为{lastMonth}月份时间范围内的点赞数量，因此在点击进入图片详情页的时候，点赞数量也许会变多，是在其他时间的点赞数据，并非数据错误。</p>
            <div style={{ marginTop: "20px" }}>
                <Table columns={columns} pagination={false} dataSource={lastMonthArray} />
            </div>
            <h2 style={{ marginTop: "30px" }}>本月实时排名</h2>
            <div style={{ marginTop: "20px" }}>
                <Table columns={columns.filter(e => e.key !== 'award')} pagination={false} dataSource={thisMonthArray} />
            </div>
        </div>
    )
}

export default ActivityResult;