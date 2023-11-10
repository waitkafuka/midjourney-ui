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

const getCodeText = '获取验证码'
let countdownInterval: any = null;

const EmailBind = function () {
    const [form] = Form.useForm();
    const [codeRequesting, setCodeRequesting] = useState<boolean>(false);
    const [getCodeBtnText, setGetCodeBtnText] = useState<string>(getCodeText);
    const [apiRequesting, setApiRequesting] = useState<boolean>(false);
    const [appHost,setAppHost] = useState<string>('superx.chat');

    // 获取验证码按钮置灰
    const getEmailCodeBtnDisabled = useMemo(() => {
        return getCodeBtnText !== getCodeText;
    }, [getCodeBtnText])
    // 获取验证码
    const getEmailCode = async () => {
        await form.validateFields(['email']);

        const params = form.getFieldsValue(['email']);
        params.appHost = appHost;
        setCodeRequesting(true)
        const result = await requestAliyun(`get-email-code`, params);
        setCodeRequesting(false)

        // if (result.code === 0) {
        message.success('验证码发送成功，请至邮箱查看')
        // } else {
        //   MessagePlugin.warning(result.message)
        // }
        console.log('result', result);
        //倒计时 60 秒
        startCountdown(60)
    }

    const onSubmit = async () => {
        const params = form.getFieldsValue();
        setApiRequesting(true);
        const result = await requestAliyun(`wx/bind-email`, params);
        console.log('result', result);
        if (result.code === 0) {
            store.dispatch(setUserInfo(result.user || {}))
            message.success('绑定成功')
            // localStorage.setItem('email', result.email);
        } else {
            message.warning(result.message)
        }
        setApiRequesting(false);

    }

    //重置验证码
    const clearTimer = () => {
        clearInterval(countdownInterval);
        setGetCodeBtnText(getCodeText);
    }

    //倒计时 60 秒
    const startCountdown = function (seconds = 60) {
        const countdownElement = document.getElementById("countdown"); // 获取显示倒计时的元素
        setGetCodeBtnText(seconds + '');
        countdownInterval = setInterval(() => {
            seconds--;
            if (seconds > 0) {
                // 更新剩余时间
                setGetCodeBtnText(seconds + '');
            } else {
                // 倒计时结束，清除 interval
                clearInterval(countdownInterval);
                setGetCodeBtnText(getCodeBtnText);
            }
        }, 1000);
        window.countdownInterval = countdownInterval;
    }

    useEffect(()=>{
        setAppHost(window.location.host);
    },[])

    return <div className="email-bind-form">
        <Form
            form={form}
            name="emailBind"
            scrollToFirstError
            onSubmitCapture={onSubmit}
        >
            <Form.Item
                name="email"
                label="邮箱："
                initialValue={''}
                rules={[
                    {
                        type: 'email',
                        message: '邮箱格式错误',
                    },
                    {
                        required: true,
                        message: '请输入邮箱',
                    },
                ]}
            >
                <Input placeholder="请输入邮箱账号"/>
            </Form.Item>


            <Row gutter={8}>
                <Col span={16}>
                    <Form.Item
                        name="code"
                        label="验证码："
                        rules={[{ required: true, message: '请输入邮箱验证码' }]}
                    >
                        <Input maxLength={6} placeholder="请输入验证码"/>
                    </Form.Item>
                </Col>
                <Col span={8}>
                    <Button disabled={getEmailCodeBtnDisabled} loading={codeRequesting} style={{ width: "100%" }} onClick={getEmailCode}>{getCodeBtnText}</Button>
                </Col>
            </Row>

            <Form.Item >
                <Button type="primary" htmlType="submit" style={{ width: "100%" }} loading={apiRequesting}>
                    确定
                </Button>
                <p className="qrcode-demo-tips">如果您之前用邮箱购买过，可通过邮箱绑定同步权益。</p>
                <p className="qrcode-demo-tips">注意：如果当前微信仍有相关权益，则请不要绑定之前已注册过的邮箱，以避免账号合并所带来的问题。可选择新邮箱进行绑定。请谨慎操作。</p>
            </Form.Item>

        </Form>

    </div>
}

export default EmailBind;