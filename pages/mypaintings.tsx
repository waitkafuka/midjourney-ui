import AuthPage from "../components/Auth";
import ImgListPage from "../components/ImgListPage";
import { ImgCardModel, ImgPageType } from '../scripts/types'

const MyPaintings: React.FC = () => {
    return <>
        <AuthPage hidePage={true}></AuthPage>
        <ImgListPage type={ImgPageType.MY} />
    </>;
}

export default MyPaintings;
