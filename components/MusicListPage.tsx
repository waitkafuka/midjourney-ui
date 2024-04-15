import React, { useEffect, useRef, useState } from "react";
import { Input, Button, List, Image, Typography } from "antd";
import { requestAliyun, requestAliyunArt } from "../request/http";
import MusicMasonry from "./masonry/musicMasonry";
import { ImgCardModel, MusicModel, MusicPageType } from '../scripts/types'
import type { DatePickerProps, RangePickerProps } from 'antd/es/date-picker';
import { DatePicker, Checkbox, Switch } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
const { RangePicker } = DatePicker;

const { Search } = Input;
interface MusicListPageProps {
    type: MusicPageType
}
const format = 'YYYY-MM-DD';

//由于setstate是异步的，所以需要一个变量来判断是否正在请求数据
const MusicListPage = ({ type }: MusicListPageProps) => {
    let isLockRequest = false;
    let pageIndex = useRef(0);

    const keywordsRef = useRef('');
    const [keywords, setKeywords] = useState<string>('');
    const [musicList, setMusicList] = useState<ImgCardModel[]>([])

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
        const index = musicList.findIndex(item => item.id === id);
        // 从列表中移除
        musicList.splice(index, 1);
        //重新渲染
        setMusicList([...musicList]);
    }

    //查询用户的作品列表
    const queryMusicList = async () => {

        if (isLockRequest) return
        isLockRequest = true
        setIsDataLoading(true)
        pageIndex.current = pageIndex.current + 1;
        let apiUrl = '';
        if (type === MusicPageType.MY) {
            apiUrl = 'my-suno-music-list'
        } else if (type === MusicPageType.MY_THUMB_UP_LIST) {
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
        setMusicList(list => [...list, ...newImgList])

        // setCount(Math.random())
        setCount(result.count)
        isLockRequest = false;
        setIsDataLoading(false)
    }

    const dateOnChange = (dates: DatePickerProps['value'] | RangePickerProps['value'], dateStrings: [string, string]) => {
        setStartDate(dateStrings[0]);
        startDateRef.current = dateStrings[0];
        setEndDate(dateStrings[1]);
        endDateRef.current = dateStrings[1];
    };

    useEffect(() => {
        pageIndex.current = 0;
        setMusicList([]);
        queryMusicList()
    }, [startDate, endDate])

    const onSearch: any = async (value: string) => {
        pageIndex.current = 0;
        keywordsRef.current = value;
        setKeywords(value);
        setMusicList([]);
        queryMusicList()
    };

    // 页面初始化
    useEffect(() => {
        // recalcCardPosition();
        // pageIndex = 0;
        queryMusicList()
    }, [])
    return (
        <div className="">
            {/* 我的页面，加上关键词和日期的搜索 */}
            {
                type === MusicPageType.MY && <div style={{ padding: "10px 20px" }}>
                    <div className="painting-search-box">
                        <Search placeholder="输入音乐标题..." value={keywords} onChange={(v) => {
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
            {
                process.env.NODE_ENV === 'development' && <div style={{ padding: "10px 20px" }}>
                    <Search placeholder="风景、人物、插画、动漫..." value={keywords} onChange={(v) => {
                        setKeywords(v.target.value)
                    }} maxLength={50} allowClear onSearch={onSearch} style={{}} />
                </div>
            }
            <MusicMasonry type={type} onImgDeleted={onImgDeleted} style={{ paddingTop: "20px" }} list={musicList} onPageRequest={queryMusicList} isDataLoading={isDataLoading} totalCount={count} />
        </div>
    );
};

export default MusicListPage;
