import React, { useState } from "react";
import { Input, Button, List, Image, Typography } from "antd";
import { SendOutlined } from "@ant-design/icons";
import { Imagine, Upscale, Variation } from "../request";
import { MJMessage } from "midjourney";
import { Message } from "../interfaces/message";
import Tag from "../components/tag";

const { TextArea } = Input;
const { Text } = Typography;

const Index: React.FC = () => {
    const [imgList] = useState<Array<any>>([{
        prompt: 'mdjrny-v4 style portrait of female elf, intricate, elegant, highly detailed, digital painting, artstation, concept art, smooth, sharp focus, illustration, art by artgerm and greg rutkowski and alphonse mucha, 8k.',
        image: 'https://cdn.superx.chat/stuff/elf2.png',
    }, {
        prompt: 'mdjrny-v4 style whimsical fantasy elegant rose floral botany maximalism with a wave of flowers garden flowing flowers floating in misty soft pink, aqua, soft apricot, smoke fractal, moody and big scale realistic flowers, octane render, by josephine wall art, isabelle menin, Jean, amy brown.',
        image: 'https://cdn.superx.chat/stuff/flowers.png',
    },]);

    return (
        <div className="markdown-body">
            <h2 dir="auto">示例</h2>
            {imgList.map(({ prompt, image }) => {
                return <>
                    <blockquote>
                        <p dir="auto">{prompt}</p>
                    </blockquote>

                    <p dir="auto"><img alt="midjourney" src={image} /></p></>
            })}
            {/* <p>更多用法，请询问 ChatGPT</p> */}
        </div>
    );
};

export default Index;
