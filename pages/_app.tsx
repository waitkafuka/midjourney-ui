
import type { AppProps } from 'next/app';
import MainLayout from '../layouts/main'
import '../public/antd.min.css';
import '../styles/globals.scss'
import { Provider } from "react-redux";
import store from '../store'
import withTheme from '../theme';
import { notification, ConfigProvider, theme } from 'antd';
import { useEffect } from 'react';
import { requestAliyun, requestAliyunMJ } from "../request/http";
import { useSelector, useDispatch } from 'react-redux';
import { setUserInfo } from '../store/userInfo';
import { useRouter } from 'next/router';
import { KeepAliveProvider } from 'next-easy-keepalive';

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  notification.config({
    placement: 'top',
    duration: 5,
    // rtl: true,
  })
  //获取用户信息
  const getUserInfo = async () => {
    const data = await requestAliyun('userinfo', null, 'GET');
    store.dispatch(setUserInfo(data.user || {}))
    // dispatch(setUserInfo(data.user || {}))
  };

  // 获取用户点赞列表
  const getThumbUpList = async () => {
    const data = await requestAliyunMJ('my-thumb-up-list', null, 'GET');
    console.log('getThumbUpList', data);

    if (data.code == 0) {
      store.dispatch({
        type: 'user/setThumbUpList',
        payload: data.data.rows.map((item: any) => item.img_id)
      })
    };

  }

  useEffect(() => {
    getUserInfo();
    getThumbUpList();
  }, [])

  return (<Provider store={store}>
    <KeepAliveProvider router={router}>
      {withTheme(
        MainLayout(<Component {...pageProps} />)
      )}
    </KeepAliveProvider>
  </Provider>
  )

}
