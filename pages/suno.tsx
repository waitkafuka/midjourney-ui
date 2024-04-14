import { useEffect, useMemo, useState } from "react";
import { ImgCardModel, ImgPageType, PaintingType } from '../scripts/types'
import { getQueryString, hasChinese, downloadFile, redirectToZoomPage } from "../scripts/utils";
import { SendOutlined, StopOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { Alert, Button, Col, Form, Input, InputNumber, Radio, Row, Select, Slider, Switch, Tooltip, message, notification } from "antd";
import { SUNO_COST } from "../scripts/config";
import PaintingPoint from "../components/paintingPoint";
import { requestAliyunArt, requestAliyunArtStream } from "../request/http";
import store from '../store';
import { useSelector } from 'react-redux';
import Head from 'next/head';
import AliyunOSSUploader from '../components/OssUploader';
import PureImgCard from "../components/masonry/PureImgCard";
//导入音乐播放器
import MusicCard from "../components/MusicCard";
enum generateType {
    type_desc = 'type_desc',
    type_manual = 'type_manual'
}

const randomPrompt = [
    '一首关于整夜跳舞的节奏感强烈的 J-Pop 歌曲',
    '一首关于夜晚的梦境的 R&B 歌曲',
    '一首梦幻的电子流行歌曲，关于我们曾经去过的地方',
    '一首流畅的库恰舞曲，关于创作一个令人震撼的吉他独奏',
    '一首关于我们的爱情故事的流行歌曲',
    '一首关于我们的未来的流行歌曲',
    '一首关于我们曾经去过的地方的未来主义放克歌曲',
    '一首动感的金属歌曲，关于整夜跳舞的乐趣',
    '一首律动强劲的流行歌曲，描述着在城市霓虹灯下狂欢的场景，伴随着炽热的节奏一起跳舞的故事。',
    '一首关于心灵漫步于夜晚迷幻世界的 R&B 歌曲，旋律如同梦境般缓缓流淌，歌词述说着那些只在午夜才绽放的情感。',
    '一首梦幻般的电子流行歌曲，勾勒出我们曾经探索过的奇妙地方，音符间透露出对过往回忆的甜蜜追忆。',
    '一首优美而流畅的库恰舞曲，故事围绕着创造一个令人惊叹的吉他独奏展开，节奏如同舞者的心跳一般紧凑有力。',
    '一首动听的流行歌曲，歌词充满着对爱情的热情讴歌，旋律中流露出对彼此深深的眷恋与情感流动。',
    '一首关于未来美好的流行歌曲，充满希望与憧憬，描绘着我们共同构建的未来景象，音符中蕴含着对明天的憧憬。',
    '一首未来主义放克歌曲，描述着我们曾经探索的未知领域，节奏感强烈而前卫，展现出未来世界的独特魅力。',
    '一首动感十足的金属歌曲，唱出整夜狂欢跳舞的欢乐，音符中传递着对生命的热爱与不羁的态度。',
    '一首充满力量与热血的摇滚歌曲，描绘着在舞台上释放激情的瞬间，吉他独奏如烈火般燃烧，唤起内心深处的梦想与勇气。',
    '一首轻快欢快的流行乡村歌曲，描述着在乡间小路上漫步的快乐时光，琴弦声中传递着对自然的热爱与宁静的幸福。',
    '一首令人陶醉的爵士舞曲，音符中流淌着柔和的琴音与婉转的萨克斯风声，勾勒出优雅舞者在月光下翩翩起舞的画面。',
    '一首充满激情与渴望的流行舞曲，歌词诉说着对自由的向往与追求，节奏中蕴含着对未知未来的无尽期待。',
    '一首颠覆传统的电子朋克歌曲，描述着未来都市中的革命者们奋起抗争的壮举，音符中传递着对自由与正义的呐喊与呼唤。',
    '一首魅惑而神秘的古典交响乐曲，笛箫间流淌着迷人的旋律，勾勒出古老城堡中悬念重重的故事，令人心驰神往。',
    '一首充满浪漫情调的民谣歌曲，歌词述说着恋人们相遇相知的故事，吉他弹奏出温柔动人的旋律，让人陶醉其中。',
    '一首振奋人心的合唱交响曲，颂扬着人类团结奋斗的力量与勇气，音符中蕴含着对和平与希望的坚定信念。',
    '一首充满深情的流行民谣，描绘着远隔千里的恋人们彼此思念的情景，吉他伴奏如同心跳般坚定，温柔动人。',
    '一首抒情至深的钢琴独奏曲，音符中流露出对逝去时光的怀念与感慨，如同在寂静的夜晚中诉说着内心的故事。',
    '一首欢快活泼的流行乐曲，歌词中传递着对友谊的珍视与欢乐的庆祝，节奏感强烈，让人忍不住随之跳动。',
    '一首充满神秘色彩的古典音乐作品，交响乐队奏响着宏伟壮丽的旋律，带领听众踏上一场探索未知的音乐之旅。',
    '一首充满活力与激情的摇滚金属歌曲，吉他独奏如烈焰般燃烧，歌词中传递着对自由的向往与对生命的热爱。',
    '一首轻盈柔美的流行舞曲，节奏中透露着对轻松愉快生活的向往，让人心情愉悦，随之跃动。',
    '一首充满朝气与活力的青春摇滚曲，歌词诉说着追逐梦想的坚定信念与勇往直前的决心，激励着年轻一代勇敢向前。',
    '一首婉转动人的爵士乐曲，萨克斯风吹奏着动人旋律，让人沉浸在浪漫与温馨的音乐氛围中。',
    '一首充满异域风情的世界音乐，融合了东方古典乐器与现代节奏，勾勒出神秘而迷人的音乐画卷。',
    '一首充满活力的流行电子舞曲，节奏鲜明，激发出无尽的能量，让人沉浸在舞池的欢乐氛围中。',
    '一首感人至深的民谣歌曲，歌词述说着生活中的坎坷与挣扎，吉他伴奏唤起内心深处的共鸣与感慨。',
    '一首富有张力的史诗级交响乐曲，交响乐队奏响着壮阔的旋律，仿佛在述说着一个永恒的传奇故事。',
    '一首迷幻梦幻的实验音乐作品，音符间流淌着超现实的旋律，引领听者探索未知的音乐境界。',
    '一首充满阳光与欢笑的流行乐曲，歌词传递着对美好生活的向往与热爱，旋律中充满了积极乐观的能量。',
    '一首充满活力与动感的嘻哈音乐，节奏饱满，歌词中流露着对自由与独立的追求，让人难以抑制地跟着节拍摇摆。',
    '一首深情绵长的钢琴小品，音符如同涓涓细流，温柔而动人，唤起内心最柔软的情感与回忆。',]
const defaultLyric = `[Verse]
黑暗笼罩着这座城市
血液沸腾 在静谧的夜晚
疯狂的节奏穿越街区
放肆地燃烧 吞噬我内心的宿命

[Chorus]
狂欢之夜 我们尽情飞舞
挥洒汗水 荡起生命的热情
放肆燃烧 烧毁所有束缚
狂欢之夜 尽情释放自由

[Verse]
嘶吼声撕裂黑夜的寂静
火焰熊熊 点燃心中的骚动
尽情嘶吼 将所有痛苦抛弃
释放内心的怒吼 我们不再屈服`;

const randomMusicStyle = ['uplifting salsa', 'experimental synthpop', 'heartfelt blues', 'smooth rumba', 'dreamy swing', 'infectious grunge', 'acoustic raga', 'bouncy emo', 'bouncy kids music', 'futuristic folk', 'groovy punk', 'romantic bluegrass', 'dreamy salsa', 'aggressive uk garage', 'powerful gospel', 'powerful emo', 'dark edm', 'uplifting opera', 'melodic delta blues', 'dark synthwave', 'smooth metal', 'aggressive classical', 'experimental anime', 'bouncy sertanejo', 'mellow rumba', 'uplifting edm']


const TextArea = Input.TextArea;

const SunoAI: React.FC = () => {
    //初始化参数
    const user = useSelector((state: any) => state.user.info)
    const [showOptions, setShowOptions] = useState<boolean>(false); //是否显示更多选项
    const [qrCodeImage, setQrCodeImage] = useState<ImgCardModel>(); //模板
    const [useTemplate, setUseTemplate] = useState<boolean>(false); //是否使用模板
    const [isWrong, setIsWrong] = useState<boolean>(false); //是否服务器故障
    const [isTranslating, setIsTranslating] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    //音乐列表
    const [musicList, setMusicList] = useState<any[]>([]);
    const [ratio, setRatio] = useState<{ width: number, height: number }>({ width: 1, height: 1 }); //画布缩放比例
    const [qrImg, setQrImg] = useState<string>(''); //二维码图片
    const [showDemo, setShowDemo] = useState<boolean>(true); //是否显示示例
    const [params, setParams] = useState<any>({
        generateType: generateType.type_desc,
        prompt: '',
        modelVersion: 'v3',
        email: ''
    }); //表单参数
    const options = [{
        label: '按描述生成',
        value: generateType.type_desc
    }, {
        label: "按歌词生成",
        value: generateType.type_manual
    }]

    //当user.email更新的时候，重新设置params.email
    useEffect(() => {
        if (user.email) {
            setParams({
                ...params,
                email: user.email
            })
        }
    }, [user.email])



    //获取图片imageData
    function getImageData(imgUrl: string): any {
        return new Promise((resolve, reject) => {
            const img = new Image();

            img.onload = function () {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                canvas.width = img.width;
                canvas.height = img.height;

                if (!ctx) return reject(new Error('无法加载图像'));
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                resolve({
                    imgData,
                    img,
                    canvas
                });
            };

            img.onerror = function () {
                message.error('无法加载图像');
                setIsGenerating(false);
                reject(new Error('无法加载图像'));
            };
            img.setAttribute("crossOrigin", 'anonymous')
            img.src = imgUrl;
        });
    }

    const doSubmit = async () => {
        const apiParams: any = {};
        apiParams.isPureMusic = params.pureMusic;
        apiParams.modelVersion = params.modelVersion;
        apiParams.generateType = params.generateType;
        //按描述生成
        if (params.generateType === generateType.type_desc) {
            apiParams.prompt = params.prompt || params.defaultPrompt;
        } else {
            //按歌词生成
            if (params.lyric) {
                apiParams.lyric = params.lyric
            } else {
                apiParams.lyric = params.lyric = defaultLyric;
            }

            apiParams.musicStyle = params.musicStyle;
            apiParams.musicTitle = params.musicTitle;
            //如果不是纯音乐，歌词或者音乐风格至少输入一个
            if (!apiParams.pureMusic && !apiParams.lyric && !apiParams.musicStyle) {
                message.error('请填写歌词或音乐风格');
                return;
            }
            //如果是纯音乐，则必须输入音乐风格
            if (apiParams.musicStyle) {
                message.error('请填写音乐风格');
                return;
            }
        }

        //校验点数
        if (user.point_count < SUNO_COST) {
            message.error('点数不足，请先购买点数。');
            return;
        }
        let res = null;
        try {
            console.log('提交参数：', apiParams);
            //构建两个生成中的音乐实体
            let music1 = {
                title: '生成中...',
                tags: '',
                duration: '',
                imgUrl: '',
                imgLargeUrl: '',
                audioUrl: ''
            }
            let music2 = JSON.parse(JSON.stringify(music1));
            let buildingMusicList: any[] = [music1, music2];
            //作为placeholder放进去
            setMusicList(list => [...list, ...buildingMusicList]);
            res = await requestAliyunArtStream({
                path: 'suno-music-generate', data: apiParams,
                onDataChange: (data: any) => {
                    console.log('data:', JSON.stringify(data, null, 2));
                    if (data.code) {
                        //未登录
                        notification.error({
                            message: '提示',
                            description: data.message,
                            duration: 0,
                        });
                        music1.title = music2.title = data.message;
                        music1.tags = music2.tags = '';
                        setMusicList((list) => [...list]);
                        return;
                    }
                    if (data.state === 'complete') {
                        store.dispatch({ type: 'user/pointChange', payload: user.point_count - data.cost })
                    } else {
                        //点数减少
                        music1 = Object.assign(music1, data.audioResult[0]);
                        music2 = Object.assign(music2, data.audioResult[0]);
                        setMusicList(list => [...list]);
                    }
                }
            });

        } catch (error: any) {
            message.error(error + '');
            setIsGenerating(false);
            return;
        }

        setIsGenerating(false);
    }

    //定义一个方法，从链接中获取url参数，并set到params中
    const setParamsFromUrl = () => {
        let imgUrl = getQueryString('url');
        if (!imgUrl) return;
        //decode一下
        imgUrl = decodeURIComponent(imgUrl);
        setParams({
            ...params,
            source: {
                onlineImgUrl: imgUrl,
                imgType: generateType.type_desc
            }
        })
        const notifyEmail = localStorage.getItem('notifyEmail');
        if (notifyEmail) {
            setParams({
                ...params,
                email: notifyEmail
            })
        }
    }

    const showFaceDemo = () => {
        const isHidden = localStorage.getItem('hideFaceDemo');
        if (isHidden) {
            setShowDemo(false);
        }
    }

    //随机一个描述
    const randomPromptFunc = () => {
        const randomIndex = Math.floor(Math.random() * randomPrompt.length);
        setParams({
            ...params,
            defaultPrompt: randomPrompt[randomIndex]
        })
    }

    //随机一个音乐风格
    const randomMusicStyleFunc = () => {
        const randomIndex = Math.floor(Math.random() * randomMusicStyle.length);
        setParams({
            ...params,
            musicStyle: randomMusicStyle[randomIndex]
        })
    }

    //初始化选中生成类型，从localStorage 中获取默认值
    const initGenerateType = () => {
        const generateType = localStorage.getItem('sunoGenerateType');
        if (generateType) {
            setParams({
                ...params,
                generateType
            })
        }
    }


    //页面初始化
    useEffect(() => {
        setParamsFromUrl();
        showFaceDemo();
        randomPromptFunc();
        randomMusicStyleFunc();
        initGenerateType();
    }, [])

    return <><Head>
        <meta name="description" content="这是我的页面描述" />
        <meta name="referrer" content="no-referrer" />
    </Head >
        {/* <Alert
            className="faceswap-alert"
            message="换脸限时优惠中，原价：60点数/张，现价：30点数/张。"
            banner
            style={{ width: 'calc(100% - 230px)' }}
            type="success"
            closable
        /> */}
        <div className='dalle-point-box'><PaintingPoint></PaintingPoint></div>
        {isWrong && <Alert
            message={<>服务器故障，换脸服务暂不可用，请使用其他功能。预计 30 分钟后恢复。</>}
            banner
            type='warning'
            closable
        />}
        <div className="ai-qrcode-wrapper" style={{ marginTop: '50px', paddingTop: "0" }}>

            {/* 左侧区域 */}
            <div className="code-options-box">
                <div className="face-box-wrap">

                    <div className="face-box">
                        {/* 生成类型 */}
                        <div style={{ display: "flex", justifyContent: "center", marginBottom: "20px" }}>
                            <Radio.Group
                                options={options}
                                onChange={v => {
                                    setParams({
                                        ...params,
                                        generateType: v.target.value
                                    });
                                    localStorage.setItem('sunoGenerateType', v.target.value);
                                }}
                                value={params.generateType}
                                optionType="button"
                                buttonStyle="solid"
                            />
                            &nbsp;&nbsp;<Tooltip title="按描述生成：AI 将自动根据歌曲描述生成歌词，然后生成歌曲；按歌词生成：将直接根据指定歌词生成歌曲。">
                                <QuestionCircleOutlined />
                            </Tooltip>
                        </div>
                        {/* 按描述生成 */}
                        {params.generateType === generateType.type_desc && <div>
                            {/* 提示词 */}
                            <div className="art-form-item">
                                <div className="form-item-label">
                                    <span className="input-label">歌曲描述</span>
                                    <Tooltip title="要生成歌曲的描述，可以写上风格、情感、故事等。">
                                        <QuestionCircleOutlined />
                                    </Tooltip>
                                    <div className="label-right" onClick={randomPromptFunc}>
                                        <i className="iconfont icon-shuaxin"></i>
                                        随机
                                    </div>
                                </div>
                                <TextArea disabled={params.template_id} showCount maxLength={500} placeholder={params.defaultPrompt} onChange={v => {
                                    setParams({
                                        ...params,
                                        prompt: v.target.value
                                    });
                                }} value={params.prompt} autoSize={{ minRows: 3, maxRows: 5 }} />
                            </div>
                            <div style={{ fontSize: '12px', color: "#999" }}>Tips: Suno目前对中文的支持尚不完善，偶尔会出现中文被识别为敏感词的情况，此时可以稍后重试或者修改为英文提示词。</div>

                        </div>}

                        {/* 按歌词生成 */}
                        {params.generateType === generateType.type_manual && <div>  {/* 歌词 */}
                            <div className="art-form-item">
                                <div className="form-item-label">
                                    <span className="input-label">歌词</span>
                                    <Tooltip title="输入歌曲的歌词，可以是中文或英文。">
                                        <QuestionCircleOutlined />
                                    </Tooltip>
                                    {(params.pureMusic && params.lyric) && <span className="small-tips">&nbsp;&nbsp;&nbsp;勾选纯音乐之后，将不使用歌词</span>}
                                </div>
                                <TextArea showCount maxLength={1000} onResize={() => { }} disabled={params.pureMusic} placeholder={defaultLyric} onChange={v => {
                                    setParams({
                                        ...params,
                                        lyric: v.target.value
                                    });
                                }} value={params.lyric} autoSize={{ minRows: 3, }} />
                            </div>
                            {/* 音乐风格 */}
                            <div className="art-form-item" style={{ marginTop: "30px" }}>
                                <div className="form-item-label">
                                    <span className="input-label">音乐风格</span>
                                    <Tooltip title="描述你想要的音乐风格（例如：“原声流行”）。Suno的模型无法识别艺术家的名字，但可以理解音乐流派和氛围。">
                                        <QuestionCircleOutlined />
                                    </Tooltip>
                                    <div className="label-right" onClick={randomMusicStyleFunc}>
                                        <i className="iconfont icon-shuaxin"></i>
                                        随机{params.musicStyle}
                                    </div>
                                </div>
                                <TextArea showCount maxLength={300} placeholder="请输入风格，也可以点击右上角随机一个风格"  onChange={v => {
                                    setParams({
                                        ...params,
                                        musicStyle: v.target.value
                                    });
                                }} value={params.musicStyle} autoSize={{ minRows: 3, maxRows: 5 }} />
                            </div>

                            {/* 音乐标题 */}
                            <div className="art-form-item" style={{ marginTop: "30px" }}>
                                <div className="form-item-label">
                                    <span className="input-label">音乐标题</span>
                                    <Tooltip title="给你的歌曲起一个名字，可不填">
                                        <QuestionCircleOutlined />
                                    </Tooltip>
                                </div>
                                <Input showCount maxLength={100} placeholder="请输入标题，可以不填，将由 AI 生成标题" onChange={v => {
                                    setParams({
                                        ...params,
                                        musicTitle: v.target.value
                                    });
                                }} value={params.defaultMusicTitle} />
                            </div>

                        </div>}

                        {/* 是否纯音乐 */}
                        <div className="art-form-item horizontal" style={{ marginTop: "30px" }}>
                            <div className="form-item-label">
                                <span className="input-label">是否纯音乐</span>
                                <Tooltip title="如果勾选，则不会生成歌词，仅会生成指定风格的纯音乐。">
                                    <QuestionCircleOutlined />
                                </Tooltip>
                            </div>
                            <Switch
                                size='small'
                                onChange={(v) => {
                                    setParams({
                                        ...params,
                                        pureMusic: v
                                    });
                                }}
                            />
                        </div>

                        {/* 模型版本 */}
                        <div className="art-form-item horizontal" style={{ marginTop: "30px" }}>
                            <div className="form-item-label">
                                <span className="input-label">Suno模型版本</span>
                            </div>
                            <Select
                                value={params.modelVersion}
                                style={{ width: 180, marginLeft: "10px" }}
                                onChange={v => {
                                    setParams({
                                        ...params,
                                        modelVersion: v
                                    });
                                }}
                                options={[{ label: 'v3', value: 'v3' }, { label: 'v2', value: 'v2' }]}
                            />
                        </div>

                    </div>
                </div>

                <div style={{ marginTop: "20px" }}>
                    点数：{SUNO_COST}
                </div>
                <Button type="primary" loading={isGenerating} onClick={doSubmit} style={{ width: "100%", marginTop: "10px" }}>
                    开始生成
                </Button>
                <div style={{ marginTop: "20px", color: "#666", fontSize: "13px", lineHeight: "1.6", width: "100%" }}>
                    使用必读：
                    <ul>
                        <ol>1. 每段音乐长度为 1:00~2:00不等，生成时间约为 1-3 分钟</ol>
                        <ol>2. 两种生成方式：按AI描述生成和按指定歌词生成。按描述生成方式无需指定歌词，将由 AI 自动生成歌词；若想指定歌词，请选择按歌词生成的方式。</ol>
                        <ol>3. 不管是描述还是指定歌词，均支持中文。生成的歌曲歌词也为中文声音。</ol>
                        <ol>4. 生成的音乐默认私有，可商用。</ol>
                        <ol>5. 每次生成 2 首音乐备选，共消耗 20 点数</ol>
                    </ul>
                </div>
            </div>
            {/* 右侧结果区域 */}
            {musicList.length > 0 && <div className="code-result">
                <div className="face-swap-demo-wrap" style={{ paddingLeft: "30px" }}>
                    {musicList.map((item: any, index: number) => {
                        return <div style={{ marginTop: "30px", width: '100%' }} key={index}>
                            <MusicCard title={item.title} tags={item.tags} duration={item.duration} imgUrl={item.imgUrl} imgLargeUrl={item.imgLargeUrl} audioUrl={item.audioUrl} status={item.status} prompt={item.prompt}></MusicCard>
                        </div>
                    })}
                </div>
            </div>}
            <div className="suno-result">
                <div style={{ display: "flex", justifyContent: "center", flexDirection: 'column', alignItems: 'center' }}>
                    {qrCodeImage && <><PureImgCard
                        imgBasePath="https://oc.superx.chat"
                        ratio={{ width: qrCodeImage.width || 1, height: qrCodeImage.height || 1 }}
                        isLoading={true}
                        showThumbImg={false}
                        columnWidth={350}
                        copylink={true}
                        key={qrCodeImage.id}
                        model={qrCodeImage}
                        hasPrompt={false}
                        onImgDeleted={() => {
                            setQrCodeImage(undefined);
                        }}
                        hasDelete={true} />
                        <Button
                            style={{ marginTop: "20px" }}
                            onClick={() => {
                                redirectToZoomPage(`https://oc.superx.chat${qrCodeImage.img_url}`);
                            }}
                        >
                            一键放大
                        </Button>
                    </>}
                </div>
            </div>

        </div>
        {/* 说明区域 */}
        {/* <div className="art-desc">
            <h2>使用说明</h2>
            <div></div>
        </div> */}
    </>
}

export default SunoAI;
