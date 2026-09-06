# CLAUDE.md - 智能物业系统前端开发规范

## 项目概述

智能物业管理系统（和家云服务管理云平台）Web 管理端，基于 Ant Design Pro 脚手架（UmiJS Max 4 + React 19 + antd 6）二次开发。

- 后端仓库：`../SmartProperty`（Spring Cloud 微服务），线上地址 https://github.com/Zzznopay/SmartProperty
- 前端只与**网关（smart-property-gateway，端口 8000）**通信，不直连各微服务
- 功能模块与后端服务一一对应：系统基础服务（system）/ 房产财务服务（property）/ 运营管理服务（operation）

---

## 技术栈锁定

| 技术 | 版本 | 说明 |
|------|------|------|
| React | 19 | UI 框架 |
| UmiJS Max | 4 | 路由 / 构建 / 插件体系 |
| Ant Design | 6 | UI 组件库 |
| @ant-design/pro-components | 3 | ProTable / ProForm / ProLayout |
| TypeScript | 5+ | 严格模式 |
| TailwindCSS | 4 | 原子化样式 |
| @tanstack/react-query | 5 | 复杂服务端状态 |
| Biome | 2 | Lint + 格式化（唯一规范工具） |
| Vitest | 4 | 单元测试 |

- **Node >= 22**
- **只用 npm + `package-lock.json`**，禁止 yarn / pnpm

---

## 常用命令

```bash
npm install            # 安装依赖
npm run dev            # 启动开发服务 http://localhost:5173（MOCK=none，直连真实后端）
npm start              # 启动开发服务（模板 Mock 文件已清理，现与 dev 等效）
npm run build          # 生产构建 → dist/
npm run lint           # Biome 规范检查 + tsc 类型检查
npm run biome          # Biome 自动修复与格式化
npm run test           # Vitest 单测
npm run openapi        # 按后端 OpenAPI 规范重新生成 src/services/ant-design-pro/
```

---

## 目录结构与分层

```
config/
  config.ts            # UmiJS 主配置（title、locale、代理等）
  routes.ts            # 路由与菜单（声明式，按 system/property/operation 分组）
  proxy.ts             # dev 代理 /api/ → http://localhost:8000（模板遗留，业务请求不走它）
src/
  app.tsx              # 运行时配置：getInitialState 拉取 currentUser
  access.ts            # 权限定义：canAdmin / canPerm
  requestErrorConfig.ts# 统一响应解包、错误处理、401 跳转、token 存取
  services/
    smart-property/    # ★ 业务 API 层（手写，可编辑）
      apiBase.ts       # API_BASE 定义（dev 直连网关 / 生产相对路径）
      http.ts          # PageParams / PageResult 公共类型
      system|property|operation/   # 按后端服务分目录的 API 文件
    ant-design-pro/    # 模板遗留自动生成，禁止手改
  pages/
    system|property|operation/     # 页面，与路由一一对应
    user/login/        # 登录页
  locales/             # 国际化文案（zh-CN / en-US 双语）
```

### 页面约定

- 每个页面一个目录：`src/pages/{模块}/{页面名}/index.tsx`，页面私有的 `service.ts`、`_mock.ts`、`data.d.ts` 与页面同目录放置
- 列表页统一用 ProTable 的 `request` 属性加载数据；复杂服务端状态用 `@tanstack/react-query`
- 路由 `name` 对应 i18n key（`menu.xxx`），**新增页面必须同步补齐 `src/locales/zh-CN/menu.ts` 和 `en-US/menu.ts` 两份菜单文案**

---

## 后端联调约定

### 请求基址（src/services/smart-property/apiBase.ts）

| 环境 | API_BASE | 说明 |
|------|----------|------|
| dev | `http://localhost:8000/api/v1` | 浏览器直连网关（不经 dev proxy），网关 CORS 白名单已放行 `http://localhost:5173` |
| 生产 | `/api/v1` | 相对路径，由 Nginx 同源反代到网关 |

### 接口契约（与后端 CLAUDE.md 对齐）

- 路径：`/api/v1/{模块}/{资源}`，RESTful
- 响应：`{code, message, data}`，由 `requestErrorConfig.ts` 统一解包（`SUCCESS_CODE` 判定成功）
- 分页：后端返回 `{total, pageNum, pageSize, pages, records}`，`http.ts` 的 `PageResult<T>` 适配为 ProTable 结构
- 认证：token 存取与刷新见 `requestErrorConfig.ts`（`ACCESS_TOKEN_KEY` / `REFRESH_TOKEN_KEY`）；**401 自动跳转 `/user/login?redirect=原路径`**

### 后端服务端口（仅作联调参考，前端只连 8000）

| 服务 | 端口 |
|------|------|
| gateway | 8000 |
| system | 8001 |
| property | 8002 |
| operation | 8003 |

---

## 权限模型

`/auth/user-info` 返回 `roles` + `permissions`，`src/access.ts` 计算：

- `canAdmin`：roles 含 `admin` 或 `super_admin`
- `canPerm(perm)`：permissions 含指定权限，`*:*:*` 为通配

路由配置里的 `access` 字段控制菜单显隐与页面准入。

---

## 关键规则（必须遵守）

1. **Biome only** — 不引入 ESLint / Prettier；`npm run lint` 与 `npx antd lint ./src` 都必须通过才能提交
2. **写 antd 代码前先查 API** — `npx antd info <Component>`，不要凭记忆猜 props
3. **Conventional commits** — commitlint 强制校验（feat/fix/chore/...）
4. **业务代码只写在** `src/pages/` 和 `src/services/smart-property/`；`src/services/ant-design-pro/` 是自动生成产物，禁止手改（重新生成用 `npm run openapi`）
5. **样式优先级**：TailwindCSS（布局）→ antd-style `createStyles`（主题 token）→ CSS Modules → Less（仅遗留代码）
6. **`.umi` 目录是自动生成的** — dev server 异常时删掉 `src/.umi` 重启
7. **提交前跑 `npm run lint`**；husky 钩子未生效时（clone 后未装依赖）先 `npm install`

---

## 测试

- Vitest + @testing-library/react，DOM 环境为 happy-dom / jsdom
- 测试与页面同目录放置（如 `src/pages/user/login/login.test.tsx`）
- `npm run test` 全量跑，`npm run test:coverage` 覆盖率

---

## 模板遗留（勿依赖）

- `npm run deploy`（gh-pages）：模板遗留，未使用
- `npm run record`（@umijs/request-record）：模板的 Mock 录制工具，未使用

---

## AI Skills

本项目自带两个 Claude Code Skills（`.claude/skills/`）：

### /antd — Ant Design CLI

- `npx antd info <Component>` — 写代码前查组件 API（必做）
- `npx antd lint ./src` — 检查过时/问题用法（提交前必过）
- `npx antd demo <Component> <demo>` — 查看官方示例
- `npx antd migrate <from> <to>` — 大版本迁移清单

### /pro-upgrade — 模板升级

自动 diff 最新 Ant Design Pro 模板并合并框架变更，保留业务代码。升级前先提交本地改动。
