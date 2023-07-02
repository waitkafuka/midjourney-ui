import { MJMessage } from "midjourney";
import { notification } from "antd";

 const decoder = new TextDecoder("utf-8");

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
      description: `接口超时，请检查：1.参考词没有敏感内容 2.参考词中的参数格式是否正确，请查阅左侧参数手册 3.参考图没有涉黄涉暴。您可以更换参考词、参数、参考图重新再试。status: ${response.status}`,
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

      buffer += decoder.decode(value);

      let startIdx = 0;
      let endIdx = buffer.lastIndexOf("}");
      while (endIdx !== -1) {
        const jsonString = buffer.substring(startIdx, endIdx + 1);
        try {
          console.log('string', jsonString);
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
  return streamFetch("/art/sapi/imagine", body, loading);
};

export const Upscale = (body: string, loading?: (uri: MJMessage) => void) => {
  return streamFetch("/art/sapi/upscale", body, loading);
};

export const Variation = (body: string, loading?: (uri: MJMessage) => void) => {
  return streamFetch("/art/sapi/variation", body, loading);
};
