import React, { useState, useMemo, useEffect } from "react";
import { Space, Tag, Tooltip, Card, Image, message, Modal, Switch } from "antd";
import { CopyOutlined, CloudDownloadOutlined, EditOutlined, DeleteOutlined, LikeOutlined, LikeFilled } from '@ant-design/icons'
const { Meta } = Card;
import moment from 'moment';
require('moment/locale/zh-cn');
import { ImgCardModel, PaintingType } from "../../scripts/types";
import ClipboardJS from 'clipboard';
import css from './masonry.module.scss'
import { downloadFile } from '../../scripts/utils';
import Router from "next/router";
import { requestAliyunArt } from "../../request/http";
const { confirm } = Modal;
import { ImgPageType } from "../../scripts/types";
import { getRatio, getHeight, redirectToZoomPage } from "../../scripts/utils";
import { useSelector } from "react-redux";
import store from "../../store";
import Link from "next/link";

interface Props {
    // 实例模型
    model: ImgCardModel,
    columnWidth: number,
    paint_params: any,
    onImgDeleted?: (id: number) => void,
    // 类型，我的页面还是公开页面
    type: ImgPageType,
    onImgThumbUpActionDone?: (id: number, action: string) => void,
}

const defaultImg = 'data:image/png;base64,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'

const { CheckableTag } = Tag;

const basePath = 'https://och.superx.chat'
const basePathOc = 'https://oc.superx.chat'
// 以此宽度进行图片按比例裁剪。mj的图片地址可以支持width和height参数
const baseWidth = 500;
//从提示词中提取宽高比例


