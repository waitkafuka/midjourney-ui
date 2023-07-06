import { Button, Input, Space, Tooltip, message, InputNumber, Select } from "antd";
import PaintingPoint from "../components/paintingPoint";
import { SendOutlined, StopOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { useEffect, useMemo, useState } from 'react';
import { hasChinese } from '../scripts/utils';
import { requestAliyun, requestAliyunArt } from '../request/http';
const prompts = ['a bowl of soup that is also a portal to another dimension, digital art',
    'a sunlit indoor lounge area with a pool with clear water and another pool with translucent pastel pink water, next to a big window, digital art',
    'synthwave sports car',
    'a stern-looking owl dressed as a librarian, digital art',
    'panda mad scientist mixing sparkling chemicals, digital art',
    '3D render of a small pink balloon dog in a light pink room',
    'an armchair in the shape of an avocado'
]
import PureImgCard from '../components/masonry/PureImgCard'
import { ImgCardModel, PaintingType, ImgPageType } from '../scripts/types';
import { PAINTING_POINTS_ONE_TIME, defaultImg, ossUploadedImgBaseURL } from '../scripts/config';
import { useSelector } from 'react-redux';
import store from '../store';
import AliyunOSSUploader from "../components/OssUploader";
import { Model } from '../interfaces/sd'

const SD: React.FC = () => {
    const sizeLimit = {
        //图片限制
        maxSize: 1048576,
        minSize: 262144,
    }
    const imgBasePath = 'https://och.superx.chat/'
    const [isGenerating, setIsGenerating] = useState(false);
    const user = useSelector((state: any) => state.user.info)
    const [isTranslating, setIsTranslating] = useState(false);
    const [fileList, setFileList] = useState<any[]>([]);
    const [imgList, setImgList] = useState<ImgCardModel[]>([])
    const [sdModels, setSdModels] = useState<Model[]>([])
    const [pointNeed, setPointNeed] = useState<number>(8)
    const [sdStyles, setSdStyles] = useState<any[]>([{
        name: '默认',
        styleValue: undefined,
    }, {
        name: '奇幻',
        styleValue: 'fantasy-art',
    }, {
        name: '摄影',
        styleValue: 'photographic',
    }, {
        name: '3D',
        styleValue: '3d-model',
    }, {
        name: '动画',
        styleValue: 'anime',
    }, {
        name: '电影',
        styleValue: 'cinematic',
    }, {
        name: '模拟胶片',
        key: 'analog-film',
        styleValue: 'analog-film',
    }, {
        name: '像素画',
        styleValue: 'pixel-art',
    },
    {
        name: '线描',
        styleValue: 'line-art',
    },
    {
        name: '折纸',
        styleValue: 'origami',
    },
    {
        name: '霓虹朋克',
        styleValue: 'neon-punk',
    },
    {
        name: '等距',
        styleValue: 'isometric',
    }, {
        name: '数字',
        styleValue: 'digital-art',
    },
        // {
        //     name: '漫画书',
        //     styleValue: 'comic-book',
        // },
        // {
        //     name: '增强',
        //     styleValue: 'enhance',
        // },
        // {
        //     name: '混合',
        //     styleValue: 'modeling-compound',
        // },
        // {
        //     name: '抽象',
        //     styleValue: 'low-poly',
        // },
    ])
    const [params, setParams] = useState<any>({
        //提示词
        text: '',
        //风格
        style_preset: undefined,
        //参考图权重
        image_strength: 0.5,
        //提示词权重
        cfg_scale: 7,
        //生成图片的数量
        samples: 1,
        //步数
        steps: 50,
        //图片宽度
        width: 512,
        //图片高度
        height: 512,
        //参考图链接
        image_url: '',
        //引擎 id
        engineId: 'stable-diffusion-512-v2-1'
    })

    const getImgSize = async (file: File) => {
        // 创建 FileReader 对象
        const reader = new FileReader();

        // 读取 File 对象
        reader.readAsDataURL(file);

        return new Promise((resolve, reject) => {
            // 当读取完成后
            reader.onload = function (event) {
                // 创建 Image 对象
                const img = new Image();
                // 设置 Image 对象的 src 属性
                img.src = event.target?.result as string;
                // 当 Image 对象加载完成后
                img.onload = function () {
                    // 获取宽高
                    const width = img.width;
                    const height = img.height;
                    console.log(`宽度：${width}，高度：${height}`);
                    resolve({ width, height })
                };
            };
        })
    }

    const queryModels = async () => {
        const data = await requestAliyunArt('sd-models', null, 'GET');
        setSdModels(data.data);
    }

    const recalculatePointNeed = async function () {
        const data = await requestAliyunArt('calculate-point', params);
        setPointNeed(data.point);
    }

    useEffect(() => {
        recalculatePointNeed();
    }, [params.width, params.height, params.steps, params.samples])

    //开始生成
    const doGeneration = async () => {
        console.log('doGeneration', params);

        if (isGenerating) {
            message.error('正在生成中，请勿重复发送')
            return;
        }
        if (user.point_count < pointNeed) {
            message.error('点数不足，请先充值');
            return;
        }
        if (!params.text) {
            message.error('请输入提示词');
            return;
        }
        //如果是768模型，图片最小尺寸相乘不能小于589824
        if (params.engineId.indexOf('768') > -1 && params.width * params.height < 589824) {
            message.error('768模型，图片宽高相乘不能小于589824，请增大图片尺寸');
            return;
        }
        const imgSize: any = fileList.length > 0 ? await getImgSize(fileList[0].originFileObj) : { width: params.width, height: params.height };
        params.actualWidth = imgSize.width;
        params.actualHeight = imgSize.height;
        //创建一个空的图片卡片
        let holder = new Array(params.samples);
        for (let i = 0; i < holder.length; i++) {
            const imgCardPlaceHolder: ImgCardModel = {
                id: Math.random(),
                img_url: null,
                prompt: params.text,
                create_time: new Date(),
                is_public: 0,
                thumb_up_count: 0,
                painting_type: PaintingType.DALLE,
                width: imgSize.width,
                height: imgSize.height,
            }
            holder[i] = (imgCardPlaceHolder);
        }

        setImgList([...holder, ...imgList])
        //判断点数是否足够
        // if (user.)
        // 判断是否有中文，如果有中文，翻译成英文
        if (hasChinese(params.text)) {
            // 调用api翻译为英文
            // message.info('midjourney无法支持中文提示词，正在为您翻译为英文...');
            setIsTranslating(true);
            let result = {} as any;
            try {
                result = await requestAliyun('translate', { content: params.text });
            } catch (error) {
                message.error('翻译出错，请稍后重试，请确保您的输入词中不包含政治、色情、暴力等词汇', 10);
                setIsTranslating(false);
                return;
            }
            if (result.code !== 0) {
                message.error(result.message, 10);
                setIsTranslating(false);
                return;
            }
            params.text = result.data;
            setIsTranslating(false);
            console.log('翻译结果', result);
            setParams({ ...params });
        }
        // 调用api生成图片
        setIsGenerating(true);

        const data = await requestAliyunArt('sd-painting', params)
        console.log('生成结果', data);
        if (data.code !== 0) {
            message.error(data.message, 30);
            setIsGenerating(false);
            return;
        }


        for (let i = 0; i < data.result.length; i++) {
            const model: ImgCardModel = {
                id: data.result[i].id,
                prompt: data.result[i].prompt,
                img_base_path: imgBasePath,
                create_time: data.result[i].createTime,
                painting_type: PaintingType.SD,
                is_public: data.result[i].is_public,
                thumb_up_count: 0,
                img_url: data.result[i].img_url,
                width: imgSize.width,
                height: imgSize.height,
            };
            imgList.unshift(model);
        }

        setImgList(imgList)
        //创建一个图片对象
        setIsGenerating(false);
        //点数减少
        store.dispatch({ type: 'user/pointChange', payload: user.point_count - data.point_cost })
    }

    //页面初始化
    useEffect(() => {
        queryModels();
    }, [])

    return <>
        <div className='dalle-point-box'><PaintingPoint></PaintingPoint></div>
        {/* 图片列表 */}
        <div className='painting-result-wrap sd-result'>
            {imgList.map((model, index) => {
                return <PureImgCard ratio={{ width: model.width || 0, height: (model.height || 0) }} imgBasePath={model.img_base_path} isLoading={true} showThumbImg={false} columnWidth={300} key={model.id} model={model} hasDelete={true} onImgDeleted={(id) => {
                    console.log('imgid1:', id);
                    setImgList(list => list.filter(item => item.id !== id));
                }} />
            })}
        </div>
        <div className='dalle-input-box'>
            {/* <div style={{ color: "#777", fontSize: "13px" }}>
                <Button size='small' >随机一个prompt</Button>
            </div> */}

            {/* 工具栏1 */}
            <div className="sd-params-set">
                {/* 上传图片 */}
                <Space.Compact size="middle">
                    <AliyunOSSUploader buttonText="+ 添加参考图" listType="picture-card" onChange={fileList => {
                        console.log('fileList:', fileList);
                        setFileList(fileList);
                        setParams({ ...params, image_url: fileList.length > 0 ? fileList[0].url : '' })
                    }}></AliyunOSSUploader>
                </Space.Compact>

                {/* 图片权重 */}
                {fileList.length > 0 && <> <Space.Compact size="middle">
                    <InputNumber max={1} min={0} step={0.1} style={{ width: "170px", borderRadius: 0 }} addonBefore={<>参考图权重：</>} value={params.image_strength} onChange={v => {
                        setParams({ ...params, image_strength: v })
                    }} />
                </Space.Compact> <Tooltip title="设置参考图的权重，0-1 之间。数值越大，同原图越相似。参考图模式下不支持设置图片宽高。">
                        <QuestionCircleOutlined />
                    </Tooltip>
                    <Space.Compact size="middle">
                        <InputNumber max={35} min={0} style={{ width: "160px", borderRadius: 0 }} addonBefore={<>提示词权重：</>} value={params.cfg_scale} onChange={v => {
                            setParams({ ...params, cfg_scale: v })
                        }} />
                    </Space.Compact> <Tooltip title="提示词权重，0-35 之间。越大生成的图片同提示词越相似。">
                        <QuestionCircleOutlined />
                    </Tooltip></>}
                {/* 选择比例 */}
                {fileList.length === 0 && <> <Space.Compact size="middle">
                    <InputNumber max={1024} min={128} readOnly={false} step={64} style={{ width: "160px", borderRadius: 0 }} className="rect-input" addonBefore={<>图片宽高：</>} value={params.width} onChange={v => {
                        setParams({ ...params, width: v })
                    }} />
                    <InputNumber max={1024} min={128} readOnly={false} step={64} value={params.height} onChange={v => {
                        setParams({ ...params, height: v })
                    }} style={{ width: "70px" }} />
                </Space.Compact>
                    <Tooltip title="设置生成图片的宽和高，数值是 64 的整数倍">
                        <QuestionCircleOutlined />
                    </Tooltip></>}
                {/* 图片数量 */}
                <Space.Compact size="middle">
                    <InputNumber max={20} min={1} style={{ width: "120px", borderRadius: 0 }} addonBefore={<>数量：</>} value={params.samples} onChange={v => {
                        setParams({ ...params, samples: v })
                    }} />
                </Space.Compact>
                <Tooltip title="一次生成图片的数量">
                    <QuestionCircleOutlined />
                </Tooltip>
                {/* 步数 */}
                <Space.Compact size="middle">
                    <InputNumber max={150} min={10} step={10} style={{ width: "130px", borderRadius: 0 }} addonBefore={<>步数：</>} value={params.steps} onChange={v => {
                        setParams({ ...params, steps: v })
                    }} />
                </Space.Compact>
                <Tooltip title="生成步数，越大图片越清晰。10-150 之间。">
                    <QuestionCircleOutlined />
                </Tooltip>
                <div style={{ marginLeft: "10px" }}>
                    选择模型：
                    <Select
                        value={params.engineId}
                        style={{ width: 260, marginLeft: "10px" }}
                        onChange={v => {
                            setParams({ ...params, engineId: v })
                        }}
                        options={sdModels.map(item => ({ value: item.id, label: item.name }))}
                    />
                </div>

            </div>
            {/* 选择风格 */}
            <div className="choose-style-line">
                {sdStyles.map((item, index) => {
                    return <div className={`choose-style-item ${params.style_preset === item.styleValue ? 'checked' : ''}`} onClick={() => {
                        setParams({ ...params, style_preset: item.styleValue })
                    }}>
                        <div className="style-img-box">
                            {item.styleValue ? <img src={`//c.superx.chat/stuff/sd-styles/${item.styleValue}.png`} /> : <StopOutlined />}
                        </div>
                        <div className="style-name">
                            {item.name} {item.checked}
                        </div>
                    </div>
                })
                }
            </div>
            {/* 工具栏 2 */}
            {/* <div className="sd-params-set sd-img-params-box">

            </div> */}

            <div style={{ marginTop: "0px", position: "relative" }}>
                {/* 消耗点数 */}
                <div className="sd-point-cost">
                    预计消耗点数：{pointNeed}点数
                </div>
                <Space.Compact style={{ width: '100%' }}>
                    <Input placeholder="请尽量详细描述你要生成的作品" onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            doGeneration();
                            e.preventDefault();
                        }
                    }}
                        value={params.text} onChange={(e) => {
                            setParams({ ...params, text: e.target.value })
                        }} />

                    <Button type="primary" icon={<SendOutlined className="send-prompt-btn" />} loading={isGenerating} onClick={doGeneration}></Button>
                </Space.Compact>
            </div>
        </div >
    </>
}

export default SD;
