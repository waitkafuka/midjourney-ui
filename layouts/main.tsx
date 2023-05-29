import dynamic from 'next/dynamic'
import Link from 'next/link'
import React, { useEffect, useState } from 'react';
import { Button, Dropdown } from 'antd';
import Head from 'next/head';
import store from '../store'
import type { MenuProps } from 'antd';

import {
  SmileOutlined,
  GithubFilled,
  PictureFilled,
  SendOutlined,
  WechatOutlined,
  BulbOutlined,
  PictureOutlined
} from '@ant-design/icons'

import { Route, MenuDataItem } from '@ant-design/pro-layout/lib/typing'
import { PageContainer, ProConfigProvider } from '@ant-design/pro-components';
import { requestAliyun } from '../request/http';
const ProLayout = dynamic(() => import('@ant-design/pro-layout'), {
  ssr: false,
})

const ROUTES: Route = {
  routes: [
    {
      path: '/',
      name: '开始绘画',
      icon: <SendOutlined />,
    },
    {
      path: '/mypaintings',
      name: '我的作品',
      icon: <i className='iconfont icon-huihua'></i>,
    },
    // {
    //   path: '/paintings',
    //   name: '艺术公园',
    //   icon: <i className='iconfont icon-fengjing-01'></i>,
    // },
    {
      path: '/guide',
      name: '入门指引',
      icon: <BulbOutlined />,
    },
    {
      path: 'https://superx.chat/',
      target: '_blank',
      name: 'ChatGPT',
      icon: <WechatOutlined />,
    },
  ],
}

const menuHeaderRender = (
  logo: React.ReactNode,
  title: React.ReactNode,
) => (
  <Link href="/">
    {logo}
    {title}
  </Link>
)

const menuItemRender = (options: MenuDataItem, element: React.ReactNode) => (
  <>
    {options.target ?
      <a target='_blank' href={(options.path) ?? '/'} onClick={() => {
        // if (options.target) {
        //   window.location.href = options.target ?? '/';
        // }
      }}>
        {element}
      </a> :
      <Link href={(options.path) ?? '/'} onClick={() => {
        // if (options.target) {
        //   window.location.href = options.target ?? '/';
        // }
      }}>
        {element}
      </Link>}
  </>
)

export default function Main(children: JSX.Element) {
  const [dark, setDark] = useState(false);
  const [user, setUser] = useState({} as any);
  // const user = useSelector((state: any) => state.user.info);
  store.subscribe(() => {
    setUser(store.getState().user.info)

  })

  const items: MenuProps['items'] = [
    {
      key: '2',
      label: (
        <Button type="text" block onClick={async () => {
          window.location.href = `https://superx.chat/pay.html?email=${user.email}`;
        }}>
          开通包月
        </Button>
      ),
    },
    {
      key: '1',
      label: (
        <Button type="text" block onClick={async () => {
          if (user.email) {
            // 退出登录
            await requestAliyun(`logout`, null, 'GET');
            store.dispatch({
              type: 'user/setUserInfo',
              payload: {}
            })
          }
        }}>
          退出
        </Button>
      ),
    },

  ];
  useEffect(() => {
    // Check the theme when the user first visits the page
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setDark(true);
    } else {
      setDark(false);
    }
    // Monitor the change of the theme of the system
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
      if (e.matches) {
        setDark(true);
      } else {
        setDark(false);
      }
    });
  }, []);

  return (
    <>
      <Head>
        <meta
          name="description"
          content="ChatGPT原版镜像。国内可快速访问。比官方ChatGPT更好用，速度更快，错误更少，模型能力完全一致。"
        />
        <meta
          name="keywords"
          content="ChatGPT,国内ChatGPT,ChatGPT免注册,ChatGPT在线体验,ChatGPT免登录,ChatGPT镜像,ChatGPT国内镜像"
        />
        <meta
          name="viewport"
          content="width=device-width,minimum-scale=1.0,maximum-scale=1.0,user-scalable=no"
        />
      </Head>
      <ProConfigProvider
        dark={dark}
        hashed={false}>
        {/* <ProLayout appList={[{
        icon: <GithubFilled></GithubFilled>, title:"superx.chat", url:'https://'
      }]}></ProLayout> */}
        <ProLayout
          logo={"/art/logo.png"}
          title="superx.chat"
          style={{ minHeight: '100vh' }}
          route={ROUTES}
          // avatarProps={{
          //   src: 'logo.png',
          //   title: 'superx.chat',
          // }}
          onMenuHeaderClick={() => {
            window.location.href = '/';
          }}
          actionsRender={(props) => {
            if (props.isMobile) return [];
            return [
              // <Link href="https://superx.chat/login" key="about">
              //   登录
              //   {/* <GithubFilled  style={{
              //   fontSize: 24,
              //  }}/> */}
              // </Link>,
            ];
          }}

          menuItemRender={menuItemRender}
          menuFooterRender={(props) => {
            if (props?.collapsed) return undefined;
            return (
              <>
                {user && user.email ? <Dropdown menu={{ items }} placement="top" arrow={{ pointAtCenter: true }}>
                  <Button block>{user.email}</Button>
                </Dropdown> : <Button block onClick={() => {
                  window.location.href = `/${process.env.NODE_ENV === 'development' ? 'login' : 'login.html'}?redirect=/uedmj`
                }}>
                  登录
                </Button>}

                <p
                  style={{
                    textAlign: 'center',
                    paddingBlockStart: 12,
                  }}
                >
                  Power by Midjourney
                </p>
              </>
            );
          }}
          menuHeaderRender={menuHeaderRender}
        >
          {children}
        </ProLayout>
      </ProConfigProvider >
    </>
  )
}
