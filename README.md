# 贝壳投资小程序

这是一个基于 Taro + React + NutUI + TailwindCSS 开发的投资管理小程序。

## 项目环境要求

- Node.js 16.x 或更高版本
- 微信开发者工具
- npm 包管理工具

如果您还没有安装 npm，请选择以下任一方式进行安装：

方案一：直接从官网安装
1. 首先下载并安装 Node.js（npm会随Node.js一起安装）
   - 访问 [Node.js官网](https://nodejs.org/)
   - 下载并安装最新的LTS版本

方案二：使用 Homebrew 安装（仅适用于 macOS）
1. 如果还没有安装 Homebrew，请先安装：
   ```bash
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
   ```
2. 使用 Homebrew 安装 Node.js：
   ```bash
   brew install node
   ```

安装完成后，打开终端输入以下命令验证安装：
```bash
node --version
npm --version
```

## 快速开始

### 1. 安装依赖

首先克隆项目后，在项目根目录下运行：

```bash
npm install
```

### 2. 开发模式启动

```bash
npm run dev:weapp
```

### 3. 在微信开发者工具中预览

1. 打开微信开发者工具
2. 点击工具栏的【项目】->【导入项目】
3. 选择项目目录下的 `dist` 文件夹
4. 填写小程序的 AppID（如果没有，可以使用测试号）
5. 点击确定，即可在开发者工具中预览小程序

## 项目结构

```
src/
  ├── assets/        # 静态资源文件
  ├── components/    # 公共组件
  ├── pages/         # 页面文件
  ├── app.config.js  # 全局配置
  ├── app.js         # 入口文件
  └── app.css        # 全局样式
```

## 构建生产版本

```bash
npm run build:weapp
```

## 注意事项

1. 首次运行 `dev:weapp` 或 `build:weapp` 命令时，需要等待一段时间进行编译
2. 确保微信开发者工具的 "ES6 转 ES5" 和 "增强编译" 选项处于开启状态
3. 如果遇到样式问题，可能需要在微信开发者工具中清除缓存后重新编译

## 技术栈

- Taro 3.6.6
- React 18
- NutUI React
- TailwindCSS
- TypeScript

## 支持与帮助

如果在使用过程中遇到问题，可以：

1. 查看 [Taro 官方文档](https://taro.zone/)
2. 查看 [NutUI-React 文档](https://nutui.jd.com/react/2x/#/zh-CN/guide/intro)
3. 查看 [微信小程序文档](https://developers.weixin.qq.com/miniprogram/dev/framework/) 