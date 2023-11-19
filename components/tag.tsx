import React, { useMemo, useState } from "react";
import { Space, Tag, Tooltip } from "antd";

const { CheckableTag } = Tag;

interface Props {
  Data: string[];
  onClick?: (tag: string) => void;
  type: "variation" | "upscale";
}

const App = ({ Data, onClick, type }: Props) => {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  // const tagsData = ["V1", "V2", "V3", "V4"];
  const handleChange = (tag: string, checked: boolean) => {
    if (!checked) return;
    const nextSelectedTags = checked
      ? [...selectedTags, tag]
      : selectedTags.filter((t) => t !== tag);
    console.log("You are interested in: ", nextSelectedTags);
    onClick && onClick(tag);
    setSelectedTags(nextSelectedTags);
  };

  const calcTitle = (type: string, index: number) => {
    if (type === 'upscale') {
      return `高清绘制第${index + 1}张图片`
    }
    if (type === 'variation') {
      return `以第${index + 1}张图片为基础创作四张变体`
    }
    return '';
  }


  return (
    <>
      <Space className="operation-btn-space" size={16} wrap>
        {Data.map((tag, index) => (
          <Tooltip key={tag} placement="top" title={calcTitle(type, index)} arrow={true}>
            <CheckableTag
              className={
                selectedTags.includes(tag) ? "tag-checked" : "tag-unchecked"
              }
              checked={selectedTags.includes(tag)}
              onChange={(checked) => handleChange(tag, checked)}
            >
              {tag}
            </CheckableTag>
          </Tooltip>
        ))}
      </Space>
    </>
  );
};

export default App;
