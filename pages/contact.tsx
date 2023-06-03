import { Card, Space } from 'antd';


const Contact: React.FC = () => {
    return <>
        <Space direction="vertical" size={16} align='center'>
            <Card title="联系方式" style={{ width: 300 }}>
                <p>客服邮箱：service@superx.chat</p>
            </Card>
        </Space>
    </>
}

export default Contact;