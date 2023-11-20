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

interface Img {
    id: number,
    progress: number
}


const ImageLoader = () => {
    const [images, setImages] = useState<Array<Img>>([]);
    const [nextId, setNextId] = useState(0);

    const addImage = () => {
        const img: Img = {
            id: Math.random(),
            progress: 0
        }
        console.log('images1:', JSON.parse(JSON.stringify(images)));

        // 使用当前的 nextId 作为图片的唯一标识
        // setImages(imgs => {
        //     console.log('images2:', JSON.parse(JSON.stringify(imgs)));
        //     return [...imgs, img]
        // });
        setImages([...images, img])
        let imgIndex = images.length;
        console.log('images3:', JSON.parse(JSON.stringify(images)));
        // 增加 nextId，以便下一个图片有不同的 ID
        fetchImageProgress(((progress: number) => {
            console.log("🚀 ~ file: dwawwwa2.tsx:35 ~ fetchImageProgress ~ progress:", progress)
            img.progress = progress;
            console.log('images4:', JSON.parse(JSON.stringify(images)));
            setImages(imgs => {
                console.log('images5:', JSON.parse(JSON.stringify(imgs)));
                imgs[imgIndex] = img;
                return [...imgs]
            })
            // images[imgIndex] = img;
            // setImages(images)
            console.log('images6:', JSON.parse(JSON.stringify(images)));
        }))
    };

    return (
        <div>
            <button onClick={addImage}>Load Image</button>
            <div>
                {images.map((img) => (
                    <div>{img.progress}</div>
                ))}
            </div>
        </div>
    );
};

export default ImageLoader;