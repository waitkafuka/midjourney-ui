import { FC, useState, useRef, useEffect } from 'react';
import { PlayIcon, PauseIcon } from '@heroicons/react/24/solid';
import moment from 'moment';

interface AudioCardProps {
  audioUrl: string;
  title: string;
  createdAt: Date;
  onUse?: () => void;
}

const AudioCard: FC<AudioCardProps> = ({
  audioUrl,
  title,
  createdAt,
  onUse
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  // 格式化时间为 mm:ss 格式
  const formatTime = (time: number): string => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const current = audioRef.current.currentTime;
      const duration = audioRef.current.duration;
      setCurrentTime(current);
      setProgress((current / duration) * 100);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (audioRef.current) {
      const progressBar = e.currentTarget;
      const clickPosition = e.clientX - progressBar.getBoundingClientRect().left;
      const progressBarWidth = progressBar.offsetWidth;
      const percentage = (clickPosition / progressBarWidth);
      const newTime = percentage * audioRef.current.duration;
      audioRef.current.currentTime = newTime;
    }
  };

  return (
    <div className="w-[300px] bg-white rounded-xl shadow-sm overflow-hidden transition-transform hover:shadow-md hover:-translate-y-1">
      {/* 音频播放器区域 */}
      <div className="p-6 bg-gray-50 flex flex-col items-center">
        <button
          onClick={handlePlayPause}
          className="w-16 h-16 rounded-full bg-blue-500 hover:bg-blue-600 
            transition-colors duration-200 flex items-center justify-center cursor-pointer focus:outline-none border-0"
        >
          {isPlaying ? (
            <PauseIcon className="w-8 h-8 text-white" />
          ) : (
            <PlayIcon className="w-8 h-8 text-white" />
          )}
        </button>

        {/* 进度条和时间显示 */}
        <div className="w-full mt-4 space-y-1">
          <div 
            className="w-full h-1 bg-gray-200 rounded-full cursor-pointer"
            onClick={handleProgressClick}
          >
            <div 
              className="h-full bg-blue-500 rounded-full transition-all duration-100"
              style={{ width: `${progress}%` }}
            />
          </div>
          
          {/* 时间显示 */}
          <div className="flex justify-between text-xs text-gray-500">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        <audio
          ref={audioRef}
          src={audioUrl}
          onEnded={() => setIsPlaying(false)}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          className="hidden"
        />
      </div>

      {/* 音频信息 */}
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
  );
};

export default AudioCard;
