import { useEffect, useState } from "react";
import { qrTemplates, qrModels, qrVersions } from "../scripts/config";
import { Button } from "antd";
import Router from "next/router";

const QrcodeTemplates: React.FC = () => {

    const [templates, setTemplates] = useState(qrTemplates)
    useEffect(() => {
    }, [])

    return <>
        <div className="qrcode-templates-wrap">
            {/* 遍历展示templates */}
            {templates.filter(item => item.id !== 0).map((template, index) => {
                return <div className="qrcode-template-item" key={index}>
                    <div className="qrcode-template-title">{template.name}</div>
                    <div className="qrcode-template-img-box">
                        <img src={template.preview_img} alt="" />
                        <Button onClick={() => {
                            //从浏览器地址中获取from参数
                            const urlParams = new URLSearchParams(window.location.search);
                            const from = urlParams.get('from') || 'qrcode';
                            //使用next-router跳转到/art/qrcode路由，并且携带template_id参数
                            Router.push(`/${from}/?template_id=${template.id}`);
                        }}>使用</Button>
                    </div>
                </div>
            })}
        </div>
    </>;
}

export default QrcodeTemplates;
