import React, { useState, useMemo, useEffect } from "react";
import { Space, Tag, Tooltip, Card, Image, message, Modal, Switch } from "antd";
import { CopyOutlined, CloudDownloadOutlined, EditOutlined, DeleteOutlined, LikeOutlined, LikeFilled } from '@ant-design/icons'
const { Meta } = Card;
import moment from 'moment';
import { ImgCardModel, PaintingType } from "../../scripts/types";
import ClipboardJS from 'clipboard';
import css from './masonry.module.scss'
import { downloadFile } from '../../scripts/utils';
import Router from "next/router";
import { requestAliyunArt } from "../../request/http";
const { confirm } = Modal;
import { ImgPageType } from "../../scripts/types";
import { getRatio, getHeight } from "../../scripts/utils";
import { useSelector } from "react-redux";
import store from "../../store";
import Link from "next/link";

interface Props {
    // 实例模型
    model: ImgCardModel,
    columnWidth: number,
    onImgDeleted?: (id: number) => void,
    // 类型，我的页面还是公开页面
    type: ImgPageType,
    onImgThumbUpActionDone?: (id: number, action: string) => void,
}

const defaultImg = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3PTWBSGcbGzM6GCKqlIBRV0dHRJFarQ0eUT8LH4BnRU0NHR0UEFVdIlFRV7TzRksomPY8uykTk/zewQfKw/9znv4yvJynLv4uLiV2dBoDiBf4qP3/ARuCRABEFAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghgg0Aj8i0JO4OzsrPv69Wv+hi2qPHr0qNvf39+iI97soRIh4f3z58/u7du3SXX7Xt7Z2enevHmzfQe+oSN2apSAPj09TSrb+XKI/f379+08+A0cNRE2ANkupk+ACNPvkSPcAAEibACyXUyfABGm3yNHuAECRNgAZLuYPgEirKlHu7u7XdyytGwHAd8jjNyng4OD7vnz51dbPT8/7z58+NB9+/bt6jU/TI+AGWHEnrx48eJ/EsSmHzx40L18+fLyzxF3ZVMjEyDCiEDjMYZZS5wiPXnyZFbJaxMhQIQRGzHvWR7XCyOCXsOmiDAi1HmPMMQjDpbpEiDCiL358eNHurW/5SnWdIBbXiDCiA38/Pnzrce2YyZ4//59F3ePLNMl4PbpiL2J0L979+7yDtHDhw8vtzzvdGnEXdvUigSIsCLAWavHp/+qM0BcXMd/q25n1vF57TYBp0a3mUzilePj4+7k5KSLb6gt6ydAhPUzXnoPR0dHl79WGTNCfBnn1uvSCJdegQhLI1vvCk+fPu2ePXt2tZOYEV6/fn31dz+shwAR1sP1cqvLntbEN9MxA9xcYjsxS1jWR4AIa2Ibzx0tc44fYX/16lV6NDFLXH+YL32jwiACRBiEbf5KcXoTIsQSpzXx4N28Ja4BQoK7rgXiydbHjx/P25TaQAJEGAguWy0+2Q8PD6/Ki4R8EVl+bzBOnZY95fq9rj9zAkTI2SxdidBHqG9+skdw43borCXO/ZcJdraPWdv22uIEiLA4q7nvvCug8WTqzQveOH26fodo7g6uFe/a17W3+nFBAkRYENRdb1vkkz1CH9cPsVy/jrhr27PqMYvENYNlHAIesRiBYwRy0V+8iXP8+/fvX11Mr7L7ECueb/r48eMqm7FuI2BGWDEG8cm+7G3NEOfmdcTQw4h9/55lhm7DekRYKQPZF2ArbXTAyu4kDYB2YxUzwg0gi/41ztHnfQG26HbGel/crVrm7tNY+/1btkOEAZ2M05r4FB7r9GbAIdxaZYrHdOsgJ/wCEQY0J74TmOKnbxxT9n3FgGGWWsVdowHtjt9Nnvf7yQM2aZU/TIAIAxrw6dOnAWtZZcoEnBpNuTuObWMEiLAx1HY0ZQJEmHJ3HNvGCBBhY6jtaMoEiJB0Z29vL6ls58vxPcO8/zfrdo5qvKO+d3Fx8Wu8zf1dW4p/cPzLly/dtv9Ts/EbcvGAHhHyfBIhZ6NSiIBTo0LNNtScABFyNiqFCBChULMNNSdAhJyNSiECRCjUbEPNCRAhZ6NSiAARCjXbUHMCRMjZqBQiQIRCzTbUnAARcjYqhQgQoVCzDTUnQIScjUohAkQo1GxDzQkQIWejUogAEQo121BzAkTI2agUIkCEQs021JwAEXI2KoUIEKFQsw01J0CEnI1KIQJEKNRsQ80JECFno1KIABEKNdtQcwJEyNmoFCJAhELNNtScABFyNiqFCBChULMNNSdAhJyNSiECRCjUbEPNCRAhZ6NSiAARCjXbUHMCRMjZqBQiQIRCzTbUnAARcjYqhQgQoVCzDTUnQIScjUohAkQo1GxDzQkQIWejUogAEQo121BzAkTI2agUIkCEQs021JwAEXI2KoUIEKFQsw01J0CEnI1KIQJEKNRsQ80JECFno1KIABEKNdtQcwJEyNmoFCJAhELNNtScABFyNiqFCBChULMNNSdAhJyNSiECRCjUbEPNCRAhZ6NSiAARCjXbUHMCRMjZqBQiQIRCzTbUnAARcjYqhQgQoVCzDTUnQIScjUohAkQo1GxDzQkQIWejUogAEQo121BzAkTI2agUIkCEQs021JwAEXI2KoUIEKFQsw01J0CEnI1KIQJEKNRsQ80JECFno1KIABEKNdtQcwJEyNmoFCJAhELNNtScABFyNiqFCBChULMNNSdAhJyNSiEC/wGgKKC4YMA4TAAAAABJRU5ErkJggg=='

