# 智能物业管理系统 - 前端

智能物业管理系统（和家云服务管理云平台）的 Web 管理端，基于 [Ant Design Pro](https://pro.ant.design/) 脚手架开发，对接[智能物业系统后端](https://github.com/Zzznopay/SmartProperty)（Spring Cloud 微服务架构）。

## 技术栈

| 技术 | 版本 | 说明 |
|------|------|------|
| React | 19 | UI 框架 |
| UmiJS Max | 4 | 企业级前端框架（路由 / 构建 / 插件体系） |
| Ant Design | 6 | UI 组件库 |
| @ant-design/pro-components | 3 | Pro 表格 / 表单 / 布局组件 |
| TypeScript | 5+ | 类型安全 |
| TailwindCSS | 4 | 原子化样式 |
| @tanstack/react-query | 5 | 服务端状态管理 |
| Biome | 2 | 代码规范检查与格式化 |
| Vitest | 4 | 单元测试 |

> 环境要求：Node.js >= 22

## 功能模块

### 系统基础服务 `/system`

用户管理、角色管理、菜单管理、部门管理、字典管理、物业公司、登录日志、操作日志。

### 房产财务服务 `/property`

- **房产**：小区管理、楼宇管理、单元管理、房间管理
- **业主 / 租户**：业主管理、租户管理
- **交易**：销售合同、验房记录、装修记录、租赁合同
- **财务**：费项设置、台帐管理、收费管理、票据管理、车位管理、预收款、抄表管理

### 运营管理服务 `/operation`

- **服务工单**：报修 / 投诉等工单的受理与跟踪
- **保洁绿化**：清洁安排、清洁检查、绿化植被、绿化检查
- **消防安全**：消防设施、消防巡查、消防演练、社区活动
- **保安管理**：保安安排、执勤记录、来访登记、物品出入、车辆进出
- **行政办公**：公告管理、规章制度、意见箱、投票调查、消息中心
- **业委会**：业委会成员、业委会会议

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务（http://localhost:5173）
npm run dev
```

前端通过本地代理访问后端：开发环境下 `/api/` 请求会被代理到 `http://localhost:8000`（smart-property-gateway 网关端口），代理配置见 [config/proxy.ts](config/proxy.ts)。需要先启动后端服务，登录与各业务接口才能正常工作；后端的部署与启动步骤见后端仓库的 `deploy/DEPLOY.md`。

## 常用命令

| 命令 | 说明 |
|------|------|
| `npm run dev` | 启动开发服务（端口 5173） |
| `npm run start:no-mock` | 关闭 Mock 启动开发服务 |
| `npm run build` | 生产构建，产物输出到 `dist/` |
| `npm run preview` | 本地预览构建产物 |
| `npm run lint` | Biome 规范检查 + TypeScript 类型检查 |
| `npm run biome` | Biome 自动修复与格式化 |
| `npm run test` | 运行单元测试 |
| `npm run openapi` | 根据后端 OpenAPI 规范生成接口代码 |

## 目录结构

```
├── config/               # UmiJS 配置（路由、代理、构建等）
│   ├── config.ts         # 主配置
│   ├── routes.ts         # 路由与菜单
│   └── proxy.ts          # 本地开发代理
├── src/
│   ├── pages/            # 页面组件（按 system / property / operation 分模块）
│   ├── components/       # 通用业务组件
│   ├── locales/          # 国际化文案（zh-CN / en-US）
│   ├── services/         # 接口请求层
│   └── access.ts         # 权限定义
├── mock/                 # 本地 Mock 数据
└── tests/                # 测试
```
