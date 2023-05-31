import React, { useEffect, useState } from "react";
import { Input, Button, List, Image, Typography, Modal, message } from "antd";
import { requestAliyun, requestAliyunArt } from "../request/http";
import Masonry from "../components/masonry/masonry";
import { ImgCardModel, ImgPageType } from '../scripts/types'
import QRCode from 'qrcode';
import { useSelector } from "react-redux";
import store from "../store";
import { setUserInfo } from "../store/userInfo";

interface ImgListPageProps {
    type: ImgPageType
}

//由于setstate是异步的，所以需要一个变量来判断是否正在请求数据
const PaingPoint = ({ }) => {
    const [isShowBuyPoint, setIsShowBuyPoint] = useState(false);
    const [qrCodeSrc, setQrCodeSrc] = useState<string>('');
    const user = useSelector((state: any) => state.user.info);

    const showBuyModal = async () => {
        //获取用户邮箱
        const email = user.email;
        if (!email) {
            // message.error('请先登录');
            // setTimeout(() => {
            window.location.href = '/login';
            return;
            // }, 1000);
        };
        const base64Url = await QRCode.toDataURL(`https://superx.chat/pay/?email=${email}&pkgId=10`)
        setQrCodeSrc(base64Url);
        setIsShowBuyPoint(true);
    }
    //获取用户信息
    const getUserInfo = async () => {
        const data = await requestAliyun('userinfo', null, 'GET');
        store.dispatch(setUserInfo(data.user || {}))
        setIsShowBuyPoint(false);
        // dispatch(setUserInfo(data.user || {}))
    };

    return (
        <div className="">
            <Modal
                title="购买点数"
                style={{ top: 20 }}
                open={isShowBuyPoint}
                destroyOnClose={true}
                // closable={true}
                cancelText="取消"
                maskClosable={false}
                okText="支付完成"
                onOk={getUserInfo}
                onCancel={() => { setIsShowBuyPoint(false) }}
            // footer={null}
            >
                <div style={{ display: "flex" }}>
                    <div>
                        <img src={qrCodeSrc} />
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}><img style={{ marginRight: "5px", width: "20px" }} src="https://cdn.superx.chat/wechatlogo.png" />请使用微信扫码支付</div>
                    </div>
                    <div style={{ display: "flex", flexGrow: 1, lineHeight: 1.6, alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
                        <div>1000 个点数 / 68 元</div>
                        <div>每张图消耗 8 个点数</div>
                        <div>midjourney和dalle均可使用</div>
                    </div>
                </div>
            </Modal>
            <div style={{ color: "rgb(119, 119, 119)", fontSize: "13px" }}> 剩余点数：{user.point_count} <Button onClick={showBuyModal}>购买点数</Button></div>
        </div>
    );
};

export default PaingPoint;
