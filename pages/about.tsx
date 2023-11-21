import { Card, Space } from 'antd';
import { useEffect, useState } from 'react';


const Contact: React.FC = () => {
    const [companyInfo, setCompanyInfo] = useState<any>({
        address: "丰慧中路7号新材料创业大厦10层10层南侧办公1114号",
        name: '北京以诚智控科技有限公司是一家专注于人工智能软件开发和企业级智能知识库应用的创新型科技公司。我们致力于为客户提供先进的人工智能解决方案，帮助他们实现业务的数字化转型和智能化升级。',
        phone: '18310949357',
        mail: 'service@superx.chat'
    })
    useEffect(() => {
        //取出链接地址
        const url = window.location.href;
        //如果包含superx360.com 修改公司信息
        if (url.includes("superx360.com")) {
            setCompanyInfo({
                //生成一个新的公司地址
                address: '北京市朝阳区望京东路8号望京SOHO塔3B座1709室',
                name: '北京市智伴互动科技有限公司',
                phone: '18310949357',
                mail: 'service@superx.chat'
            })
        }
        if (url.includes('ai.sunmen.cn')) {
            setCompanyInfo({
                //生成一个新的公司地址
                address: '浙江省金华市双龙南街276号日报大楼',
                name: '金华嘉丰信息技术有限公司是一家专注于数字化应用的创新型科技公司。我们致力于为客户提供先进的数字化解决方案，帮助客户实现业务的数字化转型和智能化升级。',
                phone: '13819987688',
                mail: '249506@qq.com'
            })
        }
        if (url.includes('ciae.superx.chat')) {
            setCompanyInfo({
                //生成一个新的公司地址
                address: '',
                name: '我们是《中国插画艺术展》及《中国插画艺术展少儿赛》授权的艺术素养课程的研发团队。在这里带领广大美术爱好者、设计师、青少年科技美术爱好者体验AI带给我们的新世界。',
                phone: '18410913984',
                mail: 'yule@ciae.net'
            })
        }
        if (url.includes('aihuihua')) {
            setCompanyInfo({
                //生成一个新的公司地址
                address: '',
                name: '',
                phone: '18310949357',
                mail: 'service@superx.chat'
            })
        }
    }, []);
    return <>
        <Space direction="vertical" size={16} align='center'>
            <Card title="关于我们" style={{ width: 500 }}>
                <div style={{ lineHeight: "1.8" }}>
                    <p>{companyInfo.name}</p>
                    {companyInfo.address && <p>地址：{companyInfo.address}</p>}
                    <p>联系电话：{companyInfo.phone}</p>
                    <p>联系邮箱： <a href={`mailto:${companyInfo.mail}`} style={{ textDecoration: "underline" }}>{companyInfo.mail}</a></p>

                </div>
                {/* <p>客服邮箱：service@superx.chat</p> */}
            </Card>
        </Space>
    </>
}

export default Contact;