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
  state?: number;
}

const VideoCard: FC<VideoCardProps> = ({
  coverUrl,
  videoUrl,
  title,
  createdAt,
  onUse,
  state
}) => {
  const [showVideo, setShowVideo] = useState(false);

  const handlePlayClick = () => {
    setShowVideo(true);
  };

  return (
    <>
      <div className="w-[300px] bg-white dark:bg-[#1f2022] rounded-xl shadow-sm overflow-hidden transition-all hover:shadow-md hover:-translate-y-1 border border-gray-100 dark:border-gray-700">
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
          <div className="absolute inset-0 bg-black/20 dark:bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <PlayCircleIcon className="w-16 h-16 text-white/80 dark:text-white/90 hover:text-white transition-colors" />
          </div>
        </div>

        {/* 视频信息 */}
        <div className="p-4 bg-white dark:bg-[#1f2022]">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 line-clamp-1 mb-2">
            {title}
          </h3>
          
          <div className="flex items-center justify-between">
            <time className="text-sm text-gray-500 dark:text-gray-400">
              {moment(createdAt).format('YYYY/MM/DD')}
            </time>
            
            {state === 0 ? (
              <span className="text-sm text-yellow-600 dark:text-yellow-500">生成中...</span>
            ) : onUse && (
              <button
                onClick={onUse}
                className="px-4 py-1.5 bg-[#424242] dark:bg-[#141414] text-white text-sm rounded-full
                  hover:bg-[#595959] dark:hover:bg-[#1f1f1f] transition-colors duration-200 
                  cursor-pointer focus:outline-none border-0"
              >
                去生成
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 视频播放弹窗 */}
      {showVideo && (
        <div 
          className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50" 
          onClick={() => setShowVideo(false)}
        >
          <div 
            className="relative w-[80vw] max-w-4xl aspect-video" 
            onClick={e => e.stopPropagation()}
          >
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
