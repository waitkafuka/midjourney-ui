import React, { use, useEffect, useState, useRef, useMemo } from 'react';
import { Input, Button, Table, Image, Typography, message, Modal, Spin, Select, Space, Divider, Checkbox, notification, Tag, Switch, Tooltip } from 'antd';
import { SendOutlined, UploadOutlined, QuestionCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { Imagine, Upscale, Variation } from '../request';
import { MJMessage } from 'midjourney';
import { Message } from '../interfaces/message';
import MyTag from '../components/tag';
import { requestAliyun, requestAliyunArt } from '../request/http';
import { useSelector, useDispatch } from 'react-redux';
import { downloadFile, getQueryString, hasChinese, shuffleArray, redirectToZoomPage, extractIdFromString, redirectToFaceswapPage } from '../scripts/utils';
import { NEXT_PUBLIC_IMAGE_PREFIX, PAINTING_POINTS_ONE_TIME } from '../scripts/config';
import { getRatio, getHeight } from '../scripts/utils';
import PaintingPoint from '../components/paintingPoint';
import store from '../store';
import AliyunOSSUploader from '../components/OssUploader';
import { isPromptValid } from '../scripts/utils';
import type { ColumnsType } from 'antd/es/table';
const imgExp = /<([^<>]+)>/g;
import ClipboardJS from 'clipboard';
import LottieAnimation from '../components/LottieAnimation';
import dkJson from '../components/dk.json'
import { number } from 'echarts';
const imgBasePath = '//och.superx.chat'

const baseWidth = 500;
const { TextArea } = Input;
const { Text } = Typography;
const defaultTips = '正在生成...';
function replaceLastElement(arr: Message[], newElement: Message) {
  arr[arr.length - 1] = newElement; // 替换最后一个元素
  return [...arr]; // 返回更新后的数组
}

const thumbUrl = (img: string, text: string) => {
  console.log('计算缩略图：', img);
  if (img.endsWith('.png')) {
    const ratio = getRatio(text);
    const height = getHeight(ratio, baseWidth);
    return `${img}?x-oss-process=style/scale_500`;
  } else {
    console.log('计算缩略图2：', img);
    return img;
  }
};

// 根据图片和文字计算图片高度
const getImgCalcHeight = (img: string, text: string) => {
  const ratio = getRatio(text);
  const height = getHeight(ratio, baseWidth);
  return height;
};

const isDone = (progress: string | undefined) => {
  return progress && (progress.indexOf('done') > -1 || progress.indexOf('完成') > -1);
};

const Index: React.FC = () => {
  const [inputValue, setInputValue] = useState('');
  const inputValueRef = useRef(inputValue);
  const [inputDisable, setInputDisable] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [referImg, setReferImg] = useState('');
  const [isShowBuyPointEntry, setIsShowBuyPointEntry] = useState<boolean>(true);
  const [showTips, setShowTips] = useState(true);
  const [showPublicTips, setShowPublicTips] = useState(true);
  const [clientId, setClientId] = useState(0);
  const [showOperationtTips, setShowOperationtTips] = useState(false);
  const [isShowParamsTips, setIsShowParamsTips] = useState(false);
  //自动纠错提示词
  const [isCorrectPrompt, setIsCorrectPrompt] = useState(false);
  const [showQrcodeModal, setShowQrcodeModal] = useState(true);
  const [clientCount, setClientCount] = useState(0);
  const [nodes, setNodes] = useState<any[]>([]);
  const [hasStartImagin, setHasStartImagin] = useState(false);
  const [showStartTips, setShowStartTips] = useState(false);

  //测试
  // const [messages, setMessages] = useState<Message[]>([{
  //   text: '测试',
  //   img: 'https://och.superx.chat/attachments/1100632439031877675/1109823643304853564/waitkafuka_an_asian_woman_poses_for_a_portrait_in_the_style_of__61423d59-7663-42d4-b972-eb4a2cf1e6d6.png?x-oss-process=style/scale_500',
  //   progress: 'done',
  //   hasTag: true,
  // }]);
  const [messages, setMessages] = useState<Message[]>([]);
  const user = useSelector((state: any) => state.user.info);
  const dispatch = useDispatch();
  const [messageApi, contextHolder] = message.useMessage();
  // const defaultImg = 'data:image/png;base64,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'
  const defaultImg = '';
  const [paintingTip, setPaintingTip] = useState<string>('');
  const [api, contextHolder2] = notification.useNotification();
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  const scrollToBottom = () => {
    setTimeout(() => {
      const chat = document.querySelector('.img-list-box');
      if (chat) {
        chat.scrollTop = chat.scrollHeight;
      }
    }, 500);
  };

  interface DataType {
    name: string;
    describe: string;
  }

  const columns: ColumnsType<DataType> = [
    {
      title: '参数',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <span>{text}</span>,
    },
    {
      title: '描述',
      dataIndex: 'describe',
      key: 'describe',
    },
  ];

  const data: DataType[] = [
    {
      name: '--ar n:m',
      describe: '图片尺寸宽:高（Aspect Ratios），例如：a cat --ar 16:9',
    },
    {
      name: '--chaos 0-100',
      describe: '变异程度，默认 0。数字越大，图片想象力越发散，例如：a cat --chaos 50',
    },
    {
      name: '--iw 0-2',
      describe: '参考图权重，值越大，参考图的权重越大，默认 1。例如：--iw 1.25（仅在v5或者niji5模型下有效）',
    },
    {
      name: '--no 元素',
      describe: '排除某些元素，例如：--no plants，生成图中将不包含plants',
    },
    {
      name: '--q <.25、.5、1>',
      describe: '指定生成图的质量，默认 1。例如：--q .5（仅在v4、5，niji5下有效）',
    },
    {
      name: '--style raw ',
      describe: '减少 midjourney 的艺术加工，生成更摄影化的图片。例如：--style raw',
    },
    {
      name: '--style <cute, expressive, original, or scenic>',
      describe: '设置动漫风格：可爱、表现力、原始、或者风景。例如：--style cute（cute, expressive, original 和 scenic 必须搭配--niji 一起使用，如：a cat --style expressive --niji）',
    },
    {
      name: '--s（或--stylize） 数字',
      describe: '设置midjourney的艺术加工权重，默认 100。取值范围 0-1000（v4、v5），626-60000（v3），niji模式下无效',
    },
    {
      name: '--niji',
      describe: '设置为日本动漫风格模型，例如：--niji，也可以写成：--niji 5（目前 5 可以省略）',
    },
    {
      name: '--v <1-5> ',
      describe: '模型设置。设置模型版本，例如：--v 5',
    },
  ];

  const checkUserAuth = () => {
    if (!user || !user.secret) {
      message.error('用户尚未登录', 5);
      return false;
    }
    //检查点数是否足够
    if (user.point_count < PAINTING_POINTS_ONE_TIME) {
      message.error('点数不足，请先充值');
      return;
    }
    return true;
  };
  const handleMessageSend = async () => {
    if (!checkUserAuth()) return;
    //弹窗提示操作指南
    if (localStorage.getItem('noAllowOperationTips') !== 'true') {
      setShowOperationtTips(true);
    }
    //校验提示词是否合法
    let newMessage: Message = {
      text: inputValue.trim(),
      hasTag: false,
      progress: defaultTips,
      img: defaultImg,
    };
    const promptValidResult = isPromptValid(inputValue.trim());
    if (promptValidResult.isValid !== true) {
      message.error(promptValidResult.message, 10);
      return;
    }
    // alert('通过')
    // return;

    if (newMessage.text) {
      //检测内容是否包含中文
      if (hasChinese(newMessage.text)) {
        // 调用api翻译为英文
        // message.info('midjourney无法支持中文提示词，正在为您翻译为英文...');
        setIsTranslating(true);
        let result = {} as any;
        let imgStrArray = newMessage.text.match(imgExp) || [];
        try {
          result = await requestAliyun('translate', { content: newMessage.text.replace(imgExp, '') });
        } catch (error) {
          messageApi.error('翻译出错，请稍后重试，请确保您的输入词中不包含政治、色情、暴力等词汇', 10);
          setIsTranslating(false);
          return;
        }
        // return;
        if (result.code !== 0) {
          messageApi.error(result.message, 10);
          setIsTranslating(false);
          return;
        }
        result = result.data;
        setIsTranslating(false);
        console.log('翻译结果', result);
        //长度限制 500 个字符
        // if (result.length > 500) {
        //   messageApi.error('提示词过长，不能超过 500 个字符，请重新输入', 10);
        //   return;
        // }
        //去掉文字中的换行和回车

        newMessage.text = `${imgStrArray.join(' ')} ${result}`;
        setInputValue(result);
        // }
      }
      setInputDisable(true);
      setMessages((msgs) => [...msgs, newMessage]);
      setHasStartImagin(true);
      try {
        newMessage.text = newMessage.text.replace(/[\r\n]/g, '');
        if (!localStorage.getItem('beta-tips1')) {
          setShowStartTips(true);
          // notification.success({
          //   message: 'MJ绘画提示',
          //   // description: '💐恭喜您已获得超极速出图的内测体验资格，作为一项黑科技，出图速度将在之前相当快的基础上，再次提升数倍。功能已自动开启，如需关闭，可微信联系客服进行关闭。',
          //   description: <div>
          //     <div>💐 MJ 绘画 8 个点数/张</div>
          //     <div>💐 点 V（变体）8 点数/张</div>
          //     <div>💐 点 U（高清某一张）2 点数/张</div>
          //     <div>💐 出图失败不扣费</div>
          //   </div>,
          //   duration: 0,
          // })
          localStorage.setItem('beta-tips1', '1')
        }
        // return;
        // alert('翻译结果' + newMessage.text)
        // return;
        await Imagine(JSON.stringify({ prompt: newMessage.text, clientId, isCorrectPrompt }), (data: any) => {
          if (data.code === 40015) {
            //未登录
            setTimeout(() => {
              window.location.href = process.env.NODE_ENV === 'development' ? '/login' : '/login/';
            }, 1000);
            return;
          }
          // 判断用户信息
          if (data.code === 40016) {
            //无权限
            messageApi.error(data.message, 10);
            return;
          }

          //mj 服务报错
          if (data.code === 40024 || data.code === 40029 || data.code === 40030) {
            notification.error({
              message: '提示',
              description: data.message,
              duration: 0,
            });
            //取出最后一个msg
            let errorMsg: Message = {
              text: inputValue.trim(),
              hasTag: false,
              progress: 'error：' + data.message,
              img: 'https://c.superx.chat/stuff/img-error.png',
            };
            setMessages((msgs) => [...msgs.slice(0, -1), errorMsg]);
            setInputDisable(false);
            return;
          }

          console.log('imagin dataing:', data);
          newMessage.img = data.uri.replace('https://cdn.discordapp.com/', NEXT_PUBLIC_IMAGE_PREFIX);
          if (data.id) {
            newMessage.hasTag = true;
            //扣减点数
            store.dispatch({ type: 'user/pointChange', payload: user.point_count - PAINTING_POINTS_ONE_TIME });
          }

          newMessage.msgHash = data.hash;
          newMessage.msgID = data.id;
          newMessage.progress = data.progress;
          newMessage.content = data.content;
          const oldMessages = messages;
          // setMessages(omsg => replaceLastElement(omsg, newMessage));
          setMessages([...oldMessages, newMessage]);
        });
      } catch (error) {
        console.log('生成出错了：', error);
        message.error('出错了:' + error, 30);
        setInputDisable(false);
      }
      setInputValue('');
      setInputDisable(false);
    }
  };
  const variation = async (content: string, msgId: string, msgHash: string, index: number) => {
    let newMessage: Message = {
      text: `${content} variation V${index}`,
      hasTag: false,
      progress: defaultTips,
      img: defaultImg,
    };

    setInputDisable(true);
    setMessages((omsg) => [...omsg, newMessage]);
    try {
      await Variation(JSON.stringify({ content, index, msgId, msgHash, clientId }), (data: any) => {
        //mj 服务报错
        if (data.code === 40024) {
          notification.error({
            message: '提示',
            description: data.message,
            duration: 0,
          });

          setInputDisable(false);
          return;
        }
        newMessage.img = data.uri.replace('https://cdn.discordapp.com/', NEXT_PUBLIC_IMAGE_PREFIX);
        if (data.id) {
          newMessage.hasTag = true;
          //扣减点数
          store.dispatch({ type: 'user/pointChange', payload: user.point_count - PAINTING_POINTS_ONE_TIME / 2 });
        }
        console.log('variation dataing:', data);
        newMessage.msgHash = data.hash;
        newMessage.msgID = data.id;
        newMessage.content = data.content;
        newMessage.progress = data.progress;
        const oldMessages = messages;
        // setMessages(omsg => replaceLastElement(omsg, newMessage));
        setMessages([...oldMessages, newMessage]);
      });
    } catch (error) {
      console.log('variation出错了：', error);
      message.error('出错了:' + error, 30);
      setInputDisable(false);
    }

    setInputDisable(false);
  };
  const upscale = async (pormpt: string, msgId: string, msgHash: string, index: number) => {
    let newMessage: Message = {
      text: `${pormpt} upscale U${index}`,
      hasTag: false,
      progress: defaultTips,
      img: defaultImg,
    };

    setInputDisable(true);
    setMessages((omsg) => [...omsg, newMessage]);
    try {
      await Upscale(JSON.stringify({ content: pormpt, index, msgId, msgHash, clientId }), (data: any) => {
        console.log('upscale dataing:', data);
        //mj 服务报错
        if (data.code === 40024) {
          notification.error({
            message: '提示',
            description: data.message,
            duration: 0,
          });
          //删除最后一个messages
          setMessages((msgs) => [...msgs.slice(0, -1)]);
          setInputDisable(false);
          return;
        }
        newMessage.img = data.uri.replace('https://cdn.discordapp.com/', NEXT_PUBLIC_IMAGE_PREFIX);
        newMessage.msgHash = data.hash;
        newMessage.msgID = data.id;
        newMessage.content = data.content;
        newMessage.progress = data.progress;
        const oldMessages = messages;
        // setMessages(omsg => replaceLastElement(omsg, newMessage));
        setMessages([...oldMessages, newMessage]);
      });
    } catch (error) {
      console.log('upscale出错了：', error);
      message.error('出错了:' + error, 30);
      setInputDisable(false);
    }

    setInputDisable(false);
  };

  const tagClick = (content: string, msgId: string, msgHash: string, tag: string) => {
    switch (tag) {
      case 'V1':
        variation(content, msgId, msgHash, 1);
        break;
      case 'V2':
        variation(content, msgId, msgHash, 2);
        break;
      case 'V3':
        variation(content, msgId, msgHash, 3);
        break;
      case 'V4':
        variation(content, msgId, msgHash, 4);
        break;
      case 'U1':
        upscale(content, msgId, msgHash, 1);
        break;
      case 'U2':
        upscale(content, msgId, msgHash, 2);
        break;
      case 'U3':
        upscale(content, msgId, msgHash, 3);
        break;
      case 'U4':
        upscale(content, msgId, msgHash, 4);
        break;
      default:
        break;
    }
  };

  const handleArray = (direction: string) => {
    if (messages.length === 0) return;
    if (direction === 'down') {
      setCurrentIndex((prevIndex) => (prevIndex === messages.length - 1 ? 0 : prevIndex + 1));
    } else {
      setCurrentIndex((prevIndex) => (prevIndex === 0 ? messages.length - 1 : prevIndex - 1));
    }
    console.log('currentIndex:', currentIndex);
    console.log('message:', messages[currentIndex].text);
    const t = messages[currentIndex].text;
    setInputValue(t.replace(/(variation|upscale) (V|U)\d/g, ''));
  };

  //定义一个方法，取出链接参数中的prompt，放在 Input 中
  const getPrompt = () => {
    //从链接中取出prompt参数
    const urlSearchParam = new URLSearchParams(window.location.search);
    const prompt = urlSearchParam.get('prompt');
    //如果prompt存在，就把它放在Input中

    if (prompt) {
      setInputValue(decodeURIComponent(prompt));
    }
  };

  useEffect(() => {
    inputValueRef.current = inputValue;
  }, [inputValue]);

  const checkTips = () => {
    //查看是否有showTips参数，如果有，就显示提示
    const localShowTips = localStorage.getItem('showTips');
    if (localShowTips === 'false') {
      setShowTips(false);
    }

    const localShowPublicTips = localStorage.getItem('showPublicTips');
    if (localShowPublicTips === 'false') {
      setShowPublicTips(false);
    }
  };

  const setBDVid = () => {
    //从链接中获取bd_vid参数
    const bd_vid = getQueryString('bd_vid');
    const qhclickid = getQueryString('qhclickid');
    if (bd_vid) {
      localStorage.setItem('bd_vid', bd_vid);
    }
    if (qhclickid) {
      localStorage.setItem('qhclickid', qhclickid);
    }

    const u = getQueryString('u');
    if (u) {
      localStorage.setItem('u', u);
    }
  };

  //随机一个客户端
  const setRandomClientId = async () => {
    //首先获取客户端的数量
    let { clientIds } = await requestAliyunArt('clientIds', null, 'GET');
    clientIds = shuffleArray(clientIds);
    setClientCount(clientIds.length);
    //设置nodes
    const nodes = [];
    for (let i = 0; i < clientIds.length; i++) {
      nodes.push({
        value: clientIds[i],
        label: `绘画服务器${i + 1}`,
      });
    }
    setNodes(nodes);

    const randIndex = Math.floor(Math.random() * clientIds.length);
    setClientId(clientIds[randIndex]);

    //如果是 UED，使用固定的client Id
    if (window.location.href.includes('ued.superx.chat')) {
      // setClientId();
    }
  };

  const setServerId = () => {

  }

  //从链接中取出img_id参数，并查询图片信息
  const getImgInfo = async () => {
    const id = getQueryString('id');
    if (id) {
      const result = await requestAliyunArt('get-my-img-detail', { id });
      console.log(result);
      const data = result.data;
      //检查是否是自己的图片
      if (result.code !== 0) {
        message.error(result.message, 8);
        return;
      }
      setInputValue(data.prompt);
      //检查服务器是否还在线
      //获取服务器 ID
      const clientId = extractIdFromString(data.api_channel) || -1;
      //检查服务器 ID 是否还存在，有效
      const serverValid = nodes.findIndex((node) => node.value === clientId) > -1;
      if (!serverValid) {
        message.error('抱歉，由于时间过长，无法重新生成该图片。您仍可使用下方提示词进行生成。错误码：40012。', 5);
        return;
      }
      if (!data.img_id) {
        message.error('抱歉，由于时间过长，无法重新生成该图片。您仍可使用下方提示词进行生成。错误码：40013。', 5);
        return;
      }
      //如果动作是imagine或者variation，才有hasTag
      const hasTag = (data.action === 'imagine' || data.action === 'variation') && data.img_id;
      let newMessage: Message = {
        progress: "完成",
        text: data.prompt,
        hasTag,
        img: `${imgBasePath}${data.img_url}`,
      };
      newMessage.msgHash = '';
      newMessage.msgID = data.img_id;
      newMessage.content = data.prompt;
      setMessages((msgs) => [newMessage]);

      setClientId(Number(clientId));
    }
  };

  useEffect(() => {
    if (nodes.length > 0) {
      getImgInfo();
    }
  }, [nodes])


  const showQRcode = () => {
    if (localStorage.getItem('noAllowQrcode') === 'true') {
      setShowQrcodeModal(false);
    }
  };

  //页面初始化
  useEffect(() => {
    new ClipboardJS('.copy-prompt-btn');
    getPrompt();
    checkTips();
    setBDVid();
    showQRcode();
    setRandomClientId();
    //页面初始化
    //如果链接中包含ued参数，隐藏购买入口
    if (window.location.href.indexOf('ued') > -1) {
      setIsShowBuyPointEntry(false);
    }
    //从localstorage中获取isCorrectPrompt的状态
    const localIsCorrectPrompt = localStorage.getItem('isCorrectPrompt');
    if (localIsCorrectPrompt === 'false') {
      setIsCorrectPrompt(false);
    }
  }, []);

  return (
    // <div>

    //   <div className="prompt-input-wrap">
    //     <TextArea
    //       className="w-full"
    //       disabled={true}
    //       value={inputValue}
    //       onChange={(e) => setInputValue(e.target.value)}
    //       onKeyDown={(e) => {
    //         if (e.key === "Enter" && e.shiftKey) {
    //           setInputValue(`${inputValue}\n`);
    //           e.preventDefault();
    //         } else if (e.key === "Enter") {
    //           handleMessageSend();
    //           e.preventDefault();
    //         }
    //       }}
    //       placeholder="请描述你要绘画的作品。（例如：a cat。midjourney本身不支持中文，但您仍然可以输入中文，生成时系统将自动为您翻译为英文。可以使用ChatGPT生成你的提示词prompt。）"
    //       autoSize={{ minRows: 1, maxRows: 6 }}
    //       style={{ paddingRight: 30 }}
    //     />
    //     <Button
    //       className="absolute"
    //       type="primary"
    //       onClick={handleMessageSend}
    //       loading={inputDisable}
    //       disabled={true}
    //       icon={<SendOutlined className="send-prompt-btn" />}
    //       title="Send"
    //       style={{
    //         position: "absolute",
    //         bottom: 0,
    //         right: 0,
    //         background: "transparent",
    //         border: "none",
    //         boxShadow: "none",
    //       }}
    //     />
    //   </div>
    //   <div className="no-content-tips">当前使用人数过多，服务器已无法继续提供服务。图片渲染需要耗费大量计算资源，请稍后再试。</div>
    // </div>
    <div className='w-full mx-auto px-4 h-full overflow-y-hidden list-input-container'>
      {/* 购买点数 */}
      {isShowBuyPointEntry && (
        <div className='dalle-point-box'>
          <PaintingPoint></PaintingPoint>
        </div>
      )}

      {contextHolder}
      {/* <Spin>{paintingTip}</Spin> */}
      {/* 价格提示弹窗 */}
      <Modal
        title='MJ 使用提示'
        style={{ top: 20, width: '500px' }}
        open={showStartTips}
        destroyOnClose={true}
        closable={true}
        maskClosable={false}
        okText='确定'
        footer={[
          <Button
            key='ok'
            type='primary'
            onClick={() => {
              setShowStartTips(false);
            }}
          >
            确定
          </Button>,
        ]}
      // footer={null}
      >
        <div>
          <div>💐 MJ 绘画 8 点数/张</div>
          <div>💐 点 V（变体）8 点数/张</div>
          <div>💐 点 U（高清某一张）2 点数/张</div>
          <div>💐 可在左侧“我的作品”中查看全部已生成作品</div>
          <div>💐 如有任何问题和反馈建议，均可联系公众号客服</div>
        </div>
      </Modal>
      {/* 操作提示弹窗 */}
      <Modal
        title='使用指南'
        style={{ top: 20, width: '500px' }}
        open={showOperationtTips && false}
        destroyOnClose={true}
        closable={true}
        maskClosable={false}
        okText='确定'
        footer={[
          <Button
            key='ok'
            type='primary'
            onClick={() => {
              setShowOperationtTips(false);
            }}
          >
            确定
          </Button>,
        ]}
      // footer={null}
      >
        <div style={{ lineHeight: '1.6' }}>
          <p>💐 每次绘图消耗 8 个点数；点一次 V（重新变体），消耗 8 个点数；点 U（放大单图）消耗 2 个点数。</p>
          <p>💐 由于midjourney有内容风控，如果超过 3 分钟无结果，请检查您的提示词内容是否有敏感内容，参数是否有误。可以更换提示词再试。</p>
          <p>💐 绘图过程中请不要刷新页面</p>
          <p>💐 绘画作品默认公开分享在“艺术公园”，供点赞和交流，如需关闭，可在“我的作品”中进行关闭分享</p>
          <p>💐 为保护隐私，有参考图的作品默认不会分享。如需分享，同样可以在“我的作品”中打开分享</p>
          {/* <p>6. 为使您可以绘制出高质量的作品，本站左侧提供了入门和提升教程，您可以一边阅读一边对比尝试</p> */}
        </div>

        <div style={{ marginTop: '20px', textAlign: 'right' }}>
          <Checkbox
            onChange={(e) => {
              const checked = e.target.checked;
              checked ? localStorage.setItem('noAllowOperationTips', 'true') : localStorage.removeItem('noAllowOperationTips');
            }}
          >
            不再提示
          </Checkbox>
        </div>
      </Modal>
      {/* 翻译中 */}
      <Modal title='翻译中' style={{ top: 20 }} open={isTranslating} closable={false} cancelText='' okText='' footer={null}>
        <div>
          <Spin />
          正在翻译为英文...
        </div>
      </Modal>
      {/* <div className="qr-code-modal" style={{ display: showQrcodeModal ? 'block' : 'none' }}>
        <CloseCircleOutlined onClick={() => {
          setShowQrcodeModal(false)
          localStorage.setItem('noAllowQrcode', 'true')
        }} />
        <p>加入绘画交流群：</p>
        <img src="//c.superx.chat/stuff/1.png" alt="" />
      </div> */}
      {/* <List
        className="mx-auto justify-start overflow-y-auto img-list-box"
        style={{
          height: "calc(100vh - 96px)",
        }}

        dataSource={messages}
        renderItem={renderMessage}
        locale={{ emptyText: '使用 midjourney 来生成你的第一幅人工智能绘画作品。' }}
      /> */}

      {messages.length > 0 ? (
        <div
          className='workspace-img-wrap img-list-box'
          style={{
            height: 'calc(100vh - 96px)',
            overflowY: 'auto',
          }}
        >
          {/* 图片结果列表容器 */}
          {messages.map(({ text, img, progress, hasTag, content, msgID, msgHash }, index) => (
            <div className='img-list-item' key={index}>
              <div className='mj-prompt-box'>
                {' '}
                {text.replace(/- <@\d+>\s*\([^)]*\)/g, '')} {`(${progress === 'done' ? '完成' : progress})`}{' '}
                <Button
                  size='small'
                  onClick={() => {
                    setInputValue(text.replace(/- <@\d+>\s*\([^)]*\)/g, '').replace(/(variation V\d+|upscale U\d+)/g, ''));
                  }}
                  data-clipboard-text={text.replace(/- <@\d+>\s*\([^)]*\)/g, '').replace(/(variation|upscale) (V|U)\d/g, '')}
                  className='copy-prompt-btn'
                >
                  复制提示词
                </Button>
              </div>
              <div className='workspace-img-container' style={{ width: `${baseWidth}px`, height: getImgCalcHeight(img, text) }}>
                {img && !progress?.includes('error') && (
                  <img
                    src={img}
                    style={{ cursor: isDone(progress) ? 'zoom-in' : 'auto' }}
                    onClick={() => {
                      // <img src={thumbUrl(img, text)} style={{ cursor: isDone(progress) ? 'zoom-in' : 'auto' }} onClick={() => {
                      if (isDone(progress)) {
                        window.open(img, '_blank');
                      }
                    }}
                  />
                )}

                {img && progress?.includes('error') && <img src={img} style={{ width: '150px', filter: 'grayscale(100%)' }} />}

                {/* {!img && <Spin tip="绘画中，正常 1 分钟内可完成，如遇排队，可能需要 1-2 分钟。"></Spin>} */}
                {!img && (
                  <div style={{ textAlign: 'center' }}>
                    {/* <img style={{ width: '130px' }} src='https://c.superx.chat/stuff/default.svg' alt='' /> <br /> */}
                    <div style={{ width: "130px" }}>
                      <LottieAnimation animationData={dkJson}></LottieAnimation>
                    </div>
                    <div style={{ marginTop: '10px', display: 'flex', textAlign: 'center', justifyContent: 'center' }}>
                      <Spin tip=''></Spin> <span style={{ color: '#888', fontSize: '13px' }}> 正在努力绘画...</span>
                    </div>
                  </div>
                )}
                {/* 隐藏一个原图，这是为了提前缓存，以便在后面点击查看大图的时候能够更快加载 */}
                {/* <img src={img} style={{ display: 'none' }} /> */}
              </div>
              {img && showPublicTips && !progress?.includes('error') && (
                <p className='no-content-tips' style={{ position: 'static', marginTop: '0px', marginBottom: '15px', fontSize: '13px', textAlign: 'left', padding: '0' }}>
                  图片默认公开展示在“艺术公园”，可在左侧“我的作品”中进行管理。
                  <Button
                    style={{ fontSize: '12px' }}
                    size='small'
                    onClick={() => {
                      localStorage.setItem('showPublicTips', 'false');
                      setShowPublicTips(false);
                    }}
                  >
                    不再提示
                  </Button>
                </p>
              )}

              {/* ，如果您不希望展示，可进入“<Link href="/mypaintings">我的作品</Link>”进行关闭。 */}
              {img && !progress?.includes('error') && (progress?.includes('完成') || progress?.includes('done')) && img !== defaultImg && (
                <Space.Compact style={{ width: '100%', marginTop: '0px' }}>
                  <Button
                    onClick={() => {
                      window.open(img, '_blank');
                    }}
                  >
                    查看大图
                  </Button>
                  <Button
                    onClick={() => {
                      downloadFile(img);
                    }}
                  >
                    下载原图
                  </Button>
                  <Button
                    onClick={() => {
                      redirectToZoomPage(img);
                    }}
                  >
                    一键放大
                  </Button>
                  <Button
                    onClick={() => {
                      redirectToFaceswapPage(img);
                    }}
                  >
                    一键换脸
                  </Button>
                </Space.Compact>
              )}
              {hasTag && (
                <>
                  <div style={{ marginTop: '15px' }}>
                    <MyTag
                      Data={['U1', 'U2', 'U3', 'U4']}
                      type='upscale'
                      onClick={(tag) => {
                        scrollToBottom();
                        tagClick(String(content), String(msgID), String(msgHash), tag);
                      }}
                    />
                  </div>
                  <MyTag
                    Data={['V1', 'V2', 'V3', 'V4']}
                    type='variation'
                    onClick={(tag) => {
                      scrollToBottom();
                      tagClick(String(content), String(msgID), String(msgHash), tag);
                    }}
                  />
                  {showTips && (
                    <p className='no-content-tips' style={{ marginTop: '0px', fontSize: '13px', textAlign: 'left', padding: '0' }}>
                      如果您觉得某张图片还不错，可以点击： U+“图片编号”，获取高清图片~{' '}
                      <Button
                        style={{ fontSize: '12px' }}
                        size='small'
                        onClick={() => {
                          localStorage.setItem('showTips', 'false');
                          setShowTips(false);
                        }}
                      >
                        不再提示
                      </Button>
                    </p>
                  )}
                </>
              )}
              <Divider></Divider>
            </div>
          ))}
        </div>
      ) : (
        <>
          <p className='no-content-tips'>使用 midjourney 生成你的专属人工智能绘画作品。</p>
          {/* <p className="no-content-tips">请勿使用违禁词汇，违者将被封号。</p> */}
          {!user.secret && (
            <p className='no-content-tips'>
              您尚未登录，请先
              <a href='/login/?redirect=/art' style={{ fontSize: '14px', textDecoration: 'underline' }}>
                {' '}
                登录
              </a>
            </p>
          )}
        </>
      )}
      <div className='prompt-input-wrap'>
        {/* 线路切换1 */}
        <div className='line-change-box1'>
          <div style={{ marginRight: '5px', marginLeft: '20px' }}>
            <Select
              options={nodes}
              value={clientId}
              disabled={hasStartImagin}
              style={{ width: 140 }}
              onChange={(v) => {
                setClientId(v);
              }}
            />
          </div>
          <Tooltip title={`为保证服务高可用，缩短等待时间，特新增${clientCount}个服务器节点。如果您生成出错或时间过长，可以选择切换节点。一般情况下不需要切换。（生成开始后不可切换，如需切换请刷新页面。）`}>
            <QuestionCircleOutlined style={{ cursor: 'pointer' }} />
          </Tooltip>
        </div>
        {/* 参考图上传 */}
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
          <AliyunOSSUploader
            buttonText='添加参考图'
            onChange={(fileList) => {
              if (fileList.length > 0) {
                //只在上传完成后做操作
                if (fileList[0].status === 'done') {
                  const imgUrl = `${fileList[0].url}`;
                  setReferImg(imgUrl);
                  const exp = /< .*? >/;
                  //用正则表达式替换掉输入框中的图片地址，图片地址用<>包裹
                  //判断inputValue 中是否有图片地址
                  if (exp.test(inputValue)) {
                    //如果有，替换掉
                    setInputValue(inputValue.replace(exp, `< ${imgUrl} >`));
                  } else {
                    //如果没有，加到开头
                    setInputValue(`< ${imgUrl} > ${inputValue}`);
                  }
                }
              } else {
                setReferImg('');
                setInputValue((v) => v.replace(/< \s*([^<>]+)\s* >/g, ''));
                // setInputValue(v => v.replace(`<${referImg}> `, ''))
              }
            }}
          ></AliyunOSSUploader>
          {/* 参数手册 */}
          <div style={{ position: 'relative', marginRight: '0' }} className='param-book'>
            <div className='param-wrap' style={{ width: '100%', maxWidth: '800px', position: 'fixed', left: '50%', transform: 'translateX(-50%)', top: '0', display: `${isShowParamsTips ? 'block' : 'none'}` }}>
              <div className='param-table-box'>
                <Table columns={columns} dataSource={data} pagination={false} />
              </div>
              <div style={{ marginTop: '10px', padding: '10px' }}>示例：a cat --ar 4:3 --style cute --niji（1.参数放在提示词之后 2.参数和值之间用空格分隔 3.参数与参数之间也需要用空格分隔 4.参数之后不要加任何多余符号，如句号、小数点、其他字符等。）</div>
              <div style={{ marginTop: '5px', padding: '10px' }}>常见错误：1. a cat--niji(--前缺少空格) 2.a cat --niji.（最后多一个小数点） 3.--ar 16:9 a cat（参数应该在提示词之后）4.a cat -- ar 16:9（--和ar之间不能有空格）</div>
            </div>
            <span style={{ marginLeft: '20px', cursor: 'pointer', fontSize: '13px' }} className='param-book-label'>
              参数手册
              <Switch
                size='small'
                onChange={(v) => {
                  setIsShowParamsTips(v);
                }}
              />
            </span>
          </div>
          {/* 提示词优化 */}
          {/* <div style={{ position: 'relative' }} className='correct-prompt-box'>
            <span style={{ marginLeft: '20px', cursor: 'pointer', fontSize: '13px' }} className='correct-prompt-label'>
              优化提示词
              <Switch
                size='small'
                checked={isCorrectPrompt}
                onChange={(v) => {
                  setIsCorrectPrompt(v);
                  localStorage.setItem('isCorrectPrompt', String(v));
                }}
              />
            </span>
            <Tooltip title={`开启后，将自动优化提示词。可能会改变原有提示词，如果不想改变原有提示词，可关闭此功能。`}>
              <QuestionCircleOutlined style={{ cursor: 'pointer', verticalAlign: '-3px', marginLeft: '3px' }} />
            </Tooltip>
          </div> */}
          {/* 线路切换1,pc端显示 */}
          <div className='line-change-box2'>
            <div style={{ marginRight: '5px', marginLeft: '20px' }}>
              <Select
                options={nodes}
                value={clientId}
                disabled={hasStartImagin}
                style={{ width: 140 }}
                onChange={(v) => {
                  setClientId(v);
                }}
              />
            </div>
            <Tooltip title={`为保证服务高可用，缩短等待时间，特新增${clientCount}个服务器节点。如果您生成出错或时间过长，可以选择切换节点。一般情况下不需要切换。（生成开始后不可切换，如需切换请刷新页面。）`}>
              <QuestionCircleOutlined style={{ cursor: 'pointer' }} />
            </Tooltip>
          </div>

        </div>

        {referImg && (
          <div style={{ margin: '10px 0' }} className='refer-img-box'>
            参考图已添加：
            <a href={referImg} target='_blank'>
              {referImg}
            </a>
            （下方提示词中的链接请勿删除）。将在此图基础上，结合您的提示词生成新的作品。
          </div>
        )}

        <Space.Compact style={{ width: '100%' }}>
          <TextArea
            className='w-full'
            disabled={inputDisable}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.shiftKey) {
                setInputValue(`${inputValue}\n`);
                e.preventDefault();
              } else if (e.key === 'Enter') {
                handleMessageSend();
                e.preventDefault();
              } else if (e.key === 'ArrowUp' || e.keyCode === 38) {
                handleArray('up');
                e.preventDefault();
              } else if (e.key === 'ArrowDown' || e.keyCode === 40) {
                handleArray('down');
                e.preventDefault();
              }
            }}
            placeholder='请详细描述你要生成的图片，如：一只猫在草地上玩耍。'
            autoSize={{ minRows: 1, maxRows: 6 }}
            style={{ paddingRight: 30 }}
          />
          <Button
            className='absolute'
            type='primary'
            onClick={handleMessageSend}
            loading={inputDisable}
            icon={<SendOutlined className='send-prompt-btn' />}
            title='Send'
            style={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              background: 'transparent',
              border: 'none',
              boxShadow: 'none',
            }}
          />
        </Space.Compact>
      </div>
    </div>
  );
};

export default Index;
