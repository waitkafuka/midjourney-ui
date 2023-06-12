
import type { AppProps } from 'next/app';
import MainLayout from '../layouts/main'
import '../public/antd.min.css';
import '../styles/globals.scss'
import { Provider } from "react-redux";
import store from '../store'
import withTheme from '../theme';
import { notification, ConfigProvider, theme } from 'antd';
import { useEffect } from 'react';
import { requestAliyun, requestAliyunArt } from "../request/http";
import { useSelector, useDispatch } from 'react-redux';
import { setUserInfo } from '../store/userInfo';
import { useRouter } from 'next/router';
import { KeepAliveProvider } from 'next-easy-keepalive';
import Head from 'next/head';

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
    const data = await requestAliyunArt('my-thumb-up-list', null, 'GET');

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

  return (
    <>
      <Head>
        <title>AI绘画, Midjourney绘画, 人工智能绘画</title>
        <meta name="keywords" content="AI绘画, Midjourney绘画, 人工智能绘画, Dalle 绘画, Stable Diffusion" />
        <meta name="description" content="AI绘画, Midjourney绘画, 人工智能绘画, Stable Diffusion。使用人工智能+描述词画出你想要绘制的图像。" />
        <meta
          name="viewport"
          content="width=device-width,minimum-scale=1.0,maximum-scale=1.0,user-scalable=no"
        />
      </Head>
      <Provider store={store}>
        <KeepAliveProvider router={router}>
          {withTheme(
            MainLayout(<Component {...pageProps} />)
          )}
        </KeepAliveProvider>
      </Provider>
    </>
  )

}