const { CheckableTag } = Tag;

const basePath = 'https://oss-cdn.superx.chat'
// 以此宽度进行图片按比例裁剪。mj的图片地址可以支持width和height参数
const baseWidth = 500;
//从提示词中提取宽高比例


const App = ({ model, columnWidth, onImgDeleted, type, onImgThumbUpActionDone }: Props) => {
    const { img_url, prompt, create_time, id, is_public, thumb_up_count, painting_type } = model;
    const userThumbUpList = useSelector((state: any) => state.user.thumbUpList);
    const user = useSelector((state: any) => state.user.info);
    const [isShare, setIsShare] = useState(is_public === 0);

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
        const ratio = getRatio(prompt);
        return getHeight(ratio, baseWidth);
    }, [prompt])

    const onImgClick = () => {
        // window.open(src, '_blank')
    }

    const src = useMemo(() => {
        //如果已经有?，则使用&，否则使用?
        return img_url ? `${basePath}${img_url}${img_url.includes('?') ? '&' : '?'}x-oss-process=style/scale_500` : defaultImg
    }, [img_url, height])

    const HDsrc = useMemo(() => {
        return `${basePath}${img_url}`
    }, [img_url])

    //初始化
    useEffect(() => {
        new ClipboardJS('.copy-action');
    })

    return <>
        <div className={`${css['masonry-item']} masonry-item`} style={{ width: `${columnWidth}px` }} id={`i${id}`}>
            {img_url ? <a href={HDsrc} target="_blank">
                <img onClick={onImgClick} style={{ height: `${columnWidth * height / baseWidth}px` }} className={css["masonry-cover-img"]} src={src} alt="" />
            </a> : <img style={{ height: `${columnWidth * 360 / 358}px` }} src={defaultImg} />}

            <div className={css["masonry-meta"]}>
                <Tooltip title={prompt}>
                    <p className={css["prompt"]} >{prompt}</p>
                </Tooltip>
            </div>
            <div className={css["masonry-action-wrap"]}>
                <div className={css["masonry-action-box"]}>
                    {/* 复制提示词 */}
                    <div className={`${css["masonry-action-item"]} copy-action`} data-clipboard-text={prompt} onClick={() => {
                        message.success('prompt已复制')
                    }}>
                        <CopyOutlined key="copy" title="复制提示词" />
                    </div>
                    {/* 编辑按钮 */}
                    {type === ImgPageType.MY && <div className={css["masonry-action-item"]} onClick={() => {
                        //路由到编辑页面
                        Router.push(`/?prompt=${encodeURIComponent(prompt)}`);
                    }}>
                        <EditOutlined key="edit" title="重新生成" />
                    </div>}
                    <div className={css["masonry-action-item"]} onClick={() => {
                        if (!img_url) {
                            message.error('图片未生成')
                            return;
                        };
                        downloadFile(HDsrc)
                    }}>
                        <CloudDownloadOutlined title="下载" />
                    </div>
                    {type === ImgPageType.MY && <div className={css["masonry-action-item"]} onClick={() => {
                        deleteImg(model.id);
                    }}>
                        <DeleteOutlined title="删除" />
                    </div>}
                    {/* {JSON.stringify(userThumbUpList)} */}

                    {type !== ImgPageType.MY && <div className={css["masonry-action-item"]} onClick={async () => {
                        console.log('userThumbUpList:', userThumbUpList);
                        console.log('id:', id);
                        const hasThumbUp = userThumbUpList.includes(id);
                        const url = hasThumbUp ? 'cancel-thumb-up' : 'thumb-up';
                        const result = await requestAliyunArt(url, { id });
                        console.log('user:', user);

                        if (!user || !user.email) {
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
                    {/* {type === ImgPageType.MY && <div className={css["masonry-action-item"]} onClick={() => {
                        //分享
                    }}>
                        <Switch style={{ minWidth: "60px", marginLeft: "10px" }} checked={isShare} checkedChildren="分享" unCheckedChildren="关闭" defaultChecked={is_public === 0} onClick={async checked => {
                            console.log('checked:', checked);
                            // 关闭分享
                            if (!checked) {
                                confirm({
                                    title: '确定关闭分享吗？',
                                    content: <>关闭分享后，将无法参与点赞送包月会员的活动哦~ <br />
                                        每月点赞最多的前 5 名作品的作者将获得<b> 200 个绘画点数</b> <br />
                                        5-10 名将获得 <b> 100 个绘画点数</b><br />
                                        按月统计，每月 1 日公布上月获胜者。<br />
                                        详情请参考：<Link href="/activity" style={{ color: "#333333", textDecoration: "underline" }}>首届 midjourney 人工智能绘画大赛</Link></>,
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
                    } */}
                    <div style={{ display: "none" }}>{moment(create_time).format('YYYY-MM-DD HH:mm:ss')}</div>
                </div>
            </div>
        </div>
    </>
};

export default App;
