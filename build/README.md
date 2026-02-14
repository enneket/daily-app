# 应用图标

此目录包含应用的图标文件，用于不同平台的打包。

## 图标文件

- `icon.icns` - macOS 应用图标（512x512 像素）
- `icon.ico` - Windows 应用图标（256x256 像素）
- `icon.png` - Linux 应用图标（512x512 像素）

## 替换图标

如果需要更新应用图标：

1. 准备一张高质量的正方形图片（建议 1024x1024 像素）
2. 使用在线工具转换为所需格式：
   - https://www.icoconverter.com/ - 转换为 .ico 和 .icns
   - https://cloudconvert.com/ - 通用格式转换
3. 替换此目录下的对应文件
4. 重新打包应用

## 配置

图标路径已在 `package.json` 的 `build` 配置中指定：

```json
"mac": {
  "icon": "build/icon.icns"
},
"win": {
  "icon": "build/icon.ico"
},
"linux": {
  "icon": "build/icon.png"
}
```
