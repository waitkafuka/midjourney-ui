import ImgListPage from "../components/ImgListPage";
import { ImgCardModel, ImgPageType } from '../scripts/types'
import { getQueryString } from "../scripts/utils";

const QrCode: React.FC = () => {
    const setBDVid = (vid: string) => {
        //从链接中取出bd_vid参数
        // const url = new URL(window.location.href);
        const bd_vid = getQueryString('bd_vid');
        if (bd_vid) {
            localStorage.setItem('bd_vid', bd_vid);
        }
    }

    return <div>dw</div>
}

export default QrCode;
