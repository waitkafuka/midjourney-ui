import { NextPage } from 'next'
import { useState } from 'react'
import VideoCard from '../../components/VideoCard'
import AudioCard from '../../components/AudioCard'
import MainLayout from '../../layouts/main'

const DigitalHuman: NextPage = () => {
    const [loading, setLoading] = useState(false)

    const videoData = {
        title: "陈学艺",
        coverUrl: "https://oss.iiii.com/userImg/2ae9b7d605fb4fd4b0ea6cbfb9fd7a33.png",
        videoUrl: "https://oss.iiii.com/userTraining/陈学艺cd53638538c24cedb0d79a460492b347.mp4",
        createdAt: new Date(),
        onUse: () => {
            console.log('使用数字人模型')
        }
    }

    const audioData = {
        title: "陈学艺声音",
        audioUrl: "https://oss.iiii.com/audio/755da881d1154610989edd22ad9b973d.mp3",
        createdAt: new Date(),
        onUse: () => {
            console.log('使用声音模型')
        }
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-6">数字人生成</h1>

            <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex flex-wrap gap-6">
                    <div>
                        <h2 className="text-lg font-semibold mb-4">数字人视频</h2>
                        <VideoCard {...videoData} />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold mb-4">数字人声音</h2>
                        <AudioCard {...audioData} />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default DigitalHuman
