import ImgListPage from "../components/ImgListPage";
import { ImgCardModel, ImgPageType } from '../scripts/types'

const MyPaintings: React.FC = () => {
    return <ImgListPage type={ImgPageType.MY} />;
}

export default MyPaintings;
