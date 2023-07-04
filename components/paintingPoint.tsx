import React, { useEffect, useState } from "react";
import { Input, Button, List, Image, Typography, Modal, message } from "antd";
import { requestAliyun, requestAliyunArt } from "../request/http";
import Masonry from "../components/masonry/masonry";
import { ImgCardModel, ImgPageType } from '../scripts/types'
import QRCode from 'qrcode';
import { useSelector } from "react-redux";
import store from "../store";
import { setUserInfo } from "../store/userInfo";
import { getQueryString } from "../scripts/utils";

interface ImgListPageProps {
    type: ImgPageType
}

//由于setstate是异步的，所以需要一个变量来判断是否正在请求数据
const PaingPoint = ({ }) => {
    const [qrCodeSrc, setQrCodeSrc] = useState<string>('');
    const user = useSelector((state: any) => state.user.info);
    const isShowBuyPointDialog = useSelector((state: any) => state.user.isShowBuyPointDialog);
    //从链接中取出u 参数
    const u = sessionStorage.getItem('u');

    const setModalQrcode = async () => {
        //获取用户邮箱
        const email = user.email;
        if (!email) {
            // message.error('请先登录');
            // setTimeout(() => {
            // window.location.href = '/login';
            return;
            // }, 1000);
        };
        const base64Url = await QRCode.toDataURL(`https://arkit.com.cn/pay/?u=${u}&email=${email}&pkgId=10&bd_vid=${sessionStorage.getItem('bd_vid') || ''}`)
        setQrCodeSrc(base64Url);
    }


    const showBuyModal = async () => {
        store.dispatch({
            type: 'user/setIsShowBuyPointDialog',
            payload: true
        })
    }

    useEffect(() => {
        if (isShowBuyPointDialog) {
            if (!user.email) {
                window.location.href = `/login?redirect=${encodeURIComponent(`/art?bd_vid=${getQueryString('bd_vid')}`)}`;
            }
        }
    }, [isShowBuyPointDialog])

    //获取用户信息
    const getUserInfo = async () => {
        const data = await requestAliyun('userinfo', null, 'GET');
        store.dispatch(setUserInfo(data.user || {}))
        store.dispatch({
            type: 'user/setIsShowBuyPointDialog',
            payload: false
        })
        // dispatch(setUserInfo(data.user || {}))
    };

    //初始化
    useEffect(() => {
        setModalQrcode();
    }, [user]);

    return (
        <div className="">
            <Modal
                title="购买点数"
                style={{ top: 20 }}
                open={isShowBuyPointDialog}
                destroyOnClose={true}
                closable={true}
                cancelText="取消"
                maskClosable={false}
                okText="支付完成"
                onOk={getUserInfo}
                onCancel={() => {
                    store.dispatch({
                        type: 'user/setIsShowBuyPointDialog',
                        payload: false
                    })
                }}
            // footer={null}
            >
                <div style={{ display: "flex" }}>
                    <div>
                        <img src={qrCodeSrc} />
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}><img style={{ marginRight: "5px", width: "20px" }} src="https://c.arkit.com.cn/wechatlogo.png" />请使用微信扫码支付</div>
                    </div>
                    <div style={{ display: "flex", flexGrow: 1, lineHeight: 1.6, textAlign: "center", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
                        <div>1000 个点数 / 68 元</div>
                        <div>可应用于 Stable Diffusion、Midjourney、DALLE，点数永久有效。</div>
                        <div>每张图消耗 8 个点数（SD 根据参数消耗不同点数）</div>
                        <div>（ midjourney四宫格算一张图）</div>
                    </div>
                </div>
            </Modal>
            <div style={{ color: "rgb(119, 119, 119)", fontSize: "13px" }}> 剩余点数：{user.point_count} <Button onClick={showBuyModal}>购买点数</Button></div>
        </div>
    );
};

export default PaingPoint;
