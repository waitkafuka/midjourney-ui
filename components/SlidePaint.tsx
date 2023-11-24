import { use, useEffect, useRef, useState } from "react";
import { requestAliyunArt } from "../request/http";
import ImgCard from "./masonry/imgCard";
import { ImgCardModel } from "../scripts/types";
import { ImgPageType } from "../scripts/types";
import ReactDOM from "react-dom";

const SlidePaint = () => {
    const [paintList, setPaintList] = useState([]) as any[];
    const scrollInnerDiv = useRef(null) as any;
    let isPaused = false; // 是否暂停滚动
    let currentScrollPosition = 0; // 当前滚动位置
    const speed = process.env.NODE_ENV === 'development' ? 1 : 0.6; // 假设滚动速度为1像素每帧
    let frameAnimationId: number | null = null;
    let pageIndex = 0;

    const queryPaint = async () => {
        const { data } = await requestAliyunArt('query-last-squre-paint', {
            offset: pageIndex * 10,
        });
        pageIndex++;
        setPaintList((list: any[]) => {
            return [...data, ...data]
        });
        // ReactDOM.flushSync(() => {
        //     console.log('flushSync');
        // });
    }

    function startAnimation() {
        const scrollingDiv = document.getElementById('scrollingDiv') as HTMLElement | null;
        if (!scrollingDiv) return;
        scrollInnerDiv.current = scrollingDiv;

        scrollingDiv.addEventListener('mouseover', () => {
            isPaused = true; // 鼠标进入时暂停滚动
        });

        scrollingDiv.addEventListener('mouseout', () => {
            isPaused = false; // 鼠标离开后继续滚动
        });
        scrollContent();
    }

    function scrollContent() {
        const scrollingDiv = scrollInnerDiv.current;
        if (!isPaused) {
            // 检查是否到达原始内容的末尾
            if (currentScrollPosition >= scrollingDiv.scrollWidth / 2) {
                currentScrollPosition = 0; // 重置滚动位置
                // queryPaint();
            }

            currentScrollPosition += speed; // 更新滚动位置
            scrollingDiv.style.left = -currentScrollPosition + 'px'; // 应用新的滚动位置
        }
        frameAnimationId = requestAnimationFrame(scrollContent); // 请求下一帧继续滚动
    }

    // 调用方法开始动画
    // useEffect(() => {
    //     startAnimation();
    // }, [paintList]);

    // startAnimation();

    useEffect(() => {
        queryPaint();
        startAnimation();
        //组件销毁时，清除动画
        return () => {
            if (frameAnimationId) {
                cancelAnimationFrame(frameAnimationId);
            }
        }
    }, []);

    return (
        <div className="slide-img-wrap">
            <div className="slide-img-inner-wrap" id="scrollingDiv">

                {paintList.map((item: ImgCardModel, index: number) => {
                    return (
                        <div key={index} className="slide-img-item" >
                            <ImgCard columnWidth={300} model={item} type={ImgPageType.PUBLIC} paint_params={{}} />
                        </div>
                    )
                })}
            </div>
        </div >
    );
}

export default SlidePaint;
