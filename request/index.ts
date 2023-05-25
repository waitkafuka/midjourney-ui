import { MJMessage } from "midjourney";
import { notification } from "antd";

const streamFetch = async (
  url: string,
  body: string,
  loading?: (uri: MJMessage) => void
) => {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-type": "application/json",
    },
    body,
  });
  if (!response.ok) {
    notification.info({
      message: "提示",
      description: `接口超时，请重新发起请求。如要刷新页面，请提前下载您的图片。response.status: ${response.status}`,
      duration: 0,
    })
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const reader = response.body?.getReader();
  let buffer = "";
  if (reader) {
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }

      buffer += new TextDecoder("utf-8").decode(value);

      let startIdx = 0;
      let endIdx = buffer.indexOf("}");
      while (endIdx !== -1) {
        const jsonString = buffer.substring(startIdx, endIdx + 1);
        try {
          const parsedMessage = JSON.parse(jsonString);
          loading && loading(parsedMessage);
        } catch (error) {
          console.error("Error parsing JSON:", error);
        }
        startIdx = endIdx + 1;
        endIdx = buffer.indexOf("}", startIdx);
      }
      buffer = buffer.slice(startIdx);
    }
  } else {
    console.log("Response body is null");
  }
};

export const Imagine = (body: string, loading?: (uri: MJMessage) => void) => {
  return streamFetch("/mj/api/imagine", body, loading);
};

export const Upscale = (body: string, loading?: (uri: MJMessage) => void) => {
  return streamFetch("/mj/api/upscale", body, loading);
};

export const Variation = (body: string, loading?: (uri: MJMessage) => void) => {
  return streamFetch("/mj/api/variation", body, loading);
};
