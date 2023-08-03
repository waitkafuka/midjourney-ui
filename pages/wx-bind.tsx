import { ProForm, ProFormText } from "@ant-design/pro-components"
import { Button, Col, Form, Input, Row, message } from "antd"
import {
    UserOutlined,
    LockOutlined
} from '@ant-design/icons'
import { useEffect, useMemo, useState } from "react"
import { requestAliyun } from "../request/http"
declare const window: Window & { countdownInterval: any, poolScanTimer: any, refreshQrcodeTimer: any }
import { setUserInfo } from "../store/userInfo";
import store from "../store"
import QRCode from 'qrcode';

const getCodeText = '获取验证码'
let countdownInterval: any = null;

const WxBind = function () {
    const [qrCodeSrc, setQrCodeSrc] = useState<string>('');
    //获取微信绑定二维码
    const getWXQrcode = async () => {
        const { data } = await requestAliyun('wx/get-qrcode?type=bind', null, 'GET')
        if (!data.url) {
            message.error('获取微信登录二维码失败，请刷新重试');
            return;
        }
        const base64Url = await QRCode.toDataURL(data.url)
        setQrCodeSrc(base64Url);
        clearPollingTimer();
        pollingScanStatus(data.token);
    }

    function clearPollingTimer() {
        if (window.poolScanTimer) {
            clearTimeout(window.poolScanTimer);
            window.poolScanTimer = null;
        }
    }

    //每 2 分钟刷新一次二维码
    const refreshQrcode = () => {
        return setInterval(() => {
            getWXQrcode();
        }, 2 * 60 * 1000);
    }

    //轮询扫码状态
    const pollingScanStatus = async (token: string) => {
        const res = await requestAliyun('wx/polling-scan-status', { token, type: 'bind' },);
        if (!!res.user) {
            message.success('绑定成功');
            store.dispatch(setUserInfo(res.user || {}))
            clearPollingTimer();
        } else {
            clearPollingTimer();
            window.poolScanTimer = setTimeout(() => {
                pollingScanStatus(token);
            }, 1000);
        }
    }

    //初始化
    useEffect(() => {
        getWXQrcode();
        const pollingTimer = refreshQrcode();
        return () => {
            clearPollingTimer();
            clearInterval(pollingTimer);
        }
    }, [])

    return <div className="wx-bind-form">
        <div>
            <img style={{ width: "260px" }} src={qrCodeSrc} alt="" />
        </div>

    </div>
}

export default WxBind;