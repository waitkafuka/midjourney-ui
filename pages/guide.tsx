import React, { useState } from "react";
import { Input, Button, List, Image, Typography } from "antd";

const Guide: React.FC = () => {
    const [imgList] = useState<Array<any>>([{
        prompt: 'mdjrny-v4 style portrait of female elf, intricate, elegant, highly detailed, digital painting, artstation, concept art, smooth, sharp focus, illustration, art by artgerm and greg rutkowski and alphonse mucha, 8k.',
        image: 'https://cdn.superx.chat/stuff/elf2.png',
    }, {
        prompt: 'mdjrny-v4 style whimsical fantasy elegant rose floral botany maximalism with a wave of flowers garden flowing flowers floating in misty soft pink, aqua, soft apricot, smoke fractal, moody and big scale realistic flowers, octane render, by josephine wall art, isabelle menin, Jean, amy brown.',
        image: 'https://cdn.superx.chat/stuff/flowers.png',
    },
    {
        prompt: 'an asian woman poses for a portrait, in the style of luminous shadows, dark white and beige, onii kei , fluid photography, realistic yet romantic, smooth lines, angura kei',
        image: 'https://cdn.superx.chat/stuff/human.png',
    },]);

    return (
        <div className="markdown-body">
            <h2>示例</h2>
            {imgList.map(({ prompt, image }) => {
                return <div key={image}>
                    <blockquote>
                        <p dir="auto">{prompt}</p>
                    </blockquote>

                    <p dir="auto"><img alt="midjourney" src={image} /></p></div>
            })}
            <h2>指令解释</h2>
            图片生成之后，界面上有 V1-V4，U1-U4 8 个按钮。其中数字 1-4 指的是图片编号，第几张图片。  <br />
            V指的是：Variation，指针对这张图片进行变体；  <br />
            U指的是：Upscale，指针对这张图片放大和填充更多细节。当你挑出满意的图片之后可以使用 U 指令进行单张图片的细化；
            {/* <p>更多用法，请询问 ChatGPT</p> */}
            <h2>设置图片宽高比</h2>
            <p>--ar w:h	控制图片尺寸比例，w是宽，h是高，例--ar 16:9</p>

            <h2>其他参数</h2>
            <p>--V +数字范围值: 1-5,算法选择，最新v5, 图像的细节、构图上有了极大的提升</p>
            <p>--q +数字范围值: 1-5	默认1,更高质量，耗时翻倍2，更强更久3、4、5</p>
            <p>--hd 直接使用生成更高清图，但是会减少图片中的细节，适用于风景画、抽象画</p>
            <p>--upbeta 直接使用增加图片细节，生成质量更高，风格更奇特</p>
            <p>--test 直接使用和--upbeta类似， 介于艺术与写实之间，质量更高/风格奇特</p>
            <p>--tile 直接使用生成四方无缝贴图，暂不支持v4模式下使用</p>
            <p>--niji	直接使用生成动漫风格图像</p>
            <p>--seed + 数字	基于画作生成类似图。右键图像添加「信封」图标Seed值会DM中发送你</p>
            <p>--no +物品	出图将不包含该物品</p>
            <p>--creative	直接使用 创造(性)的，创作的:有创造力的，有想象力的</p>
            <p>--iw +数字范围值: 0.25-5	设置图片与参考图和描述文字的相似程度</p>
            <p>--Chaos +数字范围值: 0-100	生成四张风格迥异的图，数字越大，风格越不一致</p>
            <p>--s +数字范围值: 625- 60000.默认2500 生成个性化艺术，更有创造里、想象力图</p>
            {/* <p>更多用法，请询问 ChatGPT</p> */}
        </div>
    );
};

export default Guide;
