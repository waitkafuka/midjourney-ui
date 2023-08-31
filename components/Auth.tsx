import { useEffect, useRef, useState } from "react";
import { getDeviceType, isPCOrWeChat } from '../utils/app/env'
import { requestAliyun } from "../request/http";

//入口链接：https://superx.chat/auth/?distPage=/art/sd/
//入口链接：https://superx.chat/auth/?distPage=/art/dalle
//入口链接：https://superx.chat/auth/?distPage=/art/
//入口链接：https://superx.chat/auth/?distPage=/art/qrcode/
//入口链接：https://superx.chat/auth/?distPage=/art/guide/
//入口链接：https://superx.chat/auth/?distPage=/
const AuthPage = ({ hidePage }: { hidePage: boolean }) => {
    const redirectUri = useRef('');
    //微信测试账号
    const appid_test = 'wxdb110de9c07d3781'
    //智伴互动服务号
    const appid_prod = 'wx924c1cf2d94b4258'
    const appid = process.env.NODE_ENV === 'development' ? appid_prod : appid_prod;

    //查看链接中是否有code
    function getCode() {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        console.log('code', code);
        return code;
    }

    async function init() {
        //获取用户信息
        const urlParams = new URLSearchParams(window.location.search);
        const distPage = urlParams.get('distPage');
        const userinfo = await requestAliyun('userinfo', {}, 'GET');
        if (userinfo.user) {
            distPage && (window.location.href = `https://${window.location.host}${decodeURIComponent(distPage)}`);
            return;
        }

        //流程是：1.访问本页 2.判断有无code 3.有code，说明是从微信跳转过来的，自动登录 4.无code，说明是从其他地方跳转过来的，跳转到微信授权页  
        //5.自动登录后，跳转到distPage，如果没有distPage，就留在当页
        const code = getCode();
        const url = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${appid}&redirect_uri=${redirectUri.current}&response_type=code&scope=snsapi_base&state=12333#wechat_redirect`
        if (code) {
            //有code，说明是从微信跳转过来的
            //自动登录
            const data = await requestAliyun(`wx/loginByCode`, { code });
            if (data.code === 0) {
                // 从 url 链接中获取distPage 参数
                if (distPage) {
                    window.location.href = `https://${window.location.host}${decodeURIComponent(distPage)}`
                } else {
                    //刷新页面
                    window.location.reload();
                }
            } else {
                alert(JSON.stringify(data));
            }
        } else {
            window.location.href = url;
        }
    }

    useEffect(() => {
        // 在组件加载后执行代码
        if (typeof window !== 'undefined' && isPCOrWeChat() && (window.location.host === 'superx.chat' || window.location.host === 'nat.youyi.asia')) {
            redirectUri.current = encodeURIComponent(window.location.href);
            init();
        }
    }, []); // 空数组是因为没有依赖项

    return <>
        {hidePage ? <span className="auth-page"></span> : <div style={{ width: "100%", height: "100vh", backgroundColor: "#fff" }}></div>}
    </>
}


export default AuthPage;