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
        </div>
    );
};

export default Guide;
