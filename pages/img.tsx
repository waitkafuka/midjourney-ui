import { useRouter } from 'next/router';
import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';

const ImageDisplayPage: React.FC = () => {
    const router = useRouter();
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [isExpanded, setIsExpanded] = useState(false);
    const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
    const [scale, setScale] = useState(1);
    const [initialDistance, setInitialDistance] = useState(0);
    const [initialScale, setInitialScale] = useState(1);
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

    const getDistance = (touch1: Touch, touch2: Touch) => {
        return Math.hypot(
            touch1.clientX - touch2.clientX,
            touch1.clientY - touch2.clientY
        );
    };

    const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
        if (e.touches.length === 2) {
            e.preventDefault();
            const touch1 = e.touches[0] as Touch;
            const touch2 = e.touches[1] as Touch;
            const distance = getDistance(touch1, touch2);
            setInitialDistance(distance);
            setInitialScale(scale);
        }
    };

    const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
        if (e.touches.length === 2 && imgRef.current) {
            e.preventDefault();
            const distance = getDistance(e.touches[0] as Touch, e.touches[1] as Touch);
            const newScale = (distance / initialDistance) * initialScale;

            // Calculate the minimum scale to reach 200px width
            const minScale = 200 / imgRef.current.naturalWidth;

            // Apply the new scale, with a minimum of minScale and a maximum of 3
            setScale(Math.min(Math.max(newScale, minScale), 3));
        }
    };

    const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
        if (isExpanded) {
            e.preventDefault();
            const newScale = Math.min(Math.max(scale - e.deltaY * 0.001, 0.5), 3);
            setScale(newScale);
        }
    };

    return (
        <div className="mx-auto">
            <Head>
                <title>Image Display</title>
                <meta name="description" content="Interactive full-size image display" />
                <style>{`
                    .zoom-cursor { cursor: zoom-in; }
                    .zoom-out-cursor { cursor: zoom-out; }
                    .image-container {
                        overflow: auto;
                        max-width: 90vw;
                        max-height: 80vh;
                    }
                `}</style>
            </Head>

            <main>
                {imageUrl ? (
                    <>
                        <div
                            ref={containerRef}
                            style={{ textAlign: "center" }}
                            className={`mb-4 ${isExpanded ? 'image-container' : 'overflow-hidden'}`}
                            onTouchStart={isExpanded ? handleTouchStart : undefined}
                            onTouchMove={isExpanded ? handleTouchMove : undefined}
                        // onWheel={handleWheel}
                        >
                            <img
                                ref={imgRef}
                                src={imageUrl}
                                alt="Displayed image"
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
                        {imageDimensions.width ? (
                            <>
                                <p className="mt-2 text-sm text-center">
                                    <strong>图片尺寸:</strong> {imageDimensions.width} x {imageDimensions.height} px
                                </p>
                                <p className="mt-2 text-sm text-gray-600 text-center">
                                    点击图片放大/缩小。
                                </p>
                                <p className="mt-2 text-sm text-gray-600 text-center">
                                    右键保存图片（手机端可长按保存）
                                </p>
                                <div style={{ height: "20px" }}></div>
                                {isExpanded && (
                                    <p className="mt-2 text-sm text-gray-600 text-center">
                                        {/* Use pinch gestures or mouse wheel to zoom in/out. */}
                                    </p>
                                )}
                            </>
                        ) : (
                            <p className="mt-2 text-sm text-gray-600 text-center">
                                {/* Loading image details... */}
                            </p>
                        )}
                    </>
                ) : (
                    <p>No valid image URL found or image loading failed.</p>
                )}
            </main>
        </div>
    );
};

export default ImageDisplayPage;