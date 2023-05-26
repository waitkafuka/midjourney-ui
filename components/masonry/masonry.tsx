import ImgCard from './imgCard';
import { ImgCardModel, ImgPageType } from '../../scripts/types'
import { use, useEffect, useMemo, useState, useRef } from 'react'
import css from './masonry.module.scss'
import { Spin } from 'antd';
import Link from 'next/link'
import { useSelector } from 'react-redux';

interface Props {
    list: ImgCardModel[],
    onPageRequest: () => void,
    isDataLoading: boolean,
    totalCount: number,
    onImgDeleted: (id: number) => void,
    style: React.CSSProperties,
    type: ImgPageType,
}

const columnWidth = 300;
const gap = 20;
let timer: NodeJS.Timeout | null = null;

const App = ({ type, list, onPageRequest, onImgDeleted, isDataLoading, totalCount, style }: Props) => {
    const [columns, setColumns] = useState(0);
    const [maxColumnHeight, setMaxColumnHeight] = useState(0);
    const user = useSelector((state: any) => state.user.info);
    //加个ref，这是为了解决在scroll事件中无法获取到最新的state的值
    const hasMoreRef = useRef(true);


    const recalcColumns = () => {
        //获取容器的宽度
        const wrap = document.querySelector('.masonry-list-wrapper') as HTMLDivElement;
        let containerWidth = wrap?.offsetWidth;
        //两边留 20px 的间距
        containerWidth = containerWidth ? containerWidth - (gap * 2) : 0;
        //计算列数
        const columns = Math.floor(containerWidth / (columnWidth + gap));
        setColumns(columns);
    }
    const adjustPosition = () => {
        // 获取所有要排列的元素
        const items = document.querySelectorAll('.masonry-item');
        // 初始化每一列的高度
        let columnHeights = new Array(columns).fill(0);
        // 遍历所有元素
        items.forEach(item => {
            const ele = item as HTMLDivElement;
            // 找到高度最小的列
            const minHeight = Math.min(...columnHeights);
            const columnIndex = columnHeights.indexOf(minHeight);

            // 计算元素的 left 和 top 值
            const left = columnIndex * (columnWidth + gap) + gap;
            const top = columnHeights[columnIndex];

            // 设置元素的样式
            //解决闪动问题，只在left和top都变化时才设置样式
            if (ele.style.left !== `${left}px` || ele.style.top !== `${top}px`) {
                ele.style.left = `${left}px`;
                ele.style.top = `${top}px`;
            }

            // 更新列高度
            columnHeights[columnIndex] += (ele.offsetHeight + gap);
            setMaxColumnHeight(Math.max(...columnHeights));
        });
    }

    //页面初始化
    useEffect(() => {
        //监听屏幕宽度变化事件
        window.addEventListener('resize', () => {
            recalcColumns();
        })

        recalcColumns();

        const scrollWrapper = document.querySelector('.masonry-list-wrapper') as HTMLDivElement;
        const requestMore = () => {
            // 处理滚动事件的代码
            //检测body是否滚动到底部
            const scrollTop = scrollWrapper.scrollTop;
            const scrollHeight = scrollWrapper.scrollHeight;
            const clientHeight = scrollWrapper.clientHeight;

            // console.log('scrolling,', scrollTop, clientHeight, scrollHeight);
            // console.log((scrollTop + clientHeight));
            // console.log((scrollHeight - 100));
            // console.log(hasMoreRef.current);

            if (((scrollTop + clientHeight) >= (scrollHeight - 100)) && hasMoreRef.current) {
                // console.log('scrolling,到底部了');
                onPageRequest();
            }
        };

        // 添加滚动事件的侦听器
        scrollWrapper.addEventListener('scroll', requestMore);

        // 在路由切换时删除滚动事件的侦听器
        return () => {
            scrollWrapper.removeEventListener('scroll', requestMore);
        };
    }, []);

    useEffect(() => {
        //首次加载不需要调整位置
        if (columns === 0) return;
        adjustPosition();
    }, [columns])

    const containerWidth = useMemo(() => {
        return columns * (columnWidth + gap) + gap;
    }, [columns])

    //是否还有更多数据
    const hasMore = useMemo(() => {
        let isMore = totalCount > list.length
        hasMoreRef.current = isMore;
        return isMore;
    }, [totalCount, list])

    // 数据加载，重新布局样式
    useEffect(() => {
        adjustPosition();
    }, [list])


    return <>
        {/* style={{ height: "calc(100vh - 56px)" }} */}
        {/* 未登录，我的页面显示登录按钮 */}
        {!isDataLoading && <> {type === ImgPageType.MY && (!user || !user.email) && <div className={css['no-more-tips']}>您还未登录，请先<a href={`/${process.env.NODE_ENV === 'development' ? 'login' : 'login.html'}?redirect=/mj`}> 登录 </a>  </div>}
            {type === ImgPageType.MY && (user.email) && list.length === 0 && <div className={css['no-more-tips']}>暂无数据，<Link href='/'> 开始绘画！ </Link>  </div>}
            {type === ImgPageType.PUBLIC && list.length === 0 && <div className={css['no-more-tips']}>暂无数据，<Link href='/'> 开始绘画！ </Link>  </div>}
        </>}
        <div className="masonry-list-wrapper" style={{ height: "calc(100vh - 56px - 15px)", overflow: "scroll", boxSizing: "border-box", paddingTop: '20px', ...style, }}>
            {/* height: `${maxColumnHeight}px` */}
            <><div className={css["masonry-list-container"]} style={{ width: `${containerWidth}px`, height: `${maxColumnHeight}px`, minHeight: "100vh" }}>
                {list.map((imgCardInfo: ImgCardModel) => <ImgCard type={type} onImgDeleted={onImgDeleted} key={imgCardInfo.id} model={imgCardInfo} columnWidth={columnWidth} />)}
            </div>
                {isDataLoading && <div className='loaing-box' style={{ textAlign: 'center', padding: "15px" }}>
                    <Spin></Spin>
                </div>}
                {!hasMore && !isDataLoading && totalCount !== 0 && <div className={css['no-more-tips']}>没有更多了</div>}</>
        </div >
    </>
};

export default App;
