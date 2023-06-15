import { Button, Input, Space, message } from "antd";
import PaintingPoint from "../components/paintingPoint";
import { SendOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';
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
import { PAINTING_POINTS_ONE_TIME, defaultImg } from '../scripts/config';
import { useSelector } from 'react-redux';
import store from '../store';

const SD: React.FC = () => {
    const [text, setText] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const user = useSelector((state: any) => state.user.info)
    const [isTranslating, setIsTranslating] = useState(false);
    const [imgList, setImgList] = useState<string[]>([])

    //开始生成
    const doGeneration = async () => {
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

        const { data } = await requestAliyunArt('sd-painting', { text: prompt })

        setImgList([data.result.artifacts[0].fileName])

        //创建一个图片对象
        setIsGenerating(false);

        //点数减少
        store.dispatch({ type: 'user/pointChange', payload: user.point_count - data.point_cost })
    }

    return <>
        <div className='dalle-point-box'><PaintingPoint></PaintingPoint></div>
        <div className='dalle-input-box'>
            <div style={{ color: "#777", fontSize: "13px" }}>
                <Button size='small' >随机一个prompt</Button>
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
        </div>
    </>
}

export default SD;
