import ImgListPage from "../components/ImgListPage";
import { ImgCardModel, ImgPageType } from '../scripts/types'

const Paintings: React.FC = () => {
    return <ImgListPage type={ImgPageType.PUBLIC} />;
}

export default Paintings;
