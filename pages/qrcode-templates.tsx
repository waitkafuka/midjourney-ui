import { useEffect, useState } from "react";
import { qrTemplates, qrModels, qrVersions } from "../scripts/config";

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
                    </div>
                </div>
            })}
        </div>
    </>;
}

export default QrcodeTemplates;
