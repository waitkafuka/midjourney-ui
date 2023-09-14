import { Card, Space } from 'antd';
import { useEffect, useState } from 'react';


const Contact: React.FC = () => {
    const [contactInfo,setContactInfo] = useState({
        mail:'service@superx.chat',
        phone:'18310949357'
    })
    useEffect(()=>{
        if(window.location.href.includes('ai.sunmen.cn')){
            setContactInfo({
                mail:'249506@qq.com',
                phone:'13819987688'
            })
        }
        if(window.location.href.includes('ciae.superx.chat')){
            setContactInfo({
                mail:'yule@ciae.net',
                phone:'18410913984'
            })
        }
    })
    return <>
        <Space direction="vertical" size={16} align='center'>
            <Card title="联系我们" style={{ width: 500 }}>
                <div style={{ lineHeight: "1.8" }}>
                    <div>公众号（扫码联系客服）：</div>
                    <div>
                        <img style={{ width: "100%", marginTop: "10px" }} src="https://och.superx.chat/mx-qrcode/20230809214740870087.png" alt="" />
                        <div style={{ textAlign: "center", fontSize: "13px" }}> （以上二维码使用本站“ <a href="/art/qrcode/" style={{ textDecoration: "underline" }}>AI 艺术二维码</a> ” 功能制作）</div>
                    </div>
                    <p>联系邮箱： <a href={`mailto:${contactInfo.mail}`} style={{ textDecoration: "underline" }}>{contactInfo.mail}</a></p>
                    <p>联系电话：{contactInfo.phone}</p>
                </div>
                {/* <p>客服邮箱：service@superx.chat</p> */}
            </Card>
        </Space>
    </>
}

export default Contact;