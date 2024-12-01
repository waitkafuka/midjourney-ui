import { SendOutlined, UploadOutlined } from "@ant-design/icons";
import { Button, Form, message, Upload } from 'antd';
import type { RcFile, UploadFile } from 'antd/es/upload/interface';
import type { UploadProps } from 'antd';
import { useEffect, useState } from "react";
import { requestAliyun } from "../request/http";
import { useSelector } from 'react-redux';

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
    accept?: string,
    maxSize?: number;//最大上传文件大小，默认为 5M
    style?: React.CSSProperties;
    maxMP3Size?: number;//最大上传音频文件大小，默认为 10M
}


const AliyunOSSUploader: React.FC<AliyunOSSUploadProps> = (props) => {
    const {
        value,
        style,
        accept = '.jpg,.jpeg,.png',
        maxSize = 1024 * 1024 * 10,
        maxMP3Size = 1024 * 1024 * 2,
        listType = 'text',
        onChange,
        buttonText,
        slot,
        maxCount = 1,
        multiple = false,
        disabled,
    } = props;

    const [OSSData, setOSSData] = useState<OSSDataType>();
    const user = useSelector((state: any) => state.user.info);

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
        const res = await requestAliyun('get-oss-signature');
        if (res.code === 429) {
            message.error('获取太多oss签名，请稍后再试。如是正常使用，请联系微信客服协助解决。', 10);
            return null;
        }
        return res.data;
    }

    const init = async () => {
        try {
            const result = await getOSSSignature();
            result && setOSSData(result);
        } catch (error) {
            message.error(error + '');
        }
    };

    //上传第一步
    const beforeUpload: UploadProps['beforeUpload'] = async (file, fileList) => {
        // Check if the user is logged in
        if (!user || !user.secret) {
            message.error('请先登录后再上传'); // Prompt the user to log in
            return Upload.LIST_IGNORE; // Prevent the file from being uploaded
        }

        // Only allow uploading up to maxCount files
        const whiteList = fileList.slice(0, maxCount);

        // Check if the file is in the allowed list
        if (!whiteList.includes(file)) {
            console.log('超出限制，不允许上传', file);
            return Upload.LIST_IGNORE;
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
        if (file.size > maxSize) {
            message.error(`文件不能超过${Math.round(maxSize / 1024 / 1024)}M`);
            // 删除文件
            fileList.splice(fileList.indexOf(file), 1);
            return Upload.LIST_IGNORE;
        }

        //如果是音频文件，判断是否超过最大大小
        if (file.type?.startsWith('audio') && file.size > maxMP3Size) {
            message.error(`音频文件最大不能超过${Math.round(maxMP3Size / 1024 / 1024)}M`);
            // 删除文件
            fileList.splice(fileList.indexOf(file), 1);
            return Upload.LIST_IGNORE;
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
        accept,
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
            if (file.type?.startsWith('video')) {
                window.open(src);
            } else {
                const image = new Image();
                image.src = src;
                const imgWindow = window.open(src);
                imgWindow?.document.write(image.outerHTML);
            }

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
        <Upload {...uploadParams} disabled={disabled} style={{ width: '100%' }}>
            {listType === 'text' ? <Button icon={<UploadOutlined />} style={{ width: '100%' }}>{buttonText}</Button> : buttonText}
            {slot}
        </Upload>
    </>
};

export default AliyunOSSUploader;