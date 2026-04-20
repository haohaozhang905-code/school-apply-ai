# AI 择校建议系统 - school-apply-ai

> AI 驱动的美国留学择校建议平台，帮助文书老师高效服务学生。

## 🎯 项目概览

- **框架**：Next.js 16 + TypeScript + Tailwind CSS
- **数据库**：Supabase (PostgreSQL)
- **AI**：Claude API (Anthropic)
- **飞书集成**：自动同步学生数据至飞书多维表格

## 📦 项目结构

```
school-apply-ai/
├── app/                    # Next.js App Router
│   ├── api/               # API 路由
│   ├── apply/            # 学生填表页面
│   └── admin/            # 老师后台页面
├── lib/                   # 工具函数和配置
│   ├── supabase.ts       # Supabase 客户端
│   ├── types.ts          # TypeScript 类型定义
│   ├── token.ts          # Token 生成和验证
│   └── submission.ts     # 提交记录操作
├── database.sql          # 数据库 Schema
├── .env.local            # 环境变量（本地）
└── PRD.md               # 产品需求文档
```

## 🚀 快速开始

### 1. 环境配置

填写 `.env.local` 中的环境变量：

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
LARK_BASE_TOKEN=ZAwYbizNAaIEfGsQGaQcJDwBnob
LARK_TABLE_ID=tblrz4luxbJ9lEjM
CLAUDE_API_KEY=
ADMIN_PASSWORD=
```

### 2. 初始化 Supabase

在 Supabase SQL Editor 执行 `database.sql` 创建表和索引。

### 3. 启动开发服务器

```bash
npm install
npm run dev
```

## 📋 MVP 任务进度

- ✅ **Task 1**：项目基础架构 + Supabase 初始化
- ⏳ **Task 2**：Token 校验 + 链接管理后台
- ⏳ **Task 3**：学生信息收集表单
- ⏳ **Task 4**：AI 择校建议生成
- ⏳ **Task 5**：飞书多维表格同步
