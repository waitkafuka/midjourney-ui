import { Card, Space } from 'antd';


const Contact: React.FC = () => {
    return <>
        <Space direction="vertical" size={16} align='center'>
            <Card title="关于我们" style={{ width: 500 }}>
                <div style={{ lineHeight: "1.8" }}>
                    <p>北京以诚智控科技有限公司是一家专注于人工智能软件开发和企业级智能知识库应用的创新型科技公司。我们致力于为客户提供先进的人工智能解决方案，帮助他们实现业务的数字化转型和智能化升级。</p>
                    <p>北京市朝阳区望京东路8号望京SOHO塔3B座1709室</p>
                    {/* <p>联系电话：18037226583</p> */}
                    <p>联系邮箱： <a href="mailto:service@superx.chat" style={{ textDecoration: "underline" }}>service@superx.chat</a></p>

                </div>
                {/* <p>客服邮箱：service@superx.chat</p> */}
            </Card>
        </Space>
    </>
}

export default Contact;