
import type { AppProps } from 'next/app';
import MainLayout from '../layouts/main'
import '../public/antd.min.css';
import '../styles/globals.scss'
import { Provider } from "react-redux";
import store from '../store'
import withTheme from '../theme';
import { notification, ConfigProvider, theme } from 'antd';
import { useEffect } from 'react';
import { requestAliyun } from "../request/http";
import { useSelector, useDispatch } from 'react-redux';
import { setUserInfo } from '../store/userInfo';

export default function App({ Component, pageProps }: AppProps) {
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

  useEffect(() => {
    getUserInfo();
  }, [])

  return (<Provider store={store}>
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#000000',
        },
      }}
    >
      {withTheme(
        MainLayout(<Component {...pageProps} />)
      )}
    </ConfigProvider>
  </Provider>
  )

}
