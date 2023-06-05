import React, { use, useEffect, useState, useRef, useMemo } from "react";
import { Input, Button, List, Image, Typography, message, Modal, Spin, Upload } from "antd";
import { SendOutlined, UploadOutlined } from "@ant-design/icons";
import { Imagine, Upscale, Variation } from "../request";
import { MJMessage } from "midjourney";
import { Message } from "../interfaces/message";
import Tag from "../components/tag";
import { requestAliyun } from "../request/http";
import { useSelector, useDispatch } from 'react-redux';
import { downloadFile, hasChinese } from '../scripts/utils';
import { NEXT_PUBLIC_IMAGE_PREFIX, PAINTING_POINTS_ONE_TIME } from '../scripts/config';
import { getRatio, getHeight } from "../scripts/utils";
import PaintingPoint from "../components/paintingPoint";
import store from "../store";
import AliyunOSSUploader from "../components/OssUploader";
import { ossImgBaseURL } from '../scripts/config'
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
  //测试
  // const [messages, setMessages] = useState<Message[]>([{
  //   text: '测试',
  //   img: 'https://img.alicdn.com/imgextra/i4/2200758132660/O1CN01Q4Z2QI1qZQ8QYQY5B_!!2200758132660.jpg',
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

  const scrollToBottom = () => {
    setTimeout(() => {
      const chat = document.querySelector(".img-list-box");
      if (chat) {
        chat.scrollTop = chat.scrollHeight;
      }
    }, 1000);
  };

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
    let newMessage: Message = {
      text: inputValue.trim(),
      hasTag: false,
      progress: defaultTips,
      img: defaultImg,
    };

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
          JSON.stringify({ prompt: newMessage.text }),
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

            console.log('imagin dataing:', data);
            newMessage.img = data.uri.replace(
              "https://cdn.discordapp.com/",
              NEXT_PUBLIC_IMAGE_PREFIX
            );
            if (data.id) {
              newMessage.hasTag = true;
              //扣减点数
              store.dispatch({ type: 'user/pointChange', payload: user.point_count - PAINTING_POINTS_ONE_TIME })

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
        message.error('出错了:' + error)
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
        JSON.stringify({ content: pormpt, index, msgId, msgHash }),
        (data: MJMessage) => {
          console.log('upscale dataing:', data);
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
      message.error('出错了:' + error)
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
        JSON.stringify({ content, index, msgId, msgHash }),
        (data: MJMessage) => {
          newMessage.img = data.uri.replace(
            "https://cdn.discordapp.com/",
            NEXT_PUBLIC_IMAGE_PREFIX
          );
          if (data.uri.endsWith(".png")) {
            newMessage.hasTag = true;
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
      message.error('出错了:' + error)
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

  //页面初始化
  useEffect(() => {
    getPrompt();
    // 加载的时候，如果有缓存，就把缓存的数据赋值给页面

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
    <div className="w-full mx-auto px-4 h-full overflow-y-hidden list-input-container">
      <div className='dalle-point-box'><PaintingPoint></PaintingPoint></div>
      {contextHolder}
      {/* <Spin>{paintingTip}</Spin> */}
      <Modal
        title="翻译中"
        style={{ top: 20 }}
        open={isTranslating}
        closable={false}
        cancelText=""
        okText=""
        footer={null}
      >
        <div><Spin />正在翻译为英文...</div>
      </Modal>
      {/* <List
        className="mx-auto justify-start overflow-y-auto img-list-box"
        style={{
          height: "calc(100vh - 96px)",
        }}

        dataSource={messages}
        renderItem={renderMessage}
        locale={{ emptyText: '使用 midjourney 来生成你的第一幅人工智能绘画作品。' }}
      /> */}
      {messages.length > 0 ? <div className="workspace-img-wrap img-list-box" style={{
        height: "calc(100vh - 96px)", overflowY: "auto"
      }}>
        {/* 图片结果列表容器 */}
        {messages.map(({ text, img, progress, hasTag, content, msgID, msgHash }, index) => <div className="img-list-item" key={img}>
          <div> {text} {`(${progress})`}</div>
          <div className="workspace-img-container" style={{ width: `${baseWidth}px`, height: getImgCalcHeight(img, text) }}>

            <img src={img} style={{ cursor: isDone(progress) ? 'zoom-in' : 'auto' }} onClick={() => {
              // <img src={thumbUrl(img, text)} style={{ cursor: isDone(progress) ? 'zoom-in' : 'auto' }} onClick={() => {
              if (isDone(progress)) {
                window.open(img, '_blank');
              }
            }} />
            {img && <p className="no-content-tips" style={{ fontSize: "13px" }}>图片默认公开展示在“艺术公园”，可在左侧“我的作品”中进行管理。</p>}

            {!img && <Spin tip="正在生成，大约需要 1-2 分钟，请耐心等待..."></Spin>}
            {/* 隐藏一个原图，这是为了提前缓存，以便在后面点击查看大图的时候能够更快加载 */}
            <img src={img} style={{ display: 'none' }} />
          </div>
          {/* ，如果您不希望展示，可进入“<Link href="/mypaintings">我的作品</Link>”进行关闭。 */}
          {(img && img !== defaultImg) && <div style={{ marginTop: "15px" }}><a href={img} style={{ textDecoration: "underline" }} target="_blank">查看大图</a> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<a style={{ textDecoration: "underline" }} onClick={() => { downloadFile(img) }}>下载图片 </a> </div>}
          {hasTag && (
            <>
              <div style={{ marginTop: "10px" }}>
                <Tag
                  Data={["U1", "U2", "U3", "U4"]}
                  type="upscale"
                  onClick={(tag) => {
                    scrollToBottom();
                    tagClick(String(content), String(msgID), String(msgHash), tag)
                  }
                  }
                />
              </div>
              <Tag
                Data={["V1", "V2", "V3", "V4"]}
                type="variation"
                onClick={(tag) => {
                  scrollToBottom();
                  tagClick(String(content), String(msgID), String(msgHash), tag)
                }
                }
              />
              <p style={{ marginTop: "0px" }}>如果您觉得某张图片还不错，别忘了点 U+编号，获取高清图片~ </p>

            </>
          )}
        </div>)}
      </div> : <>
        <p className="no-content-tips">使用 midjourney 生成你的第一幅人工智能绘画作品。</p>
        {/* <p className="no-content-tips">请勿使用违禁词汇，违者将被封号。</p> */}
        {!user.email && <p className="no-content-tips">您尚未登录，请先<a href="/login/?redirect=/art" style={{ fontSize: "14px", textDecoration: "underline" }}> 登录</a></p>}
      </>}
      <div className="prompt-input-wrap">
        <AliyunOSSUploader buttonText="添加参考图" onChange={fileList => {
          if (fileList.length > 0) {
            //只在上传完成后做操作
            if (fileList[0].status === 'done') {
              const imgUrl = `https:${ossImgBaseURL}${fileList[0].url}`
              setReferImg(imgUrl);
              const exp = /<.*?>/;
              //用正则表达式替换掉输入框中的图片地址，图片地址用<>包裹
              //判断inputValue 中是否有图片地址
              if (exp.test(inputValue)) {
                //如果有，替换掉
                setInputValue(inputValue.replace(exp, `<${imgUrl}>`))
              } else {
                //如果没有，加到开头
                setInputValue(`<${imgUrl}> ${inputValue}`);
              }
            }
          } else {
            setReferImg('')
            setInputValue(v => v.replace(/<\s*([^<>]+)\s*>/g, ''))
            // setInputValue(v => v.replace(`<${referImg}> `, ''))
          }
        }}></AliyunOSSUploader>
        {referImg && <div style={{ margin: "10px 0" }} className="refer-img-box">
          参考图已添加：<a href={referImg} target="_blank">{referImg}</a>，将在此图基础上，结合您的提示词生成新的作品。
        </div>}
        <TextArea
          className="w-full"
          disabled={inputDisable}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && e.shiftKey) {
              setInputValue(`${inputValue}\n`);
              e.preventDefault();
            } else if (e.key === "Enter") {
              handleMessageSend();
              e.preventDefault();
            }
          }}
          placeholder="请描述你要绘画的作品。（例如：a cat。midjourney本身不支持中文，但您仍然可以输入中文，生成时系统将自动为您翻译为英文。可以使用ChatGPT生成你的提示词prompt。）"
          autoSize={{ minRows: 1, maxRows: 6 }}
          style={{ paddingRight: 30 }}
        />
        <Button
          className="absolute"
          type="primary"
          onClick={handleMessageSend}
          loading={inputDisable}
          icon={<SendOutlined className="send-prompt-btn" />}
          title="Send"
          style={{
            position: "absolute",
            bottom: 0,
            right: 0,
            background: "transparent",
            border: "none",
            boxShadow: "none",
          }}
        />
      </div>
    </div>
  );
};

export default Index;
