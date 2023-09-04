import { useEffect } from "react";
import ImgListPage from "../components/ImgListPage";
import { ImgCardModel, ImgPageType } from '../scripts/types'
import { getQueryString } from "../scripts/utils";

const Paintings: React.FC = () => {
    const setBDVid = () => {
        //从链接中取出bd_vid参数
        // const url = new URL(window.location.href);
        const bd_vid = getQueryString('bd_vid');
        if (bd_vid) {
            localStorage.setItem('bd_vid', bd_vid);
        }

        const qhclickid = getQueryString('qhclickid');
        if (qhclickid) {
            localStorage.setItem('qhclickid', qhclickid);
        }
    }

    useEffect(() => {
        setBDVid();
    }, [])

    return <ImgListPage type={ImgPageType.PUBLIC} />;
}

export default Paintings;
