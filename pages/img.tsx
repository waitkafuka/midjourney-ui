import { useRouter } from 'next/router';
import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';

const ImageDisplayPage: React.FC = () => {
    const router = useRouter();
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [isExpanded, setIsExpanded] = useState(false);
    const [showSize, setShowSize] = useState(false);
    const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
    const [scale, setScale] = useState(1);
    const imgRef = useRef<HTMLImageElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (router.isReady) {
            const { img } = router.query;
            setImageUrl(decodeURIComponent(img as string));
        }
    }, [router.isReady, router.query]);

    useEffect(() => {
        if (imgRef.current && imgRef.current.complete) {
            setImageDimensions({
                width: imgRef.current.naturalWidth,
                height: imgRef.current.naturalHeight
            });
        }
    }, [imageUrl]);

    const toggleImageSize = () => {
        setIsExpanded(!isExpanded);
        setScale(1);
    };

    const handleImageLoad = () => {
        if (imgRef.current) {
            setImageDimensions({
                width: imgRef.current.naturalWidth,
                height: imgRef.current.naturalHeight
            });
        }
    };

    const handleTouchStart = (e: React.TouchEvent) => {
        if (e.touches.length === 2) {
            e.preventDefault();
        }
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (e.touches.length === 2) {
            e.preventDefault();
            const touch1 = e.touches[0];
            const touch2 = e.touches[1];
            const distance = Math.sqrt(
                Math.pow(touch1.clientX - touch2.clientX, 2) +
                Math.pow(touch1.clientY - touch2.clientY, 2)
            );

            const newScale = Math.min(Math.max(scale * (distance / 100), 0.5), 3);
            setScale(newScale);
        }
    }

    return (
        <div className=" mx-auto">
            <Head>
                <title>midjourney官网</title>
                <meta name="description" content="展示从URL路径中获取的可交互全尺寸图片" />
                <style>{`
          .zoom-cursor { cursor: zoom-in; }
          .zoom-out-cursor { cursor: zoom-out; }
          .image-container {
            overflow: auto;
            max-width:90vw;
          }
        `}</style>
            </Head>

            <main>
                {imageUrl ? (
                    <>
                        <div ref={containerRef}
                            style={{ textAlign: "center" }}
                            className={`mb-4 ${isExpanded ? 'image-container' : ' overflow-hidden'}`}
                            onTouchStart={isExpanded ? handleTouchStart : undefined}
                            onTouchMove={isExpanded ? handleTouchMove : undefined}>
                            <img
                                ref={imgRef}
                                src={imageUrl}
                                alt="展示的图片"
                                className={isExpanded ? 'zoom-out-cursor' : 'zoom-cursor'}
                                style={{
                                    width: isExpanded ? 'auto' : '50%',
                                    height: 'auto',
                                    transform: `scale(${scale})`,
                                    transformOrigin: 'center',
                                    transition: 'transform 0.1s ease-out'
                                }}
                                onClick={toggleImageSize}
                                onLoad={handleImageLoad}
                                onError={() => setImageUrl(null)}
                            />

                        </div>
                        {imageDimensions.width ? <>
                            <p className="mt-2 text-sm text-center">
                                <strong>图片完整尺寸:</strong> {imageDimensions.width} x {imageDimensions.height} 像素
                            </p>
                            <p className="mt-2 text-sm text-gray-600 text-center">
                                点击图片可以 {isExpanded ? '缩小' : '放大'} 查看。{isExpanded && '可以滚动查看完整图片。'}
                            </p>
                            <p className="mt-2 text-sm text-gray-600 text-center">
                                右键可以保存图片（手机端可以长按保存）。
                            </p>
                        </> : <p className="mt-2 text-sm text-gray-600 text-center">
                        </p>}
                    </>
                ) : (
                    <p>没有找到有效的图片URL或图片加载失败。</p>
                )}
            </main>
        </div>
    );
};

export default ImageDisplayPage;