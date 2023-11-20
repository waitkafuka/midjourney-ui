import React, { useEffect, useState } from 'react';

// 假设这是我们的 API 请求函数
// 它应该是一个异步的函数，这里用 setTimeout 模拟异步的进度更新
const fetchImageProgress = (callback: any) => {
    let progress = 0;
    const intervalId = setInterval(() => {
        progress += 10;
        callback(progress); // 模拟进度更新
        if (progress >= 100) {
            clearInterval(intervalId);
        }
    }, 500);
};

const LoadingImageItem = ({ id }: any) => {
    const [progress, setProgress] = useState(0);

    // 启动进度更新
    useEffect(() => {
        fetchImageProgress((newProgress: any) => {
            setProgress(newProgress);
        });
    }, []);

    return (
        <div>
            {progress < 100 ? (
                <div>Loading... {progress}%</div>
            ) : (
                <img src="image_source_url" alt={`Finished loading ${id}`} />
            )}
        </div>
    );
};

const ImageLoader = () => {
    const [imageIds, setImageIds] = useState<Array<number>>([]);
    const [nextId, setNextId] = useState(0);

    const addLoadingImage = () => {
        // 使用当前的 nextId 作为图片的唯一标识
        setImageIds([...imageIds, nextId]);
        // 增加 nextId，以便下一个图片有不同的 ID
        setNextId(nextId + 1);
    };

    return (
        <div>
            <button onClick={addLoadingImage}>Load Image</button>
            <div>
                {imageIds.map((id) => (
                    <LoadingImageItem id={id} />
                ))}
            </div>
        </div>
    );
};

export default ImageLoader;