const App = ({ model, columnWidth, onImgDeleted, paint_params, type, onImgThumbUpActionDone }: Props) => {
    const { img_url, prompt, create_time, id, is_public, thumb_up_count, painting_type } = model;
    const userThumbUpList = useSelector((state: any) => state.user.thumbUpList);
    const user = useSelector((state: any) => state.user.info);
    const [isShare, setIsShare] = useState(is_public === 0);
    const [hideShareButton, setHideShareButton] = useState(false);

    const deleteImg = (id: number) => {
        confirm({
            content: '确定删除吗？',
            okText: '确定',
            cancelText: '取消',
            async onOk() {
                await requestAliyunArt('delete-painting', { id });
                message.success('删除成功');
                //从列表中移除
                onImgDeleted && onImgDeleted(id);
            },
            onCancel() {
                console.log('Cancel');
            },
        });
    }

    const height = useMemo(() => {
        const { width, height } = paint_params;
        let ratio = (width && height) ? { width, height } : getRatio(prompt);
        //如果参数中有宽高，则使用参数中的宽高
        //业务hack:在qrcode中，11 12 13 14 这四个id的图片为宽度740，高度 1280
        const ids = [11, 12, 13, 14];
        if (paint_params.template_id && ids.includes(paint_params.template_id)) {
            ratio = { width: 740, height: 1280 }
        }
        //继续hack，在换脸图片中，图片宽度高度分别通过sourceImgWidth 和 sourceImgHeight返回
        if (model.painting_type === PaintingType.FACESWAP) {
            ratio = { width: paint_params.sourceImgWidth, height: paint_params.sourceImgHeight }
        }
        return getHeight(ratio, baseWidth);
    }, [prompt])

    const onImgClick = () => {
        // window.open(src, '_blank')
    }

    const src = useMemo(() => {
        //如果已经有?，则使用&，否则使用?
        let igUrl = img_url ? `${basePath}${img_url}${img_url.includes('?') ? '&' : '?'}x-oss-process=style/scale_500` : defaultImg
        //如果是换脸照片，则使用oc域名
        if (painting_type === PaintingType.FACESWAP) {
            igUrl = img_url ? `${basePathOc}${img_url}${img_url.includes('?') ? '&' : '?'}x-oss-process=style/scale_500` : defaultImg
        }
        return igUrl;
    }, [img_url, height])

    const HDsrc = useMemo(() => {
        let hdsrc =  `${basePath}${img_url}`
        //如果是换脸图片
        if(painting_type === PaintingType.FACESWAP){
            hdsrc =  `${basePathOc}${img_url}`
        }
        return hdsrc;
    }, [img_url])

    //初始化
    useEffect(() => {
        new ClipboardJS('.copy-action');
        //如果链接中包含ai.sunmen.cn，则隐藏分享按钮
        if (window.location.href.includes('ai.sunmen.cn')) {
            setHideShareButton(true);
        }
    }, [])

    return <>
        <div className={`${css['masonry-item']} masonry-item`} style={{ width: `${columnWidth}px` }} id={`i${id}`}>
            <div style={{ position: "absolute", left: "0", top: '-1px' }}>
                {/* data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAABQAAAAEABAMAAAAehcbXAAAAHlBMVEX//2ZC//9R2Uv/bjs7Rv///2ZC//9R2kz/bjw8Rv+T0BPCAAAABXRSTlPf39/f3yHgI24AAAHRSURBVHgBYmQYYCA4ou0ftZ8pdADBKBgFTAOZ+kfBKGAaDQJAu3QsAAAAgADMnyXJCLp7NoYhIAKCgAgIAiIgCIiAICACgoAICAIiIAiIgCAgAoKACAgCIiAIiIAgIAKCgAgIAiIgCIiACAgCIiAIiIAgIAKCgAgIAiIgCIiAICACgoAICAIiIAiIgCAgAoKACAgCIiAIiIAgIAKCgAiIgCAgAoKACAgCIiAIiIAgIAKCgAgIAiIgCIiAICACgoAICAIiIAiIgCAgAoKACAgCIiACgoAICAIiIAiIgCAgAoKACAgCIiAIiIAgIAKCgAgIAiIgCIiAICACgoAICCsgCIiAICACgoAICAIiIAiIgCAgAoKACAgCIiAIiIAgIAKCgAgIAiIgCIiAICACgoAICAIiIAKCgAgIAiIgCIiAICACgoAICAIiIAiIgCAgAoKACAgCIiAIiIAgIAKCgAgIAiIgCIiACAgCIiAIiIAgIAKCgAgIAiIgCIiAICACgoAICAIiIAiIgCAgAoKACAgCIiAIiIAgIAKCgAiIgCAgAoKACAgCIiAIiIAgIAKCgAgIAiIgCIiAICACgoAICAIiIAiIgCAgAoKACAgCIiACBo4KVgKCYkXIHT4AAAAASUVORK5CYII=" */}
                {model.painting_type === 'dalle' && <Tag color="rgba(96 108 93/70%)" >
                    DALL·E 2
                </Tag>}
                {model.painting_type === 'dalle3' && <Tag color="rgba(41 1 104/70%)" >
                    DALL·E 3
                </Tag>}
                {model.painting_type === 'mj' && <Tag color="rgba(76 76 109/70%)">
                    Midjourney
                </Tag>}
                {model.painting_type === 'sd' && <Tag color="rgba(76 76 109/70%)">
                    SD
                </Tag>}
                {model.painting_type === 'qrcode' && <Tag color="rgba(118 110 110/70%)">
                    QrCode
                </Tag>}
                {model.painting_type === 'faceswap' && <Tag color="rgba(118 110 118/70%)">
                    FACE
                </Tag>}
            </div>
            <div style={{ position: "absolute", right: "-8px", top: "-1px" }}>
                <Tag color={model.painting_type === 'mj' ? 'rgba(76 76 109/70%)' : 'rgba(96 108 93/70%)'}>
                    {moment.duration(moment().diff(model.create_time, "minutes"), 'minutes').humanize()}前
                </Tag>
            </div>
            {img_url ? <a href={HDsrc} target="_blank">
                <img onClick={onImgClick} style={{ height: `${columnWidth * height / baseWidth}px` }} className={css["masonry-cover-img"]} src={src} alt="" />
            </a> : <img style={{ height: `${columnWidth * 360 / 358}px` }} src={defaultImg} />}

            <div className={css["masonry-meta"]}>
                {painting_type !== 'faceswap' && <Tooltip title={prompt}>
                    <p className={css["prompt"]} >{prompt}</p>
                </Tooltip>}
                {painting_type === 'faceswap' && <Tooltip title={prompt}>
                    <p className={css["prompt"]} >face magic</p>
                </Tooltip>}
            </div>
            <div className={css["masonry-action-wrap"]}>
                <div className={css["masonry-action-box"]}>
                    {/* 复制提示词 */}
                    <div className={`${css["masonry-action-item"]} copy-action`} data-clipboard-text={painting_type !== 'faceswap' ? prompt:`${basePathOc}${img_url}`} onClick={() => {
                        if(painting_type !== 'faceswap'){
                            message.success('prompt已复制')
                        }else{
                            message.success('图片地址已复制')
                        }
                    }}>
                        <CopyOutlined key="copy" title="复制提示词" />
                    </div>
                    {/* 编辑按钮 */}
                    {painting_type === PaintingType.MJ && <div className={css["masonry-action-item"]} onClick={() => {
                        //路由到编辑页面
                        // Router.push(`/?id=${id}`);
                        if (type === ImgPageType.MY) {
                            Router.push(`/?id=${id}`);
                        } else {
                            Router.push(`/?prompt=${encodeURIComponent(prompt)}`);
                        }
                    }}>
                        <EditOutlined key="edit" title="重新生成" />
                    </div>}
                    {/* 下载按钮 */}
                    <div className={css["masonry-action-item"]} onClick={() => {
                        if (!img_url) {
                            message.error('图片未生成')
                            return;
                        };
                        downloadFile(HDsrc)
                    }}>
                        <CloudDownloadOutlined title="下载原图" />
                    </div>

                    {/* 一键放大按钮 */}
                    <div className={css["masonry-action-item"]} onClick={() => {
                        redirectToZoomPage(HDsrc, 'current_window');
                    }}>
                        <i className='iconfont icon-fangda' title="一键放大"></i>
                    </div>
                    {/* 删除按钮 */}
                    {type === ImgPageType.MY && <div className={css["masonry-action-item"]} onClick={() => {
                        deleteImg(model.id);
                    }}>
                        <DeleteOutlined title="删除" />
                    </div>}
                    {/* {JSON.stringify(userThumbUpList)} */}

                    {/* 点赞按钮 */}
                    {type !== ImgPageType.MY && <div className={css["masonry-action-item"]} onClick={async () => {
                        console.log('userThumbUpList:', userThumbUpList);
                        console.log('id:', id);
                        const hasThumbUp = userThumbUpList.includes(id);
                        const url = hasThumbUp ? 'cancel-thumb-up' : 'thumb-up';
                        const result = await requestAliyunArt(url, { id });
                        console.log('user:', user);

                        if (!user || !user.secret) {
                            message.error('登录之后才能投票哦');
                            return;
                        }
                        console.log('hasThumbUp:', hasThumbUp);
                        if (result.code === 0) {
                            // message.success('点赞成功');
                            store.dispatch({ type: hasThumbUp ? 'user/cancelThumbUp' : 'user/thumbUp', payload: id });
                            //通知给父页面，更新list
                            onImgThumbUpActionDone && onImgThumbUpActionDone(id, hasThumbUp ? 'cancel' : 'add');
                        } else {
                            message.error(result.message);
                        }

                    }}>
                        {userThumbUpList.includes(id) ? <LikeFilled title="取消点赞" style={{ color: "#ff5722" }} /> : <LikeOutlined title="点赞" />}
                        <p style={{ position: "relative", fontSize: "12px", marginLeft: "4px", top: "2px" }}>{thumb_up_count}</p>
                        {/* <LikeOutlined title="点赞" style={{color:"#ff2626"}} /> */}
                    </div>}
                    {/* 分享按钮 */}
                    {((type === ImgPageType.MY || user.secret === '39f254ec1d53fcaed4c3cf34e44071ec' || user.secret === '8c49b5e04c642a4c39c66ce17127d47a')) && <div className={css["masonry-action-item"]} onClick={() => {
                        //分享
                    }}>
                        <Switch style={{ minWidth: "60px", marginLeft: "10px" }} checked={isShare} checkedChildren="分享" unCheckedChildren="关闭" defaultChecked={is_public === 0} onClick={async checked => {
                            console.log('checked:', checked);
                            //如果是换脸照片，不允许开启分享
                            if (painting_type === PaintingType.FACESWAP) {
                                message.warning('换脸图片无法分享');
                                return;
                            }
                            // 关闭分享
                            if (!checked) {
                                if (user.unionid === 'otQgs68WOx6j9ylt_I3MY5ABiBB0') {
                                    await requestAliyunArt('edit-painting-state', { id, isPublic: checked ? 0 : 1 });
                                    setIsShare(false)
                                    return;
                                }
                                confirm({
                                    title: '确定关闭分享吗？',
                                    content: <>{hideShareButton ? '关闭分享后，其他人无法在“艺术公园”中看到该作品。' : <>关闭分享后，将无法参与点赞送包月会员的活动哦~ <br />
                                        每月点赞最多的前 5 名作品的作者将获得<b> 200 个绘画点数</b> <br />
                                        5-10 名将获得 <b> 100 个绘画点数</b><br />
                                        按月统计，每月 1 日公布上月获胜者。<br />
                                        详情请参考：<Link href="/activity" style={{ color: "#333333", textDecoration: "underline" }}>首届 midjourney 人工智能绘画大赛</Link></>}</>,
                                    okText: '确定',
                                    cancelText: '取消',
                                    async onOk() {
                                        await requestAliyunArt('edit-painting-state', { id, isPublic: checked ? 0 : 1 });
                                        setIsShare(false)
                                    },
                                    onCancel() {
                                        console.log('Cancel');
                                        setIsShare(true)
                                    },
                                });
                            } else {
                                await requestAliyunArt('edit-painting-state', { id, isPublic: 0 });
                                setIsShare(true)
                            }
                        }} />
                    </div>
                    }
                    <div style={{ display: "none" }}>{moment(create_time).format('YYYY-MM-DD HH:mm:ss')}</div>
                </div>
            </div>
        </div>
    </>
};

export default App;
