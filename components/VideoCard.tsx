import { FC, useState } from 'react';
import Image from 'next/image';
import { PlayCircleIcon } from '@heroicons/react/24/solid';
import moment from 'moment';

interface VideoCardProps {
  coverUrl: string;
  videoUrl: string;
  title: string;
  createdAt: Date;
  onUse?: () => void;
}

const VideoCard: FC<VideoCardProps> = ({
  coverUrl,
  videoUrl,
  title,
  createdAt,
  onUse
}) => {
  const [showVideo, setShowVideo] = useState(false);

  const handlePlayClick = () => {
    setShowVideo(true);
  };

  return (
    <>
      <div className="w-[300px] bg-white rounded-xl shadow-sm overflow-hidden transition-transform hover:shadow-md hover:-translate-y-1">
        {/* 视频封面容器 */}
        <div className="relative aspect-video group cursor-pointer" onClick={handlePlayClick}>
          <Image
            src={coverUrl}
            alt={title}
            fill
            className="object-cover"
            onError={(e) => {
              const imgElement = e.target as HTMLImageElement;
              imgElement.src = '/images/default-video-cover.jpg';
            }}
          />
          {/* 悬浮时显示的播放按钮 */}
          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <PlayCircleIcon className="w-16 h-16 text-white/90 hover:text-white transition-colors cursor-pointer" />
          </div>
        </div>

        {/* 视频信息 */}
        <div className="p-4">
          <h3 className="text-lg font-medium text-gray-900 line-clamp-1 mb-2">
            {title}
          </h3>
          
          <div className="flex items-center justify-between">
            <time className="text-sm text-gray-500">
              {moment(createdAt).format('YYYY/MM/DD')}
            </time>
            
            <button
              onClick={onUse}
              className="px-4 py-1.5 bg-blue-500 text-white text-sm rounded-full
                hover:bg-blue-600 transition-colors duration-200 cursor-pointer focus:outline-none border-0"
            >
              去生成
            </button>
          </div>
        </div>
      </div>

      {/* 视频播放弹窗 */}
      {showVideo && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowVideo(false)}>
          <div className="relative w-[80vw] max-w-4xl aspect-video" onClick={e => e.stopPropagation()}>
            <video
              src={videoUrl}
              controls
              autoPlay
              className="w-full h-full rounded-lg"
            >
              您的浏览器不支持视频播放。
            </video>
          </div>
        </div>
      )}
    </>
  );
};

export default VideoCard;
