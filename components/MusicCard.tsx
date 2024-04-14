import React, { useMemo, useState } from "react";
import { Button, Space, Tag, Tooltip } from "antd";
import { downloadFile } from '../scripts/utils'

const { CheckableTag } = Tag;

interface Props {
    imgUrl: string;
    imgLargeUrl: string;
    title: string;
    tags: string;
    duration: number;
    audioUrl: string;
    status: string;
    //歌词
    prompt: string;
    //是否显示状态
    showStatus?: boolean;
    //是否显示歌词
    showPrompt?: boolean;
}

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

const App = (info: Props) => {
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    // submitted queued streaming complete error
    return (
        <>
            {/* 创建一个美观的音乐播放器 */}
            <div className="music-player">
                <div className="music-player__box">
                    <div className="music-player__cover">
                        {info.imgUrl ? <img src={info.imgUrl} alt={info.title} /> : <i className="iconfont icon-music" />}
                        <Button className="music-download-btn" size="small" onClick={() => {
                            downloadFile(info.imgLargeUrl)
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
                    src={info.audioUrl}
                ></audio>
            </div>
        </>
    );
};

export default App;
