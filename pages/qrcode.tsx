import { useEffect, useMemo, useState } from "react";
import ImgListPage from "../components/ImgListPage";
import { ImgCardModel, ImgPageType, PaintingType } from '../scripts/types'
import { getQueryString, hasChinese } from "../scripts/utils";
import { SendOutlined, StopOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { Button, Col, Form, Input, InputNumber, Row, Select, Slider, Tooltip, message } from "antd";
import jsQR from "jsqr";
import { qrTemplates, qrModels, qrVersions } from "../scripts/config";
import PureImgCard from '../components/masonry/PureImgCard'
import PaintingPoint from "../components/paintingPoint";
import { requestAliyun, requestAliyunArtStream } from "../request/http";
import store from '../store';
import { useSelector } from 'react-redux';
import Head from 'next/head';
import { QRCODE_COST } from '../scripts/config'
import { Html5Qrcode } from "html5-qrcode";

const TextArea = Input.TextArea;

const QrCode: React.FC = () => {
    //初始化参数
    const [params, setParams] = useState<any>({
        iw: 0.35,
        v: process.env.NODE_ENV === 'development' ? '1' : '2',
        seed: '',
        prompt: '',
        negative_prompt: '',
        qr_content: process.env.NODE_ENV === 'development' ? 'http://weixin.qq.com/r/OBxdRS3EnXDirWkm90kq' : '',
        model: '67',
        template_id: 0,
    }); //表单参数
    const [showOptions, setShowOptions] = useState<boolean>(false); //是否显示更多选项
    const [qrCodeImage, setQrCodeImage] = useState<ImgCardModel>(); //模板
    const [useTemplate, setUseTemplate] = useState<boolean>(false); //是否使用模板
    const [isTranslating, setIsTranslating] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [ratio, setRatio] = useState<{ width: number, height: number }>({ width: 1, height: 1 }); //画布缩放比例
    const [qrImg, setQrImg] = useState<string>(''); //二维码图片
    const [showDemo, setShowDemo] = useState<boolean>(true); //是否显示示例
    const user = useSelector((state: any) => state.user.info)

    const setBDVid = () => {
        //从链接中取出bd_vid参数
        // const url = new URL(window.location.href);
        const bd_vid = getQueryString('bd_vid');
        if (bd_vid) {
            localStorage.setItem('bd_vid', bd_vid);
        }
    }

    //当前的二维码模板
    const currentTemplate = useMemo(() => {
        if (params.template_id) {
            const template = qrTemplates.find((t) => t.id === params.template_id);
            if (template) {
                return template;
            }
        } else {
            return null;
        }
    }, [params.template_id]);

    //随机一个prompt
    const randomPrompt = () => {
        if (params.template_id) return;
        const prompts = ["marine life, ocean creatures, sea animals, undersea world, aquatic ecosystem, coral reef, deep ocean, sea world, aqua life, marine species", "starry sky, galaxy, universe, space, nebula, constellation, milky way, cosmos, night sky, celestial", "abstract art, non-representative, non-figurative, abstract expressionism, cubist, modern art, geometric, minimalism, surreal, avant-garde ", "wildlife, wild animals, fauna, beasts, safari, jungle, natural habitat, ecosystem, wilderness, animals", "cityscape, night view, city lights, skyscrapers, city at night, urban scenery, downtown, skyline, metropolis, neon lights", "ancient roman architecture, coliseum, pantheon, roman ruins, classical, columns, arches, roman art, roman empire, basilica", "native american totem, tribal art, indians, shaman, spiritual symbols, indigenous, totem pole, native culture, tribal, folklore", "stone carving, engraving, relief, bas-relief, stele, sculpture, rock art, lithography, petroglyphs, chiseling", "autumn leaves, fall colors, autumn season, foliage, crisp air, harvest, autumnal, fallen leaves, golden autumn, season change", "winter landscape, snowfall, snowflakes, snow-covered, frost, winter scene, snowy weather, white winter, snowscape, cold season", "3D geometry, polygons, geometric shapes, solids, 3D figures, shapes in space, geometric modeling, spatial geometry, trigonometry, prism", "ancient egyptian hieroglyphs, pictorial script, inscription, pharaoh, egyptology, ankh, pyramids, scribes, rosetta stone, cartouche", "countryside, pastoral scenery, rural landscape, farms, fields, greenery, pastoral, rolling hills, country life, rustic", "van gogh's starry night, post-impressionism, swirling stars, art masterpiece, starry, expressionist, night sky, celestials, cosmos, van gogh", "fashion trends, style, latest fashion, vogue, chic, couture, modish, glamour, trendsetter, haute couture", "fairy magic, enchanted, sprites, fantasy, mystic, spellbound, charm, pixie, fairyland, elf mythical", "fairy-tale town, quaint village, charming, picturesque, idyllic, cobblestone streets, storybook, fable, folklore, enchanting", "popular cartoons, animated characters, anime, animation, cartoonist, comic strip, kids show, toons, caricature, manga", "retro posters, vintage, old-fashioned, classic billboard, nostalgia, mid-century, antique, past era, elderly, yesteryear", "ink wash painting, oriental art, calligraphy, brushwork, Zen art, sumi-e, Chinese painting, ink and wash, traditional Asian art, literati painting", "multicolored, colorful, vibrant, diverse, hues, shades, tints, rainbow colors, vivid, technicolor", "poker card designs, clubs, diamonds, hearts, spades, face cards, deck of cards, playing cards, joker, royal flush", "marvel heroes, superhero, comics, avengers, iron man, captain America, hulk, thor, black widow, spiderman", "portrait painting, fine art, sitter, oil painting, profile, canvas, realism, self-portrait, likeness, figure painting", "jazz music elements, saxophone, rhythm, blue notes, improvisation, swing, bebop, jazz standards, musical, syncopation", "ancient Greek mythology, Olympus, Zeus, Athena, Aphrodite, classical myths, titans, Hercules, mythology, minotaur", "succulents, cacti, aloe, desert plants, botanical, flora, fleshy plants, garden, drought-tolerant, exotics", "folk embroidery, needlework, stitchery, handicraft, threadwork, crewel, cross-stitch, embroidery pattern, folk art, craft", "diamond facets, gemstone, sparkle, jewel, carats, clarity, brilliance, gem-cutting, precious stone, jeweler", "ancient Roman sculpture, statue, marble, busts, roman gods, classical, romanesque, roman art, carvings, relief", "dance moves, ballet, salsa, breakdance, waltz, tango, jazz dance, ballroom, choreography, dance steps", "forest sprites, fairies, fantasy, woodland creatures, nature spirits, magical beings, enchantment, pixies, forest magic, woodland", "love elements, hearts, romance, affection, love symbols, sweetheart, love sign, valentine, affectionate, amour", "precision instruments, microscope, telescope, precision tools, equipment, laboratory, spectroscopy, microscope, precision measurement, scientific instrument", "balloon scenery, hot air balloon, balloon ride, aerial view, balloons in the sky, flight, flying, balloon festival, high altitude, airship", "Buddhist art, Buddha, mandala, enlightenment, bodhisattva, Zen, dharma, sutra, Dalai Lama, Buddhist symbols ", "Victorian style, antique, prudish, gothic revival, queen victoria, ornate, victorian fashion, 19th century, vintage, victorian architecture", "film elements, cinema, directors cut, hollywood, screenplay, box office, camera angles, movie stars, film reel, blockbuster", "steampunk, Victorian, retro-futuristic, gears, goggles, steam engine, alternative history, clockwork, anachronistic, industrial revolution", "classical sculpture, statue, marble, Greek gods, classical, renaissance, roman art, carvings, relief, busts", "virtual reality, VR, augmented reality, virtual world, hologram, VR gaming, simulation, immersive technology, cyberspace, 3D world", "marine adventure, pirates, treasure, shipwreck, ocean exploration, sea voyage, nautical, diving, sea monsters, sailing", "technology lines, digital, futuristic, tech graphics, circuitry, binary, streamline, data streams, virtual, hi-tech", "Christmas elements, Santa Claus, Christmas tree, reindeer, ornaments, snowman, yuletide, festive, bells, presents", "African tribal culture, tribe, rituals, masks, African art, tribal dance, tribal music, folklore, ancestors, indigenous", "Amusement park, attractions, theme parks, roller coaster, ferris wheel, flower, fountain, outdoor, blue sky", "wandering, mystical forest, enchanted, trees, moss, soft light, magic, path, foliage, mysterious", "beachside, cozy cottage, sand, seashells, white picket fence, inviting, homey, ocean view", "picnic, cherry blossom tree, spring, petals, grass, blanket, soft light, leisure, outdoors, flowers", "empty theater stage, after the show, quiet, spotlight, curtains, performance, atmosphere, solitude", "river surrounded by trees, blue sky and cumulonimbus, camping, Riverside, in shadow, arbor, light reflecting in the river, tree shade, sunbeams", "majestic cliffside, overlooking the ocean, vast seascape, dramatic sky, waves, panoramic view, wind", "fantasy, castle and town, castle town, beautiful building, how people live, flowers, trees, nature, romantic, shopping street, street stall, blue sky", "broken glass, peeled walls, jungle, city, city center, building, moss, ivy, blue sky, cumulonimbus, collapsed town, broken town, deserted town, roots crawling on walls, outdoor, rubble, ruins", "whimsical art gallery, paintings, sculptures, colorful, creative, inspiring, dreamy, imaginative", "Giant trees, leaves that cover the sky, maple leaves, Autumn leaves, autumn, red mountain, Fallen leaves, waterfall", "back alley, bricks, gangland, wall text graffiti, messy town, gang, shutters, darksome, spooky, dangerous atmosphere, badness, midnight, night, night road, fluorescent lamp", "beautiful ballet performance, elegant, dancers, stage, fluid movement, grace, spotlight", "trolling, lavender field, fragrant, summer, purple, calming, warm breeze, picturesque, rows, nature", "ancient tomb excavation, archeology, hieroglyphics, sarcophagus, dusty, mysterious, historical", "outdoor, yoga, zen, harmony, nature, balance pose, peaceful", "waterfall, hidden, lush jungle, greenery, mist, tranquil, cascading water, ferns, rocks, nature", "dark sky, dense fog, thunderstorm , heavy rain, waves crashing, lighthouse, beacon of light, coastal, rugged", "coastal village, peaceful harbor, boats, fishing nets, sea breeze, quaint homes, shoreline", "mysterious cave exploration, unknown, torchlight, stalactites, subterranean, hidden treasures, darkness", "old-fashioned, street café, nostalgic, city, cobblestone, chairs, tables, people, relaxing, architecture", "Visual impact , spooky, imagination, glitch art, revolve round, fluorescent , Fibonacci spiral , galaxy, extreme detailed effect, Lightning and body Interweave, milky way, goddess"];
        //从prompts中随机一个
        const randomPrompt = prompts[Math.floor(Math.random() * prompts.length)];
        setParams({
            ...params,
            prompt: randomPrompt
        });
    }

    const initQrDemo = () => {
        const initQrcodeImage: ImgCardModel = {
            id: 0,
            img_url: '/mx-qrcode/lanselifu.png',
            prompt: 'blue dress',
            create_time: new Date(),
            is_public: 0,
            thumb_up_count: 0,
            painting_type: PaintingType.QRCODE,
            width: 740,
            height: 1280
        };
        setQrCodeImage(initQrcodeImage);
    }

    // useEffect(() => {
    //     initQrDemo();
    // }, [params.prompt]);

    const doSubmit = async () => {
        if (!params.qr_content) {
            message.error('请输入URL链接');
            return;
        }
        //校验点数
        if (user.point_count < QRCODE_COST) {
            message.error('点数不足，请先购买点数。');
            return;
        }
        setIsGenerating(true);
        setShowDemo(false);
        if (hasChinese(params.prompt)) {
            // 调用api翻译为英文
            // message.info('midjourney无法支持中文提示词，正在为您翻译为英文...');
            setIsTranslating(true);
            let result = {} as any;
            try {
                result = await requestAliyun('translate', { content: params.prompt });
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
            params.prompt = result.data;
            setParams({ ...params });
            setIsTranslating(false);
            console.log('翻译结果', result);
        }

        if (hasChinese(params.negative_prompt)) {
            // 调用api翻译为英文
            // message.info('midjourney无法支持中文提示词，正在为您翻译为英文...');
            setIsTranslating(true);
            let result = {} as any;
            try {
                result = await requestAliyun('translate', { content: params.negative_prompt });
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
            params.negative_prompt = result.data;
            setParams({ ...params });
            setIsTranslating(false);
            console.log('翻译结果', result);
        }

        const newQrcodeImage: ImgCardModel = {
            id: 0,
            img_url: '',
            prompt: params.prompt,
            create_time: new Date(),
            is_public: 0,
            thumb_up_count: 0,
            painting_type: PaintingType.QRCODE,
            width: currentTemplate ? currentTemplate.width : 500,
            height: currentTemplate ? currentTemplate.height : 500
        };
        // if (currentTemplate) {
        //     setRatio({ width: currentTemplate?.width || 1, height: currentTemplate?.height || 1 });
        // } else {
        //     setRatio({ width: 1, height: 1 });
        // }
        setQrCodeImage(img => newQrcodeImage);

        console.log('提交参数：', params);

        const result = await requestAliyunArtStream({
            path: 'qrcode-generate', data: { params }, onDataChange: (data: any) => {
                console.log('onDataChange', data);
                if (data.code === 40022) {
                    message.error('点数不足，请先购买点数。');
                    setIsGenerating(false);
                    initQrDemo();
                    return;
                }
                if (data.progress === 100) {
                    setIsGenerating(false);
                    setQrCodeImage({ ...newQrcodeImage, img_url: data.img_url, id: data.id });
                    //点数减少
                    store.dispatch({ type: 'user/pointChange', payload: user.point_count - QRCODE_COST })
                }
            }
        });
    }

    //获取图片imageData
    function getImageData(dataURI: string) {
        const maxSize = 400;

        return new Promise((resolve, reject) => {
            const img = new Image();

            img.onload = function () {
                let rate = Math.min(img.width, img.height) / maxSize;
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                canvas.width = img.width / rate;
                canvas.height = img.height / rate;

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
                reject(new Error('无法加载图像'));
            };

            img.src = dataURI;
        });
    }

    //选择图片
    const chooseImage = () => {
        console.log('选择图片');
        if (!window.FileReader) {
            message.error('您的浏览器版本过低，请升级浏览器，或使用 Chrome 浏览器获得最佳使用体验。')
            return;
        }
        const fileInput = document.createElement("input");
        fileInput.type = "file";
        fileInput.accept = "image/*";

        fileInput.addEventListener("change", function () {
            if (!fileInput.files) return;
            const file = fileInput.files[0];
            const reader = new FileReader();

            reader.onloadend = async function () {
                if (!reader.result) return;
                let base64String = reader.result as string;
                // base64String = base64String.replace(/^data:image\/\w+;base64,/, "");
                // base64String = 'data:image/png;base64,' + base64String
                //获取图片宽高
                const { imgData, img, canvas } = await getImageData(base64String) as any;
                console.log(imgData);
                const code = jsQR(imgData.data, canvas.width, canvas.height) as any;
                let text = null;
                if (code) {
                    text = code.data;
                } else {
                    const html5QrCode = new Html5Qrcode(/* element id */ "qr-input-file");
                    text = await html5QrCode.scanFile(file, true)
                }
                if (text) {
                    setParams({
                        ...params,
                        qr_content: text
                    });
                } else {
                    message.error('二维码解析失败，请确保您的图片中包含二维码，或联系微信客服。');
                }

                // 销毁动态创建的input标签
                fileInput.remove();
            };

            if (file) {
                reader.readAsDataURL(file);
            }
        });

        fileInput.click();
    }

    //页面初始化
    useEffect(() => {
        randomPrompt();
        setBDVid();
        initQrDemo();
    }, [])

    return <><Head>
        <meta name="description" content="这是我的页面描述" />
        <meta name="referrer" content="no-referrer" />
    </Head >
        <div className='dalle-point-box'><PaintingPoint></PaintingPoint></div>
        <div className="ai-qrcode-wrapper" style={{ marginTop: '50px' }}>

            {/* 左侧区域 */}
            <div className="code-options-box">
                <div className="art-form-item">
                    <div className="form-item-label">
                        <span className="input-label">URL 链接</span>
                        <Tooltip title="二维码扫码之后识别到的链接。链接越短越容易扫描（也可以是文字，但二维码容量有限，文字不宜过长）。如果是微信二维码，请点击右侧“识别”，上传二维码图片。">
                            <QuestionCircleOutlined />
                        </Tooltip>
                        <div className="label-right" onClick={chooseImage}>
                            <input type="file" id="qr-input-file" accept="image/*" style={{ display: "none" }} />
                            <i className="iconfont icon-xiangji"></i>
                            识别
                            <input type="file" id="fileInput" accept="image/*" style={{ display: "none" }} />
                        </div>

                    </div>
                    <Input showCount maxLength={100} onChange={v => {
                        setParams({
                            ...params,
                            qr_content: v.target.value
                        });
                    }} placeholder="如：https://superx.chat/art/" value={params.qr_content} />
                </div>
                {/* 提示词 */}
                <div className="art-form-item">
                    <div className="form-item-label">
                        <span className="input-label">图片提示词</span>
                        <Tooltip title="要生成图片的描述词，和 midjourney 一样，支持中文，会自动进行翻译。不支持参数。">
                            <QuestionCircleOutlined />
                        </Tooltip>
                        <div className="label-right" onClick={randomPrompt}>
                            <i className="iconfont icon-shuaxin"></i>
                            随机
                        </div>
                    </div>
                    <TextArea disabled={params.template_id} showCount maxLength={500} placeholder="如：https://superx.chat/art/" onChange={v => {
                        setParams({
                            ...params,
                            prompt: v.target.value
                        });
                    }} value={params.prompt} autoSize={{ minRows: 3, maxRows: 5 }} />
                </div>
                {/* 更多选项 */}
                <div className="art-form-item">
                    <div className="form-item-label cp inline-block" onClick={() => {
                        setShowOptions(!showOptions);
                    }}>
                        <span className="input-label"><span className="more-options-icon">
                            <i className={`iconfont ${showOptions ? 'icon-shuangshangjiantou-' : 'icon-shuangxiajiantou-'}`}></i>
                        </span> 高级选项</span>
                    </div>
                </div>
                {/* 高级选项盒子 */}
                <div className="advance-options-box" style={{ display: showOptions ? 'block' : 'none' }}>
                    {/* 二维码强度 */}
                    <div className="art-form-item horizontal">
                        <div className="form-item-label">
                            <span className="input-label">二维码强度</span>
                            <Tooltip title="数值越大，二维码越明显，越容易扫描；数值越小，艺术图片越明显，越好看。如果您生成的二维码无法扫描，请尝试提高此参数。">
                                <QuestionCircleOutlined />
                            </Tooltip>
                        </div>
                        <Row className="form-item-value-row">
                            <Col span={16}>
                                <Slider
                                    min={0}
                                    max={1}
                                    onChange={v => {
                                        setParams({
                                            ...params,
                                            iw: v
                                        })
                                    }}
                                    value={typeof params.iw === 'number' ? params.iw : 0}
                                    step={0.01}
                                />
                            </Col>
                            <Col span={1}></Col>

                            <Col span={7}>
                                <InputNumber
                                    min={0}
                                    max={1}
                                    style={{ width: "100%" }}
                                    step={0.01}
                                    value={params.iw}
                                    onChange={v => {
                                        setParams({
                                            ...params,
                                            iw: v
                                        })
                                    }}
                                />
                            </Col>
                        </Row>
                    </div>
                    {/* 模型选择 */}
                    <div className="art-form-item horizontal">
                        <div className="form-item-label">
                            <span className="input-label">选择风格</span>
                            <Tooltip title="选择不同的模型，生成的艺术图片会有所不同。">
                                <QuestionCircleOutlined />
                            </Tooltip>

                        </div>
                        <Select
                            disabled={params.template_id}
                            value={params.model}
                            style={{ width: 180, marginLeft: "10px" }}
                            onChange={v => {
                                setParams({ ...params, model: v })
                            }}
                            options={qrModels.map(item => ({
                                value: item.value, label: <div className="select-hover-options">
                                    {item.name}
                                    {/* <div className="select-hover-img">
                                <img src={item.preview_img} alt="" />
                            </div> */}
                                </div>
                            }))}
                        />
                    </div>
                    {/* 模板选择 */}
                    <div className="art-form-item horizontal">
                        <div className="form-item-label">
                            <span className="input-label">选择模板</span>
                            <Tooltip title="选择模板的情况下，将直接使用系统图片模板进行二维码融合，而不会使用提示词、负面提示词和风格选择。">
                                <QuestionCircleOutlined />
                            </Tooltip>

                        </div>
                        <Select
                            value={params.template_id}
                            style={{ width: 180, marginLeft: "10px" }}
                            onChange={v => {
                                setParams({ ...params, template_id: v })
                            }}
                            options={qrTemplates.map(item => ({ value: item.id, label: item.name }))}
                        />
                    </div>
                    {/* 版本选择 */}
                    {/* <div className="art-form-item horizontal" style={{ display: "flex" }}>
                        <div className="form-item-label">
                            <span className="input-label">版本</span>
                            <Tooltip title="越高版本效果越好。">
                                <QuestionCircleOutlined />
                            </Tooltip>

                        </div>
                        <Select
                            value={params.v}
                            style={{ width: 180, marginLeft: "10px" }}
                            onChange={v => {
                                setParams({ ...params, v })
                            }}
                            options={qrVersions.map(item => ({ value: item.value, label: item.name }))}
                        />
                    </div> */}
                    {/* 负面提示词 */}
                    {/* <div className="art-form-item">
                    <div className="form-item-label">
                        <span className="input-label">负面提示词</span>
                        <Tooltip title="负面提示词，将从画面中排除。">
                            <QuestionCircleOutlined />
                        </Tooltip>

                    </div>
                    <Input showCount maxLength={200} disabled={params.template_id} onChange={v => {
                        setParams({
                            ...params,
                            negative_prompt: v.target.value
                        });
                    }} placeholder="你不想要出现的内容" value={params.negative_prompt} />
                </div> */}
                </div>

                <Button type="primary" loading={isGenerating} onClick={doSubmit} style={{ width: "100%", marginTop: "10px" }}>
                    生成
                </Button>
            </div>
            {/* 二维码结果区域 */}
            <div className="code-result">
                <div style={{ display: "flex", justifyContent: "center", flexDirection: 'column', alignItems: 'center' }}>
                    {qrCodeImage && <PureImgCard
                        imgBasePath="https://och.superx.chat"
                        ratio={{ width: qrCodeImage.width || 1, height: qrCodeImage.height || 1 }}
                        isLoading={true}
                        showThumbImg={false}
                        columnWidth={350}
                        copylink={true}
                        key={qrCodeImage.id}
                        model={qrCodeImage}
                        hasDelete={true} />}
                    {/* {JSON.stringify(ratio)} */}
                    {/* {JSON.stringify(qrCodeImage)} */}
                    {showDemo && <>
                        <div className="qrcode-demo-tips">示例二维码由：高级选项-{'>'}选择模板-{'>'}“蓝色礼服”生成</div>
                        <div className="qrcode-demo-tips">玫瑰礼服、蓝色礼服、公主裙、清新古风四个模板为比例9:16，其他模板为 1:1</div>
                        <div className="qrcode-demo-tips">二维码创作30点数/张</div>
                        {/* <div className="qrcode-demo-tips">每张点数 30 点</div> */}
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

export default QrCode;
