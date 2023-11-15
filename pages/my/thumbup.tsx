import AuthPage from "../../components/Auth";
import ImgListPage from "../../components/ImgListPage";
import { ImgCardModel, ImgPageType } from '../../scripts/types'

const MyThumbup: React.FC = () => {
    return <>
        <AuthPage hidePage={true}></AuthPage>
        <ImgListPage type={ImgPageType.MY_THUMB_UP_LIST} />
    </>;
}

export default MyThumbup;
