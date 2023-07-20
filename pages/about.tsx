import { Card, Space } from 'antd';
import { useEffect, useState } from 'react';


const Contact: React.FC = () => {
    const [companyInfo, setCompanyInfo] = useState<any>({
        address: "丰慧中路7号新材料创业大厦10层10层南侧办公1114号",
        name: '北京以诚智控科技有限公司'
    })
    useEffect(()=>{
        //取出链接地址
        const url = window.location.href;
        //如果包含superx360.com 修改公司信息
        if(url.indexOf("superx360.com") > -1){
            setCompanyInfo({
                //生成一个新的公司地址
                address:'北京市朝阳区望京东路8号望京SOHO塔3B座1709室',
                name: '北京市智伴互动科技有限公司'
            })
        }
    },[]);
    return <>
        <Space direction="vertical" size={16} align='center'>
            <Card title="关于我们" style={{ width: 500 }}>
                <div style={{ lineHeight: "1.8" }}>
                    <p>{companyInfo.name}是一家专注于人工智能软件开发和企业级智能知识库应用的创新型科技公司。我们致力于为客户提供先进的人工智能解决方案，帮助他们实现业务的数字化转型和智能化升级。</p>
                    <p>地址：{companyInfo.address}</p>
                    <p>联系电话：18037226583</p>
                    <p>联系邮箱： <a href="mailto:service@superx.chat" style={{ textDecoration: "underline" }}>service@superx.chat</a></p>

                </div>
                {/* <p>客服邮箱：service@superx.chat</p> */}
            </Card>
        </Space>
    </>
}

export default Contact;