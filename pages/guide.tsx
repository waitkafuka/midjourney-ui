import React, { useState } from "react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm'
import 'github-markdown-css';
import { Input, Button, List, Image, Typography } from "antd";
import Link from "next/link";
const imgList = [{
    prompt: 'A beautiful and serene landscape painting of a traditional Chinese peach forest with Towards dusk, there was a Chinese courtyard in the hill. It was snowing heavily. Several people were baking stoves and drinking in the room. by Caspar David Friedrich and Zhang daqian, --ar 3:4 --v 5.1',
    image: 'https://och.superx.chat/attachments/1100632439031877675/1111205415699611768/waitkafuka_A_beautiful_and_serene_landscape_painting_of_a_tradi_defa1111-e9c7-44b0-a08b-1e50e7778025.png?width=1000&height=1332',
}, {
    prompt: '`<https://s.mj.run/T-TaZHZk-yo>`, full body front photo, figure, one piece,ultra high definiton, 8k , --niji 5 --style expressive --s 400 --ar 3:5',
    image: 'https://och.superx.chat/attachments/1100632439031877675/1110928624300871750/waitkafuka_full_body_front_photo_figure_one_pieceultra_high_def_27cb7785-4e27-49a2-8657-18b029b4cafb.png?width=1000&height=1666',
},
{
    prompt: 'an asian woman poses for a portrait, in the style of luminous shadows, dark white and beige, onii kei , fluid photography, realistic yet romantic, smooth lines, angura kei',
    image: 'https://c.superx.chat/stuff/human.png',
},];
const text = `
## 介绍
midjourney 是一款当今较为领先的一款人工智能绘画程序。输入你想要绘制的内容提示词，midjourney将为你绘制出来指定的图片。
## 示例
${imgList.map(({ prompt, image }) => {
    return `> ${prompt}  

[![](${image})](${image}) 

    `
}).join('\n')}
更多示例，请参考：[艺术公园](../paintings)

## U 和 V 指令解释  
图片生成之后，界面上有 V1-V4，U1-U4 8 个按钮。其中数字 1-4 指的是图片编号，第几张图片。  
V指的是：Variation，指针对这张图片进行变体。    
U指的是：Upscale，指针对这张图片放大和填充更多细节。当你挑出满意的图片之后可以使用 U 指令进行单张图片的细化。  
## 设置图片宽高比  
--ar w:h	控制图片尺寸比例，w是宽，h是高，例--ar 16:9
## 其他参数
`
const Guide: React.FC = () => {
    return (
        <div style={{ paddingLeft: "15px" }} className='markdown-body'>
            <style>
                {`.markdown-body img{
                    max-width: 600px;
                    width: 100%;
                }`}
            </style>
            <h1>midjourney入门指引</h1>

            <h3>强烈建议你在开始之前，先看一下这篇教程：<a href="https://mp.weixin.qq.com/s/I0342FeExlgyCBWWfckpBw" target="_blank">Midjourney简要使用指南</a></h3>
            <h3>如果你想设计 logo，请看这一篇：<a href="https://learningprompt.wiki/docs/midjourney/mj-tutorial-text-prompt/scenario-2-brands-logo" target="_blank">Midjourney 设计品牌 Logo</a></h3>
            <h3>如果你想设计插画，请看这一篇：<a href="https://learningprompt.wiki/docs/midjourney/mj-tutorial-text-prompt/scenario-4-illustrations" target="_blank">Midjourney 制作插画</a></h3>

            <ReactMarkdown children={text} remarkPlugins={[remarkGfm]} />
            其他更多参数请参考：<Link href="/cookbook/">风格大全</Link> <br />
            关于更详细的学习教程，请点击：<a href="https://learningprompt.wiki/docs/midjourney-learning-path" target='_blank'>这里</a>
        </div >
    );
};

export default Guide;
