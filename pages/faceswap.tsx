import { useEffect, useMemo, useState } from "react";
import { ImgCardModel, ImgPageType, PaintingType } from '../scripts/types'
import { getQueryString, hasChinese, downloadFile, redirectToZoomPage } from "../scripts/utils";
import { SendOutlined, StopOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { Alert, Button, Col, Form, Input, InputNumber, Radio, Row, Select, Slider, Tooltip, message, notification } from "antd";
import { FACESWAP_COST } from "../scripts/config";
import PaintingPoint from "../components/paintingPoint";
import { requestAliyunArt } from "../request/http";
import store from '../store';
import { useSelector } from 'react-redux';
import Head from 'next/head';
import AliyunOSSUploader from '../components/OssUploader';
import PureImgCard from "../components/masonry/PureImgCard";
enum imgType {
    online = 'online',
    local = 'local'
}

const TextArea = Input.TextArea;

const SwapFace: React.FC = () => {
    //初始化参数
    const user = useSelector((state: any) => state.user.info)
    const [showOptions, setShowOptions] = useState<boolean>(false); //是否显示更多选项
    const [qrCodeImage, setQrCodeImage] = useState<ImgCardModel>(); //模板
    const [useTemplate, setUseTemplate] = useState<boolean>(false); //是否使用模板
    const [isWrong, setIsWrong] = useState<boolean>(false); //是否服务器故障
    const [isTranslating, setIsTranslating] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [ratio, setRatio] = useState<{ width: number, height: number }>({ width: 1, height: 1 }); //画布缩放比例
    const [qrImg, setQrImg] = useState<string>(''); //二维码图片
    const [showDemo, setShowDemo] = useState<boolean>(true); //是否显示示例
    const [params, setParams] = useState<any>({
        source: {
            onlineImgUrl: process.env.NODE_ENV === 'development' ? 'https://oc.superx.chat/img/1696924547155.png' : '',
            localImgUrl: '',
            imgType: imgType.online
        },
        target: {
            onlineImgUrl: '',
            localImgUrl: process.env.NODE_ENV === 'development' ? 'https://oc.superx.chat/img/1696924342341.png' : '',
            imgType: imgType.local
        },
        email: ''
    }); //表单参数
    const options = [{
        label: '在线图片',
        value: 'online',
    }, {
        label: "本地上传",
        value: "local"
    }]

    //当user.email更新的时候，重新设置params.email
    useEffect(() => {
        if (user.email) {
            setParams({
                ...params,
                email: user.email
            })
        }
    }, [user.email])



    //获取图片imageData
    function getImageData(imgUrl: string): any {
        return new Promise((resolve, reject) => {
            const img = new Image();

            img.onload = function () {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                canvas.width = img.width;
                canvas.height = img.height;

                if (!ctx) return reject(new Error('无法加载图像'));
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                resolve({
                    imgData,
                    img,
                    canvas
                });
            };

            img.onerror = function () {
                message.error('无法加载图像');
                setIsGenerating(false);
                reject(new Error('无法加载图像'));
            };
            img.setAttribute("crossOrigin", 'anonymous')
            img.src = imgUrl;
        });
    }

    const doSubmit = async () => {
        const apiParams: any = {}
        apiParams.source = params.source.imgType === imgType.online ? params.source.onlineImgUrl : params.source.localImgUrl;
        apiParams.target = params.target.imgType === imgType.online ? params.target.onlineImgUrl : params.target.localImgUrl;
        if (!apiParams.source || !apiParams.target) {
            message.error('请添加底图和人脸照片');
            return;
        }
        //校验点数
        if (user.point_count < FACESWAP_COST) {
            message.error('点数不足，请先购买点数。');
            return;
        }
        if (!params.email) {
            message.error('请填写邮箱');
            return;
        }
        //记录邮箱
        if (params.email) {
            //存入localsotrage , notifyEmail 为key
            localStorage.setItem('notifyEmail', params.email)
        }

        setIsGenerating(true);

        //获取图片宽高
        const { imgData } = await getImageData(apiParams.source);
        const newQrcodeImage: ImgCardModel = {
            id: 0,
            img_url: '',
            prompt: params.prompt,
            create_time: new Date(),
            is_public: 0,
            thumb_up_count: 0,
            painting_type: PaintingType.MJ,
            width: imgData.width,
            height: imgData.height,
        };

        apiParams.sourceImgWidth = imgData.width;
        apiParams.sourceImgHeight = imgData.height;

        setQrCodeImage({ ...newQrcodeImage, img_base_path: 'https://oc.superx.chat/' });
        let res = null;
        try {
            console.log('提交参数：', apiParams);
            res = await requestAliyunArt('face-swap', apiParams);
        } catch (error: any) {
            //error.message转为小写
            if (error.message.toLowerCase().includes('time')) {
                const tips = '由于图片较大，接口响应超时，后台任务仍在运算中，可直接关闭页面。稍后换脸结果将发送至预留邮箱。';
                notification.error({
                    message: '提示',
                    description: tips,
                    duration: 0,
                });
            } else {
                message.error(error + '');
            }

            setIsGenerating(false);
            setQrCodeImage(undefined);
            return;
        }
        if (res.code !== 0) {
            //未登录的提示
            if (res.code === 40015) {
                res.message = '您尚未登录，请先登录后再试'
            }
            if (res.code === 40038) {
                message.error('没有检测到面部，请确保底图和照片中均有清晰人脸，以避免换脸失败。可通过裁剪图像只保留人物腰部以上部分重试。为获得最好效果，尽量不要戴眼镜、口罩、帽子等遮挡物。', 12);
            } else {
                //这里取的是sd返回的message
                message.error(res.message);
            }
            setIsGenerating(false);
            setQrCodeImage(undefined);
            return;
        }
        const data = res.data;
        setIsGenerating(false);
        setQrCodeImage({ ...newQrcodeImage, img_base_path: 'https://oc.superx.chat', img_url: data.ossPath, id: data.id, width: imgData.width, height: imgData.height });
        const distImgUrl = `https://oc.superx.chat${data.ossPath}`;
        //自动下载图片
        downloadFile(distImgUrl);

        //点数减少
        store.dispatch({ type: 'user/pointChange', payload: user.point_count - data.cost })
    }

    //定义一个方法，从链接中获取url参数，并set到params中
    const setParamsFromUrl = () => {
        let imgUrl = getQueryString('url');
        if (!imgUrl) return;
        //decode一下
        imgUrl = decodeURIComponent(imgUrl);
        setParams({
            ...params,
            source: {
                onlineImgUrl: imgUrl,
                imgType: imgType.online
            }
        })
        const notifyEmail = localStorage.getItem('notifyEmail');
        if (notifyEmail) {
            setParams({
                ...params,
                email: notifyEmail
            })
        }
    }

    const showFaceDemo = () => {
        const isHidden = localStorage.getItem('hideFaceDemo');
        if (isHidden) {
            setShowDemo(false);
        }
    }


    //页面初始化
    useEffect(() => {
        setParamsFromUrl();
        showFaceDemo();
    }, [])

    return <><Head>
        <meta name="description" content="这是我的页面描述" />
        <meta name="referrer" content="no-referrer" />
    </Head >
        {/* <Alert
            className="faceswap-alert"
            message="换脸限时优惠中，原价：60点数/张，现价：30点数/张。"
            banner
            style={{ width: 'calc(100% - 230px)' }}
            type="success"
            closable
        /> */}
        <div className='dalle-point-box'><PaintingPoint></PaintingPoint></div>
        {isWrong && <Alert
            message={<>服务器故障，换脸服务暂不可用，请使用其他功能。预计 30 分钟后恢复。</>}
            banner
            type='warning'
            closable
        />}
        <div className="ai-qrcode-wrapper" style={{ marginTop: '50px', paddingTop: "0" }}>

            {/* 左侧区域 */}
            <div className="code-options-box">
                {/* 底图 */}
                <div className="face-box-wrap">
                    <div className="face-box-title">添加底图 {!showDemo && <a style={{ fontSize: "14px", fontWeight: "100" }} href="javascript:void(0)" onClick={() => {
                        setShowDemo(true);
                        localStorage.setItem('hideFaceDemo', '');
                    }}>显示示例</a>}</div>
                    <div className="face-box">
                        {/* 是否在线图片 */}
                        <div style={{ display: "flex", justifyContent: "center", marginBottom: "20px" }}>
                            <Radio.Group
                                options={options}
                                onChange={v => {
                                    setParams({
                                        ...params,
                                        source: {
                                            ...params.source,
                                            imgType: v.target.value
                                        }
                                    });
                                }}
                                value={params.source.imgType}
                                optionType="button"
                                buttonStyle="solid"
                            />
                        </div>
                        {/* 在线图片输入框 */}
                        <div className="art-form-item">
                            {/* <div className="form-item-label">
                            <span className="input-label">底图</span>
                        </div> */}
                            <Input showCount maxLength={500} onChange={v => {
                                setParams({
                                    ...params,
                                    source: {
                                        ...params.source,
                                        [params.source.imgType === imgType.online ? 'onlineImgUrl' : 'localImgUrl']: v.target.value
                                    }
                                });
                            }} placeholder="请粘贴或者本地上传底图链接" value={params.source.imgType === imgType.online ? params.source.onlineImgUrl : params.source.localImgUrl} />
                        </div>

                        {/* 本地图片选择框 */}
                        {params.source.imgType === imgType.local && <div className="art-form-item">
                            <AliyunOSSUploader onChange={fileList => {
                                console.log('fileList', fileList);
                                setParams({
                                    ...params,
                                    source: {
                                        ...params.source,
                                        localImgUrl: fileList[0].url
                                    }
                                });
                            }} listType="picture-card" slot={<div>+ 上传图片</div>} />
                        </div>}
                    </div>
                </div>
                {/* 人脸图 */}
                <div className="face-box-wrap" style={{ marginTop: "40px" }}>
                    <div className="face-box-title">添加照片</div>
                    <div className="face-box">
                        {/* 是否在线图片 */}
                        <div style={{ display: "flex", justifyContent: "center", marginBottom: "20px" }}>
                            <Radio.Group
                                options={options}
                                onChange={v => {
                                    setParams({
                                        ...params,
                                        target: {
                                            ...params.target,
                                            imgType: v.target.value
                                        }
                                    });
                                }}
                                value={params.target.imgType}
                                optionType="button"
                                buttonStyle="solid"
                            />
                        </div>
                        {/* 在线图片输入框 */}
                        <div className="art-form-item">
                            {/* <div className="form-item-label">
                            <span className="input-label">底图</span>
                        </div> */}
                            <Input showCount maxLength={500} onChange={v => {
                                setParams({
                                    ...params,
                                    target: {
                                        ...params.target,
                                        [params.target.imgType === imgType.online ? 'onlineImgUrl' : 'localImgUrl']: v.target.value
                                    }
                                });
                            }} placeholder="请在这里粘贴或者上传包含你要更换的人脸照片" value={params.target.imgType === imgType.online ? params.target.onlineImgUrl : params.target.localImgUrl} />
                        </div>

                        {/* 本地图片选择框 */}
                        {params.target.imgType === imgType.local && <div className="art-form-item">
                            <AliyunOSSUploader onChange={fileList => {
                                console.log('fileList', fileList);
                                setParams({
                                    ...params,
                                    target: {
                                        ...params.target,
                                        localImgUrl: fileList[0].url
                                    }
                                });
                            }} listType="picture-card" slot={<div>+ 上传图片</div>} />
                        </div>}

                    </div>
                </div>
                {/* 通知邮箱 */}
                <div className="art-form-item" style={{ display: "block" }}>
                    <div className="form-item-label">
                        <span className="input-label">通知邮箱</span>
                        <Tooltip title="如果图片较大，生成时间过长，可添加邮箱，待换脸完成后会将结果图片发送至邮箱。如已绑定邮箱，此处会自动显示。">
                            <QuestionCircleOutlined />
                        </Tooltip>
                    </div>
                    <Input showCount maxLength={20} onChange={v => {
                        setParams({
                            ...params,
                            email: v.target.value
                        });
                    }} placeholder="用来接收放大后的图片" value={params.email} />
                </div>
                <div style={{ marginTop: "20px" }}>
                    点数：{FACESWAP_COST}
                </div>
                <Button type="primary" loading={isGenerating} onClick={doSubmit} style={{ width: "100%", marginTop: "10px" }}>
                    开始合成
                </Button>
                <div style={{ marginTop: "20px", color: "#666", fontSize: "13px", lineHeight: "1.6", width: "100%" }}>
                    提示：
                    <ul>
                        <ol>1. 底图可使用 midjourney 或者其他 AI 绘画生成的图片</ol>
                        <ol>2. 人脸照尽量选择清晰正脸照片，效果更佳</ol>
                        <ol>3. 为保护用户隐私，服务器不对合成的图片进行保存，请生成后及时下载</ol>
                        <ol>4. 换脸时长约 30 秒~ 1 分钟，请耐心等待</ol>
                    </ul>
                </div>
            </div>
            {/* 放大结果区域 */}
            {!qrCodeImage && showDemo && <div className="code-result">

                <div className="face-swap-demo-wrap">
                    <div className="face-swap-demo-title">
                        效果示例 <a style={{ fontWeight: '100', fontSize: "14px" }} href="javascript:void(0)" onClick={() => {
                            localStorage.setItem('hideFaceDemo', 'true');
                            setShowDemo(false);
                        }}>隐藏示例</a>
                    </div>
                    <div className="img-title">底图：</div>
                    <div className="img-box">
                        <img src="//oc.superx.chat/img/1696936198952.png" alt="" />
                    </div>
                    <div className="img-title">人物照片：</div>
                    <div className="img-box">
                        <img src="//oc.superx.chat/img/1696939444411.png" alt="" />
                    </div>
                    <div className="img-title">换脸结果：</div>
                    <div className="img-box">
                        <a target="_blank" href="//oc.superx.chat/fimg/20231010191101162739.png"><img src="//oc.superx.chat/fimg/20231010191101162739.png" alt="" /></a>
                    </div>
                </div>
            </div>}
            {qrCodeImage && <div className="code-result">
                <div style={{ display: "flex", justifyContent: "center", flexDirection: 'column', alignItems: 'center' }}>
                    {qrCodeImage && <><PureImgCard
                        imgBasePath="https://oc.superx.chat"
                        ratio={{ width: qrCodeImage.width || 1, height: qrCodeImage.height || 1 }}
                        isLoading={true}
                        showThumbImg={false}
                        columnWidth={350}
                        copylink={true}
                        key={qrCodeImage.id}
                        model={qrCodeImage}
                        hasPrompt={false}
                        onImgDeleted={() => {
                            setQrCodeImage(undefined);
                        }}
                        hasDelete={true} />
                        <Button
                            style={{ marginTop: "20px" }}
                            onClick={() => {
                                redirectToZoomPage(`https://oc.superx.chat${qrCodeImage.img_url}`);
                            }}
                        >
                            一键放大
                        </Button>
                    </>}
                </div>
            </div>}

        </div>
        {/* 说明区域 */}
        {/* <div className="art-desc">
            <h2>使用说明</h2>
            <div></div>
        </div> */}
    </>
}

export default SwapFace;
