#!/bin/bash

# 定义文件路径
VERSION_FILE=".version"
PACKAGE_JSON="package.json"
TAURI_CONF="src-tauri/tauri.conf.json"
CARGO_TOML="src-tauri/Cargo.toml"

# 检查参数是否合法
if [[ $# -ne 1 ]]; then
  echo "使用方法：./tag-publish.sh [major|minor|patch|<version_number>]"
  exit 1
fi

# 读取当前版本号
current_version=$(cat "$VERSION_FILE")

# 解析当前版本号为 major、minor、patch
IFS='.' read -ra version_parts <<< "$current_version"
major="${version_parts[0]}"
minor="${version_parts[1]}"
patch="${version_parts[2]}"

# 根据参数更新版本号
if [[ $1 == "major" ]]; then
  major=$((major + 1))
  minor=0
  patch=0
elif [[ $1 == "minor" ]]; then
  minor=$((minor + 1))
  patch=0
elif [[ $1 == "patch" ]]; then
  patch=$((patch + 1))
else
  # 使用提供的版本号作为新版本号
  new_version=$1
  echo "使用自定义版本号：$new_version"
fi

# 构造新版本号
if [[ -z $new_version ]]; then
  new_version="$major.$minor.$patch"
fi

# 构造带 v 的 tag 名称
tag_name="v$new_version"

# 更新 .version 文件
echo "$new_version" > "$VERSION_FILE"

# 更新 package.json 文件
if [[ -f $PACKAGE_JSON ]]; then
  jq ".version = \"$new_version\"" "$PACKAGE_JSON" > tmpfile && mv tmpfile "$PACKAGE_JSON"
fi

# 更新 src-tauri/tauri.conf.json 文件
if [[ -f $TAURI_CONF ]]; then
  jq ".package.version = \"$new_version\"" "$TAURI_CONF" > tmpfile && mv tmpfile "$TAURI_CONF"
fi

# 更新 src-tauri/Cargo.toml 文件
if [[ -f $CARGO_TOML ]]; then
  sed -i "s/^version = \".*\"/version = \"$new_version\"/" "$CARGO_TOML"
fi

# 提交变更
git add "$VERSION_FILE" "$PACKAGE_JSON" "$TAURI_CONF" "$CARGO_TOML"
git commit -m "Bump version to $new_version"

# 创建 git tag，tag 名称带 v
git tag "$tag_name"

# 推送到远程仓库
git push origin "$tag_name"
git push origin main

echo "版本 $new_version 标记为 $tag_name 并推送到远程仓库。"