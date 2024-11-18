import React, { use, useEffect, useState, useRef, useMemo } from 'react';
import Head from 'next/head';
import { Input, Button, Table, Alert, Typography, message, Modal, Spin, Select, Space, Divider, Checkbox, notification, Tag, Switch, Tooltip, UploadFile } from 'antd';
import { SendOutlined, UploadOutlined, QuestionCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { Imagine, Upscale, Variation } from '../request';
import { MJMessage } from 'midjourney';
import { Message } from '../interfaces/message';
import MyTag from '../components/tag';
import Link from 'next/link';
import Router from 'next/router';
import { requestAliyun, requestAliyunArt, requestAliyunArtStream } from '../request/http';
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
import OssUploader from '../components/OssUploader';
import SlidePaint from '../components/SlidePaint';

const { CheckableTag } = Tag;
const imgBasePath = '//och.superx.chat'
const replaceExp = /<<.*>>/g;

const baseWidth = 500;
const { TextArea } = Input;
const { Text } = Typography;
const defaultTips = '正在生成...';
function replaceLastElement(arr: Message[], newElement: Message) {
  arr[arr.length - 1] = newElement; // 替换最后一个元素
  return [...arr]; // 返回更新后的数组
}

const thumbUrl = (img: string, text: string) => {
  if (img.endsWith('.png')) {
    const ratio = getRatio(text);
    const height = getHeight(ratio, baseWidth);
    return `${img}?x-oss-process=style/scale_500`;
  } else {
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

// 定义Props的类型
interface PageProps {
  title: string;
  description: string;
  keywords: string;
}

const Index: React.FC<PageProps> = ({ title, description, keywords }) => {
  const dontShowBuyIds = ['e07a76e01eaccf7771be3d2a2a26a797', '4851200e9127baff7fab63ec5d1c8c2exx'];
  const [inputValue, setInputValue] = useState('');
  const [seedPrompt, setSeedPrompt] = useState('');
  const inputValueRef = useRef(inputValue);
  const [showDescribeModal, setShowDescribeModal] = useState(false);
  const [showBlendModal, setShowBlendModal] = useState(false);
  const [inputDisable, setInputDisable] = useState(false);
  const [showAlert, setShowAlert] = useState(true);
  const [imgDescribeTexts, setImgDescribeTexts] = useState([]);
  const [isTranslating, setIsTranslating] = useState(false);
  const [referImg, setReferImg] = useState('');
  const [isShowBuyPointEntry, setIsShowBuyPointEntry] = useState<boolean>(true);
  const [showTips, setShowTips] = useState(true);
  const [showPublicTips, setShowPublicTips] = useState(true);
  const [clientId, setClientId] = useState(0);
  const [showOperationtTips, setShowOperationtTips] = useState(false);
  const [isShowParamsTips, setIsShowParamsTips] = useState(false);
  const [showSeed, setShowSeed] = useState(false);
  const [seed, setSeed] = useState('');
  const [describeImageUrl, setDescribeImageUrl] = useState('');
  const [blendImgs, setBlendImgs] = useState<UploadFile[]>([]);
  //购买课程弹窗
  const [showCourseBuyModal, setShowCourseBuyModal] = useState(false);

  //自动纠错提示词
  const [isCorrectPrompt, setIsCorrectPrompt] = useState(false);
  const [showQrcodeModal, setShowQrcodeModal] = useState(true);
  const [clientCount, setClientCount] = useState(0);
  const [nodes, setNodes] = useState<any[]>([]);
  const [hasStartImagin, setHasStartImagin] = useState(false);
  const [seedCopyText, setSeedCopyText] = useState('复制');
  const [showStartTips, setShowStartTips] = useState(false);
  const [isWrong, setIsWrong] = useState(false);
  const [requestingSeed, setRequestingSeed] = useState('');
  const [debug, setDebug] = useState(false);
  const [bdVid, setBdVid] = useState('');
  const [qhclickid, setQhclickid] = useState('');

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
  // const defaultImg = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3PTWBSGcbGzM6GCKqlIBRV0dHRJFarQ0eUT8LH4BnRU0NHR0UEFVdIlFRV7TzRksomPY8uykTk/zewQfKw/9znv4yvJynLv4uLiV2dBoDiBf4qP3/ARuCRABEFAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghgg0Aj8i0JO4OzsrPv69Wv+hi2qPHr0qNvf39+iI97soRIh4f3z58/u7du3SXX7Xt7Z2enevHmzfQe+oSN2apSAPj09TSrb+XKI/f379+08+A0cNRE2ANkupk+ACNPvkSPcAAEibACyXUyfABGm3yNHuAECRNgAZLuYPgEirKlHu7u7XdyytGwHAd8jjNyng4OD7vnz51dbPT8/7z58+NB9+/bt6jU/TI+AGWHEnrx48eJ/EsSmHzx40L18+fLyzxF3ZVMjEyDCiEDjMYZZS5wiPXnyZFbJaxMhQIQRGzHvWR7XCyOCXsOmiDAi1HmPMMQjDpbpEiDCiL358eNHurW/5SnWdIBbXiDCiA38/Pnzrce2YyZ4//59F3ePLNMl4PbpiL2J0L979+7yDtHDhw8vtzzvdGnEXdvUigSIsCLAWavHp/+qM0BcXMd/q25n1vF57TYBp0a3mUzilePj4+7k5KSLb6gt6ydAhPUzXnoPR0dHl79WGTNCfBnn1uvSCJdegQhLI1vvCk+fPu2ePXt2tZOYEV6/fn31dz+shwAR1sP1cqvLntbEN9MxA9xcYjsxS1jWR4AIa2Ibzx0tc44fYX/16lV6NDFLXH+YL32jwiACRBiEbf5KcXoTIsQSpzXx4N28Ja4BQoK7rgXiydbHjx/P25TaQAJEGAguWy0+2Q8PD6/Ki4R8EVl+bzBOnZY95fq9rj9zAkTI2SxdidBHqG9+skdw43borCXO/ZcJdraPWdv22uIEiLA4q7nvvCug8WTqzQveOH26fodo7g6uFe/a17W3+nFBAkRYENRdb1vkkz1CH9cPsVy/jrhr27PqMYvENYNlHAIesRiBYwRy0V+8iXP8+/fvX11Mr7L7ECueb/r48eMqm7FuI2BGWDEG8cm+7G3NEOfmdcTQw4h9/55lhm7DekRYKQPZF2ArbXTAyu4kDYB2YxUzwg0gi/41ztHnfQG26HbGel/crVrm7tNY+/1btkOEAZ2M05r4FB7r9GbAIdxaZYrHdOsgJ/wCEQY0J74TmOKnbxxT9n3FgGGWWsVdowHtjt9Nnvf7yQM2aZU/TIAIAxrw6dOnAWtZZcoEnBpNuTuObWMEiLAx1HY0ZQJEmHJ3HNvGCBBhY6jtaMoEiJB0Z29vL6ls58vxPcO8/zfrdo5qvKO+d3Fx8Wu8zf1dW4p/cPzLly/dtv9Ts/EbcvGAHhHyfBIhZ6NSiIBTo0LNNtScABFyNiqFCBChULMNNSdAhJyNSiECRCjUbEPNCRAhZ6NSiAARCjXbUHMCRMjZqBQiQIRCzTbUnAARcjYqhQgQoVCzDTUnQIScjUohAkQo1GxDzQkQIWejUogAEQo121BzAkTI2agUIkCEQs021JwAEXI2KoUIEKFQsw01J0CEnI1KIQJEKNRsQ80JECFno1KIABEKNdtQcwJEyNmoFCJAhELNNtScABFyNiqFCBChULMNNSdAhJyNSiECRCjUbEPNCRAhZ6NSiAARCjXbUHMCRMjZqBQiQIRCzTbUnAARcjYqhQgQoVCzDTUnQIScjUohAkQo1GxDzQkQIWejUogAEQo121BzAkTI2agUIkCEQs021JwAEXI2KoUIEKFQsw01J0CEnI1KIQJEKNRsQ80JECFno1KIABEKNdtQcwJEyNmoFCJAhELNNtScABFyNiqFCBChULMNNSdAhJyNSiECRCjUbEPNCRAhZ6NSiAARCjXbUHMCRMjZqBQiQIRCzTbUnAARcjYqhQgQoVCzDTUnQIScjUohAkQo1GxDzQkQIWejUogAEQo121BzAkTI2agUIkCEQs021JwAEXI2KoUIEKFQsw01J0CEnI1KIQJEKNRsQ80JECFno1KIABEKNdtQcwJEyNmoFCJAhELNNtScABFyNiqFCBChULMNNSdAhJyNSiEC/wGgKKC4YMA4TAAAAABJRU5ErkJggg=='
  const defaultImg = '';
  const [paintingTip, setPaintingTip] = useState<string>('');
  const [api, contextHolder2] = notification.useNotification();
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isDescribeApiRequesting, setIsDescribeApiRequesting] = useState<boolean>(false);
  const [isBlendApiRequesting, setIsBlendApiRequesting] = useState<boolean>(false);

  const defaultPaintingText = '正在努力绘画...';
  const scrollToBottom = () => {
    setTimeout(() => {
      const chat = document.querySelector('.img-list-box');
      if (chat) {
        chat.scrollTop = chat.scrollHeight;
      }
    }, 500);
  };

  const showSlidePaint = useMemo(() => {
    return bdVid || qhclickid;
  }, [bdVid, qhclickid]);

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
      buttons: [],
      paintingText: defaultPaintingText,
      paintingTimer: setTimeout(() => {
        newMessage.paintingText = `${defaultPaintingText}`;
        // newMessage.paintingText = `${defaultPaintingText}，温馨提醒：如时间超过 3 分钟，可点击左侧“我的作品”，查看是否已完成。在我的作品页面点击编辑按钮可再次编辑。`;
        setMessages((msgs) => {
          return [...msgs];
        })
      }, 3 * 60000),
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
          result = await requestAliyun('trans', { content: newMessage.text.replace(imgExp, '') });
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
        newMessage.text = newMessage.text.replace(/--/g, ' --');
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
        requestAliyunArtStream({
          path: 'imagine',
          data: {
            prompt: newMessage.text, clientId, isCorrectPrompt
          },
          onDataChange(data: any) {
            //清除定时器
            clearTimeout(newMessage.paintingTimer);
            newMessage.paintingText = defaultPaintingText;
            setMessages((msgs) => [...msgs]);
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
            if (data && data.code && data.code !== 0) {
              // if (data.code === 40024 || data.code === 40029 || data.code === 40030) {
              notification.error({
                message: '提示',
                description: data.message,
                duration: 0,
              });
              newMessage.text = inputValue.trim();
              newMessage.hasTag = false;
              newMessage.progress = '错误：' + data.message;
              newMessage.img = 'https://c.superx.chat/stuff/img-error.png';
              newMessage.buttons = [];
              // //取出最后一个msg
              // let errorMsg: Message = {
              //   text: inputValue.trim(),
              //   hasTag: false,
              //   progress:,
              //   img: 'https://c.superx.chat/stuff/img-error.png',
              //   buttons: []
              // };
              setMessages((msgs) => [...msgs]);
              setInputDisable(false);
              return;
            }

            newMessage.img = data.uri.replace('https://cdn.discordapp.com/', NEXT_PUBLIC_IMAGE_PREFIX);
            if (data.id) {
              newMessage.hasTag = true;
              //扣减点数
              store.dispatch({ type: 'user/makePointChange', payload: -PAINTING_POINTS_ONE_TIME });
            }

            newMessage.msgHash = data.hash;
            newMessage.msgID = data.id;
            newMessage.progress = data.progress;
            newMessage.content = data.content;
            newMessage.buttons = data.buttons;
            const oldMessages = messages;
            // setMessages(omsg => replaceLastElement(omsg, newMessage));
            //两秒之后，再setMessages
            setTimeout(() => {
              // setMessages((omsg) => {
              //   return [...omsg, newMessage];
              // });
              setMessages(msgs => [...msgs]);

            }, 1000);
            // setMessages(msgs => [...msgs]);
          }
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

  //点击按钮
  const onButtonClick = ({ buttonId, imgId, buttonLabel, prompt = "" }: any) => {
    let newMessage: Message = {
      text: `${prompt}  <<${buttonLabel}>>`,
      hasTag: false,
      progress: defaultTips,
      img: defaultImg,
      buttons: []
    };
    let messageIndex = messages.length;
    setInputDisable(true);
    setMessages((omsg) => {
      return [...omsg, newMessage]
    });

    requestAliyunArtStream({
      path: 'do-button-click',
      data: {
        buttonId, imgId
      },
      onDataChange(data: any) {
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
        newMessage.buttons = data.buttons;

        if (data.id) {
          // newMessage.hasTag = true;
          //扣减点数
          store.dispatch({ type: 'user/makePointChange', payload: -data.cost });
        }
        // setMessages(omsg => replaceLastElement(omsg, newMessage));
        //从messages中根据msgId找到对应的msg，然后替换

        setTimeout(() => {
          setMessages(imgs => {
            imgs[messageIndex] = newMessage;
            return [...imgs]
          });
        }, 1000);

      }
    })
    setInputDisable(false);
  }

  //图片描述
  const handleImgDescribe = async (imgUrl: string) => {
    if (!imgUrl) return;
    setIsDescribeApiRequesting(true);
    try {
      const data = await requestAliyunArt('img-describe-mj', { imgUrl });
      setIsDescribeApiRequesting(false);
      if (data.code === 0) {
        setImgDescribeTexts(data.data.prompt.split('\n\n'));
        store.dispatch({ type: 'user/makePointChange', payload: -data.data.cost });
      } else {
        message.error(data.message);
      }
    } catch (error) {
      setIsDescribeApiRequesting(false);
    }
  };

  //图片融合
  const handleImgBlend = async () => {
    if (!blendImgs || blendImgs.length === 0) return;
    if (blendImgs.length < 2) {
      message.error('请至少选择两张图片');
      return;
    }
    if (blendImgs.length > 5) {
      message.error('最多只能选择五张图片');
      return;
    }
    let newMessage: Message = {
      text: `image blend`,
      hasTag: false,
      progress: defaultTips,
      img: defaultImg,
      buttons: []
    };
    let messageIndex = messages.length;
    setInputDisable(true);
    setMessages((omsg) => {
      return [...omsg, newMessage]
    });
    setShowBlendModal(false);

    requestAliyunArtStream({
      path: 'blend',
      data: {
        imgs: blendImgs.map(i => i.url)
      },
      onDataChange(data: any) {
        //mj 服务报错
        if (data.code === 40025 || data.code === 40024) {
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
        newMessage.buttons = data.buttons;

        if (data.id) {
          // newMessage.hasTag = true;
          //扣减点数
          store.dispatch({ type: 'user/makePointChange', payload: -data.cost });
        }
        // setMessages(omsg => replaceLastElement(omsg, newMessage));
        //从messages中根据msgId找到对应的msg，然后替换

        setMessages(imgs => {
          imgs[messageIndex] = newMessage;
          return [...imgs]
        });
      }
    })
    setInputDisable(false);

  };

  const handleArray = (direction: string) => {
    if (messages.length === 0) return;
    if (direction === 'down') {
      setCurrentIndex((prevIndex) => (prevIndex === messages.length - 1 ? 0 : prevIndex + 1));
    } else {
      setCurrentIndex((prevIndex) => (prevIndex === 0 ? messages.length - 1 : prevIndex - 1));
    }
    const t = messages[currentIndex].text;
    setInputValue(t.replace(replaceExp, ''));
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
      setBdVid(bd_vid);
      localStorage.setItem('bd_vid', bd_vid);
    }
    if (qhclickid) {
      setQhclickid(qhclickid);
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

  const getSeed = async (taskId: string | undefined) => {
    setRequestingSeed(taskId || '');
    const result = await requestAliyunArt(`get-seed?taskId=${taskId}`, null, 'GET');
    setRequestingSeed('');
    if (result.code === 0) {
      setSeed(result.data.seed);
      setShowSeed(true);
      store.dispatch({ type: 'user/makePointChange', payload: -result.data.cost });
    }
  }

  //从链接中取出img_id参数，并查询图片信息（根据id）
  const getImgInfoById = async () => {
    const id = getQueryString('id');
    if (id) {
      const result = await requestAliyunArt('get-my-img-detail', { id });
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
        buttons: []
      };
      newMessage.msgHash = '';
      newMessage.msgID = data.img_id;
      newMessage.content = data.prompt;
      setMessages((msgs) => [newMessage]);

      setClientId(Number(clientId));
    }
  };

  //从链接中取出img_id参数，并查询图片信息（根据taskId）
  const getImgInfo = async () => {
    const id = getQueryString('id');
    if (id) {
      const result = await requestAliyunArt('get-my-img-detail-by-img-id', { imgId: id });
      const data = result.data;
      //如果状态码是40042，表示图片已超时，无法再次生成
      if (result.code === 40042) {
        message.warning('二次编辑功能仅针对网络问题造成的图片不显示可进行二次编辑，超过 1 小时之后的图片不支持二次编辑，请根据提示词再次生成。', 10);
        setInputValue(data.prompt);
        return;
      }
      //检查是否是自己的图片
      if (result.code !== 0) {
        message.error(result.message, 8);
        return;
      }
      setInputValue(data.prompt);
      let newMessage: Message = {
        progress: "完成",
        text: data.prompt,
        hasTag: true,
        img: `${imgBasePath}${data.img_url}`,
        buttons: []
      };
      newMessage.msgHash = '';
      newMessage.msgID = data.img_id;
      newMessage.buttons = data.buttons;
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
  //当redux中user.id改变时，隐藏购买弹窗
  useEffect(() => {
    if (user.secret) {
      if (dontShowBuyIds.indexOf(user.secret) > -1) {
        localStorage.setItem('hiddenBuyModal3', 'true');
        setShowCourseBuyModal(false);
      }
    }
  }, [user.secret]);

  //页面初始化
  useEffect(() => {
    getPrompt();
    checkTips();
    setBDVid();
    showQRcode();
    setRandomClientId();
    //如果hiddenBuyModal3不存在，显示弹窗
    if (!localStorage.getItem('hiddenBuyModal3')) {
      setShowCourseBuyModal(true);
    }
    return () => {
      Router.events.off('routeChangeComplete', getPrompt);
    }
  }, []);

  return (
    <>
      <Head>
        <title>Midjourney - 中国官网</title>
        <meta name="description" content="Midjourney中国区官网，通过Midjourney AI让绘画如此简单，您只需要在Midjourney AI中描述你的画面即可，这里为您为准备了Midjourney AI基本的使用教程，Stable Diffusion、Dalle3等，是在中国使用Midjourney一站式平台！" />
        <meta name="keywords" content="Midjourney,Midjourney中文网,Midjourney中国官网,MJ AI,Midjourney培训、MJ咒语" />
      </Head>
      <div className='w-full mx-auto px-4 h-full overflow-y-hidden list-input-container'>
        {/* 右下角的购买课程按钮弹窗 */}
        {
          false && <div className='course-buy-box'>
            <div className='course-buy-close-btn' onClick={() => {
              // localStorage.setItem('hiddenBuyModal3', 'true');
              setShowCourseBuyModal(false);
            }}>
              <i className='iconfont icon-guanbi'></i>
            </div>
            <a href='https://mp.weixin.qq.com/s?__biz=MzkxNzUwMTIyMQ==&mid=2247483792&idx=1&sn=5a6dc3d39b81efe5c545c5db15c3cfa1&chksm=c1bee5daf6c96ccc44cce587e5e0f99b2a26a8718603d4832968068e5a4078d6121687f8476c&token=1720764114&lang=zh_CN#rd' target='_blank'>
              <img className='buy-course-img' src='https://superx.chat/stuff/course.jpg' alt='购买课程' />
              <div className='buy-course-title'>视频课</div>
            </a>
          </div>
        }

        {/* 购买点数 */}
        {isShowBuyPointEntry && (
          <div className='dalle-point-box'>
            <PaintingPoint></PaintingPoint>
          </div>
        )}

        {contextHolder}
        {/* <Spin>{paintingTip}</Spin> */}
        {/* 课程广告弹窗 */}
        {/* 价格提示弹窗 */}
        <Modal
          title='Midjourney 视频教程'
          style={{ top: 20, width: '700px' }}
          open={showCourseBuyModal}
          destroyOnClose={true}
          closable={true}
          maskClosable={false}
          okText='去看看'
          onCancel={() => {
            setShowCourseBuyModal(false);
          }}
          footer={[
            <Button
              key='ok'
              onClick={() => {
                setShowCourseBuyModal(false);
              }}
            >
              取消
            </Button>,
            <Button
              key='ok'
              type='primary'
              onClick={() => {
                // window.location.href = 'https://superx.chat/stuff/course/';
                window.open('https://superx.chat/stuff/course/');
              }}
            >
              立即观看
            </Button>,
          ]}
        // footer={null}
        >
          <a href='https://superx.chat/stuff/course/' target='_blank'>
            <img src="https://superx.chat/stuff/course-ad-modal.png" alt="" style={{ width: "100%", borderRadius: "20px" }} />
          </a>
          <div style={{ textAlign: "right" }}>
            <Checkbox
              onChange={(e) => {
                const checked = e.target.checked;
                checked ? localStorage.setItem('hiddenBuyModal3', 'true') : localStorage.removeItem('hiddenBuyModal3');
              }}
            >
              不再提示
            </Checkbox>
          </div>
        </Modal>
        {/* 价格提示弹窗 */}
        <Modal
          title='MJ 使用提示'
          style={{ top: 20, width: '500px' }}
          open={showStartTips}
          destroyOnClose={true}
          closable={true}
          maskClosable={false}
          okText='确定'
          onCancel={() => {
            setShowStartTips(false);
          }}
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
        {/* 种子结果提示 */}
        <Modal
          title='提示'
          style={{ top: 20, width: '500px' }}
          open={showSeed}
          destroyOnClose={true}
          closable={true}
          maskClosable={false}
          okText='确定'
          onCancel={() => {
            setShowSeed(false);
          }}
          footer={[
            <Button
              key='ok'
              type='primary'
              onClick={() => {
                setSeedCopyText('复制')
                setShowSeed(false);
                setSeed('')
              }}
            >
              确定
            </Button>,
          ]}
        // footer={null}
        >
          <div>
            <div>seed（种子）值：{seed}</div>
            <div style={{ marginTop: "15px" }}>带种子提示词：{seedPrompt} --seed {seed}  <Button
              size='small'
              onClick={() => {
                setSeedCopyText('已复制')
                setInputValue(`${seedPrompt} --seed ${seed}`)
              }}
              data-clipboard-text={`${seedPrompt} --seed ${seed}`}
              className='copy-prompt-btn'
            >
              {seedCopyText}
            </Button></div>
            <div style={{ marginTop: "15px", fontSize: "13px" }}>
              <p>种子使用说明：</p>
              <p>种子决定了一次生成的初始图像。相同的种子+相同的提示词将得到100%完全相同的两张图片（如果不固定种子，即使提示词相同，两次生成的图片也会不一样）。因此，通过固定种子数，然后略微修改提示词，可达到“在一张底图上进行微调”的效果。</p>
              <p style={{ marginTop: "15px" }}>举例：第一次生成：通过 a girl 得到一张女孩的照片，然后获取种子，假设种子数是：123</p>
              <p>此时修改提示词（按个人意图进行修改）为：a girl, Wear glasses --seed 123（通过固定种子复用第一张图片） ，然后再次生成，将在第一张图的基础上为人物戴上眼镜。</p>
              {/* <p>点击上方复制按钮将复制完整参数，然后略微修改提示词再次生成，以生成你想要的图片。</p> */}
            </div>
          </div>
        </Modal>
        {/* 上传图片进行描述弹窗 */}
        <Modal
          title='描述图片（Describe）'
          style={{ top: 20, width: '500px' }}
          open={showDescribeModal}
          destroyOnClose={true}
          closable={true}
          maskClosable={false}
          okText="完成"
          onOk={() => {
            setShowDescribeModal(false);
          }}
          onCancel={() => {
            setShowDescribeModal(false);
          }}
        // footer={[
        //   <Button
        //     key='ok'
        //     type='primary'
        //     onClick={() => {
        //       setShowDescribeModal(false);
        //     }}
        //   >
        //     完成
        //   </Button>,
        // ]}
        // footer={null}
        >
          <div>
            <div style={{ padding: '15px', display: 'flex', justifyContent: 'center', flexWrap: 'wrap' }}>
              <OssUploader disabled={isDescribeApiRequesting} buttonText='点击选择图片进行解析' onChange={(files => {
                setDescribeImageUrl(files[0].url || '');
                handleImgDescribe(files[0].url || '');
              })}></OssUploader>
              {/* <div style={{ fontSize: '12px', width: "100%", textAlign: 'center', }}>（消耗 1 点数）</div> */}
            </div>
            {/* 图片描述结果 */}
            <div>
              {isDescribeApiRequesting && <div>正在解析图片描述词，请稍候...</div>}
              {!isDescribeApiRequesting && imgDescribeTexts.length > 0 && <>
                <div style={{ marginTop: "15px" }}>描述词（已生成 4 条描述）：</div>
                {imgDescribeTexts.map(item => {
                  return (
                    <>
                      <div style={{ marginTop: "5px" }}>
                        {item as string} &nbsp;&nbsp;
                        <Button
                          size='small'
                          onClick={() => {
                            setInputValue((item as string).replace(/1️⃣|2️⃣|3️⃣|4️⃣/g, ''));
                            message.success('提示词已复制')
                          }}
                          data-clipboard-text={(item as string).replace(/1️⃣|2️⃣|3️⃣|4️⃣/g, '')}
                          className='copy-prompt-btn'
                        >
                          复制
                        </Button>
                      </div>
                    </>
                  );
                })}</>}
            </div>

          </div>
        </Modal>
        {/* 多图混合blend弹窗 */}
        <Modal
          title='多图融合（Blend）'
          style={{ top: 20, width: '500px' }}
          open={showBlendModal}
          destroyOnClose={true}
          closable={true}
          maskClosable={false}
          okText="开始融合"
          onOk={() => {
            handleImgBlend();
          }}
          onCancel={() => {
            setShowBlendModal(false);
          }}
        // footer={null}
        >
          <div>

            <div style={{ padding: '15px', display: 'flex', justifyContent: 'center', flexWrap: 'wrap' }}>
              <OssUploader disabled={isDescribeApiRequesting} buttonText='选择图片' multiple={true} maxCount={5} onChange={(files => {
                setBlendImgs(files)
              })}></OssUploader>
              {/* <div style={{ fontSize: '12px', width: "100%", textAlign: 'center', }}>（消耗 1 点数）</div> */}
            </div>
            {/* 图片融合界面 */}
            <div style={{ textAlign: "center", cursor: "pointer" }}>
              <Tooltip title={<div><p>将多张图片融合为一张。融合过程中 midjourney 会对图片进行艺术加工。</p>
                <p>最多融合 5 张图片。建议两张最佳，前两张的权重最高。</p>
                <p>点数消耗： 8 个点数。</p></div>}>
                <span>融合说明</span> <QuestionCircleOutlined style={{ cursor: 'pointer' }} />
              </Tooltip>
            </div>

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
        <Modal title='翻译中' style={{ top: 20 }} open={isTranslating && false} closable={false} cancelText='' okText='' footer={null}>
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
            {messages.map(({ text, img, progress, content, msgID, msgHash, buttons, paintingText }, index) => (
              <div className='img-list-item' key={index}>
                <div className='mj-prompt-box'>
                  {' '}
                  {text.replace(/- <@\d+>\s*\([^)]*\)/g, '')} {`(${progress === 'done' ? '完成' : progress})`}{' '}
                  <Button
                    size='small'
                    onClick={() => {
                      setInputValue(text.replace(/- <@\d+>\s*\([^)]*\)/g, '').replace(replaceExp, ''));
                    }}
                    data-clipboard-text={text.replace(/- <@\d+>\s*\([^)]*\)/g, '').replace(replaceExp, '')}
                    className='copy-prompt-btn'
                  >
                    复制提示词
                  </Button>
                </div>
                <div className='workspace-img-container' style={{ width: `${baseWidth}px`, minHeight: getImgCalcHeight(img, text) }}>
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
                      <div style={{ width: "130px", display: 'inline-block' }}>
                        <LottieAnimation animationData={dkJson}></LottieAnimation>
                      </div>
                      <div style={{ marginTop: '10px', display: 'flex', textAlign: 'center', justifyContent: 'center' }}>
                        <Spin tip=''></Spin> <span style={{ color: '#888', fontSize: '13px' }}> {paintingText}</span>
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
                      loading={!!requestingSeed && (msgID === requestingSeed)}
                      onClick={() => {
                        setSeedPrompt(text.replace(/- <@\d+>\s*\([^)]*\)/g, '').replace(replaceExp, ''))
                        getSeed(msgID)
                      }}
                    >
                      获取seed <Tooltip title={`seed值作为图片的“种子”和唯一标识，可在下次生成时，以： --seed xxx(替换成获取到的数字) 参数追加在提示词最后。然后略微修改描述词，以达到在该图片的基础上，进行微调的效果。`}>
                        <QuestionCircleOutlined style={{ cursor: 'pointer' }} />
                      </Tooltip>
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
                {buttons && buttons.length > 0 && (
                  <>
                    <div>
                      {buttons.map((button, index) => {
                        return <><CheckableTag
                          className={
                            button.checked ? "tag-checked" : "tag-unchecked"
                          }
                          checked={button.checked}
                          onChange={checked => {
                            if (!checked) return;
                            button.checked = true;
                            // 执行button click动作
                            onButtonClick({
                              buttonId: button.customId, imgId: msgID, buttonLabel: button.label, prompt: content
                            });
                          }}
                        >
                          {button.label || button.emoji}
                        </CheckableTag>
                          {/* {(index + 1) % 4 === 0 && index !== buttons.length - 1 && <br />} */}
                        </>
                      })}
                      {/* 按钮解释 */}
                      <Tooltip title={<div className='button-desc-box'>
                        <div className='title'>按钮说明：</div>
                        <div className='line'>数字 1-4 对应四宫格的 1 2 3 4 号图片</div>
                        <div className='line'><b>U+图片编号</b>：获取单张高清图</div>
                        <div className='line'><b>V+图片编号</b>：对某张图进行变体（生成相似图）</div>
                        <div className='line'><b>延伸</b>：保持内容不变，往指定方向扩展画面</div>
                        <div className='line'><b>缩放</b>：保持画布尺寸不变，但是生成更多内容（主体变小）</div>
                        <div className='title' style={{ marginTop: "10px" }}>点数消耗：</div>
                        <div className='line'><b>U</b>：2 个点数</div>
                        <div className='line'><b>V</b>：8 个点数</div>
                        <div className='line'><b>延伸</b>： 8 个点数</div>
                        <div className='line'><b>缩放 1.5 倍</b>： 15 个点数</div>
                        <div className='line'><b>缩放 2 倍</b>： 20 个点数</div>
                      </div>}>
                        <QuestionCircleOutlined style={{ cursor: 'pointer' }} />
                      </Tooltip>

                      {/* <MyTag
                      Data={['U1', 'U2', 'U3', 'U4']}
                      type='upscale'
                      onClick={(tag) => {
                        scrollToBottom();
                        tagClick(String(content), String(msgID), String(msgHash), tag);
                      }}
                    /> */}
                    </div>
                    {/* <MyTag
                    Data={['V1', 'V2', 'V3', 'V4']}
                    type='variation'
                    onClick={(tag) => {
                      scrollToBottom();
                      tagClick(String(content), String(msgID), String(msgHash), tag);
                    }}
                  /> */}
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
            {/* 故障提示 */}
            {isWrong && <Alert
              message={<>亲爱的用户您好，midjourney 官方服务器故障，正在修复。给您带来不便深感抱歉（可尝试Stable Diffusion，DALLE3 等，除midjourney 之外的其他服务不受影响）。</>}
              banner
              type='success'
              closable
            />}
            <Alert
              message={<> 重大更新：本站始终以用户体验为第一原则，在保持出图质量和价格不变的前提下，生成速度提升了2倍！飞一般的生成速度，欢迎体验！</>}
              banner
              style={{ width: 'calc(100vw - 480px)' }}
              
              type='success'
              closable
            />
            <p className='no-content-tips'>使用 midjourney 生成你的专属人工智能绘画作品。</p>
            {/* 走马灯作品展播 */}

            {showSlidePaint && <div style={{ marginTop: "30px" }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontWeight: 600, fontSize: '16px' }}>作品展示</div>
                <div>查看更多作品，请点击：<Link href="/paintings" style={{ textDecoration: "underline" }}>艺术公园</Link></div>
              </div>
              <SlidePaint></SlidePaint></div>}

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
            {/* 图片描述 */}
            <div className='line-change-box2'>
              <div style={{ marginRight: '5px', marginLeft: '20px' }}>
                <Button onClick={() => {
                  setShowDescribeModal(true);
                }}>图片转提示词</Button>
              </div>
              <Tooltip title={`describe功能。可通过上传一张图片，反向推断出图片对应相近的描述词，方便后续生成。`}>
                <QuestionCircleOutlined style={{ cursor: 'pointer' }} />
              </Tooltip>
            </div>
            {/* 图片 Blend */}
            <div className='line-change-box2'>
              <div style={{ marginRight: '5px', marginLeft: '20px' }}>
                <Button onClick={() => {
                  setShowBlendModal(true);
                }}>多图融合（Blend）</Button>
              </div>
              <Tooltip title={`Blend功能，可将最多 5 张图片混合为 1 张图片。`}>
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
              （下方提示词输入框中的链接请勿删除）。将在此图基础上，结合您的提示词生成新的作品。
            </div>
          )}

          <Space.Compact style={{ width: '100%' }}>
            <TextArea
              className='w-full'
              disabled={inputDisable || isWrong}
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
              placeholder='请详细描述你要生成的图片，如：一只猫在草地上玩耍（支持中文，会自动翻译）。'
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
    </>
  );
};

export default Index;
