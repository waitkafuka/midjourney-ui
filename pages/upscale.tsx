import { useEffect, useMemo, useState } from "react";
import { ImgCardModel, ImgPageType, PaintingType } from '../scripts/types'
import { getQueryString, hasChinese } from "../scripts/utils";
import { SendOutlined, StopOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { Button, Col, Form, Input, InputNumber, Radio, Row, Select, Slider, Tooltip, message, notification } from "antd";
import jsQR from "jsqr";
import { qrTemplates, qrModels, qrVersions } from "../scripts/config";
import PaintingPoint from "../components/paintingPoint";
import { requestAliyun, requestAliyunArt, requestAliyunArtStream } from "../request/http";
import store from '../store';
import { useSelector } from 'react-redux';
import Head from 'next/head';
import { QRCODE_COST } from '../scripts/config'
import { Html5Qrcode } from "html5-qrcode";
import AliyunOSSUploader from '../components/OssUploader';
import PureImgCard from "../components/masonry/PureImgCard";

const TextArea = Input.TextArea;

const Upscale: React.FC = () => {
    //初始化参数
    const user = useSelector((state: any) => state.user.info)
    const [params, setParams] = useState<any>({
        scale_num: 2,
        onlineImgUrl: '',
        localImgUrl: '',
        email: ''
    }); //表单参数
    const [imgType, setImgType] = useState('online');
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
    //放大倍数有 2 倍 4 倍 8 倍
    const resizeOptions = [{
        label: '2 倍',
        value: 2,
    }, {
        label: '4 倍',
        value: 4,
    }, {
        label: '6 倍',
        value: 6,
    }, {
        label: '8 倍',
        value: 8,
    }]

    //点数消耗算法：params.scale_num * 10 + 10
    const pointCost = useMemo(() => {
        return params.scale_num * params.scale_num * 5 + 10;
    }, [params.scale_num]);

    const [showOptions, setShowOptions] = useState<boolean>(false); //是否显示更多选项
    const [qrCodeImage, setQrCodeImage] = useState<ImgCardModel>(); //模板
    const [useTemplate, setUseTemplate] = useState<boolean>(false); //是否使用模板
    const [isTranslating, setIsTranslating] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [ratio, setRatio] = useState<{ width: number, height: number }>({ width: 1, height: 1 }); //画布缩放比例
    const [qrImg, setQrImg] = useState<string>(''); //二维码图片
    const [showDemo, setShowDemo] = useState<boolean>(true); //是否显示示例



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
        params.img_url = imgType === 'online' ? params.onlineImgUrl : params.localImgUrl;
        if (!params.img_url) {
            message.error('请输入URL链接');
            return;
        }
        //校验点数
        if (user.point_count < pointCost) {
            message.error('点数不足，请先购买点数。');
            return;
        }
        //放大倍数是 4 倍以上的时候，必须输入邮箱
        if (params.scale_num >= 4 && !params.email) {
            message.error('请输入邮箱，以便接收放大后的图片。');
            return;
        }

        //记录邮箱
        if (params.email) {
            //存入localsotrage , notifyEmail 为key
            localStorage.setItem('notifyEmail', params.email)
        }

        setIsGenerating(true);

        //获取图片宽高
        const { imgData } = await getImageData(params.img_url);
        //当图片宽度乘以高度，再乘以（放大倍数的平方），大于 8096*8096 的时候，提示图片过大
        let pixieAfter = imgData.width * imgData.height * params.scale_num * params.scale_num;

        const errorMsg = `图片过大，放大后的像素数（计算公式：宽度x高度x放大倍数²）：${pixieAfter.toLocaleString()}，超过最大像素数：${(8096 * 8096).toLocaleString()}！请缩小图片尺寸，或减小放大倍数。`;
        if (pixieAfter > (8096 * 8096)) {
            // notification.error({
            //     message: '提示',
            //     description: errorMsg,
            //     duration: 0,
            //   });
            message.error(errorMsg, 15);
            setIsGenerating(false);
            return;
        }
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

        setQrCodeImage({ ...newQrcodeImage, img_base_path: 'https://oc.superx.chat/' });
        let res = null;
        try {
            console.log('提交参数：', params);
            res = await requestAliyunArt('image-upscale', params);
        } catch (error: any) {
            //error.message转为小写
            if (error.message.toLowerCase().includes('time')) {
                const tips = '由于图片较大，接口响应超时，后台任务仍在运算中，可直接关闭页面。稍后结果将发送至邮箱，预计 10 分钟左右。若生成失败不会扣减点数。';
                notification.success({
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
        const data = res.data;
        if (res.code !== 0) {
            //这里取的是sd返回的message
            message.error(res.data.message);
            setIsGenerating(false);
            setQrCodeImage(undefined);
            return;
        }
        setIsGenerating(false);
        setQrCodeImage({ ...newQrcodeImage, img_base_path: 'https://oc.superx.chat/', img_url: data.ossPath, id: data.id, width: data.width, height: data.height });
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
            onlineImgUrl: imgUrl
        })
    }


    //页面初始化
    useEffect(() => {
        const notifyEmail = localStorage.getItem('notifyEmail');
        if (notifyEmail) {
            setParams({
                ...params,
                email: notifyEmail
            })
        }
        setParamsFromUrl();
    }, [])

    return <><Head>
        <meta name="description" content="这是我的页面描述" />
        <meta name="referrer" content="no-referrer" />
    </Head >
        <div className='dalle-point-box'><PaintingPoint></PaintingPoint></div>
        <div className="ai-qrcode-wrapper" style={{ marginTop: '50px' }}>

            {/* 左侧区域 */}
            <div className="code-options-box">
                <div style={{ display: "flex", justifyContent: "center", marginBottom: "20px" }}>
                    <Radio.Group
                        options={options}
                        onChange={v => {
                            setImgType(v.target.value);
                        }}
                        value={imgType}
                        optionType="button"
                        buttonStyle="solid"
                    />
                </div>
                {/* 在线图片 */}
                <div className="art-form-item">
                    <div className="form-item-label">
                        <span className="input-label">图片地址</span>
                    </div>
                    <Input showCount maxLength={500} onChange={v => {
                        setParams({
                            ...params,
                            [imgType === 'online' ? 'onlineImgUrl' : 'localImgUrl']: v.target.value
                        });
                    }} placeholder="在线图片链接" value={imgType === 'online' ? params.onlineImgUrl : params.localImgUrl} />
                </div>
                {/* 本地图片 */}
                {imgType === 'local' && <div className="art-form-item">
                    <AliyunOSSUploader onChange={fileList => {
                        console.log('fileList', fileList);
                        setParams({
                            ...params,
                            localImgUrl: fileList[0].url
                        });
                    }} listType="picture-card" slot={<div>+ 上传图片</div>} />
                </div>}
                {/* 放大倍数，滑动条 */}
                <div className="art-form-item" style={{ display: "none" }}>
                    <div className="form-item-label">
                        <span className="input-label">放大倍数</span>
                        <Tooltip title="数值越大，二维码越明显，越容易扫描；数值越小，艺术图片越明显，越好看。如果您生成的二维码无法扫描，请尝试提高此参数。">
                            <QuestionCircleOutlined />
                        </Tooltip>
                    </div>
                    <Row className="form-item-value-row">
                        <Col span={16}>
                            <Slider
                                min={2}
                                max={8}
                                onChange={v => {
                                    setParams({
                                        ...params,
                                        scale_num: v
                                    })
                                }}
                                value={typeof params.scale_num === 'number' ? params.scale_num : 0}
                                step={2}
                            />
                        </Col>
                        <Col span={1}></Col>

                        <Col span={7}>
                            <InputNumber
                                min={2}
                                max={8}
                                style={{ width: "100%" }}
                                step={2}
                                value={params.scale_num}
                                onChange={v => {
                                    setParams({
                                        ...params,
                                        scale_num: v
                                    })
                                }}
                            />
                        </Col>
                    </Row>
                </div>
                {/* 放大倍数，radio */}
                <div className="art-form-item" style={{ display: "block" }}>
                    <div className="form-item-label">
                        <span className="input-label">放大倍数</span>
                        <Tooltip title="图片越大，消耗算力越多，速度越慢。需要更多点数，所需点数在下方显示。">
                            <QuestionCircleOutlined />
                        </Tooltip>
                    </div>
                    <Col span={24}>
                        <Radio.Group
                            options={resizeOptions}
                            onChange={v => {
                                setParams({
                                    ...params,
                                    scale_num: v.target.value
                                })
                            }}
                            value={params.scale_num}
                            optionType="button"
                            buttonStyle="solid"
                        />
                    </Col>
                </div>
                {/* 通知邮箱 */}
                <div className="art-form-item" style={{ display: "block" }}>
                    <div className="form-item-label">
                        <span className="input-label">通知邮箱</span>
                        <Tooltip title="如果生成时间过长，可添加邮箱，待放大完成后会将新图片发送至邮箱。">
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
                {/* 更多选项 */}
                <div className="art-form-item" style={{ display: "none" }}>
                    <div className="form-item-label cp inline-block" onClick={() => {
                        setShowOptions(!showOptions);
                    }}>
                        <span className="input-label"><span className="more-options-icon">
                            <i className={`iconfont ${showOptions ? 'icon-shuangshangjiantou-' : 'icon-shuangxiajiantou-'}`}></i>
                        </span> 高级选项</span>
                    </div>
                </div>
                {/* 高级选项盒子 */}
                <div className="advance-options-box" style={{ display: showOptions && false ? 'block' : 'none' }}>
                    {/* 二维码强度 */}
                    <div className="art-form-item horizontal">
                        <div className="form-item-label">
                            <span className="input-label">二维码强度</span>
                            <Tooltip title="数值越大，二维码越明显，越容易扫描；数值越小，艺术图片越明显，越好看。如果您生成的二维码无法扫描，请尝试提高此参数。">
                                <QuestionCircleOutlined />
                            </Tooltip>
                        </div>
                        <Row className="form-item-value-row">
                            <Col span={16}>
                                <Slider
                                    min={0}
                                    max={1}
                                    onChange={v => {
                                        setParams({
                                            ...params,
                                            iw: v
                                        })
                                    }}
                                    value={typeof params.iw === 'number' ? params.iw : 0}
                                    step={0.01}
                                />
                            </Col>
                            <Col span={1}></Col>

                            <Col span={7}>
                                <InputNumber
                                    min={0}
                                    max={1}
                                    style={{ width: "100%" }}
                                    step={0.01}
                                    value={params.iw}
                                    onChange={v => {
                                        setParams({
                                            ...params,
                                            iw: v
                                        })
                                    }}
                                />
                            </Col>
                        </Row>
                    </div>
                    {/* 模型选择 */}
                    <div className="art-form-item horizontal">
                        <div className="form-item-label">
                            <span className="input-label">选择风格</span>
                            <Tooltip title="选择不同的模型，生成的艺术图片会有所不同。">
                                <QuestionCircleOutlined />
                            </Tooltip>

                        </div>
                        <Select
                            disabled={params.template_id}
                            value={params.model}
                            style={{ width: 180, marginLeft: "10px" }}
                            onChange={v => {
                                setParams({ ...params, model: v })
                            }}
                            options={qrModels.map(item => ({
                                value: item.value, label: <div className="select-hover-options">
                                    {item.name}
                                    {/* <div className="select-hover-img">
                                <img src={item.preview_img} alt="" />
                            </div> */}
                                </div>
                            }))}
                        />
                    </div>
                    {/* 模板选择 */}
                    <div className="art-form-item horizontal">
                        <div className="form-item-label">
                            <span className="input-label">选择模板</span>
                            <Tooltip title="选择模板的情况下，将直接使用系统图片模板进行二维码融合，而不会使用提示词、负面提示词和风格选择。">
                                <QuestionCircleOutlined />
                            </Tooltip>

                        </div>
                        <Select
                            value={params.template_id}
                            style={{ width: 180, marginLeft: "10px" }}
                            onChange={v => {
                                setParams({ ...params, template_id: v })
                            }}
                            options={qrTemplates.map(item => ({ value: item.id, label: item.name }))}
                        />
                    </div>
                    {/* 版本选择 */}
                    {/* <div className="art-form-item horizontal" style={{ display: "flex" }}>
                        <div className="form-item-label">
                            <span className="input-label">版本</span>
                            <Tooltip title="越高版本效果越好。">
                                <QuestionCircleOutlined />
                            </Tooltip>

                        </div>
                        <Select
                            value={params.v}
                            style={{ width: 180, marginLeft: "10px" }}
                            onChange={v => {
                                setParams({ ...params, v })
                            }}
                            options={qrVersions.map(item => ({ value: item.value, label: item.name }))}
                        />
                    </div> */}
                    {/* 负面提示词 */}
                    {/* <div className="art-form-item">
                    <div className="form-item-label">
                        <span className="input-label">负面提示词</span>
                        <Tooltip title="负面提示词，将从画面中排除。">
                            <QuestionCircleOutlined />
                        </Tooltip>

                    </div>
                    <Input showCount maxLength={200} disabled={params.template_id} onChange={v => {
                        setParams({
                            ...params,
                            negative_prompt: v.target.value
                        });
                    }} placeholder="你不想要出现的内容" value={params.negative_prompt} />
                </div> */}
                </div>
                <div>
                    消耗点数：{pointCost}
                </div>
                <Button type="primary" loading={isGenerating} onClick={doSubmit} style={{ width: "100%", marginTop: "10px" }}>
                    确定
                </Button>
                <div style={{ marginTop: "20px", color: "#666", fontSize: "13px", lineHeight: "1.6", width: "100%" }}>
                    提示：
                    <ul>
                        <ol>1. 以 1024 x 1024图片为例：</ol>
                        <ol style={{ paddingLeft: "10px" }}> 1.1 2 倍图大约需要 10-20 秒，体积4M 左右</ol>
                        <ol style={{ paddingLeft: "10px" }}> 1.2 4 倍图大约需要 20-30 秒，体积15M 左右</ol>
                        <ol style={{ paddingLeft: "10px" }}> 1.3 8 倍图大约需要 1-3 分钟，体积50M 左右</ol>
                        {/* <ol>4. 以上数据以 1024x 1024为基准</ol> */}
                        <ol>2. 可用于老照片修复等场景</ol>
                        <ol>3. 出于隐私考虑，服务器不对生成的图片进行保存，请在生成之后及时下载，或从邮箱下载</ol>
                        <ol>4. 图片过大时，如提示放大超时，可直接关闭页面，后台完成后会将结果发送到邮箱。请不要重复提交。</ol>
                    </ul>
                </div>
            </div>
            {/* 放大结果区域 */}
            {qrCodeImage && <div className="code-result">
                <div style={{ display: "flex", justifyContent: "center", flexDirection: 'column', alignItems: 'center' }}>
                    {qrCodeImage && <PureImgCard
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
                        hasDelete={true} />}
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

export default Upscale;
