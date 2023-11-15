import React, { useEffect, useRef, useState } from "react";
import { Input, Button, List, Image, Typography } from "antd";
import { requestAliyun, requestAliyunArt } from "../request/http";
import Masonry from "../components/masonry/masonry";
import { ImgCardModel, ImgPageType } from '../scripts/types'

const { Search } = Input;
interface ImgListPageProps {
    type: ImgPageType
}

//由于setstate是异步的，所以需要一个变量来判断是否正在请求数据
const ImgListPage = ({ type }: ImgListPageProps) => {
    let isLockRequest = false;
    let pageIndex = useRef(0);

    const keywordsRef = useRef('');
    const [keywords, setKeywords] = useState<string>('');
    const [imgList, setImgList] = useState<ImgCardModel[]>([])
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
        const result = await requestAliyunArt(apiUrl, { pageIndex: pageIndex.current, keywords: keywordsRef.current })
        //追加之前去除重复数据
        let newImgList: any = [];
        if (result.rows) {
            newImgList = result.rows.filter((item: any) => {
                return imgList.findIndex((img: any) => img.id === item.id) === -1
            })
        }
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
            {/* <div style={{ padding: "10px 20px" }}>
                <Search placeholder="风景、人物、插画、动漫..." value={keywords} onChange={(v) => {
                    setKeywords(v.target.value)
                }} maxLength={50} allowClear onSearch={onSearch} style={{}} />
            </div> */}
            <Masonry onImgThumbUpActionDone={onImgThumbUpActionDone} type={type} onImgDeleted={onImgDeleted} style={{ paddingTop: "20px" }} list={imgList} onPageRequest={queryImgList} isDataLoading={isDataLoading} totalCount={count} />
        </div>
    );
};

export default ImgListPage;
