import { useEffect } from 'react';
import { useRouter } from 'next/router';
import AuthPage from "../components/Auth";
import ImgListPage from "../components/ImgListPage";
import { ImgCardModel, ImgPageType } from '../scripts/types';
import { useAuth } from '../hooks/useAuth';
import { isPCWeChatOrMobileWeChat } from '../utils/app/env';

const MyPaintings: React.FC = () => {
    const { isLoggedIn, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading) {
            console.log('isLoggedIn', isLoggedIn);
            if (!isLoggedIn && !isPCWeChatOrMobileWeChat()) {
                window.location.href = `/login?redirect=${encodeURIComponent('/art/mypaintings/')}`; // 跳转到登录页面
            }
        }
    }, [isLoggedIn, loading]);

    if (loading) {
        return <div>Loading...</div>; // 或者可以返回一个加载中的状态
    }

    if (!isLoggedIn) {
        return null; // 或者可以返回一个加载中的状态
    }

    return <>
        <AuthPage hidePage={true}></AuthPage>
        <ImgListPage type={ImgPageType.MY} />
    </>;
}

export default MyPaintings;
