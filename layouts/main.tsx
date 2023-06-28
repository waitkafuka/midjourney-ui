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
  SketchOutlined,
  SendOutlined,
  WechatOutlined,
  BulbOutlined,
  PictureOutlined,
  ShoppingCartOutlined
} from '@ant-design/icons'

import { Route, MenuDataItem, WithFalse } from '@ant-design/pro-layout/lib/typing'
import { PageContainer, ProConfigProvider } from '@ant-design/pro-components';
import { requestAliyun } from '../request/http';
import Router from "next/router";
const ProLayout = dynamic(() => import('@ant-design/pro-layout'), {
  ssr: false,
})

const ROUTES: Route = {
  routes: [
    {
      path: '/art/',
      name: '开始绘画',
      icon: <SendOutlined />,
      key: 'start',
      flatMenu: false,
      children: [{
        path: '/art/',
        target: "_blank",
        name: 'Midjourney',
        key: "midjourney",
      }, {
        path: '/art/sd',
        target: "_blank",
        name: 'Stable Diffusion',
        key: "stablediffusion",
      }, {
        path: '/art/dalle/',
        target: "_blank",
        name: 'DALL·E',
        key: "dalle",
      },]
    },
    {
      name: '教程',
      key: "guideParent",
      icon: <BulbOutlined />,
      children: [
        {
          key: 'guide',
          path: '/art/guide',
          target: "_blank",
          name: '入门指引',
          icon: <BulbOutlined />,
        },
        {
          path: '/art/cookbook',
          target: "_blank",
          name: '参数大全',
          key: 'cookbook',
          icon: <i className='iconfont icon-canshushezhi'></i>,
        }]
    },
    {
      path: '/art/mypaintings',
      target: '_blank',
      name: '我的作品',
      key: 'mypaintings',
      icon: <i className='iconfont icon-huihua'></i>,
    },
    {
      path: '/art/paintings',
      target: '_blank',
      name: '艺术公园',
      key: 'paintings',
      icon: <i className='iconfont icon-fengjing-01'></i>,
    },

    // {
    //   path: '/guide',
    //   name: '入门指引',
    //   icon: <BulbOutlined />,
    // },
    // {
    //   path: '/cookbook',
    //   name: '参数大全',
    //   icon: <i className='iconfont icon-canshushezhi'></i>,
    // },
    {
      path: '/',
      target: '_blank',
      name: 'ChatGPT',
      key: 'chatgpt',
      icon: <WechatOutlined />,
    },
    {
      path: '/art/activity',
      target: "_blank",
      name: '首届绘画大赛',
      key: 'activity',
      icon: <SketchOutlined />,
    },
    // {
    //   path: 'https://superx.chat/pay/',
    //   target: '_blank',
    //   name: '开通包月',
    //   icon: <ShoppingCartOutlined />,
    // },
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
  const [openKeys, setOpenKeys] = useState<WithFalse<string[]>>(['start']);
  const [dark, setDark] = useState(false);
  const [logo, setLogo] = useState('/art/logo.png');
  const [user, setUser] = useState({} as any);
  // const user = useSelector((state: any) => state.user.info);
  store.subscribe(() => {
    setUser(store.getState().user.info)
  })

  useEffect(() => {
    const domain = window.location.host;
    //如果域名是superx360.com，去掉ROUTES中的chatgpt
    if (domain.includes('superx360.com') || domain.includes('superx.chat')) {
      setLogo('//cdn.superx.chat/stuff/superx360-logo1.png');
      ROUTES.routes = ROUTES.routes.filter((item: any) => {
        return item.key !== 'chatgpt'
      })
    }
  }, [])



  const items: MenuProps['items'] = [
    // {
    //   key: '2',
    //   label: (
    //     <Button type="text" block onClick={async () => {
    //       window.location.href = `https://superx.chat/pay/?email=${user.email}`;
    //     }}>
    //       开通包月
    //     </Button>
    //   ),
    // },
    {
      key: '3',
      label: (
        <Button type="text" block onClick={async () => {
          store.dispatch({
            type: 'user/setIsShowBuyPointDialog',
            payload: true
          })
        }}>
          购买点数
        </Button>
      ),
    },
    {
      key: '2',
      label: (
        <Button type="text" block onClick={async () => {
          Router.push('/contact');
        }}>
          联系我们
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

  //页面初始化
  useEffect(() => {
    setOpenKeys(['start']);
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
      <ProConfigProvider
        dark={dark}
        hashed={false}>
        {/* <ProLayout appList={[{
        icon: <GithubFilled></GithubFilled>, title:"superx.chat", url:'https://'
      }]}></ProLayout> */}
        <ProLayout
          logo={logo}
          title="superx.chat"
          style={{ minHeight: '100vh' }}
          route={ROUTES}
          openKeys={openKeys}
          // defaultOpenKeys={['start']}
          onOpenChange={(keys) => {
            setOpenKeys(keys);
          }}
          // defaultOpenKeys={openKeys}
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
                  window.location.href = `/${process.env.NODE_ENV === 'development' ? 'login' : 'login/'}?redirect=/art`
                }}>
                  登录
                </Button>}

                <p
                  style={{
                    textAlign: 'center',
                    paddingBlockStart: 12,
                  }}
                >
                  Power by Midjourney + DALLE2
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
