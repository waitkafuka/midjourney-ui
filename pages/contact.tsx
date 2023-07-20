import { Card, Space } from 'antd';


const Contact: React.FC = () => {
    return <>
        <Space direction="vertical" size={16} align='center'>
            <Card title="联系我们" style={{ width: 500 }}>
                <div style={{ lineHeight: "1.8" }}>
                    <p>联系电话：18037226583</p>
                    <p>联系邮箱： <a href="mailto:service@superx.chat" style={{ textDecoration: "underline" }}>service@superx.chat</a></p>

                </div>
                {/* <p>客服邮箱：service@superx.chat</p> */}
            </Card>
        </Space>
    </>
}

export default Contact;