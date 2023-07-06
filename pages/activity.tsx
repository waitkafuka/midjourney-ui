import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm'
import 'github-markdown-css';

const cookbook = () => {

    const text = `
# 首届人工智能绘画大赛

## 一、活动主题
本次活动的主题为“人工智能绘画”，旨在通过人工智能技术，让计算机自动完成绘画创作，从而探索人工智能技术在艺术创作领域的应用。

## 二、活动规则
通过本站绘画生成的作品（不限使用 midjourney 还是 DALLE2），分享到公共区（[https://chat.youyi.asia/art/paintings/](../paintings/)），经网友点赞投票，每月选出点赞最多的前 10 名选手。

## 三、活动时间
每月1日至次月1日，每月1日公布上月活动结果。

## 四、活动奖励
每月1日统计上月获奖人员，1 日晚 8 点公布获奖名单。前 1-5 名选手，将获得 200 绘画点数奖励，前 6-10 名选手，将获得 100 绘画点数奖励。
每月选出冠军一名，额外赠送 ChatGPT 包月会员一份。


`
// ## 本站公众号
// [![](https://c.superx.chat/stuff/qrcode.jpg)](https://c.superx.chat/stuff/qrcode.jpg)
// ## 微信群
// ![](https://c.superx.chat/stuff/group.png)

    return (
        <div style={{ paddingLeft: "15px" }} className='markdown-body' >
            <style>
                {`.markdown-body img{
                    max-width: 300px;
                }`}
            </style>
            <ReactMarkdown children={text} remarkPlugins={[remarkGfm]} />
        </div >
    )
}

export default cookbook;