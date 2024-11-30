import { useEffect, useMemo, useState } from "react";
import { ImgCardModel, PaintingType } from '../scripts/types'
import { getQueryString, hasChinese } from "../scripts/utils";
import { QuestionCircleOutlined } from '@ant-design/icons';
import { Button, Col, Form, Input, InputNumber, Row, Select, Slider, Tooltip, UploadFile, message } from "antd";
import jsQR from "jsqr";
import { qrTemplates, trainingModes } from "../scripts/config";
import PureImgCard from '../components/masonry/PureImgCard'
import PaintingPoint from "../components/paintingPoint";
import { requestAliyun, requestAliyunArtStream } from "../request/http";
import store from '../store';
import { useSelector } from 'react-redux';
import Head from 'next/head';
import { QRCODE_COST } from '../scripts/config'
import { Html5Qrcode } from "html5-qrcode";
import AliyunOSSUploader from "../components/OssUploader";

const TextArea = Input.TextArea;

const DigitalHuman: React.FC = () => {
    //表单参数
    const [showOptions, setShowOptions] = useState<boolean>(false); //是否显示更多选项
    const [qrCodeImage, setQrCodeImage] = useState<ImgCardModel>(); //模板
    const [useTemplate, setUseTemplate] = useState<boolean>(false); //是否使用模板
    const [isTranslating, setIsTranslating] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [ratio, setRatio] = useState<{ width: number, height: number }>({ width: 1, height: 1 }); //画布缩放比例
    const [qrImg, setQrImg] = useState<string>(''); //二维码图片
    const [showDemo, setShowDemo] = useState<boolean>(true); //是否显示示例
    const user = useSelector((state: any) => state.user.info)
    const [trainPrice, setTrainPrice] = useState<number>(0); //训练价格
    const [bd_vid, setBdVid] = useState<string>(''); //bd_vid

    const setBDVid = () => {
        //从链接中取出bd_vid参数
        // const url = new URL(window.location.href);
        const bd_vid = getQueryString('bd_vid');
        if (bd_vid) {
            localStorage.setItem('bd_vid', bd_vid);
        }
    }

    //初始化参数
    const [params, setParams] = useState<any>({
        trainingMode: trainingModes[0].value,
        trainingSource: '',
        email: ''
    });

    //trainingMode改变的时候，重新计算训练价格
    useEffect(() => {
        setTrainPrice(params.trainingMode === trainingModes[0].value ? 288 : params.trainingMode === trainingModes[1].value ? 238 : 128);
    }, [params.trainingMode])

    const doSubmit = async () => {
        if (!params.trainingSource) {
            message.error('请上传训练素材');
            return;
        }
        //如果选择的是视频训练模式，但是上传的素材是音频，则提示错误  
        if (params.trainingMode !== '2' && (params.trainingSource.includes('.mp3') || params.trainingSource.includes('.wav'))) {
            message.error('单音频无法训练形象，请上传视频，或在高级选项中选择“只训练声音”');
            return;
        }

        params.bd_vid = bd_vid;

        console.log('提交参数：', params);
        const result = await requestAliyun('startDigitalHumanTraining', params);
        console.log('result', result);
    };

    const parseUrlParams = () => {

    }

    const hideDemoHandler = () => {
        setShowDemo(false);
        localStorage.setItem('showDemo', 'false');
    };

    const showDemoHandler = () => {
        setShowDemo(true);
        localStorage.setItem('showDemo', 'true');
    };

    //页面初始化
    useEffect(() => {
        setBDVid();
        parseUrlParams();
        // Read showDemo preference from localStorage
        const storedShowDemo = localStorage.getItem('showDemo');
        if (storedShowDemo !== null) {
            setShowDemo(storedShowDemo === 'true');
        }
    }, [])

    function setSource(fileList: UploadFile<any>[]): void {
        setParams({
            ...params,
            trainingSource: fileList[0].url
        });
        console.log('setSource', fileList);
    }

    return <>
        <Head>
            <title>AI 数字人</title>
            <meta name="keywords" content="Midjourne、AI绘画,  人工智能绘画, Dalle 绘画, Stable Diffusion，AI换脸，AI图片放大，AI 二维码" />
            <meta name="description" content="AI绘画, Midjourney绘画, 人工智能绘画, Stable Diffusion。使用人工智能+描述词画出你想要绘制的图像。" />
            <meta
                name="viewport"
                content="width=device-width,minimum-scale=1.0,maximum-scale=1.0,user-scalable=no"
            />
        </Head>
        <div className='dalle-point-box'><PaintingPoint></PaintingPoint></div>

        <div className="ai-qrcode-wrapper" style={{ marginTop: '20px' }}>

            {/* 左侧区域 */}
            <div className="code-options-box">
                <div className="art-form-item">
                    <div className="form-item-label">
                        <span className="input-label">添加素材</span>
                        <Tooltip title="视频格式支持：mp4、mov，30秒-5分钟，90秒最佳，大小500M以下；音频格式支持mp3、wav，30秒-3分钟，推荐40秒左右，大小不超过10M，最好无杂音。">
                            <QuestionCircleOutlined />
                        </Tooltip>
                        {showDemo ? (
                            <a className="demo-toggle-button" href="javascript:void(0)" onClick={hideDemoHandler}>隐藏示例</a>
                        ) : (
                            <a className="demo-toggle-button" href="javascript:void(0)" onClick={showDemoHandler}>显示示例</a>
                        )}
                    </div>
                    <AliyunOSSUploader maxMP3Size={1024 * 1024 * 8} maxSize={1024 * 1024 * 500} accept=".mp4,.mov,.mp3,.wav" onChange={setSource} buttonText="上传训练素材" style={{ width: '100%', display: 'block' }}>

                    </AliyunOSSUploader>

                </div>
                {/* 更多选项 */}
                <div className="art-form-item">
                    <div className="form-item-label cp inline-block" onClick={() => {
                        setShowOptions(!showOptions);
                    }}>
                        <span className="input-label"><span className="more-options-icon">
                            <i className={`iconfont ${showOptions ? 'icon-shuangshangjiantou-' : 'icon-shuangxiajiantou-'}`}></i>
                        </span> 高级选项</span>
                    </div>
                </div>
                {/* 高级选项盒子 */}
                <div className="advance-options-box" style={{ display: showOptions ? 'block' : 'none' }}>
                    {/* 训练模式 */}
                    <div className="art-form-item horizontal">
                        <div className="form-item-label">
                            <span className="input-label">训练模式</span>
                            <Tooltip title="可指定单独训练形象或者音色，价格更低。适合不同场景需求。如选择只训练声音，将自动从视频中提取音频进行训练。">
                                <QuestionCircleOutlined />
                            </Tooltip>
                        </div>
                        <Select
                            value={params.trainingMode}
                            style={{ width: 180, marginLeft: "10px" }}
                            onChange={v => {
                                setParams({ ...params, trainingMode: v })
                            }}
                            options={trainingModes.map(item => ({
                                value: item.value, label: <div className="select-hover-options">
                                    {item.name}
                                    {/* <div className="select-hover-img">
                                <img src={item.preview_img} alt="" />
                            </div> */}
                                </div>
                            }))}
                        />
                    </div>
                </div>

                <div className="train-price">训练价格：{trainPrice}元</div>
                <Button type="primary" loading={isGenerating} onClick={doSubmit} style={{ width: "100%", marginTop: "10px" }}>
                    支付并训练
                </Button>
                <div className="form-tips-box">
                    <div className="form-tips-title">使用前须知</div>
                    <div className="form-tips-content">
                        <h3>格式要求：</h3>
                        <ul>
                            <li>视频：支持格式为 MP4 和 MOV，文件大小需在 500MB 以下。</li>
                            <li>音频：支持格式为 MP3 和 WAV，文件大小需在 10MB 以下。</li>
                        </ul>

                        <h3>时长要求：</h3>
                        <ul>
                            <li>视频：长度需在 30 秒至 5 分钟之间，推荐时长为 90 秒左右，且需包含清晰的人脸。</li>
                            <li>音频：长度需在 30 秒至 3 分钟之间，推荐时长为 40 秒左右。</li>
                        </ul>

                        <h3>分辨率建议：</h3>
                        <p>视频分辨率推荐为 1080x1280 或 4K。</p>

                        <h3>高级选项：</h3>
                        <p>点击"高级选项"可选择单独训练音色。</p>

                        <h3>费用说明：</h3>
                        <ul>
                            <li>音色单独训练：128元</li>
                            <li>形象单独训练：238元</li>
                            <li>正常训练（包含形象和音色）：288元</li>
                        </ul>

                        <h3>训练时间：</h3>
                        <p>训练过程大约需要 5 分钟，完成后将通过绑定的邮箱通知您。</p>

                        <h3>后续操作：</h3>
                        <p>训练完成后，您可以通过点击左侧菜单中的"我的 -> 我的数字人"，填写您要生成视频的台词，即可驱动数字人模型直接生成口播视频。</p>

                        <h3>生成费用：</h3>
                        <p>后续视频生成按生成时长计费，价格为 80 点数/分钟。</p>
                    </div>
                </div>

            </div>
            {/* 右侧区域 */}
            {showDemo && <div className="train-result-box">
                <>
                    <div className="train-demos-title">演示案例</div>
                    <div className="train-demos">
                        <div className="video-title">原视频</div>
                        <video src="https://oss.iiii.com/userTraining/1732519233599.mp4" controls></video>
                        <div className="video-title">数字人视频</div>
                        <video src="https://oss.iiii.com/userVideo/%E6%9C%AA%E5%91%BD%E5%90%8D-ace73cc9b01740a2815859e7c46dd07ccb04f5b1b14e4b31bf3a8bc74a286e86.mp4" controls></video>
                    </div>
                </>
            </div>}
        </div>
    </>
}

export default DigitalHuman;
