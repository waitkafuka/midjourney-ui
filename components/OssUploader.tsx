import { SendOutlined, UploadOutlined } from "@ant-design/icons";
import { Button, Form, message, Upload } from 'antd';
import type { RcFile, UploadFile } from 'antd/es/upload/interface';
import type { UploadProps } from 'antd';
import { useEffect, useState } from "react";
import { requestAliyun } from "../request/http";

interface OSSDataType {
    dir: string;
    expire: string;
    host: string;
    accessId: string;
    policy: string;
    signature: string;
}


interface AliyunOSSUploadProps {
    value?: UploadFile[];
    onChange?: (fileList: UploadFile[]) => void;
    buttonText: string;
    listType?: 'text' | 'picture' | 'picture-card' | 'picture-circle'
}


const AliyunOSSUploader: React.FC<AliyunOSSUploadProps> = ({ value, listType = 'text', onChange, buttonText }) => {
    const [OSSData, setOSSData] = useState<OSSDataType>();

    const handleChange: UploadProps['onChange'] = ({ fileList }) => {
        console.log('handle change Aliyun OSS:', fileList);
        fileList = fileList.map((file) => {
            file.url = `https://oss-cdn.superx.chat/${file.url}`;
            return file;
        });
        onChange?.([...fileList]);
    };

    const onRemove = (file: UploadFile) => {
        const files = (value || []).filter((v) => v.url !== file.url);

        if (onChange) {
            onChange(files);
        }
    };


    //上传第二步
    const getExtraData: UploadProps['data'] = (file) => {
        console.log('getExtraData', file);
        return {
            key: file.url,
            OSSAccessKeyId: OSSData?.accessId,
            policy: OSSData?.policy,
            Signature: OSSData?.signature,
        }

    };

    //页面初始化的时候加载
    const getOSSSignature = async () => {
        const { data } = await requestAliyun('get-oss-signature');
        return data;
    }

    const init = async () => {
        try {
            const result = await getOSSSignature();
            setOSSData(result);
        } catch (error) {
            message.error(error + '');
        }
    };

    //上传第一步
    const beforeUpload: UploadProps['beforeUpload'] = async (file) => {
        console.log('beforeUpload', file, OSSData);

        if (!OSSData) return false;
        const expire = Number(OSSData.expire) * 1000;
        if (expire < Date.now()) {
            await init();
        }
        const suffix = file.name.slice(file.name.lastIndexOf('.'));
        //生成 6 位随机数字
        const random = Math.floor(Math.random() * 1000000);
        const filename = Date.now() + random + suffix;
        // @ts-ignore
        file.url = OSSData.dir + filename;
        //判断文件是否超过大小
        if (file.size > 1024 * 1024 * 5) {
            message.error('文件不能超过5M');
            return false;
        }
        return file;
    };

    const uploadParams: UploadProps = {
        name: 'file',
        fileList: value,
        action: OSSData?.host,
        onChange: handleChange,
        onRemove,
        data: getExtraData,
        beforeUpload,
        maxCount: 1,
        accept: '.jpg,.jpeg,.png',
        listType,
        onPreview: async (file: UploadFile) => {
            let src = file.url as string;
            if (!src) {
                src = await new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.readAsDataURL(file.originFileObj as RcFile);
                    reader.onload = () => resolve(reader.result as string);
                });
            }
            const image = new Image();
            image.src = src;
            const imgWindow = window.open(src);
            imgWindow?.document.write(image.outerHTML);
        }
        // previewFile: (file: any) => {
        //     console.log('previewFile', file);
        //     return Promise.resolve(`//oss-cdn.superx.chat/${file.url}`);
        // }
    };

    useEffect(() => {
        init();
    }, []);

    return <>
        <Upload {...uploadParams}>
            {listType === 'text' ? <Button icon={<UploadOutlined />}>{buttonText}</Button> : buttonText}

        </Upload>
    </>
};

export default AliyunOSSUploader;