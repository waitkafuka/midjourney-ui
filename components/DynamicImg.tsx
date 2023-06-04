import { Spin } from "antd";
import { useEffect, useState } from "react";

interface DynamicImgProps {
    src: string,
    style?: React.CSSProperties,
    onClick?: () => void
}

//由于setstate是异步的，所以需要一个变量来判断是否正在请求数据
const DynamicImg = ({ src, style, onClick }: DynamicImgProps) => {

    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        console.log("2");
        setIsLoading(true);
    }, [src]);
    useEffect(() => {
        console.log("3");
        console.log('isLoading', isLoading);

    }, [isLoading])

    return <>
        <div style={style}>
            <img src={src} alt="" style={style} onClick={onClick} />
            {/* <img src={src} alt="" style={{ display: "none" }} onLoad={p => {
                console.log("1", p);
                setIsLoading(false);
            }} /> */}

        </div>


    </>
};

export default DynamicImg;
