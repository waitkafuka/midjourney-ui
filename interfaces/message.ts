export interface Message {
  /**
   * text是用户输入的消息
   */
  text: string;
  /**
  * content是机器人回复的消息，一般和text一致，会加上--seed参数
  */
  content?: string;
  /**
   * img 地址，每次进度更新都会返回
   */
  img: string;
  /**
   * 消息 ID，只在完成时返回
   */
  msgID?: string;
  msgHash?: string;
  /**
   * 是否有标签，只在完成时为true，通过是否有id判断
   */
  hasTag: boolean;
  flags?: number;

  /**
   * 进度百分比，比如：93% 完成
   */
  progress?: string;
}
