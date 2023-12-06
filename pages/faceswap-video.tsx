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
    const needCostDefault = '请先上传所要转换的视频，视频最大不能超过 200M';
    const user = useSelector((state: any) => state.user.info)
    const [qrCodeImage, setQrCodeImage] = useState<ImgCardModel>(); //模板
    const [isGenerating, setIsGenerating] = useState(false);
    const [showDemo, setShowDemo] = useState<boolean>(true); //是否显示示例
    const [needCostText, setNeedCostText] = useState<string>(needCostDefault); //需要的点数，文案
    const [videoInfo, setVideoInfo] = useState<any>({}); //视频信息
    const [needCost, setNeedCost] = useState<number>(0); //需要的点数
    const [params, setParams] = useState<any>({
        source: {
            onlineImgUrl: process.env.NODE_ENV === 'development' ? 'https://oc.superx.chat/img/1696924547155.png' : '',
            localImgUrl: process.env.NODE_ENV === 'development' ? 'https://oc.superx.chat/img/1701677670604.mp4' : '',
            imgType: imgType.local
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
        if (user.email && !localStorage.getItem('notifyEmail')) {
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

    //将秒数转换为时分秒
    const formatSeconds = (value: number) => {
        let secondTime = value;// 秒
        let minuteTime = 0;// 分
        let hourTime = 0;// 小时
        if (secondTime > 60) {//如果秒数大于60，将秒数转换成整数
            //获取分钟，除以60取整数，得到整数分钟
            minuteTime = Math.floor(secondTime / 60);
            //获取秒数，秒数取佘，得到整数秒数
            secondTime = Math.floor(secondTime % 60);
            //如果分钟大于60，将分钟转换成小时
            if (minuteTime > 60) {
                //获取小时，获取分钟除以60，得到整数小时
                hourTime = Math.floor(minuteTime / 60);
                //获取小时后取佘的分，获取分钟除以60取佘的分
                minuteTime = Math.floor(minuteTime % 60);
            }
        }
        let result = "" + Math.floor(secondTime) + "秒";
        if (minuteTime > 0) {
            result = "" + Math.floor(minuteTime) + "分" + result;
        }
        if (hourTime > 0) {
            result = "" + Math.floor(hourTime) + "小时" + result;
        }
        return result;
    }

    const doSubmit = async () => {
        const apiParams: any = {}
        apiParams.videoUrl = params.source.imgType === imgType.online ? params.source.onlineImgUrl : params.source.localImgUrl;
        apiParams.imgUrl = params.target.imgType === imgType.online ? params.target.onlineImgUrl : params.target.localImgUrl;
        if (!apiParams.videoUrl || !apiParams.imgUrl) {
            message.error('请添加原视频和人脸照片');
            return;
        }
        //校验点数
        if (user.point_count < needCost) {
            message.error('点数不足，请先购买点数。');
            return;
        }
        //必须添加邮箱
        if (!params.email) {
            message.warning('由于视频换脸所需时间较长，请先添加邮箱以接收通知结果。', 6);
            return;
        }
        //记录邮箱
        if (params.email) {
            //存入localsotrage , notifyEmail 为key
            localStorage.setItem('notifyEmail', params.email)
        }
        apiParams.email = params.email;

        setIsGenerating(true);

        //获取图片宽高
        console.log('提交参数：', apiParams);
        const res = await requestAliyunArt('video-face-swap', apiParams);
        const { data } = res;
        setIsGenerating(false);
        if (res.code !== 0) {
            message.error(res.message);
            setIsGenerating(false);
            return;
        } else {
            store.dispatch({ type: 'user/pointChange', payload: user.point_count - data.cost })

            notification.success({
                message: '提示',
                description: `提交成功，可关闭网页，等待邮箱通知。根据您的视频时长，预估所需时间为：${formatSeconds(videoInfo.duration * 30 * 1.5)}。`,
                duration: 0
            });
        }
    }

    //定义一个方法，从链接中获取url参数，并set到params中
    const setParamsFromUrl = () => {
        let imgUrl = getQueryString('url');
        if (imgUrl) {
            //decode一下
            imgUrl = decodeURIComponent(imgUrl);
            setParams({
                ...params,
                source: {
                    onlineImgUrl: imgUrl,
                    imgType: imgType.online
                }
            })
        };

        const notifyEmail = localStorage.getItem('notifyEmail');
        if (notifyEmail) {
            setParams({
                ...params,
                email: notifyEmail
            })
        }
    }

    const showFaceDemo = () => {
        const isHidden = localStorage.getItem('hideFaceVideoDemo');
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
        <div className="ai-qrcode-wrapper" style={{ marginTop: '50px', paddingTop: "0" }}>

            {/* 左侧区域 */}
            <div className="code-options-box">
                {/* 底图 */}
                <div className="face-box-wrap">
                    <div className="face-box-title">添加视频 {!showDemo && <a style={{ fontSize: "14px", fontWeight: "100" }} href="javascript:void(0)" onClick={() => {
                        setShowDemo(true);
                        localStorage.setItem('hideFaceVideoDemo', '');
                    }}>显示示例</a>}</div>
                    <div style={{ textAlign: "center", fontSize: "13px", margin: "5px" }}>（禁止涉政、涉黄、涉暴的换脸，一经发现立即封号）</div>
                    <div className="face-box">
                        {/* 是否在线图片 */}
                        {/* <div style={{ display: "flex", justifyContent: "center", marginBottom: "20px" }}>
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
                        </div> */}
                        {/* 在线图片输入框 */}
                        <div className="art-form-item">
                            {/* <div className="form-item-label">
                            <span className="input-label">底图</span>
                        </div> */}
                            {params.source.localImgUrl && <Input showCount maxLength={500} onChange={v => {
                                setParams({
                                    ...params,
                                    source: {
                                        ...params.source,
                                        [params.source.imgType === imgType.online ? 'onlineImgUrl' : 'localImgUrl']: v.target.value
                                    }
                                });
                            }} placeholder="请点击下方按钮上传视频" readOnly value={params.source.imgType === imgType.online ? params.source.onlineImgUrl : params.source.localImgUrl} />}
                        </div>

                        {/* 本地图片选择框 */}
                        {params.source.imgType === imgType.local && <div className="art-form-item">
                            <AliyunOSSUploader accept="video/*" maxSize={200 * 1024 * 1024} onChange={async fileList => {
                                console.log('fileList', fileList);
                                const videoUrl = fileList[0].url;
                                const { data } = await requestAliyunArt('get-video-info', { videoUrl });
                                setNeedCostText(`${data.cost}（视频时长：${data.duration} 秒，共需换脸 ${data.frames} 张图片）`);
                                setNeedCost(data.cost);
                                setVideoInfo(data);
                                setParams({
                                    ...params,
                                    source: {
                                        ...params.source,
                                        localImgUrl: fileList[0].url
                                    }
                                });
                            }} listType="picture-card" slot={<div>+ 上传视频</div>} />
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
                    点数：{needCostText}
                </div>
                <Button type="primary" loading={isGenerating} onClick={doSubmit} style={{ width: "100%", marginTop: "10px" }}>
                    提交任务
                </Button>
                <div style={{ marginTop: "20px", color: "#666", fontSize: "13px", lineHeight: "1.6", width: "100%" }}>
                    提示：
                    <ul>
                        <ol>1. 请确保上传的视频和图片包含人脸，否则将换脸失败</ol>
                        <ol>2. 只支持单个人物的换脸，如视频中出现多个人物，将无法预测换脸结果</ol>
                        <ol>3. 人脸照尽量选择清晰正脸照片，不要戴眼镜</ol>
                        <ol>4. 为保护用户隐私，服务器不对合成的视频进行保存，请生成后及时下载</ol>
                        <ol>5. 换脸需较长时间， 一般在 30 分钟-1 小时，根据时长不同有所不同。提交之后，可关闭网页，等待邮箱通知。</ol>
                    </ul>
                </div>
            </div>
            {/* 放大结果区域 */}
            {!qrCodeImage && showDemo && <div className="code-result">

                <div className="face-swap-demo-wrap">
                    <div className="face-swap-demo-title">
                        效果示例 <a style={{ fontWeight: '100', fontSize: "14px" }} href="javascript:void(0)" onClick={() => {
                            localStorage.setItem('hideFaceVideoDemo', 'true');
                            setShowDemo(false);
                        }}>隐藏示例</a>
                    </div>
                    <div className="img-title">原视频：</div>
                    <div className="img-box">
                        <video controls autoPlay src="//oc.superx.chat/face-video/10.mp4"></video>
                    </div>
                    <div className="img-title">人物照片：</div>
                    <div className="img-box">
                        <img src="//oc.superx.chat/face-video/video-face.png" alt="" />
                    </div>
                    <div className="img-title">换脸视频：</div>
                    <div className="img-box">
                        <video controls autoPlay src="//oc.superx.chat/face-video/video-out.mp4"></video>
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
