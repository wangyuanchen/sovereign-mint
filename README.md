# Sovereign Mint

[中文文档](./README_zh.md)

AI-powered Web3 whitepaper and landing page generator with multi-model support, wallet authentication, and multi-chain USDT payments.

## Features

- 🤖 **Multi-Model AI** - Choose from top AI models (Claude, GPT-4o, Gemini, Llama, Mistral)
- 🔐 **Web3 Authentication** - Sign in with your wallet (MetaMask, WalletConnect, Coinbase, Rainbow)
- 💰 **USDT Payments** - Pay with USDT on popular EVM chains
- 📄 **PDF Export** - Download generated content as professional PDFs
- 🌍 **Bilingual** - English and Chinese support with auto-detection
- 📊 **Quota System** - Monthly generations with optional boost packs

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Database**: Drizzle ORM + PostgreSQL
- **AI Provider**: OpenRouter (multi-model)
- **Web3**: Wagmi v2 + RainbowKit
- **Payments**: USDT (ERC20) on Ethereum / Optimism / Polygon / Arbitrum / Base

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm
- PostgreSQL database

### Environment Variables

Create a `.env.local` file:

```env
# Database
DATABASE_URL=postgresql://...

# Auth
JWT_SECRET=your-jwt-secret

# Web3
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your-project-id

# AI
OPENROUTER_API_KEY=your-openrouter-key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Installation

```bash
# Install dependencies
pnpm install

# Push database schema
pnpm db:push

# Run development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Pricing Model

| Plan | Price | Features |
|------|-------|----------|
| Free | $0 | 3 generations/month, free models only |
| Unlock | $29 (one-time) | 30 generations/month, all premium models |
| Boost Pack | $19 | +20 extra generations (never expires) |

## License

[MIT](./LICENSE)

## Links

- [X (Twitter)](https://x.com)
- [GitHub](https://github.com/wangyuanchen/sovereign-mint)
- [YouTube](https://youtube.com)
