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
    disabled?: boolean;
    value?: UploadFile[];
    onChange?: (fileList: UploadFile[]) => void;
    buttonText?: string;
    multiple?: boolean;//是否支持多选，默认false
    maxCount?: number;//最大上传数量，默认为 1
    listType?: 'text' | 'picture' | 'picture-card' | 'picture-circle',
    slot?: React.ReactNode;
}


const AliyunOSSUploader: React.FC<AliyunOSSUploadProps> = ({ value, listType = 'text', onChange, buttonText, slot, maxCount = 1, multiple = false, disabled }) => {
    const [OSSData, setOSSData] = useState<OSSDataType>();

    const handleChange: UploadProps['onChange'] = ({ fileList }) => {
        console.log('handle change Aliyun OSS:', fileList);
        fileList = fileList.map((file) => {
            //如果包含superx.chat
            if (!file.url?.includes('superx.chat')) {
                file.url = `https://oc.superx.chat/${file.url}`;
            }
            return file;
        });
        //全部上传完成之后，才触发onChange 事件
        if (fileList.every((file) => file.status === 'done')) {
            onChange?.([...fileList]);
        }
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
    const beforeUpload: UploadProps['beforeUpload'] = async (file, fileList) => {
        //只允许上传前 maxCount 张图片
        const whiteList = fileList.slice(0, maxCount);
        //判断file在不在白名单里面
        if (!whiteList.includes(file)) {
            console.log('超出限制，不允许上传', file);
            // message.error(`只能上传${maxCount}张图片`);
            return false;
        }

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
        maxCount,
        multiple,
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
        //     return Promise.resolve(`//midjour.oss-cn-beijing.aliyuncs.com/${file.url}`);
        // }
    };

    useEffect(() => {
        init();
    }, []);

    return <>
        <Upload {...uploadParams} disabled={disabled}>
            {listType === 'text' ? <Button icon={<UploadOutlined />}>{buttonText}</Button> : buttonText}
            {slot}

        </Upload>
    </>
};

export default AliyunOSSUploader;