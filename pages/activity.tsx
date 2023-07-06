import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm'
import 'github-markdown-css';

const Cookbook = () => {

    const text = `
# 首届人工智能绘画大赛

## 一、活动主题
本次活动的主题为“人工智能绘画”，旨在通过人工智能技术，让计算机自动完成绘画创作，从而探索人工智能技术在艺术创作领域的应用。

## 二、活动规则
通过本站绘画生成的作品（不限使用 midjourney 还是 DALLE2），分享到公共区（[https://chat.youyi.asia/art/paintings/](../paintings/)），经网友点赞投票，每月选出点赞最多的前 10 名选手。

## 三、活动时间
每月1日至次月1日，每月1日公布上月活动结果。

## 四、活动奖励
每月1日统计上月获奖人员，1 日晚 8 点公布获奖名单。 公示 3 日后，奖励发放。  
第一名获得 1000 点绘画点数奖励，ChatGPT 包月会员一个月；  
第二名获得 1000 点绘画点数奖励；  
第三名获得 800 点绘画点数奖励；  
第四名获得 600 点绘画点数奖励；  
第五~十名获得 500、400、300、200、100、100 点绘画点数奖励。

## 五、其他说明
1.同一用户不可重复获奖，前十名作品有同一用户，以该用户最高奖项为准
2.如点赞数相同，以作品先后顺序为准
3.最终解释权归https://superx.chat所有

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

export default Cookbook;