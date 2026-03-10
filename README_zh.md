# Sovereign Mint

[English](./README.md)

AI 驱动的 Web3 白皮书和落地页生成器，支持多模型、钱包认证和 Base 网络 USDC 支付。

## 功能特性

- 🤖 **多模型 AI** - 可选顶级 AI 模型（Claude、GPT-4o、Gemini、Llama、Mistral）
- 🔐 **Web3 认证** - 使用钱包登录（MetaMask、WalletConnect、Coinbase、Rainbow）
- 💰 **USDC 支付** - 在 Base 网络使用 USDC 支付
- 📄 **PDF 导出** - 将生成内容下载为专业 PDF
- 🌍 **双语支持** - 中英文支持，自动检测浏览器语言
- 📊 **配额系统** - 每月生成次数 + 可选加量包

## 技术栈

- **框架**: Next.js 14 (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS + shadcn/ui
- **数据库**: Drizzle ORM + MySQL (PlanetScale)
- **AI 服务**: OpenRouter (多模型)
- **Web3**: Wagmi v2 + RainbowKit
- **支付**: Base 网络 USDC

## 快速开始

### 前置要求

- Node.js 18+
- pnpm
- MySQL 数据库（推荐 PlanetScale）

### 环境变量

创建 `.env.local` 文件：

```env
# 数据库
DATABASE_URL=mysql://...

# 认证
JWT_SECRET=your-jwt-secret

# Web3
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your-project-id

# AI
OPENROUTER_API_KEY=your-openrouter-key

# 应用
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 安装运行

```bash
# 安装依赖
pnpm install

# 推送数据库结构
pnpm db:push

# 启动开发服务器
pnpm dev
```

打开 [http://localhost:3000](http://localhost:3000) 查看应用。

## 定价模式

| 方案 | 价格 | 功能 |
|------|------|------|
| 免费 | $0 | 每月 3 次生成，仅限免费模型 |
| 解锁 | $29（一次性） | 每月 30 次生成，所有高级模型 |
| 加量包 | $19 | +20 次额外生成（永不过期） |

## 许可证

[MIT](./LICENSE)

## 链接

- [X (Twitter)](https://x.com)
- [GitHub](https://github.com/wangyuanchen/sovereign-mint)
- [YouTube](https://youtube.com)
