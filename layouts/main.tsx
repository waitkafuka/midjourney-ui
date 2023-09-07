import dynamic from 'next/dynamic'
import Link from 'next/link'
import React, { useEffect, useState } from 'react';
import { Button, Dropdown, Form, Modal, Input, message } from 'antd';
import Head from 'next/head';
import store from '../store'
import type { MenuProps } from 'antd';
import { setUserInfo } from "../store/userInfo";

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
      name: 'AI 艺术二维码',
      key: 'artqrcode',
      icon: <i className='iconfont icon-erweima'></i>,
      path: '/art/qrcode/',
      target: "_blank",
    },
    // {
    //   name: '七夕玫瑰二维码（限定）',
    //   key: 'artqrcode77',
    //   icon: <i className='iconfont icon-meiguihua'></i>,
    //   path: '/art/77/',
    //   target: "_blank",
    // },
    {
      name: '教程',
      key: "guideParent",
      icon: <BulbOutlined />,
      children: [
        {
          key: 'guide',
          path: '/art/guide/',
          target: "_blank",
          name: '入门指引',
          icon: <BulbOutlined />,
        },
        {
          path: '/art/cookbook/',
          target: "_blank",
          name: '参数大全',
          key: 'cookbook',
          icon: <i className='iconfont icon-canshushezhi'></i>,
        }]
    },
    {
      path: '/art/mypaintings/',
      target: '_blank',
      name: '我的作品',
      key: 'mypaintings',
      icon: <i className='iconfont icon-huihua'></i>,
    },
    {
      path: '/art/paintings/',
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
      name: 'ChatAI',
      key: 'chatgpt',
      icon: <i className='iconfont icon-chat'></i>,
    },
    {
      path: '/',
      name: '首届绘画大赛',
      key: 'activityfirst',
      icon: <SketchOutlined />,
      children: [{
        path: '/art/activity/',
        target: "_blank",
        name: '大赛规则',
        key: "activity",
      }, {
        path: '/art/activity-show/',
        target: "_blank",
        name: '结果公示',
        key: "activity-show",
      }]
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
  const [user, setUser] = useState({} as any);
  const [title, setTitle] = useState('superx.chat');
  const [logoSrc, setLogoSrc] = useState('/art/logo.png');
  const [isShowEditFormModal, setIsShowEditFormModal] = useState(false)
  const [nickname, setNickname] = useState('');
  const [powerBy, setPowerBy] = useState('Powered by Midjourney + DALLE2');
  const [items, setItems] = useState<MenuProps['items']>();

  // const user = useSelector((state: any) => state.user.info);


  const noLoginItems: MenuProps['items'] = [
    {
      key: '2',
      label: (
        <Button type="text" block onClick={async () => {
          Router.push('/about');
        }}>
          关于我们
        </Button>
      ),
    },
    {
      key: '3',
      label: (
        <Button type="text" block onClick={async () => {
          Router.push('/contact');
        }}>
          联系我们
        </Button>
      ),
    },



  ];
  let itemsOrigin: MenuProps['items'] = [
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
      key: '4',
      label: (
        <Button type="text" block onClick={async () => {
          Router.push('/about');
        }}>
          关于我们
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
      key: '30',
      label: (
        <Button type="text" block onClick={() => {
          setIsShowEditFormModal(true)
        }}>
          修改昵称
        </Button>
      ),
    },
    {
      key: '40',
      label: (
        <Button type="text" block onClick={() => {
          Router.push('/wx-bind');
        }}>
          绑定微信
        </Button>
      ),
    },
    {
      key: '50',
      label: (
        <Button type="text" block onClick={() => {
          Router.push('/email-bind');
        }}>
          绑定邮箱
        </Button>
      ),
    },

    {
      key: '1',
      label: (
        <Button type="text" block onClick={async () => {
          // debugger;
          // if (user.secret) {
            // 退出登录
            await requestAliyun(`logout`, null, 'GET');
            store.dispatch({
              type: 'user/setUserInfo',
              payload: {}
            })
          // }
        }}>
          退出
        </Button>
      ),
    },

  ];


  store.subscribe(() => {
    let info = store.getState().user.info;
    console.log('info:',info);
    
    setUser(info)
    if (info) {
      setNickname(info.nickname)
    }
    if (info && info.secret) {
      //如果有邮箱，去掉绑定邮箱功能
      if (info.email) {
        itemsOrigin = itemsOrigin?.filter(i => i?.key !== '50')
      }
      //如果有unionid，去掉绑定微信功能
      if (info.unionid) {
        itemsOrigin = itemsOrigin?.filter(i => i?.key !== '40')
      }
      setItems(itemsOrigin);
    } else {
      setItems(itemsOrigin);
    }
  })

  //页面初始化
  useEffect(() => {
    //如果链接中包含ued，就隐藏购买弹窗
    if (window.location.href.indexOf('ued') > -1) {
      setTitle('学科网UED');
      setLogoSrc('/art/logo-xkw.png');
      //隐藏左侧大赛入口、艺术公园等
      ROUTES.routes = [
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
          }]
        },
        {
          name: '教程',
          key: "guideParent",
          icon: <BulbOutlined />,
          children: [
            {
              key: 'guide',
              path: '/art/guide/',
              target: "_blank",
              name: '入门指引',
              icon: <BulbOutlined />,
            },
            {
              path: '/art/cookbook/',
              target: "_blank",
              name: '参数大全',
              key: 'cookbook',
              icon: <i className='iconfont icon-canshushezhi'></i>,
            }]
        },
        {
          path: '/art/mypaintings/',
          target: '_blank',
          name: '我的作品',
          key: 'mypaintings',
          icon: <i className='iconfont icon-huihua'></i>,
        },
      ]

    }

    //如果是ciae，单独制定路由
    if(window.location.href.includes('ciae.superx.chat')){
      setTitle('人工智能创意设计');
      setLogoSrc('/art/logo-ciae.png');
      ROUTES.routes = [
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
          }]
        },
        {
          name: '教程',
          key: "guideParent",
          icon: <BulbOutlined />,
          children: [
            {
              key: 'guide',
              path: '/art/guide/',
              target: "_blank",
              name: '入门指引',
              icon: <BulbOutlined />,
            },
            {
              path: '/art/cookbook/',
              target: "_blank",
              name: '参数大全',
              key: 'cookbook',
              icon: <i className='iconfont icon-canshushezhi'></i>,
            }]
        },
        {
          path: '/art/mypaintings/',
          target: '_blank',
          name: '我的作品',
          key: 'mypaintings',
          icon: <i className='iconfont icon-huihua'></i>,
        },
        {
          path: '/art/paintings/',
          target: '_blank',
          name: '艺术公园',
          key: 'paintings',
          icon: <i className='iconfont icon-fengjing-01'></i>,
        },
    
       
        {
          path: 'https://ciae.net/',
          name: 'CIAE 绘画大赛',
          key: 'activityfirst',
          icon: <SketchOutlined />,
          target: '_blank',
          
        },
        // {
        //   path: 'https://superx.chat/pay/',
        //   target: '_blank',
        //   name: '开通包月',
        //   icon: <ShoppingCartOutlined />,
        // },
      ]
    }

    //如果是sunmen.ai，单独定制路由 design.sunmen.cn
    if(window.location.href.includes('ai.sunmen.cn')){
      setTitle('sunmen.ai');
      setLogoSrc('/art/logo-jf.png');
      setPowerBy('Powered by ai.sunmen.cn')
      ROUTES.routes = [
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
          },{
            path: '/art/sd',
            target: "_blank",
            name: 'Stable Diffusion',
            key: "stablediffusion",
          }, {
            path: '/art/dalle/',
            target: "_blank",
            name: 'DALL·E',
            key: "dalle",
          }]
        },
        {
          name: '教程',
          key: "guideParent",
          icon: <BulbOutlined />,
          children: [
            // {
            //   key: 'guide',
            //   path: '/art/guide/',
            //   target: "_blank",
            //   name: '入门指引',
            //   icon: <BulbOutlined />,
            // },
            {
              path: '/art/cookbook/',
              target: "_blank",
              name: '参数大全',
              key: 'cookbook',
              icon: <i className='iconfont icon-canshushezhi'></i>,
            }]
        },
        {
          path: '/art/mypaintings/',
          target: '_blank',
          name: '我的作品',
          key: 'mypaintings',
          icon: <i className='iconfont icon-huihua'></i>,
        },
        // {
        //   path: '/art/paintings/',
        //   target: '_blank',
        //   name: '艺术公园',
        //   key: 'paintings',
        //   icon: <i className='iconfont icon-fengjing-01'></i>,
        // },
        {
          path: '/',
          target: '_blank',
          name: 'ChatAI',
          key: 'chatgpt',
          icon: <i className='iconfont icon-chat'></i>,
        },
      ]
    }

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
      <Modal
        title="修改昵称"
        style={{ top: 20, width: "500px" }}
        open={isShowEditFormModal}
        destroyOnClose={true}
        closable={true}
        maskClosable={true}
        okText="确定"
        onCancel={() => { setIsShowEditFormModal(false) }}
        footer={[
          <Button key="ok" onClick={() => { setIsShowEditFormModal(false) }}>
            取消
          </Button>,
          <Button key="ok" type="primary" onClick={async () => {
            const result = await requestAliyun(`edit-user`, { nickname });
            if (result.code === 0) {
              const u = result.user;
              store.dispatch(setUserInfo(u || {}))
              setIsShowEditFormModal(false)
            } else {
              message.warning(result.message);
            }
          }}>
            确定
          </Button>,
        ]}
      // footer={null}
      >

        <div style={{ marginTop: "20px", textAlign: "right" }}>
          <Input placeholder="输入一个你喜欢的昵称吧" showCount={true} maxLength={20} value={nickname} onChange={v => {
            setNickname(v.target.value)
          }} />
        </div>
      </Modal>
      <ProConfigProvider
        dark={dark}
        hashed={false}>
        {/* <ProLayout appList={[{
        icon: <GithubFilled></GithubFilled>, title:"superx.chat", url:'https://'
      }]}></ProLayout> */}
        <ProLayout
          logo={logoSrc}
          title={title}
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
                {user && user.secret ? <Dropdown menu={{ items }} placement="top" arrow={{ pointAtCenter: true }}>
                  <Button block>{user.nickname || user.email || '匿名用户'}</Button>
                </Dropdown> : <Dropdown menu={{ items: noLoginItems }} placement="top" arrow={{ pointAtCenter: true }}>
                  <Button block onClick={() => {
                    window.location.href = `/${process.env.NODE_ENV === 'development' ? 'login' : 'login/'}?redirect=/art`
                  }}>
                    登录
                  </Button>
                </Dropdown>}

                <p
                  style={{
                    textAlign: 'center',
                    paddingBlockStart: 12,
                  }}
                >
                  {powerBy}
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
