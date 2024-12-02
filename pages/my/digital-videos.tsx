import { NextPage } from 'next'
import { useEffect, useRef, useState } from 'react'
import { Input, Radio, DatePicker, Spin } from 'antd'
import VideoCard from '../../components/VideoCard'
import AudioCard from '../../components/AudioCard'
import { requestAliyunArt } from '../../request/http'
import dayjs from 'dayjs'
import Link from 'next/link'

const { Search } = Input
const { RangePicker } = DatePicker
const format = 'YYYY-MM-DD'

const DigitalVideos: NextPage = () => {
    const [loading, setLoading] = useState(false)
    const [videos, setVideos] = useState<any[]>([])
    const [activeTab, setActiveTab] = useState('video')
    const [keywords, setKeywords] = useState('')
    const [count, setCount] = useState(0)

    const pageRef = useRef(1)
    const keywordsRef = useRef('')
    const isLockRequest = useRef(false)

    const defaultDays = 180
    const [defaultPickerValue] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
        dayjs().subtract(defaultDays, 'day'),
        dayjs()
    ])
    const [dateRange, setDateRange] = useState({
        startDate: dayjs().subtract(defaultDays, 'day').format(format),
        endDate: dayjs().format(format)
    })

    const containerRef = useRef<HTMLDivElement>(null)

    const fetchVideos = async () => {
        if (isLockRequest.current) return
        isLockRequest.current = true
        setLoading(true)

        try {
            const result = await requestAliyunArt('digital-human/my-digital-human-videos', {
                page: pageRef.current,
                startDate: `${dateRange.startDate} 00:00:00`,
                endDate: `${dateRange.endDate} 23:59:59`,
                keywords: keywordsRef.current
            })

            if (result.rows) {
                setVideos(prev => [...prev, ...result.rows])
                setCount(result.count)
            }
        } catch (error) {
            console.error('Failed to fetch videos:', error)
        } finally {
            setLoading(false)
            isLockRequest.current = false
        }
    }

    const handleSearch = (value: string) => {
        pageRef.current = 1
        keywordsRef.current = value
        setKeywords(value)
        setVideos([])
        fetchVideos()
    }

    const handleDateRangeChange = (_: any, dateStrings: [string, string]) => {
        setDateRange({
            startDate: dateStrings[0],
            endDate: dateStrings[1]
        })
        pageRef.current = 1
        setVideos([])
        fetchVideos()
    }

    const handleTabChange = (key: string) => {
        setActiveTab(key)
    }

    useEffect(() => {
        fetchVideos()
    }, [])

    useEffect(() => {
        const container = containerRef.current
        if (!container) return

        const handleScroll = () => {
            if (loading || videos.length >= count) return

            const { scrollTop, scrollHeight, clientHeight } = container
            if (scrollHeight - scrollTop - clientHeight < 100) {
                pageRef.current += 1
                fetchVideos()
            }
        }

        container.addEventListener('scroll', handleScroll)
        return () => container.removeEventListener('scroll', handleScroll)
    }, [loading, videos.length, count])

    const getVideoState = (result: number) => {
        switch (result) {
            case 0:
                return '合成中'
            case 1:
                return '成功'
            case 2:
                return '失败'
            default:
                return '未知'
        }
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-center mb-6">
                <Radio.Group
                    value={activeTab}
                    onChange={e => handleTabChange(e.target.value)}
                    buttonStyle="solid"
                    className="flex"
                >
                    <Radio.Button value="video" className="px-8">视频</Radio.Button>
                    <Radio.Button value="audio" className="px-8">音频</Radio.Button>
                </Radio.Group>
            </div>

            <div className="flex justify-center mb-6 gap-4">
                <Search
                    placeholder="搜索视频..."
                    value={keywords}
                    onChange={(e) => setKeywords(e.target.value)}
                    onSearch={handleSearch}
                    style={{ width: 300 }}
                />

                <RangePicker
                    onChange={handleDateRangeChange}
                    defaultValue={defaultPickerValue}
                />
            </div>

            <div
                ref={containerRef}
                className="overflow-auto"
                style={{ height: 'calc(100vh - 250px)' }}
            >
                {videos.length > 0 ? (
                    <div className="flex flex-wrap gap-6" style={{
                        justifyContent: 'space-evenly',
                        padding: '20px 0 0'
                    }}>
                        {videos.map((item) => (
                            <div key={item.id} style={{
                                flexBasis: '300px',
                                flexGrow: 0,
                                flexShrink: 0,
                            }}>
                                {activeTab === 'video' ? (
                                    <VideoCard
                                        title={item.video_name}
                                        coverUrl={item.cover_url}
                                        videoUrl={item.video_url}
                                        createdAt={new Date(item.creation_date)}
                                        state={item.result}
                                    />
                                ) : (
                                    <AudioCard
                                        title={item.video_name}
                                        audioUrl={item.audio_url}
                                        createdAt={new Date(item.creation_date)}
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    !loading && (
                        <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                            <p>
                                您暂无数字人视频，快去
                                <Link 
                                    href="/my/digital-human/" 
                                    className="text-[#424242] dark:text-gray-300 hover:text-[#595959] dark:hover:text-white mx-1 font-medium"
                                >
                                    生成
                                </Link>
                                一个吧~
                            </p>
                        </div>
                    )
                )}

                {loading && (
                    <div className="text-center py-4">
                        <Spin />
                    </div>
                )}

                {!loading && videos.length >= count && count > 0 && (
                    <div className="text-center py-4 text-gray-500">
                        没有更多数据了
                    </div>
                )}
            </div>
        </div>
    )
}

export default DigitalVideos
