#!/bin/bash

# 获取当前时间并格式化为指定格式
timestamp=$(date +"%Y-%m-%d%H:%M:%S")

# 设置备份目录
backup_dir="/usr/local/zks/bak/superx-mj-ui/"

# 检查备份目录是否存在，如果不存在则创建
if [ ! -d "$backup_dir" ]; then
  mkdir -p "$backup_dir"
fi

# 检查out文件夹是否存在
if [ -d "out" ]; then
  # 备份out文件夹到指定目录，并以时间戳命名
  cp -r "out" "$backup_dir/out_$timestamp"
  echo "备份成功！"
else
  echo "out文件夹不存在，无法备份。"
fi


git pull
yarn
yarn static