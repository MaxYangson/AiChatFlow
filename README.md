# ChatFlow - AI智能聊天助手

简体中文 | [English](./README_EN.md)

---

## 📖 项目简介

ChatFlow 是一款简洁现代的AI聊天助手，采用Vue 3纯前端技术栈开发，通过调用外部AI大模型API实现智能对话功能。项目无需后端服务，数据本地存储，开箱即用。

### 核心特点

- 🎨 **极简设计**：清爽现代的界面，专注核心对话体验
- ⚡ **流式输出**：实时逐字显示AI回复，体验流畅
- 💾 **本地存储**：会话数据存储在浏览器本地，保护隐私
- 🔧 **灵活配置**：支持配置不同的AI模型和API地址
- 📱 **响应式设计**：支持桌面端和移动端访问

---

## ✨ 功能特性

### P0级功能（核心功能）

- ✅ **智能对话**：支持多轮对话，保持上下文连贯性
- ✅ **流式响应**：AI回复实时逐字显示
- ✅ **多模态输入**：支持文本和图片输入
- ✅ **会话管理**：
  - 创建新会话
  - 切换不同会话
  - 删除会话
  - 搜索历史会话
- ✅ **本地持久化**：会话数据自动保存到浏览器localStorage
- ✅ **API灵活配置**：支持配置API密钥、地址和模型

### P1级功能（增强功能）

- ✅ **Markdown渲染**：AI回复自动解析Markdown格式
- ✅ **代码高亮**：支持100+种编程语言代码高亮
- ✅ **主题切换**：支持浅色/深色模式
- ✅ **响应式布局**：适配桌面端和移动端

---

## 🛠 技术栈

| 技术 | 说明 |
|------|------|
| **Vue 3** | 渐进式JavaScript框架 |
| **TypeScript** | JavaScript超集，提供类型支持 |
| **TailwindCSS 3** | 原子化CSS框架，快速构建现代界面 |
| **marked** | Markdown解析库 |
| **highlight.js** | 代码语法高亮库 |
| **Lucide Vue** | 现代化图标库 |
| **Vite** | 新一代前端构建工具 |

---

## 🚀 快速开始

### 环境要求

- Node.js >= 16.0.0
- npm >= 8.0.0 或 yarn >= 1.22.0

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

访问 http://localhost:5173 查看应用

### 构建生产版本

```bash
npm run build
```

构建产物将生成在 `dist` 目录

### 预览生产版本

```bash
npm run preview
```

---

## 📁 项目结构

```
src/
├── components/           # Vue组件目录
│   ├── ChatPanel.vue     # 聊天主面板
│   ├── InputArea.vue     # 输入区域组件
│   ├── LoadingDots.vue   # 加载动画组件
│   ├── MessageBubble.vue # 消息气泡组件
│   ├── SettingsPanel.vue # 设置面板组件
│   └── Sidebar.vue       # 侧边栏组件
├── composables/          # Vue组合式函数
│   ├── useChat.ts        # 聊天逻辑
│   ├── useStorage.ts     # 本地存储
│   └── useTheme.ts       # 主题管理
├── types/                # TypeScript类型定义
│   └── index.ts          # 类型导出
├── utils/               # 工具函数
│   ├── api.ts            # API调用封装
│   └── markdown.ts       # Markdown解析
├── App.vue              # 根组件
├── main.ts              # 应用入口
└── style.css            # 全局样式
```

---

## 🎯 使用说明

### 1. 首次使用配置

首次打开应用后，点击右上角**设置图标**，配置以下信息：

- **API密钥**：从智谱AI开放平台获取的API密钥
- **API地址**：智谱AI的API地址（默认：`https://open.bigmodel.cn/api/paas/v4/chat/completions`）
- **模型名称**：可选择 `glm-4-flash`（免费）、`glm-4` 等模型

### 2. 开始对话

1. 在底部输入框输入问题
2. 按 `Enter` 键或点击发送按钮发送消息
3. AI将实时流式返回回复
4. 支持Markdown格式和代码高亮

### 3. 会话管理

- **新建会话**：点击左侧边栏的"+"按钮
- **切换会话**：点击左侧边栏的任意会话
- **删除会话**：悬停会话卡片，点击删除图标
- **搜索会话**：使用左侧搜索框搜索历史会话

### 4. 快捷键

| 快捷键 | 功能 |
|--------|------|
| `Enter` | 发送消息 |
| `Ctrl + Enter` | 换行 |

### 5. 主题切换

点击右上角月亮/太阳图标切换深色/浅色模式

---

## 🔌 支持的AI模型

ChatFlow 基于OpenAI兼容的API接口设计，理论上支持所有兼容ChatGPT接口规范的AI模型。

### 推荐的国内模型

| 模型 | 提供商 | 特点 |
|------|--------|------|
| **glm-4-flash** | 智谱AI | 免费使用，速度快 |
| **glm-4** | 智谱AI | 能力更强 |
| **qwen-turbo** | 阿里云 | 响应快速 |
| **qwen-max** | 阿里云 | 能力最强 |

### 如何切换模型

1. 前往对应AI开放平台获取API密钥
2. 获取API接口地址
3. 在ChatFlow设置面板中配置

---

## 💡 常见问题

### Q1: API调用失败？

**解决方案**：
- 检查API密钥是否正确配置
- 检查API地址是否正确
- 确认网络连接正常
- 查看浏览器控制台错误信息

### Q2: 为什么AI回复显示"访问量过大"？

这是智谱AI的限流提示，建议：
- 稍后重试
- 切换到其他模型（如glm-4）
- 使用自己的API密钥（付费用户无限制）

### Q3: 会话数据存储在哪里？

所有会话数据存储在浏览器**localStorage**中，不会上传到任何服务器。

### Q4: 如何清除所有数据？

在浏览器开发者工具中执行：
```javascript
localStorage.clear()
```

### Q5: 代码块没有高亮？

确认AI回复使用了正确的代码块格式：
````markdown
```javascript
console.log('Hello World');
```
````

---

## 🔧 开发指南

### 添加新功能

1. 在 `src/components` 目录添加Vue组件
2. 在 `src/composables` 目录添加组合式函数
3. 使用TailwindCSS编写样式

### 代码规范

- 使用 TypeScript 提供类型支持
- 组件采用Composition API写法
- 样式优先使用TailwindCSS

### 调试技巧

- 使用 `console.log` 输出调试信息
- 打开浏览器开发者工具（F12）查看网络请求
- 使用Vue DevTools调试组件状态

---

## 📄 许可证

本项目仅供学习交流使用，不可用于商业用途。

---

## 🙏 致谢

本项目参考了以下优秀开源项目：

- [ChatGPT](https://chat.openai.com) - OpenAI对话产品
- [LobeChat](https://github.com/lobehub/lobe-chat) - 开源AI聊天框架
- [豆包](https://www.doubao.com) - 字节跳动AI助手

---

## 📞 联系方式

- **GitHub Issues**: https://github.com/MaxYangson/AiChatFlow/issues
- **邮箱**: 2632385455@qq.com

---

## 📌 版本历史

### v1.0.0 (2026-06-13)
- ✨ 完成MVP版本开发
- ✨ 支持智谱AI大模型调用
- ✨ 实现Markdown解析和代码高亮
- ✨ 支持会话管理和本地存储
- ✨ 适配浅色/深色主题

---

**如果这个项目对您有帮助，请给我们一个 ⭐ Star！**
