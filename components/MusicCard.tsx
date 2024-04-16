import React, { useMemo, useState } from "react";
import { Button, Space, Tag, Tooltip, message } from "antd";
import { MusicModel } from '../scripts/types'
import { downloadFile } from '../scripts/utils'
import { sunoCdnDomain, sunoCdnDomainChina } from "../scripts/config";
import { convertNumberToComplexForm } from '../scripts/utils'


function convertSecondsToMinutes(seconds: number) {
    // 计算分钟数
    const minutes = Math.floor(seconds / 60);
    // 计算剩余秒数
    const remainingSeconds = seconds % 60;
    // 格式化字符串，确保秒数部分为两位数
    const formattedSeconds = remainingSeconds.toString().padStart(2, '0');
    // 返回格式化后的时间字符串
    return `${minutes}:${formattedSeconds}`;
}

const App = (info: MusicModel) => {
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    //始终将info.imgUrl 中的字符串做一个替换，将abc替换为def，并具有响应式的能力
    const imgUrl = useMemo(() => info.imgUrl?.replace(sunoCdnDomain, `${sunoCdnDomainChina}suno-img/`), [info.imgUrl]);
    const imgLargeUrl = useMemo(() => info.imgLargeUrl?.replace(sunoCdnDomain, `${sunoCdnDomainChina}suno-img/`), [info.imgLargeUrl]);
    const audioUrl = useMemo(() => info.audioUrl?.replace(sunoCdnDomain, `${sunoCdnDomainChina}suno-audio/`), [info.audioUrl]);



    // submitted queued streaming complete error
    return (
        <>
            {/* 创建一个美观的音乐播放器 */}
            <div className="music-player">
                <div className="music-player__box">
                    <div className="music-share-btn" onClick={() => {
                        // 复制链接
                        navigator.clipboard.writeText(`https://superx.chat/art/music/${info.id || 0}`)
                        //提示已复制
                        message.info('链接已复制，可发送至微信进行分享');
                    }}>
                        <i className="iconfont icon-share"></i>
                    </div>
                    <div className="music-player__cover">
                        {imgUrl ? <img src={imgUrl} /> : <i className="iconfont icon-music" />}
                        <Button className="music-download-btn" size="small" onClick={() => {
                            downloadFile(imgLargeUrl)
                        }}>下载大图</Button>
                    </div>
                    <div className="music-player__info">
                        <h2 className="music-player__title" title={info.title}>{info.title || '生成中'}</h2>
                        <p className="music-player__tag" title={info.tags}>{info.tags}</p>

                        {/* 歌词 */}
                        <pre className="music-player__prompt">
                            {info.prompt}
                        </pre>
                        <div className="music-player__state">
                            {info.status === 'submitted' && '已提交'}
                            {info.status === 'queued' && '队列中'}
                            {info.status === 'streaming' && '持续生成中，可播放进行试听...'}
                            {/* {info.status === 'complete' && '已完成'} */}
                            {/* {info.status === 'error' && '出错'} */}
                        </div>
                        {/* {info.status === 'streaming' && <div><img style={{ width: '15px' }} src="https://superx.chat/stuff/loading.gif" alt="" /></div>} */}
                        {/* {status === 'complete' && <p className="music-player__duration">时长：{info.duration && convertSecondsToMinutes(info.duration)}</p>} */}
                    </div>
                </div>
                <audio
                    className="music-player__audio"
                    controls
                    src={audioUrl}
                ></audio>
            </div>
        </>
    );
};

export default App;
