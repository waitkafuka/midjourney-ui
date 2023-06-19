import { Button, Input, Space, Tooltip, message, InputNumber } from "antd";
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

const SD: React.FC = () => {
    const imgBasePath = 'https://oss-cdn-h.superx.chat/'
    const [text, setText] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const user = useSelector((state: any) => state.user.info)
    const [isTranslating, setIsTranslating] = useState(false);
    const [fileList, setFileList] = useState<any[]>([]);
    const [imgList, setImgList] = useState<ImgCardModel[]>([])
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
    }, {
        name: '线描',
        styleValue: 'line-art',
    }, {
        name: '折纸',
        styleValue: 'origami',
    }, {
        name: '霓虹朋克',
        styleValue: 'neon-punk',
    }, {
        name: '等距',
        styleValue: 'isometric',
    }, {
        name: '数字',
        styleValue: 'digital-art',
    }, {
        name: '漫画书',
        styleValue: 'comic-book',
    }, {
        name: '增强',
        styleValue: 'enhance',
    }, {
        name: '混合',
        styleValue: 'modeling-compound',
    }, {
        name: '抽象',
        styleValue: 'low-poly',
    },])
    const [params, setParams] = useState<any>({
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
        //图片限制
        maxSize: 1048576,
        minSize: 262144,
    })

    const recalculatePointNeed = async function () {
        const data = await requestAliyunArt('calculate-point', params);
        setPointNeed(data.point);
    }

    useEffect(() => {
        recalculatePointNeed();
    }, [params.width, params.height, params.steps, params.samples])


    // const pointNeed = useMemo(() => {
    //     // const point = await requestAliyunArt('calculate-point', params);
    //     return 2;
    // }, [params])


    //开始生成
    const doGeneration = async () => {
        if (isGenerating) {
            message.error('正在生成中，请勿重复发送')
            return;
        }
        let prompt = text;
        if (user.point_count < PAINTING_POINTS_ONE_TIME) {
            message.error('点数不足，请先充值');
            return;
        }
        if (!prompt) {
            return;
        }
        //判断点数是否足够
        // if (user.)
        console.log(prompt)
        // 判断是否有中文，如果有中文，翻译成英文
        if (hasChinese(prompt)) {
            // 调用api翻译为英文
            // message.info('midjourney无法支持中文提示词，正在为您翻译为英文...');
            setIsTranslating(true);
            let result = {} as any;
            try {
                result = await requestAliyun('translate', { content: prompt });
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
            prompt = result.data;
            setIsTranslating(false);
            console.log('翻译结果', result);
            setText(prompt);
        }
        // 调用api生成图片
        setIsGenerating(true);
        //创建一个空的图片卡片
        const imgCardPlaceHolder: ImgCardModel = {
            id: Math.random(),
            img_url: null,
            prompt: prompt,
            create_time: new Date(),
            is_public: 0,
            thumb_up_count: 0,
            painting_type: PaintingType.DALLE,
        }
        setImgList([imgCardPlaceHolder, ...imgList])
        const data = await requestAliyunArt('sd-painting', { text: prompt })
        console.log('生成结果', data);
        if (data.code !== 0) {
            message.error(data.message, 30000);
            setIsGenerating(false);
            return;
        }

        const model: ImgCardModel = {
            id: data.result[0].id,
            prompt: data.result[0].prompt,
            img_base_path: imgBasePath,
            create_time: data.result[0].createTime,
            painting_type: PaintingType.SD,
            is_public: data.result[0].is_public,
            thumb_up_count: 0,
            img_url: data.result[0].img_url
        };
        setImgList(list => [model, ...list.slice(1)])
        //创建一个图片对象
        setIsGenerating(false);
        //点数减少
        store.dispatch({ type: 'user/pointChange', payload: user.point_count - data.point_cost })
    }

    return <>
        <div className='dalle-point-box'><PaintingPoint></PaintingPoint></div>
        {/* 图片列表 */}
        <div className='painting-result-wrap'>
            {imgList.map((model, index) => {
                return <PureImgCard imgBasePath={model.img_base_path} isLoading={true} showThumbImg={false} columnWidth={300} key={model.id} model={model} hasDelete={true} onImgDeleted={(id) => {
                    console.log('imgid1:', id);
                    setImgList(list => list.filter(item => item.id !== id));
                }} />
            })}
        </div>
        <div className='dalle-input-box'>
            {/* <div style={{ color: "#777", fontSize: "13px" }}>
                <Button size='small' >随机一个prompt</Button>
            </div> */}
            {/* 选择风格 */}
            <div className="choose-style-line">
                {sdStyles.map((item, index) => {
                    return <div className={`choose-style-item ${item.checked ? 'checked' : ''}`} onClick={() => {
                        setSdStyles(list => {
                            return list.map(item => {
                                item.checked = false;
                                return item;
                            })
                        })
                        setSdStyles(list => {
                            list[index].checked = true;
                            return list;
                        })
                    }}>
                        <div className="style-img-box">
                            {item.styleValue ? <img src={`//cdn.superx.chat/stuff/sd-styles/${item.styleValue}.png`} /> : <StopOutlined />}
                        </div>
                        <div className="style-name">
                            {item.name} {item.checked}
                        </div>
                    </div>
                })
                }
            </div>
            {/* 工具栏1 */}
            <div className="sd-params-set">

                {/* 图片权重 */}
                {fileList.length > 0 && <> <Space.Compact size="middle">
                    <InputNumber max={1} min={0} step={0.1} style={{ width: "170px", borderRadius: 0 }} addonBefore={<>参考图权重：</>} defaultValue={params.image_strength} />
                </Space.Compact> <Tooltip title="设置参考图的权重，0-1 之间。数值越大，同原图越相似。">
                        <QuestionCircleOutlined />
                    </Tooltip>
                    <Space.Compact size="middle">
                        <Input style={{ width: "150px", borderRadius: 0 }} addonBefore={<>提示词权重：</>} defaultValue={params.cfg_scale} />
                    </Space.Compact> <Tooltip title="提示词权重，0-35 之间。越大生成的图片同提示词越相似。">
                        <QuestionCircleOutlined />
                    </Tooltip></>}
                {/* 选择比例 */}
                {fileList.length === 0 && <> <Space.Compact size="middle">
                    <InputNumber max={1024} min={128} readOnly={false} step={64} style={{ width: "160px", borderRadius: 0 }} className="rect-input" addonBefore={<>图片宽高：</>} defaultValue={params.width} />
                    <InputNumber max={1024} min={128} readOnly={false} step={64} defaultValue={params.height} style={{ width: "70px" }} />
                </Space.Compact>
                    <Tooltip title="设置生成图片的宽和高，数值是 64 的整数倍">
                        <QuestionCircleOutlined />
                    </Tooltip></>}
                {/* 图片数量 */}
                <Space.Compact size="middle">
                    <InputNumber max={20} min={1} style={{ width: "120px", borderRadius: 0 }} addonBefore={<>数量：</>} defaultValue={params.samples} />
                </Space.Compact>
                <Tooltip title="一次生成图片的数量">
                    <QuestionCircleOutlined />
                </Tooltip>
                {/* 步数 */}
                <Space.Compact size="middle">
                    <InputNumber max={150} min={10} step={10} style={{ width: "130px", borderRadius: 0 }} addonBefore={<>步数：</>} defaultValue={params.steps} />
                </Space.Compact>
                <Tooltip title="生成步数，越大图片越清晰。10-150 之间。">
                    <QuestionCircleOutlined />
                </Tooltip>
            </div>
            {/* 工具栏 2 */}
            <div className="sd-params-set">
                {/* 上传图片 */}
                <Space.Compact size="middle">
                    <AliyunOSSUploader buttonText="添加参考图" onChange={fileList => {
                        console.log('fileList:', fileList);
                        setFileList(fileList);
                    }}></AliyunOSSUploader>
                </Space.Compact>
            </div>
            {/* 消耗点数 */}
            <div className="sd-point-cost">
                预计消耗点数：{pointNeed}点数
            </div>

            <div style={{ marginTop: "0px" }}>
                <Space.Compact style={{ width: '100%' }}>
                    <Input placeholder="请尽量详细描述你要生成的作品" onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            doGeneration();
                            e.preventDefault();
                        }
                    }}
                        value={text} onChange={(e) => {
                            setText(e.target.value)
                        }} />

                    <Button type="primary" icon={<SendOutlined className="send-prompt-btn" />} loading={isGenerating} onClick={doGeneration}></Button>
                </Space.Compact>
            </div>
        </div >
    </>
}

export default SD;
