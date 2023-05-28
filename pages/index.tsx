import React, { use, useEffect, useState, useRef } from "react";
import { Input, Button, List, Image, Typography, message, Modal, Spin } from "antd";
import { SendOutlined } from "@ant-design/icons";
import { Imagine, Upscale, Variation } from "../request";
import { MJMessage } from "midjourney";
import { Message } from "../interfaces/message";
import Tag from "../components/tag";
import { requestAliyun } from "../request/http";
import { useSelector, useDispatch } from 'react-redux';
import { notification } from 'antd';
import { downloadFile, hasChinese } from '../scripts/utils';
import { NEXT_PUBLIC_IMAGE_PREFIX } from '../scripts/config';
import Link from "next/link";

const { TextArea } = Input;
const { Text } = Typography;
const defaultTips = "正在生成，大约需要 1-2 分钟，请耐心等待..."
const cache: {
  inputValue: string,
  inputDisable: boolean | null,
  messages: Message[],
  isTranslating: boolean | null,
} = {
  inputValue: '',
  inputDisable: null,
  messages: [],
  isTranslating: null,
}


const Index: React.FC = () => {
  const [inputValue, setInputValue] = useState('');
  const inputValueRef = useRef(inputValue);
  const [inputDisable, setInputDisable] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const user = useSelector((state: any) => state.user.info);
  const dispatch = useDispatch();
  const [stopServe, setStopServe] = useState(true);
  const [messageApi, contextHolder] = message.useMessage();
  const defaultImg = 'data:image/png;base64,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'

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
      messageApi.error('用户尚未登录', 5);
      return false;
    }
    if (!(user.token_type === 0 || user.token_type === 3)) {
      messageApi.error('目前 midjourney 绘画功能仍在内测阶段，尚未开放售卖。仅对已购买过本站包月会员用户开放试用权限。', 10);
      return false;
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
        try {
          result = await requestAliyun('translate', { content: newMessage.text });

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
        newMessage.text = result;
        setInputValue(result);
        // }
      }
      const oldMessages = messages;
      setInputDisable(true);
      setMessages([...oldMessages, newMessage]);
      try {
        await Imagine(
          JSON.stringify({ prompt: newMessage.text }),
          (data: any) => {
            if (data.code === 40015) {

              setTimeout(() => {
                window.location.href = process.env.NODE_ENV === 'development' ? '/login' : '/login.html';
              }, 1000)
              return;
            }
            // 判断用户信息
            if (data.code === 40016) {
              messageApi.error(data.message, 10);
              return;
            }

            console.log('imagin return data:', data);
            newMessage.img = data.uri;
            if (data.id) {
              newMessage.hasTag = true;
            }
            newMessage.msgHash = data.hash;
            newMessage.msgID = data.id;
            newMessage.progress = data.progress;
            newMessage.content = data.content;
            setMessages([...oldMessages, newMessage]);
          }
        );
      } catch (error) {
        console.log('生成出错了：', error);

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

    const oldMessages = messages;
    setInputDisable(true);
    setMessages([...oldMessages, newMessage]);
    try {
      await Upscale(
        JSON.stringify({ content: pormpt, index, msgId, msgHash }),
        (data: MJMessage) => {
          newMessage.img = data.uri;
          newMessage.msgHash = data.hash;
          newMessage.msgID = data.id;
          newMessage.content = data.content;
          newMessage.progress = data.progress;
          setMessages([...oldMessages, newMessage]);
        }
      );
    } catch (error) {
      console.log('upscale出错了：', error);
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

    const oldMessages = messages;
    setInputDisable(true);
    setMessages([...oldMessages, newMessage]);
    try {
      await Variation(
        JSON.stringify({ content, index, msgId, msgHash }),
        (data: MJMessage) => {
          newMessage.img = data.uri;
          if (data.uri.endsWith(".png")) {
            newMessage.hasTag = true;
          }
          newMessage.msgHash = data.hash;
          newMessage.msgID = data.id;
          newMessage.content = data.content;
          newMessage.progress = data.progress;
          setMessages([...oldMessages, newMessage]);
        }
      );
    } catch (error) {
      console.log('variation出错了：', error);
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
  const renderMessage = ({
    text,
    img,
    hasTag,
    msgHash,
    msgID,
    progress,
    content,
  }: Message) => {
    if (NEXT_PUBLIC_IMAGE_PREFIX) {
      img = img.replace(
        "https://cdn.discordapp.com/",
        NEXT_PUBLIC_IMAGE_PREFIX
      );
    }
    return (
      <>
        <List.Item
          className="flex flex-col space-y-4 justify-start items-start"
          style={{
            alignItems: "flex-start",
            paddingTop: "25px",
            paddingBottom: "25px",
          }}
        >
          <Text>
            {text} {`(${progress})`}
          </Text>

          <Image className="rounded-xl" src={img} />
          {/* ，如果您不希望展示，可进入“<Link href="/mypaintings">我的作品</Link>”进行关闭。 */}
          {(img && img !== defaultImg) && <div><a href={img} style={{ textDecoration: "underline" }} target="_blank">查看大图</a> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<a href='javascript:;' style={{ textDecoration: "underline" }} onClick={() => { downloadFile(img) }}>下载图片 </a> （图片将默认匿名显示在“艺术公园”中）</div>}
          {hasTag && (
            <Tag
              Data={["U1", "U2", "U3", "U4"]}
              type="upscale"
              onClick={(tag) => {
                scrollToBottom();
                tagClick(String(content), String(msgID), String(msgHash), tag)
              }
              }
            />
          )}
          {hasTag && (
            <Tag
              Data={["V1", "V2", "V3", "V4"]}
              type="variation"
              onClick={(tag) => {
                scrollToBottom();
                tagClick(String(content), String(msgID), String(msgHash), tag)
              }
              }
            />
          )}
        </List.Item>
      </>
    );
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
    <>
      {stopServe ? <div className="no-content-tips">当前使用人数过多，服务器已无法继续提供服务。图片渲染需要耗费大量计算资源，请稍后再试。</div> : <div className="w-full mx-auto px-4 h-full overflow-y-hidden list-input-container">
        {contextHolder}
        <Modal
          title="翻译中"
          style={{ top: 20 }}
          open={isTranslating}
          closable={false}
          cancelText=""
          okText=""
          footer={null}
        >
          <p><Spin />正在为您翻译为英文...</p>
        </Modal>
        <List
          className="mx-auto justify-start overflow-y-auto img-list-box"
          style={{
            height: "calc(100vh - 96px)",
          }}

          dataSource={messages}
          renderItem={renderMessage}
          locale={{ emptyText: '当前使用人数过多，服务器已无法继续提供服务。图片渲染需要大量计算资源，请稍后再试。' }}
        // locale={{ emptyText: '使用 midjourney 来生成你的第一幅人工智能绘画作品。' }}
        />
        <div className="prompt-input-wrap">
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
            disabled={inputDisable}
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
      </div>}
    </>

  );
};

export default Index;
