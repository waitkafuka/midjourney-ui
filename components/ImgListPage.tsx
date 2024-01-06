import React, { useEffect, useRef, useState } from "react";
import { Input, Button, List, Image, Typography } from "antd";
import { requestAliyun, requestAliyunArt } from "../request/http";
import Masonry from "../components/masonry/masonry";
import { ImgCardModel, ImgPageType } from '../scripts/types'
import type { DatePickerProps, RangePickerProps } from 'antd/es/date-picker';
import { DatePicker, Checkbox, Switch } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
const { RangePicker } = DatePicker;

const { Search } = Input;
interface ImgListPageProps {
    type: ImgPageType
}
const format = 'YYYY-MM-DD';

//由于setstate是异步的，所以需要一个变量来判断是否正在请求数据
const ImgListPage = ({ type }: ImgListPageProps) => {
    let isLockRequest = false;
    let pageIndex = useRef(0);

    const keywordsRef = useRef('');
    const [keywords, setKeywords] = useState<string>('');
    const [imgList, setImgList] = useState<ImgCardModel[]>([])

    //默认最近几天的数据
    // const defaultDays = 6;
    const defaultDays = 180;
    const [defaultPickerValue, setDefaultPickerValue] = useState<any>([dayjs().subtract(defaultDays, 'day'), dayjs()]);
    const [startDate, setStartDate] = useState<string>(dayjs().subtract(defaultDays, 'day').format(format));
    const [endDate, setEndDate] = useState<string>(dayjs().format(format));
    const startDateRef = useRef(startDate);
    const endDateRef = useRef(endDate);
    const [count, setCount] = useState(0)
    const [isDataLoading, setIsDataLoading] = useState(false);
    const onImgDeleted = (id: number) => {
        // 找到要删除的元素的index
        const index = imgList.findIndex(item => item.id === id);
        // 从列表中移除
        imgList.splice(index, 1);
        //重新渲染
        setImgList([...imgList]);
    }

    //查询用户的作品列表
    const queryImgList = async () => {

        if (isLockRequest) return
        isLockRequest = true
        setIsDataLoading(true)
        pageIndex.current = pageIndex.current + 1;
        let apiUrl = '';
        if (type === ImgPageType.MY) {
            apiUrl = 'my-paintings'
        } else if (type === ImgPageType.MY_THUMB_UP_LIST) {
            apiUrl = 'my-thumb-up-page'
        } else {
            apiUrl = 'public-paintings'
        }
        const result = await requestAliyunArt(apiUrl, { pageIndex: pageIndex.current, keywords: keywordsRef.current, startTime: `${startDateRef.current} 00:00:00`, endTime: `${endDateRef.current} 23:59:59` })
        //追加之前去除重复数据
        let newImgList: any = [];
        // if (result.rows) {
        //     newImgList = result.rows.filter((item: any) => {
        //         return !imgList.some((img: any) => img.id === item.id)
        //     })
        // }
        newImgList = result.rows;
        if (result.keywords !== keywordsRef.current) {
            setKeywords(result.keywords);
            keywordsRef.current = result.keywords;
        }

        // setImgList([...clist, ...newImgList])
        setImgList(list => [...list, ...newImgList])

        // setCount(Math.random())
        setCount(result.count)
        isLockRequest = false;
        setIsDataLoading(false)
    }

    const onImgThumbUpActionDone = (id: number, action: string) => {
        const index = imgList.findIndex(item => item.id === id);
        if (index === -1) return;
        const img = imgList[index];
        if (action === 'add') {
            img.thumb_up_count++;
        } else {
            img.thumb_up_count--;
        }
        setImgList([...imgList]);
    }

    const dateOnChange = (dates: DatePickerProps['value'] | RangePickerProps['value'], dateStrings: [string, string]) => {
        setStartDate(dateStrings[0]);
        startDateRef.current = dateStrings[0];
        setEndDate(dateStrings[1]);
        endDateRef.current = dateStrings[1];
    };

    useEffect(() => {
        pageIndex.current = 0;
        setImgList([]);
        queryImgList()
    }, [startDate, endDate])

    const onSearch: any = async (value: string) => {
        pageIndex.current = 0;
        keywordsRef.current = value;
        setKeywords(value);
        setImgList([]);
        queryImgList()
    };

    // 页面初始化
    useEffect(() => {
        // recalcCardPosition();
        // pageIndex = 0;
        queryImgList()
    }, [])
    return (
        <div className="">
            {/* 我的页面，加上关键词和日期的搜索 */}
            {
                type === ImgPageType.MY && <div style={{ padding: "10px 20px" }}>
                    <div className="painting-search-box">
                        <Search placeholder="风景、人物、插画、动漫..." value={keywords} onChange={(v) => {
                            setKeywords(v.target.value)
                        }} maxLength={50} allowClear onSearch={onSearch} style={{ width: "300px" }} />
                        <RangePicker onChange={dateOnChange} defaultValue={defaultPickerValue} defaultPickerValue={defaultPickerValue} style={{ marginLeft: "20px" }} />

                    </div>
                    {/* <div style={{ textAlign: "center", marginTop: "10px" }}>
                        一共{count}个作品
                    </div> */}
                </div>
            }
            {/* 去掉搜索功能 */}
            {/* {
                process.env.NODE_ENV === 'development' && <div style={{ padding: "10px 20px" }}>
                    <Search placeholder="风景、人物、插画、动漫..." value={keywords} onChange={(v) => {
                        setKeywords(v.target.value)
                    }} maxLength={50} allowClear onSearch={onSearch} style={{}} />
                </div>
            } */}
            <Masonry onImgThumbUpActionDone={onImgThumbUpActionDone} type={type} onImgDeleted={onImgDeleted} style={{ paddingTop: "20px" }} list={imgList} onPageRequest={queryImgList} isDataLoading={isDataLoading} totalCount={count} />
        </div>
    );
};

export default ImgListPage;
