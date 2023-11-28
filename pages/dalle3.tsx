import { Button, Input, Modal, Select, Space, Spin, Tooltip, message } from 'antd';
import { useEffect, useState } from 'react';
import { QuestionCircleOutlined } from '@ant-design/icons';
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
import PaintingPoint from '../components/paintingPoint';
import { useSelector } from 'react-redux';
import store from '../store';

//'1024x1024', '1792x1024', '1024x1792'
const sizes = [{
    label: '1024x1024',
    value: '1024x1024'
}, {
    label: '1792x1024',
    value: '1792x1024'
}, {
    label: '1024x1792',
    value: '1024x1792'
}];
const styles = [{
    label: '自然',
    value: 'natural'
}, {
    label: '强烈',
    value: 'vivid'
},];
//'hd', 'standard'
const qualitys = [{
    label: '普通',
    value: 'standard'
}, {
    label: '高清',
    value: 'hd'
},];

//'dall-e-2', 'dall-e-3'
const models = [{
    label: 'DALL·E 3',
    value: 'dall-e-3'
}, {
    label: 'DALL·E 2',
    value: 'dall-e-2'
},];

const Dalle: React.FC = () => {
    const [text, setText] = useState<string>('')
    const [size, setSize] = useState<string>(sizes[0].value)
    const [style, setStyle] = useState<string>(styles[0].value)
    const [quality, setQuality] = useState<string>(qualitys[0].value)
    const [price, setPrice] = useState<number>(0)
    const [model, setModel] = useState<string>(models[0].value)
    const [isTranslating, setIsTranslating] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [imgList, setImgList] = useState<ImgCardModel[]>([])
    const [demoImgList, setDemoImgList] = useState<ImgCardModel[]>([])
    const user = useSelector((state: any) => state.user.info)


    //随机一个prompt
    const randomPrompt = () => {
        let text = prompts[Math.floor(Math.random() * prompts.length)]
        setText(text)
    }

    //开始生成1
    const doGenerationAuzre = async () => {
        let prompt = text;
        if (user.point_count < price) {
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
                result = await requestAliyun('trans', { content: prompt });

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
        //如果长度大于 10，移除开头的 10 个
        console.log(imgList.length);
        const paintInfo = await requestAliyunArt('dalle-painting', { caption: prompt, size, style, quality, model: 'dall-e-3' })
        if (paintInfo.code !== 0) {
            message.error(paintInfo.message);
            setIsGenerating(false);
            return;
        }
        const imgId = paintInfo.data.img_id;
        const id = paintInfo.data.id;
        //创建一个图片卡片
        const imgCardPlaceHolder: ImgCardModel = {
            id: id,
            img_url: null,
            prompt: prompt,
            create_time: new Date(),
            is_public: 0,
            thumb_up_count: 0,
            painting_type: PaintingType.DALLE,
        }

        setImgList([imgCardPlaceHolder])

        //轮询查询图片生成状态
        let result = {} as any;
        let count = 0;
        while (true) {
            result = await requestAliyunArt('dalle-painting-status', { imgId })
            // result = { code: 0, data: { "id": "5a1004ee-47c6-4c85-9b06-19f517cf5293", "result": { "caption": "a cat", "contentUrl": "https://dalleproduse.blob.core.windows.net/private/images/b82c1ffe-1b74-4567-8597-41623f825640/generated_00.png?se=2023-05-30T11%3A14%3A13Z\u0026sig=DM0GEWtG5%2F4rTkLgLcLZME9DeEPl%2FEriV1fLH6QuH8I%3D\u0026sp=r\u0026spr=https\u0026sr=b\u0026sv=2020-10-02", "contentUrlExpiresAt": "2023-05-30T11:14:13.164616544Z", "createdDateTime": "2023-05-29T11:14:07.886337581Z" }, "status": "Succeeded" } }
            //resutl.data: {"id":"5a1004ee-47c6-4c85-9b06-19f517cf5293","result":{"caption":"a cat","contentUrl":"https://dalleproduse.blob.core.windows.net/private/images/b82c1ffe-1b74-4567-8597-41623f825640/generated_00.png?se=2023-05-30T11%3A14%3A13Z&sig=DM0GEWtG5%2F4rTkLgLcLZME9DeEPl%2FEriV1fLH6QuH8I%3D&sp=r&spr=https&sr=b&sv=2020-10-02","contentUrlExpiresAt":"2023-05-30T11:14:13.164616544Z","createdDateTime":"2023-05-29T11:14:07.886337581Z"},"status":"Succeeded"}
            if (result.code !== 0) {
                message.error(result.message, 10);
                return;
            }
            if (result.data.status === 'Succeeded') {
                break;
            }
            if (result.data.status === 'Failed') {
                message.error('生成失败，点数已返还，请确保您的输入词不含色情、暴力等敏感词汇，并刷新重试。', 10);
                setIsGenerating(false);
                return;
            }
            if (count > 60) {
                message.error('生成超时，请稍后重试', 10);
                return;
            }
            count++;
            await new Promise((resolve) => {
                setTimeout(() => {
                    resolve(true);
                }, 1000);
            })
        }
        //创建一个图片对象
        setIsGenerating(false);
        const { data } = result;
        //这里替换的时候一定要不能带上/
        const img_url = data.result.contentUrl.replace('https://dalleproduse.blob.core.windows.net', '');
        const imgCard: ImgCardModel = {
            id: id,
            img_url: img_url,
            prompt: data.result.caption,
            create_time: new Date(),
            is_public: 0,
            thumb_up_count: 0,
            painting_type: PaintingType.DALLE,
        }
        //点数减少
        store.dispatch({ type: 'user/pointChange', payload: user.point_count - data.cost })
        // 显示图片
        setImgList(list => [imgCard])
    }

    //开始生成2
    const doGenerationOpenAi = async () => {
        let prompt = text;
        if (user.point_count < price) {
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
                result = await requestAliyun('trans', { content: prompt });

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
        //如果长度大于 10，移除开头的 10 个
        console.log(imgList.length);
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
        setImgList([imgCardPlaceHolder])
        const result = await requestAliyunArt('openai-dalle-painting', { caption: prompt, model, size, style, quality })
        if (result.code !== 0) {
            message.error(result.message);
            setIsGenerating(false);
            setImgList([])
            return;
        }
        console.log('生成结果', result);

        const id = result.data.id;

        setImgList([imgCardPlaceHolder])

        //创建一个图片对象
        setIsGenerating(false);
        const { data } = result;
        //这里替换的时候一定要不能带上/
        const img_url = data.img_url.replace('https://oaidalleapiprodscus.blob.core.windows.net', '');
        // let resParams = data.paint_params;
        let resPrompt = data.prompt;
        // if(resParams){
        //     resParams = JSON.parse(resParams);
        //     resPrompt = resParams.revised_prompt;
        // }
        const imgCard: ImgCardModel = {
            id: id,
            img_url: img_url,
            prompt: resPrompt,
            create_time: new Date(),
            is_public: 0,
            thumb_up_count: 0,
            painting_type: PaintingType.DALLE,
        }
        //点数减少
        store.dispatch({ type: 'user/pointChange', payload: user.point_count - data.cost })
        // 显示图片
        setImgList(list => [imgCard])
    }

    const buildDalleDemoImgs = () => {
        const imgSrcs = ['A synthwave style sunset above the reflecting water of the sea, digital art',
            'A hand drawn sketch of a Porsche 911',
            'High quality photo of a monkey astronaut',
            'A photo of Michelangelo\'s sculpture of David wearing headphones djing',
            'A photo of a white fur monster standing in a purple room',
            'An expressive oil painting of a basketball player dunking, depicted as an explosion of a nebula',
            'An armchair in the shape of an avocado',
            '3D render of a cute tropical fish in an aquarium on a dark blue background, digital art'];

        const imgBasePath = 'https://c.superx.chat/stuff/dalle'
        const imgCards: ImgCardModel[] = imgSrcs.map((src, index) => {
            return {
                id: index,
                img_url: `/${src}.webp`,
                prompt: src,
                create_time: new Date(),
                img_base_path: imgBasePath,
                is_public: 0,
                thumb_up_count: 0,
                painting_type: PaintingType.DALLE,
            }
        })
        setDemoImgList(imgCards);
    }

    async function calcPoints() {
        const { data } = await requestAliyunArt('calc-dalle-price', { model, size, quality });
        setPrice(data);
    }
    //当模型，尺寸，质量变化时，重新计算所需要消耗的点数
    useEffect(() => {
        calcPoints();
    }, [model, size, quality])
    //页面初始化
    useEffect(() => {
        buildDalleDemoImgs();
    }, [])
    return (
        <div style={{ padding: "20px", paddingTop: "0" }}>
            <Modal
                title="翻译中"
                style={{ top: 20 }}
                open={isTranslating}
                closable={false}
                cancelText=""
                okText=""
                footer={null}
            >
                <div><Spin />正在翻译为英文...</div>
            </Modal>

            <div>
                <div className='dalle-point-box'><PaintingPoint></PaintingPoint></div>
                {imgList.length === 0 && <p className="no-content-tips">DALL·E 3 相对于 DALL·E 2 版本大幅提升了出图质量，并可以自动优化提示词，出图质量同 midjourney 。</p>}
                {/* 结果展示区 */}
                <div className='painting-result-wrap'>
                    {
                        imgList.map(model => {
                            return <div style={{ margin: "15px" }} key={model.img_url}>
                                <PureImgCard imgBasePath={model.img_base_path} isLoading={true} showThumbImg={false} columnWidth={300} key={model.id} model={model} hasDelete={true} onImgDeleted={(id) => {
                                    console.log('imgid1:', id);
                                    setImgList(list => list.filter(item => item.id !== id));
                                }} />
                            </div>
                        })
                    }
                </div>
                <div className='dalle-input-box'>
                    <div style={{ color: "#777", fontSize: "13px" }}>
                        <Button size='small' onClick={randomPrompt}>随机一个prompt</Button>
                        <span className='ml10'>模型：</span>
                        <Select
                            value={model}
                            // style={{ width: 260, marginLeft: "10px" }}
                            onChange={v => {
                                setModel(v);
                            }}
                            options={models}
                        />
                        <span className='ml10'>质量：</span>
                        <Select
                            value={quality}
                            // style={{ width: 260, marginLeft: "10px" }}
                            onChange={v => {
                                setQuality(v);
                            }}
                            options={qualitys}
                        />
                        <span className='ml10'>尺寸：</span>
                        <Select
                            value={size}
                            // style={{ width: 260, marginLeft: "10px" }}
                            onChange={v => {
                                setSize(v);
                            }}
                            options={sizes}
                        />
                        <span className='ml10'>风格：</span>
                        <Select
                            value={style}
                            // style={{ width: 260, marginLeft: "10px" }}
                            onChange={v => {
                                setStyle(v);
                            }}
                            options={styles}
                        />
                        <Tooltip className='ml5' title="选择强烈，将生成超级现实或者梦幻的图片；选择自然，图片风格将更加自然。">
                            <QuestionCircleOutlined />
                        </Tooltip>
                    </div>
                    <div style={{ position: 'relative', marginTop: "0px" }}>
                        <div className="sd-point-cost">点数：{price}</div>
                        <Space.Compact style={{ width: '100%' }}>
                            <Input placeholder="请尽量详细描述你要生成的作品" onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    doGenerationOpenAi();
                                    e.preventDefault();
                                }
                            }}
                                value={text} onChange={(e) => {
                                    setText(e.target.value)
                                }} />
                            <Button type="primary" loading={isGenerating} onClick={doGenerationOpenAi}>开始生成</Button>
                        </Space.Compact>
                    </div>
                </div>
                {/* demo展示区 */}
                {/* <p>示例作品：</p> */}
                {/* {imgList.length === 0 &&
                    <div className='painting-result-wrap'>
                        {
                            demoImgList.map(model => {
                                return <div style={{ margin: "15px" }} key={model.img_url}>
                                    <PureImgCard imgBasePath={model.img_base_path} isLoading={true} showThumbImg={false} columnWidth={300} key={model.id} model={model} hasDelete={false} onImgDeleted={(id) => {
                                        console.log('imgid1:', id);
                                        setImgList(list => list.filter(item => item.id !== id));
                                    }} />
                                </div>
                            })
                        }
                    </div>
                } */}

            </div>
        </div >
    )
}

export default Dalle;