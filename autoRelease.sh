#!/bin/bash
# 文件原路径
srcPath="./unpackage/dist/build/web"
# 发布路径文件夹
releasePath="../server/public/mobile"

if [ ! -d "$srcPath" ]; then
    echo "构建产物不存在：$srcPath，请先在 HBuilderX 或 uni-app 构建 H5。"
    exit 1
fi

#删除发布目录下的mobile文件
rm -rf "$releasePath"
echo "已删除 ==> $releasePath 下的目录文件"
mkdir -p "$releasePath"
echo "已新建 ==> $releasePath 目录"

# 复制打包目录内的文件到发布目录
cp -r "$srcPath"/* "$releasePath"
echo "已复制 $srcPath/* ==> $releasePath"

cp "$releasePath/../favicon.ico" "$releasePath"
