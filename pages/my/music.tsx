import AuthPage from "../../components/Auth";
import MusicListPage from "../../components/MusicListPage";
import { ImgCardModel, MusicPageType } from '../../scripts/types'

const MyThumbup: React.FC = () => {
    return <>
        <AuthPage hidePage={true}></AuthPage>
        <MusicListPage type={MusicPageType.MY} />
    </>;
}

export default MyThumbup;
