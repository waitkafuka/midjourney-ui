import React, { use, useEffect, useState, useRef, useMemo } from "react";
import { Input, Button, Table, Image, Typography, message, Modal, Spin, Select, Space, Divider, Checkbox, notification, Tag, Switch, Tooltip, } from "antd";
import { SendOutlined, UploadOutlined, QuestionCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";
import { Imagine, Upscale, Variation } from "../request";
import { MJMessage } from "midjourney";
import { Message } from "../interfaces/message";
import MyTag from "../components/tag";
import { requestAliyun, requestAliyunArt } from "../request/http";
import { useSelector, useDispatch } from 'react-redux';
import { downloadFile, getQueryString, hasChinese } from '../scripts/utils';
import { NEXT_PUBLIC_IMAGE_PREFIX, PAINTING_POINTS_ONE_TIME } from '../scripts/config';
import { getRatio, getHeight } from "../scripts/utils";
import PaintingPoint from "../components/paintingPoint";
import store from "../store";
import AliyunOSSUploader from "../components/OssUploader";
import { ossUploadedImgBaseURL } from '../scripts/config'
import { isPromptValid } from "../scripts/utils";
import type { ColumnsType } from "antd/es/table";
const imgExp = /<([^<>]+)>/g;

const baseWidth = 500;
const { TextArea } = Input;
const { Text } = Typography;
const defaultTips = "正在生成..."
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
  const [showTips, setShowTips] = useState(true);
  const [showPublicTips, setShowPublicTips] = useState(true);
  const [clientIndex, setClientIndex] = useState(0)
  const [showOperationtTips, setShowOperationtTips] = useState(false);
  const [isShowParamsTips, setIsShowParamsTips] = useState(false);
  const [showQrcodeModal, setShowQrcodeModal] = useState(true);
  const [clientCount, setClientCount] = useState(0);
  const [nodes, setNodes] = useState<any[]>([]);
  const [hasStartImagin, setHasStartImagin] = useState(false);

  //测试
  // const [messages, setMessages] = useState<Message[]>([{
  //   text: '测试',
  //   img: 'https://oss-cdn-h.youyi.asia/attachments/1100632439031877675/1109823643304853564/waitkafuka_an_asian_woman_poses_for_a_portrait_in_the_style_of__61423d59-7663-42d4-b972-eb4a2cf1e6d6.png?x-oss-process=style/scale_500',
  //   progress: 'done',
  //   hasTag: true,
  // }]);
  const [messages, setMessages] = useState<Message[]>([]);
  const user = useSelector((state: any) => state.user.info);
  const dispatch = useDispatch();
  const [messageApi, contextHolder] = message.useMessage();
  // const defaultImg = 'data:image/png;base64,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'
  const defaultImg = ''
  const [paintingTip, setPaintingTip] = useState<string>('');
  const [api, contextHolder2] = notification.useNotification();

  const scrollToBottom = () => {
    setTimeout(() => {
      const chat = document.querySelector(".img-list-box");
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
      describe: "图片尺寸宽:高（Aspect Ratios），例如：--ar 16:9"
    },
    {
      name: '--chaos 0-100',
      describe: "变异程度，默认 0。数字越大，图片想象力越发散，例如：--chaos 50"
    },
    {
      name: '--iw 0-2',
      describe: "参考图权重，值越大，参考图的权重越大，默认 1。例如：--iw 1.25（仅在v5或者niji5模型下有效）"
    },
    {
      name: '--no 元素',
      describe: "排除某些元素，例如：--no plants，生成图中将不包含plants"
    },
    {
      name: '--q <.25、.5、1>',
      describe: "指定生成图的质量，默认 1。例如：--q .5（仅在v4、5，niji5下有效）"
    },
    {
      name: '--style raw ',
      describe: "减少 midjourney 的艺术加工，生成更摄影化的图片。例如：--style raw（只在v5.1下有效）"
    },
    {
      name: '--style <cute, expressive, original, or scenic>',
      describe: "设置动漫风格：可爱、表现力、原始、或者风景。例如：--style cute（只在--niji 5下有效）"
    },
    {
      name: '--s（或--stylize） 数字',
      describe: "设置midjourney的艺术加工权重，默认 100。取值范围 0-1000（v4、v5），626-60000（v3），niji模式下无效"
    },
    {
      name: '--niji',
      describe: "模型设置。设置为日本动漫风格模型，例如：--niji，也可以写成：--niji 5（目前 5 可以省略）"
    },
    {
      name: '--v <1-5> ',
      describe: "模型设置。设置模型版本，例如：--v 5"
    },

  ];

  const checkUserAuth = () => {
    if (!user || !user.email) {
      message.error('用户尚未登录', 5);
      return false;
    }
    //检查点数是否足够
    if (user.point_count < PAINTING_POINTS_ONE_TIME) {
      message.error('点数不足，请先充值');
      return;
    }
    return true;
  }
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
    };
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
        if (result.code !== 0) {
          messageApi.error(result.message, 10);
          setIsTranslating(false);
          return;
        }
        result = result.data;
        setIsTranslating(false);
        console.log('翻译结果', result);
        newMessage.text = `${imgStrArray.join(' ')} ${result}`;
        setInputValue(result);
        // }
      }
      setInputDisable(true);
      setMessages(msgs => [...msgs, newMessage]);
      try {
        await Imagine(
          JSON.stringify({ prompt: newMessage.text, clientIndex }),
          (data: any) => {
            if (data.code === 40015) {
              //未登录
              setTimeout(() => {
                window.location.href = process.env.NODE_ENV === 'development' ? '/login' : '/login.html';
              }, 1000)
              return;
            }
            // 判断用户信息
            if (data.code === 40016) {
              //无权限
              messageApi.error(data.message, 10);
              return;
            }

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

            console.log('imagin dataing:', data);
            newMessage.img = data.uri.replace(
              "https://cdn.discordapp.com/",
              NEXT_PUBLIC_IMAGE_PREFIX
            );
            if (data.id) {
              newMessage.hasTag = true;
              //扣减点数
              store.dispatch({ type: 'user/pointChange', payload: user.point_count - PAINTING_POINTS_ONE_TIME })
              setHasStartImagin(true);
            }

            newMessage.msgHash = data.hash;
            newMessage.msgID = data.id;
            newMessage.progress = data.progress;
            newMessage.content = data.content;
            const oldMessages = messages;
            // setMessages(omsg => replaceLastElement(omsg, newMessage));
            setMessages([...oldMessages, newMessage]);
          }
        );
      } catch (error) {
        console.log('生成出错了：', error);
        message.error('出错了:' + error, 30)
        setInputDisable(false);
      }
      setInputValue("");
      setInputDisable(false);
    }
  };

  const upscale = async (
    pormpt: string,
    msgId: string,
    msgHash: string,
    index: number
  ) => {
    let newMessage: Message = {
      text: `${pormpt} upscale U${index}`,
      hasTag: false,
      progress: defaultTips,
      img: defaultImg,
    };

    setInputDisable(true);
    setMessages(omsg => [...omsg, newMessage]);
    try {
      await Upscale(
        JSON.stringify({ content: pormpt, index, msgId, msgHash, clientIndex }),
        (data: MJMessage) => {
          console.log('upscale dataing:', data);
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
          newMessage.img = data.uri.replace(
            "https://cdn.discordapp.com/",
            NEXT_PUBLIC_IMAGE_PREFIX
          );
          newMessage.msgHash = data.hash;
          newMessage.msgID = data.id;
          newMessage.content = data.content;
          newMessage.progress = data.progress;
          const oldMessages = messages;
          // setMessages(omsg => replaceLastElement(omsg, newMessage));
          setMessages([...oldMessages, newMessage]);
        }
      );
    } catch (error) {
      console.log('upscale出错了：', error);
      message.error('出错了:' + error, 30)
      setInputDisable(false);
    }

    setInputDisable(false);
  };
  const variation = async (
    content: string,
    msgId: string,
    msgHash: string,
    index: number
  ) => {
    let newMessage: Message = {
      text: `${content} variation V${index}`,
      hasTag: false,
      progress: defaultTips,
      img: defaultImg,
    };

    setInputDisable(true);
    setMessages(omsg => [...omsg, newMessage]);
    try {
      await Variation(
        JSON.stringify({ content, index, msgId, msgHash, clientIndex }),
        (data: MJMessage) => {
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
          newMessage.img = data.uri.replace(
            "https://cdn.discordapp.com/",
            NEXT_PUBLIC_IMAGE_PREFIX
          );
          if (data.uri.endsWith(".png")) {
            newMessage.hasTag = true;
            //扣减点数
            store.dispatch({ type: 'user/pointChange', payload: user.point_count - (PAINTING_POINTS_ONE_TIME / 2) })
          }
          console.log('variation dataing:', data);
          newMessage.msgHash = data.hash;
          newMessage.msgID = data.id;
          newMessage.content = data.content;
          newMessage.progress = data.progress;
          const oldMessages = messages;
          // setMessages(omsg => replaceLastElement(omsg, newMessage));
          setMessages([...oldMessages, newMessage]);
        }
      );
    } catch (error) {
      console.log('variation出错了：', error);
      message.error('出错了:' + error, 30)
      setInputDisable(false);
    }

    setInputDisable(false);
  };
  const tagClick = (
    content: string,
    msgId: string,
    msgHash: string,
    tag: string
  ) => {
    switch (tag) {
      case "V1":
        variation(content, msgId, msgHash, 1);
        break;
      case "V2":
        variation(content, msgId, msgHash, 2);
        break;
      case "V3":
        variation(content, msgId, msgHash, 3);
        break;
      case "V4":
        variation(content, msgId, msgHash, 4);
        break;
      case "U1":
        upscale(content, msgId, msgHash, 1);
        break;
      case "U2":
        upscale(content, msgId, msgHash, 2);
        break;
      case "U3":
        upscale(content, msgId, msgHash, 3);
        break;
      case "U4":
        upscale(content, msgId, msgHash, 4);
        break;
      default:
        break;
    }
  };

  //定义一个方法，取出链接参数中的prompt，放在 Input 中
  const getPrompt = () => {
    //从链接中取出prompt参数
    const urlSearchParam = new URLSearchParams(window.location.search);
    const prompt = urlSearchParam.get("prompt");
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
    const localShowTips = localStorage.getItem("showTips");
    if (localShowTips === 'false') {
      setShowTips(false)
    }

    const localShowPublicTips = localStorage.getItem("showPublicTips");
    if (localShowPublicTips === 'false') {
      setShowPublicTips(false)
    }
  }

  const setBDVid = () => {
    //从链接中获取bd_vid参数
    const bd_vid = getQueryString('bd_vid');
    if (bd_vid) {
      sessionStorage.setItem('bd_vid', bd_vid)
    }
  }

  //随机一个 0-2 的随机数
  const setRandomClientIndex = async () => {
    //首先获取客户端的数量
    const { length: clientCount } = await requestAliyunArt('/client-length', null, 'GET');
    setClientCount(clientCount);
    //设置nodes
    const nodes = [];
    for (let i = 0; i < clientCount; i++) {
      nodes.push({
        value: i,
        label: `绘画服务器${i + 1}`,
      });
    }
    setNodes(nodes);

    const rand = Math.floor(Math.random() * clientCount);
    setClientIndex(rand);
  };

  const showQRcode = () => {
    if (localStorage.getItem('noAllowQrcode') === 'true') {
      setShowQrcodeModal(false)
    }
  }

  //页面初始化
  useEffect(() => {
    getPrompt();
    checkTips();
    setBDVid();
    showQRcode();
    setRandomClientIndex();
  }, []);

  return <>
  <div>系统故障，正在恢复中，请 20 分钟后重试。</div></>;
};

export default Index;
