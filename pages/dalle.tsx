import { Button, Input, Modal, Select, Space, Spin, message } from 'antd';
import { useState } from 'react';
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
import ImgCard from '../components/masonry/imgCard'

const Dalle: React.FC = () => {
    const [text, setText] = useState<string>('')
    const [isTranslating, setIsTranslating] = useState(false);
    const [imgList, setImgList] = useState<string[]>([])

    //随机一个prompt
    const randomPrompt = () => {
        let text = prompts[Math.floor(Math.random() * prompts.length)]
        setText(text)
    }

    //开始生成
    const doGeneration = async () => {
        let prompt = text;
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
        const { id } = await requestAliyunArt('dalle-painting', { caption: prompt })
        //轮询查询图片生成状态
        let result = {} as any;
        let count = 0;
        while (true) {
            // {"id":"5a1004ee-47c6-4c85-9b06-19f517cf5293","result":{"caption":"a cat","contentUrl":"https://dalleproduse.blob.core.windows.net/private/images/b82c1ffe-1b74-4567-8597-41623f825640/generated_00.png?se=2023-05-30T11%3A14%3A13Z\u0026sig=DM0GEWtG5%2F4rTkLgLcLZME9DeEPl%2FEriV1fLH6QuH8I%3D\u0026sp=r\u0026spr=https\u0026sr=b\u0026sv=2020-10-02","contentUrlExpiresAt":"2023-05-30T11:14:13.164616544Z","createdDateTime":"2023-05-29T11:14:07.886337581Z"},"status":"Succeeded"}
            result = await requestAliyunArt('dalle-painting-status', { id })
            if (result.code !== 0) {
                message.error(result.message, 10);
                return;
            }
            if (result.data.status === 'Succeeded') {
                break;
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
        // 显示图片
        setImgList(list => [...list, result.data.result.contentUrl])
    }
    return (
        <div style={{ padding: "20px" }}>
            <Modal
                title="翻译中"
                style={{ top: 20 }}
                open={isTranslating}
                closable={false}
                cancelText=""
                okText=""
                footer={null}
            >
                <div><Spin />正在为您翻译为英文...</div>
            </Modal>
            <div>
                <div style={{ color: "#777", fontSize: "13px" }}>
                    从一个详细的描述开始 <Button size='small' onClick={randomPrompt}>随机一个prompt</Button>
                </div>
                <div style={{ marginTop: "20px" }}>
                    <Space.Compact style={{ width: '100%' }}>
                        <Input placeholder="请详细描述您要绘画的作品" value={text} onChange={(e) => {
                            setText(e.target.value)
                        }} />
                        <Button type="primary" onClick={doGeneration}>开始生成</Button>
                    </Space.Compact>
                </div>
                {imgList.map((item, index) => {
                    return (
                        <img key={index} src={item} />
                    )
                })}
            </div>
        </div >
    )
}

export default Dalle;