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
        if (res.code === 0) {
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
        } else {
            message.error(res.message, 15);
            clearPollingTimer();
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

    return <div className="wx-bind-form" style={{ width: "500px", margin: "20px auto", textAlign: "center" }}>
        {qrCodeSrc ? <img className="login-qr-img" style={{ border: "1px solid #e6e6e6" }} src={qrCodeSrc} alt="" /> : <div style={{ height: "260px" }}></div>}
        <div className='login-tips' style={{ marginTop: "15px" }}>
            <img alt="" style={{ width: "16px", display: "inline-block", marginRight: "5px" }} src="data:image/svg+xml;base64,PHN2ZyBpZD0i5Zu+5bGCXzEiIGRhdGEtbmFtZT0i5Zu+5bGCIDEiIHhtbG5zPSJodHRwOi8vd3d3
LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxp
bmsiIHZpZXdCb3g9IjAgMCA1MC41NSA0MS4xNiI+PGRlZnM+PHN0eWxlPi5jbHMtMXtmaWxsOnVy
bCgj5pyq5ZG95ZCN55qE5riQ5Y+YKTt9LmNscy0ye2ZpbGw6dXJsKCPmnKrlkb3lkI3nmoTmuJDl
j5hfMik7fS5jbHMtM3tmaWxsOiMxODdlMjg7fS5jbHMtNHtmaWxsOiM4NThjOGM7fTwvc3R5bGU+
PGxpbmVhckdyYWRpZW50IGlkPSLmnKrlkb3lkI3nmoTmuJDlj5giIHgxPSItODIwLjQzIiB5MT0i
NjQ0LjA2IiB4Mj0iLTgyMC40MyIgeTI9IjY0NSIgZ3JhZGllbnRUcmFuc2Zvcm09Im1hdHJpeCgz
Ni41OSwgMCwgMCwgLTMyLjQzLCAzMDA0MC4yNCwgMjA5MTguMzMpIiBncmFkaWVudFVuaXRzPSJ1
c2VyU3BhY2VPblVzZSI+PHN0b3Agb2Zmc2V0PSIwIiBzdG9wLWNvbG9yPSIjNzhkNDMxIi8+PHN0
b3Agb2Zmc2V0PSIxIiBzdG9wLWNvbG9yPSIjOWVlZTY5Ii8+PC9saW5lYXJHcmFkaWVudD48bGlu
ZWFyR3JhZGllbnQgaWQ9IuacquWRveWQjeeahOa4kOWPmF8yIiB4MT0iLTgxNS43NSIgeTE9IjY0
MC40NSIgeDI9Ii04MTUuNzUiIHkyPSI2NDEuMzkiIGdyYWRpZW50VHJhbnNmb3JtPSJtYXRyaXgo
MzAuNDIsIDAsIDAsIC0yNy4yNCwgMjQ4NTEuMTUsIDE3NDkxLjE3KSIgZ3JhZGllbnRVbml0cz0i
dXNlclNwYWNlT25Vc2UiPjxzdG9wIG9mZnNldD0iMCIgc3RvcC1jb2xvcj0iI2U0ZTZlNiIvPjxz
dG9wIG9mZnNldD0iMSIgc3RvcC1jb2xvcj0iI2Y1ZjVmZiIvPjwvbGluZWFyR3JhZGllbnQ+PC9k
ZWZzPjxwYXRoIGNsYXNzPSJjbHMtMSIgZD0iTTEsMTguMzFBMTQuNDUsMTQuNDUsMCwwLDAsNy4z
MiwyOS44N2ExLjE1LDEuMTUsMCwwLDEsLjUxLDFjMCwuMTEsMCwuMjgsMCwuNC0uMjksMS4xMy0u
NzksMy0uODUsMy4wNmExLjI0LDEuMjQsMCwwLDAtLjExLjQ1LjYzLjYzLDAsMCwwLC42Mi42My44
Mi44MiwwLDAsMCwuMzQtLjEybDQtMi4zMmExLjg5LDEuODksMCwwLDEsMS0uMjgsMi4xNiwyLjE2
LDAsMCwxLC41NiwwLDIwLjU1LDIwLjU1LDAsMCwwLDYsLjg1YzEwLjEsMCwxOC4yOS02Ljg2LDE4
LjI5LTE1LjNTMjkuNCwzLDE5LjMsMywxLDkuODYsMSwxOC4zMSIgdHJhbnNmb3JtPSJ0cmFuc2xh
dGUoLTEgLTMpIi8+PHBhdGggY2xhc3M9ImNscy0yIiBkPSJNMzYuMzQsNDIuNjJhMTcuNTksMTcu
NTksMCwwLDAsNS0uNjgsMSwxLDAsMCwxLC40NS0uMDYsMS43NywxLjc3LDAsMCwxLC43OS4yM2wz
LjMyLDEuOTRjLjEyLjA2LjE3LjExLjI4LjExYS41MS41MSwwLDAsMCwuNTEtLjUxYzAtLjEyLS4w
Ni0uMjMtLjA2LS40cy0uNDUtMS42LS42Ny0yLjU3YS43LjcsMCwwLDEtLjA2LS4zNCwxLjA5LDEu
MDksMCwwLDEsLjQ1LS44NiwxMi4wOCwxMi4wOCwwLDAsMCw1LjI0LTkuNzFjMC03LjA4LTYuODEt
MTIuODUtMTUuMjEtMTIuODVTMjEuMTMsMjIuNjMsMjEuMTMsMjkuNzcsMjgsNDIuNjIsMzYuMzQs
NDIuNjJaIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgtMSAtMykiLz48cGF0aCBjbGFzcz0iY2xzLTMi
IGQ9Ik0xNS41NSwxMy4zNkEyLjM1LDIuMzUsMCwxLDEsMTMuMiwxMWEyLjM0LDIuMzQsMCwwLDEs
Mi4zNSwyLjM2bTEyLjIsMEEyLjM2LDIuMzYsMCwxLDEsMjUuMzksMTFhMi4zNCwyLjM0LDAsMCwx
LDIuMzYsMi4zNiIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoLTEgLTMpIi8+PHBhdGggY2xhc3M9ImNs
cy00IiBkPSJNMzkuNSwyNS44YTIuMDYsMi4wNiwwLDEsMCwyLjA2LTIuMDdBMi4wNywyLjA3LDAs
MCwwLDM5LjUsMjUuOG0tMTAuMTQsMGEyLjA2LDIuMDYsMCwxLDAsMi4wNi0yLjA3LDIuMDcsMi4w
NywwLDAsMC0yLjA2LDIuMDciIHRyYW5zZm9ybT0idHJhbnNsYXRlKC0xIC0zKSIvPjwvc3ZnPg==" />
            扫码绑定，之后可以直接使用微信扫码登录
        </div>

    </div>
}

export default WxBind;