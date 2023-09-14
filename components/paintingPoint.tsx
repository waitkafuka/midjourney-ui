import React, { useEffect, useState } from 'react';
import { Input, Button, List, Image, Typography, Modal, message } from 'antd';
import { requestAliyun, requestAliyunArt } from '../request/http';
import Masonry from '../components/masonry/masonry';
import { ImgCardModel, ImgPageType } from '../scripts/types';
import QRCode from 'qrcode';
import { useSelector } from 'react-redux';
import store from '../store';
import { setUserInfo } from '../store/userInfo';
import { getQueryString } from '../scripts/utils';
import { QRCODE_COST } from '../scripts/config';
import AuthPage from './Auth';
import { getDeviceType, isMobileWeChat } from '../utils/app/env';
const appId = 'wx924c1cf2d94b4258';
declare let WeixinJSBridge: any;

interface ImgListPageProps {
  type: ImgPageType;
}

interface OrderParams {
  pkgId: number;
  secret: string;
  buyCount: number;
  inviter?: string;
  channel?: string;
  openid?: string;
  orderType: string;
  deviceType?: 'android' | 'ios' | 'pc';
}

//由于setstate是异步的，所以需要一个变量来判断是否正在请求数据
const PaingPoint = ({ }) => {
  const [qrCodeSrc, setQrCodeSrc] = useState<string>('');
  const user = useSelector((state: any) => state.user.info);
  const [price, setPrice] = useState<string>('68');
  const [qrcodeCost, setQrcodeCost] = useState<number>(QRCODE_COST);
  const isShowBuyPointDialog = useSelector((state: any) => state.user.isShowBuyPointDialog);
  const [pricePoint, setPricePoint] = useState('1000');
  const [pkgs, setPkgs] = useState<any>([]);
  const [currentId, setCurrentId] = useState<number>(0);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [apiReuesting, setApiRequesting] = useState<boolean>(false);
  const [isShowPaying, setIsShowPaying] = useState<boolean>(true);
  //从链接中取出u 参数
  const u = localStorage.getItem('u');
  let pullTimer: NodeJS.Timer;

  //定义方法，获取套餐
  const getPkgs = async function () {
    //获取host
    let href = window.location.href;
    //定义一个特殊 host 数组
    const specialHost = ['ai.sunmen.cn'];
    //如果host不在数组中，host设置为all
    //判断href中是否有包含specialHost中的host
    let host = 'all';
    specialHost.forEach((item) => {
      if (href.indexOf(item) > -1) {
        host = item;
      }
    });
    const result = await requestAliyun(`get-pkg-list?host=${host}&pkg_type=1`, null, 'GET');
    setPkgs(result);
    setModalQrcode(result[0].id);
  }

  const setModalQrcode = async (pkgId: number) => {
    // let pkgId = 10;
    // //如果是测试链接，ID 改为 13
    // if (window.location.href.indexOf('art.yczktek.com') > -1) {
    //   setPrice('98');
    //   pkgId = 13;
    // } else if (window.location.href.indexOf('superx360.com') > -1) {
    //   setPrice('68');
    //   pkgId = 10;
    // } else if (window.location.href.indexOf('chat.yczktek.com') > -1) {
    //   setPrice('68');
    //   pkgId = 10;
    // } else if (window.location.href.indexOf('ai.sunmen.cn') > -1) {
    //   setPrice('799');
    //   setPricePoint('3000')
    //   pkgId = 21;
    // }

    //获取用户邮箱
    const secret = user.secret;
    if (!secret) {
      // message.error('请先登录');
      // setTimeout(() => {
      // window.location.href = '/login';
      return;
      // }, 1000);
    }
    setCurrentId(pkgId);
    const base64Url = await QRCode.toDataURL(`https://${process.env.NODE_ENV === 'development' ? 'nat.youyi.asia' : 'superx.chat'}/pay/?channel=${window.location.host}${window.location.pathname}&u=${u}&secret=${secret}&pkgId=${pkgId}&bd_vid=${localStorage.getItem('bd_vid') || ''}&qhclickid=${localStorage.getItem('qhclickid') || ''}`);
    setQrCodeSrc(base64Url);
  };

  const showBuyModal = async () => {
    if (!user.secret) {
      //没有登录的时候跳转到登录页面
      window.location.href = `/login?redirect=${encodeURIComponent(`/art?bd_vid=${getQueryString('bd_vid')}`)}`;
      return;
    }
    setModalQrcode(pkgs[0].id);
    store.dispatch({
      type: 'user/setIsShowBuyPointDialog',
      payload: true,
    });
  };

  const callPay = function ({ timeStamp, nonceStr, packageStr, paySign }: { timeStamp: string, nonceStr: string, packageStr: string, paySign: string }) {
    const param = {
      appId,     //公众号ID，由商户传入     
      timeStamp: String(timeStamp),     //时间戳，自1970年以来的秒数     
      nonceStr,      //随机串     
      package: packageStr,
      signType: "RSA",     //微信签名方式：     
      paySign //微信签名 
    }
    setIsShowPaying(false);
    WeixinJSBridge.invoke('getBrandWCPayRequest', param,
      function (res: any) {
        stopPullOrderState();
        if (res.err_msg == "get_brand_wcpay_request:ok") {
          // 使用以上方式判断前端返回,微信团队郑重提示：
          //res.err_msg将在用户支付成功后返回ok，但并不保证它绝对可靠。
        }
      });
  }

  //查询订单支付状态
  const queryOrderStatus = async function (orderNo: string) {
    const result = await requestAliyun('query-order-status', { out_trade_no: orderNo });
    if (result && result.trade_state === 'SUCCESS') {
      localStorage.removeItem('bd_vid')
      store.dispatch({
        type: 'user/setIsShowBuyPointDialog',
        payload: false,
      });
      getUserInfo();
    }
    return result;
  }

  //轮询订单状态
  const startPullOrderState = function (orderNo: string) {
    pullTimer = setInterval(async () => {
      let result = await queryOrderStatus(orderNo);
      if (result && result.trade_state === 'SUCCESS') {
        //关闭弹窗
        store.dispatch({
          type: 'user/setIsShowBuyPointDialog',
          payload: false,
        });
        //重新获取用户信息
        getUserInfo();
        stopPullOrderState();
      }
    }, 1000)
  }

  //停止轮询订单状态
  const stopPullOrderState = function () {
    clearInterval(pullTimer);
  }

  //直接创建微信订单，并拉起支付
  const createAndCallWechatPay = async function (params: OrderParams) {
    if (isMobileWeChat()) {
      const openid = localStorage.getItem('openid');
      if (!openid) {
        message.error('获取openid失败，请刷新页面重试');
        return;
      }
      //创建订单
      params.openid = openid;
      params.orderType = 'jsapi';
      setApiRequesting(true);
      const result = await requestAliyun('create-order', params);
      console.log('result:', result);
      if (result.code !== 0) {
        message.error('创建订单失败，请稍后重试');
        console.log('创建订单失败:', result);
      } else {
        const out_trade_no = result.out_trade_no;
        // 获取签名
        const signObj = await requestAliyun('get-jsapi-sign', { package: `prepay_id=${result.prepay_id}` })
        callPay(signObj);
        //轮询订单状态
        startPullOrderState(out_trade_no);
      }

      setApiRequesting(false);
      return;
    }
  }

  //拉起微信支付
  const callWxPay = async () => {
    if (!isMobileWeChat()) {
      const href = window.location.href;
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(href);
      }
      message.warning(`请在微信中打开链接：${href}（链接已复制，直接粘贴即可）`, 10);
      return;
    }
    //创建微信订单
    const callPayParams: OrderParams = {
      pkgId: currentId,
      secret: user.secret,
      buyCount: 1,
      orderType: 'jsapi',
    };
    createAndCallWechatPay(callPayParams);
  }

  useEffect(() => {
    if (isShowBuyPointDialog) {
      if (!user.secret) {
        //没有登录的时候跳转到登录页面
        window.location.href = `/login?redirect=${encodeURIComponent(`/art?bd_vid=${getQueryString('bd_vid')}`)}`;
      }
    }
  }, [isShowBuyPointDialog]);

  //获取用户信息，在支付完成后重新查询点数
  const getUserInfo = async () => {
    const data = await requestAliyun('userinfo', null, 'GET');
    store.dispatch(setUserInfo(data.user || {}));
    store.dispatch({
      type: 'user/setIsShowBuyPointDialog',
      payload: false,
    });
    //支付完成后，清除bd_vid和u
    if (data.user.point_count >= 1000) {
      console.log('支付成功');
      localStorage.removeItem('bd_vid');
      localStorage.removeItem('qhclickid');
      localStorage.removeItem('u');
    }

    // dispatch(setUserInfo(data.user || {}))
  };

  // useEffect(() => {
  //   setModalQrcode(pkgs[0].id)
  // }, [user]);

  //页面初始化
  useEffect(() => {
    const device = getDeviceType();
    if (device !== 'pc') {
      setIsMobile(true);
    }
    getPkgs();
  }, []);

  return (
    <div className=''>
      <AuthPage hidePage={true}></AuthPage>
      <Modal
        title='购买点数'
        style={{ top: 20, }}
        width={731}
        open={isShowBuyPointDialog}
        destroyOnClose={true}
        closable={true}
        // cancelText='取消'
        maskClosable={false}
        onCancel={() => {
          store.dispatch({
            type: 'user/setIsShowBuyPointDialog',
            payload: false,
          });
          stopPullOrderState();
        }}

        // okText='支付完成'
        // onOk={getUserInfo}
        footer={isMobile ? null : <div className='pay-dialog-footer-wrap'>
          <Button onClick={() => {
            store.dispatch({
              type: 'user/setIsShowBuyPointDialog',
              payload: false,
            });
            getUserInfo();
            stopPullOrderState();
          }}>取消</Button>
          <Button type="primary" onClick={getUserInfo}>支付完成</Button>
        </div>}
      >
        {/* 旧版的支付，单套餐 */}
        <div className='buy-code-wrap-multiple' style={{ display: 'none', }}>
          {/* 二维码 */}
          <div className='buy-code-box'>
            <img src={qrCodeSrc} />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img style={{ marginRight: '5px', width: '20px' }} src='https://c.superx.chat/wechatlogo.png' />
              请使用微信扫码支付
            </div>
          </div>
          {/* 描述 */}
          <div className='buy-code-desc' style={{ flexGrow: 1, lineHeight: 1.6, textAlign: 'center', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
            <div>{pricePoint} 个点数 / {price} 元</div>
            <div>可应用于 Stable Diffusion、Midjourney、DALLE、AI 艺术二维码，点数永久有效。</div>
            <div>每张图消耗 8 个点数，变体 4 个点数，获取单张高清图 2 个点数。（SD 根据参数消耗不同点数，AI 艺术二维码 {qrcodeCost} 点数/每张）</div>
            <div>（ midjourney四宫格算一张图）</div>
          </div>
        </div>
        {/* 新版的支付，多套餐 */}
        <div className='buy-code-wrap-multiple'>
          {/* 楼层 1 */}
          <div className='qrcode-select-wrap'>
            {
              pkgs.map((item: any) => {
                return <div key={item.id} className={`pkg-select-button ${currentId === item.id ? 'active' : ''}`} onClick={() => {
                  setPrice(item.price);
                  setPricePoint(item.paint_point);
                  setModalQrcode(item.id);
                }}> <div className='point-box'>{item.paint_point}点数</div>
                  <div className='price-box'>￥ {Math.floor(item.price)}</div>
                  <img className='check-png black' src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAABGdBTUEAALGPC/xhBQAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAFKADAAQAAAABAAAAFAAAAACRFdLHAAABm0lEQVQ4EaWUPUvDUBSGGxWUCuLgYpdSBF3cxMk6KyL4sXVUEDopOgg62MF/4Ori4qCT9j90CwQc7FIcOwgiVAQdND5v2lsTvUlLc+DJPfd8vLnJvYmTGdB83y/QugULkINJyDtc+jZEpijehzVowh3U5DuO80bexe9tFGahAh6UIGvrIt5bkKJteIAyjNiETIy8G1tAUq/jDPSOijxSyzQmjUO2JGKjxG9Aj7bZr5hNK6OVwS3sWQsSgvS4thXqMZ9Y1WVCb5BCYBxOYMZaS0IbUAXbjSI9qoF7kB0qyfi7y0x0NLSbE5HOmAl1FyCrwZhNsEKiHNMfCVN3ALIG6LAHht9eoYKgQxs5Rsyv4BHmQ00bzL/gBWZNXCPzruA5k1I42Sk4Ji5rwToswjt8wLKlvivoUhD3Oe2Q+wSt6hW+4d/NOwtwtcwCVP/eLTwnvwTPIDsN58I+uUDwCGc3nLD51EzDii1nYkbwGmfOBNOM6Hg6wPo56t+WyhArIlDXO/RSKdEsMdBHkdO5y+O0t3sw5WHa6rDK99/8AS9xZpi5oWsXAAAAAElFTkSuQmCC" alt="" />
                  <img className='check-png white' alt="" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAABGdBTUEAALGPC/xhBQAAADhlWElm
TU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAFKADAAQAAAABAAAAFAAAAACR
FdLHAAACKUlEQVQ4EZ2UTWjUUBDHZ15Nt2KRgkfxqheppZsEektWEBG0niqIIHryooKCB1Hw1IKI
9CaKol6qeOtJEHc3Wu1hk1ih6kGod/HjIlvEZN84E8kSttls1oXsm7z5z++9lzczCP/5m5mp7Y4i
mgMF+4FwVDAENI3D8KamnAnDwEsaYB8AroOOl8Pw9XrKMC337rb0pWh0HGes3cYrDNkDoBZC/+WX
fvqBQMuqHf3VplMKaMH3m+/7gdL5QmDVcq9r0Juh751IAwaNucBqtWog7rzPH/tpEDSfD4Jk/blA
gRF1bmU/eDaoyN4ClGPKzsrAJicP7ahUogta47MwbGzIQiq7mlwAZ9NmEDRKHPOGGq1ESwQwj0jH
Uk53h5IacptlL8A0Xy0yRECr4+N0JwV2dyh5JqmROopGy3IuAsJ51myQplnP836n+mSHUgGStL15
ZlnuIyK0AfRcEHgfJMg03Vk+5m02fypUR1ph/XsKkzEBGgZclgrIOsQmhE/8f5oXW522nZMjNPKV
QC+xK9Kojget+ufemOTIGnCvn1NOQat5EwHPclBFES4z7AXb23mlM+9a9ZVemLwr6RpJoed5ec73
Gw+5jdTY/MHPBNvXOAue9JGDSloQd41+ApnnanlLOj6gEQ6zPV+kBdN2HxQKhnDyhT3mTPnXHIeI
y5Xa9sFd7Ii6iZ2rKjkpME36XqcTn0Ou3Y/ctt+UjN0qIxhDxD9xHF1dW1v59hcG3c5PuE9fzQAA
AABJRU5ErkJggg==" />

                </div>
              })
            }
          </div>
          {/* 楼层 2，移动端 立即支付按钮 */}
          {isMobile && <div>
            <Button type='primary' className='point-pay-button' onClick={callWxPay}>立即支付</Button>
          </div>}

          {/* 楼层 2 PC 端二维码*/}
          <div className='qrcode-floor'>
            <div className='qrcode-wrap'>
              <div className='qrcode-img-box'>
                <img className='qrcode-img' src={qrCodeSrc} />
              </div>
              <div className='wechat-logo-desc'>
                <img style={{ marginRight: '5px', width: '20px' }} src='https://c.superx.chat/wechatlogo.png' />
                使用微信扫码支付
              </div>
            </div>
          </div>
          {/* 楼层 3 */}
          <div className='price-desc'>
            <div className='price-title'>点数使用说明：</div>
            <div className='price-item'>1. 可用于 Midjourney、Stable Diffusion、DALLE、AI 艺术二维码等功能，点数永久有效</div>
            <div className='price-item'>2. Midjourney 绘图价格为每张 8 个点数，变体 4 个点数，获取单张高清图 2 个点数（Midjourney 四宫格算一张图。SD 根据参数不同消耗不同点数，AI 艺术二维码 {qrcodeCost} 点数/张）</div>
            {/* <div className='price-item'>3. 点数永久有效</div> */}
            {/* <div>4. 由于绘画成本高昂，暂无包月会员</div> */}
          </div>
        </div>
      </Modal>
      <div style={{ color: 'rgb(119, 119, 119)', fontSize: '13px' }}>
        {' '}
        我的点数：{user.point_count || 0} <Button onClick={showBuyModal}>购买点数</Button>
      </div>
    </div>
  );
};

export default PaingPoint;
