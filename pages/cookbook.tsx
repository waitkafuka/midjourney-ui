import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm'
import 'github-markdown-css';

const text = `
# midjourney参数和风格大全
## 参数
| 参数 | 说明 |
| --- | --- |
| --ar n:m | 图片尺寸宽:高（Aspect Ratios），例如：--ar 16:9|
| --chaos 0-100 | 变异程度，默认 0。数字越大，图片生成的想象力越大，例如：--chaos 50|
| --iw 0-2 | 参考图权重，值越大，参考图的权重越大，默认 1。例如：--iw 1.25（仅在v5或者niji5模型下有效）|
| --no 元素 | 排除某些元素，例如：--no plants，生成图中将不包含plants |
| --q <.25、.5、1> | 指定生成图的质量，默认 1。例如：--q .5（仅在v4、5，niji5下有效） |
|--style raw |减少 midjourney 的艺术加工，生成更摄影化的图片。例如：--style raw（只在v5.1下有效） |
|--style <cute, expressive, original, or scenic>|设置动漫风格：可爱、表现力、原始、或者风景。例如：--style cute（只在--niji 5下有效）|
|--s（或--stylize） 数字|设置midjourney的艺术加工权重，默认 100。例如：--s 100。取值范围： 0-1000（v4、v5），626-60000（v3），niji模式下无效| 
|--niji|模型设置。设置为日本动漫风格模型，例如：--niji，也可以写成：--niji 5（目前 5 可以省略）|
| --v <1-5> | 模型设置。设置模型版本，例如：--v 5|

## 渲染风格类型
| 渲染风格类型 | 英文名称 |
| --- | --- |
| 虚幻引擎 | Unreal Engine |
| OC渲染 | Octane Render |
| 渲染 | Maxon Cinema 4D |
| 建筑渲染 | Architectural Visualisation |
| 室内渲染 | Corona Render |
| 真实感渲染 | Quixel Megascans Render |
| V射线 | V-Ray |

## 媒介类型
| 媒介类型 | 英文名称 |
| --- | --- |
| 插画 | Illustration | 
| 向量图 | Vector | 
| 油画 | Oil painting | 
| 摄影 | Photography | 
| 水彩 | Watercolor | 
| 素描 | Sketch | 
| 雕塑 | Ink painting | 
| 水墨画 | Sculpture | 
| 印刷版画 | Blockprint | 
| 利诺剪裁 | Lino cut | 
| 手稿 | Manuscript | 
| 16位图 | 16 Bit | 
| 8位图 | 8 Bit | 
| 3D打印 | 3D Printed | 
| 丙烯画 | Acrylic Painting | 
| 相纸打印 | Albument Print | 
| 粉彩石膏雕塑 | Chalkware | 
| 彩铅素描 | Color pencil sketch | 


## 场景类型
| 场景类型 | 英文名称 |
| --- | --- |
| 反乌托邦 | Dystopia, anti-utopia |
| 幻想 | Fantasy |
| 教室 | Classroom |
| 异想天开 | Whimsically |
| 卧室 | Bedroom |
| 森林 | Forest |
| 废墟 | Ruins |
| 城市 | City |
| 废弃城市建筑群 | Deserted city buildings |
| 近未来都市 | Near future city |
| 街景 | Street scenery |
| 炼金室 | Alchemy Laboratory |
| 宇宙 | Universe I cosmos |
| 雨天 | Rain |
| 在晨雾中 | In the morning mist |
| 充满阳光 | Full of sunlight |
| 银河 | Galaxy |
| 黑暗地牢 | Dungeon |
| 星云 | Nebula |
| 疯狂麦斯沙地风格 | Mad Max |
| 巴比伦空中花园 | Hanging Gardens of Babylon |
| 草原草地 | Meadow |
| 杂草丛生的 | Overgrown nature |
| 后启示录、末日后 | Post apocalyptic |
| 天空之城 | Castle in the Sky |

## 精度

| 精度类型                       | 英文名称               |
| -----------------------------|---------------------|
| 高细节                       | High detail         |
| 高品质                       | Hyper quality       |
| 高分辨率                     | High resolution     |
| 全高清.1080P,2K,4K,8K        | FHD,1080P,2K,4K,8K  |
| 8K流畅                       | 8K smooth           |

##  视角
| 视角类型 | 英文名称 | 
| --- | --- |
| 乌瞰图 | A bird's-eye view, aerial view | 
| 顶视園 | Top view | 
| 倾斜移位 | Tilt-shift | 
| 卫星视图 | Satellite view | 
| 底视图 | Bottom view | 
| 前视图、侧视图、后视图 | Front, side, rear view | 
| 产品视图 | Product view | 
| 极端特写视图 | Extreme closeup view | 
| 仰视 | Look up | 
| 第一人称视角 | First-person view | 
| 等距视图 | Isometric view | 
| 特写视图 | Closeup view | 
| 高角度视图 | High angle view | 
| 微观 | Microscopic view | 
| 超侧角 | Super side angle | 
| 第三人称视角 | Third-person perspective | 
| 鸟瞰图 | Aerial view | 
| 两点透视 | Two-point perspective | 
| 三点透视 | Three-point perspective | 
| 肖像 | Portrait | 
| 立面透视 | Elevation perspective | 
| 超广角镜头 | Ultra wide shot | 
| 爆头 | Headshot | 
| (核桃)的横截面图 | A cross-section view of (a walnut) | 
| 电影镜头 | Cinematic shot | 
| 焦点对准 | In focus | 
| 景深(dof) | Depth of field (DOF) | 
| 广角镜头相机型号 | Canon 5D, 1Fujifilm XT100, Sony Alpha | 
| 特写 | Close-Up (CU) | 
| 中特写 | Medium Close-Up (MCU) | 
| 中景 | Medium Shot (MS) | 
| 中远暴 | Medium Long Shot (MLS) | 
| 远景 | Long Shot (LS) | 
| 过肩景 | Over the shoulder shot | 
| 松散景 | Loose shot | 
| 近距离景 | Tight shot | 
| 两景(25)、三景(3S)、群景(GS) | Two shot (2S), three shot (3S), group shot (GS) | 
| 风景照 | Scenery shot | 
| 背景虚化 | Bokeh | 
| 前景 | Foreground | 
| 背景 | Background | 
| 细节镜头(ECU) | Detail Shot (ECU) | 
| 面部拍摄(VCU) | Face Shot (VCU) | 
| 膝景(KS) | Knee Shot (KS) | 
| 全身照(FLS) | Full Length Shot (FLS) | 
| 大特写 | Big Close-Up (BCU) | 
| 陶部以上 | Chest Shot (MCU) | 
| 腰部以上 | Waist Shot (WS) | 
| 膝盖以上 | Knee Shot (KS) | 
| 全身 | Full Length Shot (FLS) | 
| 人占3/4 | Long Shot (LS) | 
| 人在远方 | Extra Long Shot (ELS) |
|头部以上|Big Close-Up(BCU)|
|脸部特写|Face Shot (VCU)|

## 光照类型
| 光照类型 | 英文名称 |
| --- | --- |
| 体积照明 | Volumetric lighting |
| 冷光 | Cold light |
| 情绪照明 | Mood lighting |
| 明亮的 | Bright |
| 柔和的照明/柔光 | Soft illumination/soft lights |
| 荧光灯 | Fluorescent lighting |
| 微光/晨光 | Rays of shimmering light/morning light |
| 黄昏射线 | Crepuscular Ray |
| 外太空观 | Outer space view |
| 电影灯光/戏剧灯光 | Cinematic lighting/dramatic lighting |
| 双性照明 | Bisexual lighting |
| 伦勃朗照明 | Rembrandt Lighting |
| 分体照明 | Split Lighting |
| 前灯 | Front lighting |
| 背光照明 | Back lighting |
| 干净的背景趋势 | Clean background trending |
| 边缘灯 | Rim lights |
| 全局照明 | Global illuminations |
| 霓虹灯冷光 | Neon cold lighting |
| 强光 | Hard lighting |
| 斑驳光线 | Dappled Light |
| 戏剧化灯光 | Dramatic Lighting |
| 双重光源 | Dual Lighting |
| 光斑 | Flare |
| 闪光粉 | Glitter |
| 日出 日落 | Golden Hour |
| 强硬灯光 | Hard Lighting |
| 夜店灯光 | Nightclub Lighting |
| 彩虹火花 | Rainbow Sparks |
| 星空 | Starry |


## 风格

| 风格类型                       | 英文名称              |
| -----------------------------|---------------------|
| 东方山水画                   | Tradition Chinese Ink Painting |
| 浮世绘                       | Japanese Ukiyo-e     |
| 日本漫画风格                 | Japanese comics/manga |
| 童话故事书插图风格           | Stock illustration style |
| 梦工厂动西风格               | CGSociety            |
| 梦工厂影业                   | DreamWorks Pictures  |
| 皮克斯                       | Pixar                |
| 时尚                         | Fashion              |
| 日本海报风格                 | Poster of Japanese graphic design |
| 90年代电视游戏               | 90s video game       |
| 法国艺术                     | French art           |
| 包豪斯                       | Bauhaus              |
| 日本动画片                   | Anime                |
| 像素画                       | ドット絵 and Pixel Art |
| 古典风，18-19世纪             | Vintage              |
| 黑白电影时期                 | Pulp Noir            |
| 乡村风格                     | Country style        |
| 抽象风                       | Abstract             |
| Riso印刷风                   | Risograph            |
| 设计风                       | Graphic              |
| 墨水渲染                     | Ink render           |
| 民族艺术                     | Ethnic Art           |
| 复古 黑暗                    | Retro dark vintage   |
| 国风                         | Tradition Chinese Ink Painting style |
| 蒸汽朋克                     | Steampunk            |
| 电影摄影风格                 | Film photography     |
| 概念艺术                     | Concept art          |
| 剪辑                         | Montage              |
| 充满细节                     | Full details         |
| 哥特式黑暗                   | Gothic gloomy        |
| 写实主义                     | Realism              |
| 黑白                         | Black and white      |
| 统一创作                     | Unity Creations      |
| 巴洛克时期                   | Baroque              |
| 印象派                       | Impressionism        |
| 新艺术风格                   | Art Nouveau         |
| 新艺术                       | Rococo              |
| 艾德里安·多诺休（油画）       | Adrian Donohue      |
| 艾德里安·托米尼（线性人物）   | Adrian Tomine       |
| 吉田明彦（厚涂人物）         | Akihiko Yoshida     |
| 鸟山明（七龙珠）             | Akira Toiyama       |
| 阿方斯·穆查（鲜艳线性）       | Alphonse Mucha      |
| 蔡国强（爆炸艺术）           | Cai Guo-Qiang       |
| 《星球大战》                 | Drew Struzan        |
| 达达主义、构成主义           | Hans Arp            |
| 柔和人物                     | Ilya Kuvshiov       |
| 梦幻流畅                     | James Jean          |
| 迷幻、仙女、卡通             | Jasmine Becket-Griffith |
| 美式人物                     | Jean Giraud         |
| 局部解剖                     | Partial anatomy     |
| 彩墨纸本                     | Color ink on paper  |
| 涂鸦                         | Doodle               |
| 伏尼契手稿                   | Voynich manuscript  |
| 书页                         | Book page           |
| 真实的                       | Realistic            |
| 3D风格                       | 3D                   |
| 复杂的                       | Sophisticated        |
| 真实感                       | Photoreal           |
| 角色概念艺术                 | Character concept art |

| 风格类型                       | 英文名称               |
| -----------------------------|---------------------|
| 文艺复兴                     | Renaissance         |
| 野兽派                       | Fauvism             |
| 立体派                       | Cubism              |
| 抽象表现主义                 | Abstract Art        |
| 超现实主义                   | Surrealism          |
| 欧普艺术/光效应艺术         | OP Art /Optical Art |
| 维多利亚时代                 | Victorian           |
| 未来主义                     | Futuristic          |
| 极简主义                     | Minimalist          |
| 粗犷主义                     | Brutalist           |
| 建构主义                     | Constructivist      |
| 旷野之息                     | BOTW                |
| 星际战甲                     | Warframe            |
| 宝可梦                       | Pokémon             |
| Apex英雄                     | APEX                |
| 上古卷轴                     | The Elder Scrolls   |
| 魂系游戏                     | From Software       |
| 底特律:变人                  | Detroit: Become Human|
| 剑与远征                     | AFK Arena           |
| 跑跑姜饼人                   | CookieRun Kingdom and 쿠키런 |
| 英雄联盟                     | League of Legends   |
| Jojo的奇妙冒险              | Jojo's Bizarre Adventure |
| 新海诚                       | Makoto Shinkai      |
| 副岛成记                     | Soejima Shigenori   |
| 山田章博                     | Yamada Akihiro      |
| 六七质                       | Munashichi          |
| 水彩儿童插画                 | Watercolor Children's Illustration |
| 吉卜力风格                   | Ghibli Studio       |
| 彩色玻璃窗                   | Stained Glass Window|
| 水墨插图                     | Ink Illustration    |
| 宫崎骏风格                   | Miyazaki Hayao Style|
| 梵高                         | Vincent Van Gogh    |
| 达芬奇                       | Leonardo Da Vinci   |
| 漫画                         | Manga               |
| 点彩派                       | Pointillism         |
| 克劳德莫奈                   | Claude Monet        |
| 绗缝艺术                     | Quilted Art         |
| 包豪斯                       | Johannes Itten      |
| 科幻、奇幻、油画             | John Haris          |
| 干净、简约                   | Jon Klassen         |
| 伊藤润二 恐怖漫画           | Junji Ito           |
| 日本漫画家《声之形》         | Koe No Katachi      |
| 手冢治虫《千与千寻》         | Qsamu Tezuka        |
| 超现实主义                   | Rene Magritte       |
| 奇幻、光学幻象               | Rob Gonsalves       |
| 几何概念艺术                 | Sol LeWitt          |
| 线条流畅、精美               | Yusuke Murata       |
| 数字混合媒体艺术             | Antonio Mora        |
| 细腻、机械设计               | Yoji Shinkawa       |
| 国家地理                     | National Geographic |
| 超写实主义                   | Hyperrealism        |
| 电影般的                     | Cinematic           |
| 建筑素描                     | Architectural Sketching |
| 对称肖像                     | Symmetrical Portrait|
| 清晰的面部特征               | Clear Facial Features|
| 室内设计                     | Interior Design     |
| 武器设计                     | Weapon Design       |
| 次表面散射                   | Subsurface Scattering|
| 游戏场景图                   | Game Scene Graph    |



`
const cookbook = () => {
    return (
        <div style={{ paddingLeft: "15px" }} className='markdown-body'>

            <ReactMarkdown children={text} remarkPlugins={[remarkGfm]} />
            关于更详细的学习教程，请点击：<a href="https://learningprompt.wiki/docs/midjourney-learning-path" target='_blank'>这里</a>
        </div >
    )
}

export default cookbook;