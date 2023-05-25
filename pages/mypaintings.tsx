import React, { useEffect, useState } from "react";
import { Input, Button, List, Image, Typography } from "antd";
import { requestAliyunMJ } from "../request/http";
import Masonry from "../components/masonry/masonry";
import { ImgCardModel } from '../scripts/types'

//由于setstate是异步的，所以需要一个变量来判断是否正在请求数据
let isLockRequest = false;
let pageIndex = 0;

const Painting: React.FC = () => {
    const [imgList, setImgList] = useState<ImgCardModel[]>([])
    const [count, setCount] = useState(0)
    const [isDataLoading, setIsDataLoading] = useState(false);
    const onImgDeleted = (id: number) => {
        console.log('onDeleteImg', id);
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
        console.log('isDataLoading1', isDataLoading);
        pageIndex++;
        console.log('请求第几页：', pageIndex);
        const result = await requestAliyunMJ('my-paintings', { pageIndex })
        //追加之前去除重复数据
        console.log('imgList:', imgList);
        console.log('img1:', JSON.parse(JSON.stringify(imgList)));

        const newImgList = result.rows.filter((item: any) => {
            return !imgList.some((img: any) => img.id === item.id)
        })
        // debugger;

        setImgList(list => [...list, ...newImgList])

        // setCount(Math.random())
        setCount(result.count)
        isLockRequest = false;
        setIsDataLoading(false)
        console.log('isDataLoading2', isDataLoading);
    }

    // 页面初始化
    useEffect(() => {
        // recalcCardPosition();
        queryImgList()
    }, [])
    return (
        <div className="">
            <Masonry onImgDeleted={onImgDeleted} style={{ paddingTop: "20px" }} list={imgList} onPageRequest={queryImgList} isDataLoading={isDataLoading} totalCount={count} />
        </div>
    );
};

export default Painting;
