# 进度日志

## 会话：2026-06-26

### 阶段 1：需求与发现
- **状态：** complete
- 执行的操作：
  - 读取 mem0 项目记忆，确认此前目标是托管版 Web/移动 AI 酒馆。
  - 读取本地 SillyTavern 关键文件，确认现有用户、角色卡、世界书和内容类型结构。
  - 识别市场、货币、UGC 上传需要新增控制平面。
- 创建/修改的文件：
  - findings.md

### 阶段 2：产品与系统边界
- **状态：** complete
- 执行的操作：
  - 设计市场资产类型、上传流程、购买/安装流程。
  - 设计消费币、赠送币、创作者收益账户和不可变账本。
- 创建/修改的文件：
  - task_plan.md
  - docs/marketplace-currency-design.md

### 阶段 3：技术设计
- **状态：** complete
- 执行的操作：
  - 设计数据库核心实体、API 模块和服务边界。
  - 设计资产审核、版本、购买授权、安装到用户空间流程。
- 创建/修改的文件：
  - docs/marketplace-currency-design.md

### 阶段 4：测试与验证
- **状态：** complete
- 执行的操作：
  - 验证设计与现有角色卡/世界书导入逻辑相容。
  - 检查 Markdown 设计文档已创建。
- 创建/修改的文件：
  - progress.md

### 阶段 5：多 Agent 并发开发
- **状态：** complete
- 执行的操作：
  - 启动 Explorer A 调查 Express 路由、鉴权、用户目录和持久化接入点。
  - 启动 Worker B 实现钱包账本 MVP。
  - 启动 Worker C 实现市场资产后端骨架。
  - 启动 Explorer D 调查角色卡/世界书安装适配。
  - 主 agent 读取 server-main.js、server-startup.js、users-admin.js、users.js 和测试结构，准备集成。
  - 集成 Worker B 的钱包账本 MVP，并收紧 admin grant 为管理员专用。
  - 集成 Worker C 的市场资产 MVP，并补充审核通过后才可购买的状态机。
  - 根据 Explorer D 建议补充 `POST /api/market/assets/:id/install`，安装角色卡和世界书到用户私有目录。
  - 执行 market/wallet 冒烟测试，覆盖创建、提交、审核、免费领取、安装、管理员赠币。
- 创建/修改的文件：
  - task_plan.md
  - progress.md
  - src/endpoints/market.js
  - src/endpoints/wallet.js
  - src/server-startup.js

### 阶段 6：验证与交付
- **状态：** complete
- 执行的操作：
  - 运行 `node --check src/endpoints/market.js && node --check src/endpoints/wallet.js && node --check src/server-startup.js`。
  - 运行 `git diff --check`。
  - 运行临时 Express 冒烟测试。
- 创建/修改的文件：
  - progress.md

### 阶段 7：GitHub 同步
- **状态：** complete
- 执行的操作：
  - 创建分支 `codex/marketplace-wallet-mvp`。
  - 提交 `4a711de82 Add marketplace and wallet MVP endpoints`。
  - 上游 `SillyTavern/SillyTavern` 对当前账号无写权限，改为创建 fork `Angelidiot/SillyTavern`。
  - 推送分支到 `fork/codex/marketplace-wallet-mvp`。
- 创建/修改的文件：
  - task_plan.md
  - progress.md

### 阶段 8：固定价格购买闭环
- **状态：** complete
- 执行的操作：
  - 扩展 `wallet.js`，导出余额查询、ledger 查询、扣款规划、管理员赠币复用和市场购买结算 helper。
  - 扩展 `market.js`，允许 `fixed_price` 资产，购买时按 `bonus -> paid` 扣款并给创作者写入 `earnings`。
  - 为同一用户购买同一资产添加稳定 `purchase_id` 和同进程购买锁，减少重复扣款、重复 entitlement 和销量重复增加。
  - 扩展 Jest 测试，覆盖余额不足无副作用、免费领取不写账、重复购买幂等、创作者收益和价格校验。
- 创建/修改的文件：
  - src/endpoints/market.js
  - src/endpoints/wallet.js
  - tests/market-wallet.test.js
  - docs/marketplace-currency-design.md
  - task_plan.md
  - progress.md

### 阶段 9：前端市场与钱包入口
- **状态：** complete
- 执行的操作：
  - 启动前端结构 scout agent，确认 Marketplace/Wallet 更适合作为内置扩展挂载到 Extensions 面板。
  - 启动 API 契约复核 agent，确认 `/api/market` 和 `/api/wallet` 字段、错误码、购买/安装边界。
  - 新增 `marketplace-wallet` 内置扩展 manifest、模板、脚本和样式。
  - 在 Extensions 面板加入 `#marketplace_wallet_container` 容器。
  - 实现钱包余额展示、市场资产列表、搜索/类型过滤、领取/购买并安装、创作者安装、草稿提交审核。
  - 实现 JSON 文件加载/粘贴创建市场草稿，并增加基础 payload 形状校验和固定价格本地校验。
  - 使用本地 `http://localhost:8000/` 做浏览器 smoke test，确认扩展容器、UI 标题、资产列表和刷新按钮成功加载。
- 创建/修改的文件：
  - public/index.html
  - public/scripts/extensions/marketplace-wallet/manifest.json
  - public/scripts/extensions/marketplace-wallet/window.html
  - public/scripts/extensions/marketplace-wallet/index.js
  - public/scripts/extensions/marketplace-wallet/style.css
  - task_plan.md
  - progress.md

### 阶段 10：管理员审核与赠币入口
- **状态：** complete
- 执行的操作：
  - 启动并发审查 agent，复核 admin UI 显示、审核队列、grant 表单和移动端风险。
  - 在 `marketplace-wallet` 扩展中新增管理员面板，包含赠币表单和 Review Queue。
  - 支持管理员从 Review Queue 直接 approve/reject submitted 资产，拒绝时填写原因。
  - 支持管理员按用户 handle、金额、余额 bucket 和 reason 发放站内币。
  - 将 admin 前端 gate 收紧为 `isAdmin()`，避免用 `default-user` handle 推断管理员权限。
  - 对 grant bucket 增加本地白名单校验，并将空 reason 规范为 `Admin grant`。
  - 将扩展 manifest 升级到 `0.2.0`，JS/CSS 入口加入版本 query，避免浏览器 ESM 模块缓存旧逻辑。
  - 使用本地 `http://localhost:8000/` 做浏览器 smoke test，确认新版脚本/CSS 加载、admin 面板移除 `hidden`、grant 控件和 review queue 存在。
- 创建/修改的文件：
  - public/scripts/extensions/marketplace-wallet/manifest.json
  - public/scripts/extensions/marketplace-wallet/window.html
  - public/scripts/extensions/marketplace-wallet/index.js
  - public/scripts/extensions/marketplace-wallet/style.css
  - task_plan.md
  - progress.md
  - findings.md

### 阶段 11：仓库交付闭环与基础测试
- **状态：** complete
- 执行的操作：
  - 将用户目标明确为持续推进仓库，直到代码、README、基础测试和可运行脚本形成可交付闭环。
  - 新增 `tests/marketplace-wallet.e2e.js`，覆盖 admin review queue、approve 调用、admin grant POST 和移动端 review 布局。
  - 新增 `tests/marketplace-wallet-ui.test.js`，用稳定的 Jest 契约测试覆盖 manifest 版本化、admin 模板、`isAdmin()` gate、grant 校验和移动 CSS。
  - 在根 `package.json` 增加 `test:marketplace` 和 `test:marketplace:e2e` 脚本。
  - 扩展 `README.md`，补充 Hosted AI Tavern MVP 功能、安装、启动、测试和生产化限制。
  - 验证 `npm run test:marketplace` 可从仓库根目录运行并通过 10 个 marketplace/wallet 测试。
  - 验证 `npm run test:marketplace:e2e -- --list` 可列出 2 个 browser E2E 测试。
  - 验证 `npm run start -- --help` 可运行并输出服务器 CLI 帮助。
- 创建/修改的文件：
  - README.md
  - package.json
  - tests/marketplace-wallet-ui.test.js
  - tests/marketplace-wallet.e2e.js
  - task_plan.md
  - progress.md
  - findings.md

### 阶段 12：创作者中心与收益概览
- **状态：** complete
- 执行的操作：
  - 启动两个并发 agent 复核 creator API 与前端入口边界，采纳“summary 只返回聚合视图”和“creator 请求可降级”的反馈。
  - 新增 `GET /api/market/creator/summary`，返回当前创作者自己的资产、草稿/待审核/上架/拒绝数量、claims、paid sales、installs、gross revenue 和 earnings balance。
  - 收紧 creator summary 边界，不返回原始 `wallet`、`recent_earnings` ledger 或资产 `normalized_payload`。
  - 在 `marketplace-wallet` 扩展中新增 Creator Center，放在余额区下方，展示 assets/listed/claims/earned 和最近资产状态。
  - 将 Creator Center summary 改为后台降级加载，钱包和市场列表只依赖 `/api/wallet` 与 `/api/market/assets`。
  - 将公开市场和创作者资产里的计数文案从混用 installs 改为 claims + installs。
  - 扩展后端 Jest 测试，覆盖 creator draft/submitted/listed/rejected 状态、收益聚合、buyer 空 summary 和 payload/ledger 隐私边界。
  - 扩展前端契约测试，覆盖 Creator Center 模板、`total_claims`/`gross_revenue_coins` 绑定、降级加载函数和 responsive stats grid。
  - 更新 `README.md` 和 `docs/marketplace-currency-design.md`，记录 Creator Center API 与 Wallet API 的职责边界。
- 创建/修改的文件：
  - README.md
  - docs/marketplace-currency-design.md
  - src/endpoints/market.js
  - public/scripts/extensions/marketplace-wallet/window.html
  - public/scripts/extensions/marketplace-wallet/index.js
  - public/scripts/extensions/marketplace-wallet/style.css
  - tests/market-wallet.test.js
  - tests/marketplace-wallet-ui.test.js
  - task_plan.md
  - progress.md
  - findings.md

### 阶段 13：网页版/手机版 PWA 安装壳
- **状态：** complete
- 执行的操作：
  - 复用现有 web manifest、移动 viewport meta 和 Apple touch icons，不引入原生 App 壳。
  - 补充 PWA manifest `id`、`scope` 和描述，明确安装入口。
  - 新增 `public/scripts/pwa.js`，在主页面和登录页注册 service worker。
  - 新增 `public/service-worker.js`，只缓存静态 shell，跳过 `/api/*` 和非 GET 请求，避免钱包/市场/聊天请求被缓存。
  - 新增 `tests/pwa.test.js` 和根目录 `test:pwa` 脚本，并将 PWA 契约测试纳入 `test:marketplace`。
  - 更新 README，说明手机浏览器 Add to Home Screen / Install 路径和 service worker 边界。
- 创建/修改的文件：
  - README.md
  - package.json
  - public/manifest.json
  - public/index.html
  - public/login.html
  - public/scripts/pwa.js
  - public/service-worker.js
  - tests/pwa.test.js
  - task_plan.md
  - progress.md
  - findings.md

### 阶段 14：市场资产下架闭环
- **状态：** complete
- 执行的操作：
  - 选择 delist 作为市场生命周期最小补齐项，暂不做退款、举报、suspend 或搜索排序。
  - 新增 `POST /api/market/assets/:id/delist`，仅管理员可下架 listed 资产。
  - 将下架资产从公开浏览和新购买中移除，但保留已有 entitlement 用户的详情读取和安装能力。
  - 列表资产增加 `entitled` 标记，前端可给已授权用户展示 Install。
  - marketplace-wallet 增加管理员 Delist 按钮和确认弹窗。
  - 更新 README 与设计文档，记录 delist API 和“不撤销既有授权”的边界。
- 创建/修改的文件：
  - README.md
  - docs/marketplace-currency-design.md
  - src/endpoints/market.js
  - public/scripts/extensions/marketplace-wallet/index.js
  - public/scripts/extensions/marketplace-wallet/style.css
  - tests/market-wallet.test.js
  - tests/marketplace-wallet-ui.test.js
  - task_plan.md
  - progress.md
  - findings.md

### 阶段 15：市场资产举报入口
- **状态：** complete
- 执行的操作：
  - 选择 report 作为 UGC 安全最小补齐项，暂不做自动处罚或完整处理后台。
  - market store 增加 `reports` 数组，并在读取旧 store 时兜底为空数组。
  - 新增 `POST /api/market/assets/:id/report`，可见资产才允许举报，举报记录为 `open`。
  - marketplace-wallet 增加 Report 操作，提交短 reason。
  - 扩展后端测试，覆盖公开资产举报、空 reason 400、下架后无授权用户不可举报、已授权用户仍可举报。
  - 扩展前端契约测试，覆盖 Report 按钮和 report POST。
- 创建/修改的文件：
  - README.md
  - docs/marketplace-currency-design.md
  - src/endpoints/market.js
  - public/scripts/extensions/marketplace-wallet/index.js
  - tests/market-wallet.test.js
  - tests/marketplace-wallet-ui.test.js
  - task_plan.md
  - progress.md
  - findings.md

### 阶段 16：管理员举报处理队列
- **状态：** complete
- 执行的操作：
  - 选择 report queue + resolve 作为举报入口后的最小管理闭环，暂不做自动处罚、封禁或申诉流。
  - 新增 `GET /api/market/reports/admin`，仅管理员可查看 open reports，并附带最小资产摘要。
  - 新增 `POST /api/market/reports/:id/resolve`，仅管理员可将 open report 标记为 resolved。
  - marketplace-wallet 管理员面板增加 Report Queue 和 Resolve 操作。
  - 前端使用独立 `busyReportIds`、`data-report-id` 和 report queue click handler，避免和资产 action 混用。
  - 扩展后端测试，覆盖普通用户禁止查看/resolve、管理员查看、resolve 持久化、重复 resolve 400。
  - 扩展前端契约测试，覆盖 Report Queue 容器、admin reports 请求、resolve endpoint 和独立事件绑定。
- 创建/修改的文件：
  - README.md
  - docs/marketplace-currency-design.md
  - src/endpoints/market.js
  - public/scripts/extensions/marketplace-wallet/window.html
  - public/scripts/extensions/marketplace-wallet/index.js
  - public/scripts/extensions/marketplace-wallet/style.css
  - tests/market-wallet.test.js
  - tests/marketplace-wallet-ui.test.js
  - task_plan.md
  - progress.md
  - findings.md

### 阶段 17：管理员审核内容预览
- **状态：** complete
- 执行的操作：
  - 选择 Inspect 作为审核队列的最小预览入口，避免管理员盲批 submitted 资产。
  - 复用 `GET /api/market/assets/:id` 的管理员 payload 读取权限，不新增后端路由。
  - Review Queue 增加 Inspect 按钮，点击后拉取 asset detail。
  - 使用 `POPUP_TYPE.TEXT`、安全 DOM 和 `.text(JSON.stringify(...))` 展示资产摘要与 JSON payload。
  - 增加预览弹窗 CSS，使 meta 和 payload 在桌面/手机上可滚动、不撑破布局。
  - 扩展后端测试，确认管理员可读取 payload，普通公开详情仍不泄漏 payload。
  - 扩展前端契约测试，覆盖 inspect action、detail fetch、TEXT popup、安全 JSON 展示和预览 CSS。
- 创建/修改的文件：
  - README.md
  - public/scripts/extensions/marketplace-wallet/index.js
  - public/scripts/extensions/marketplace-wallet/style.css
  - tests/market-wallet.test.js
  - tests/marketplace-wallet-ui.test.js
  - task_plan.md
  - progress.md
  - findings.md

### 阶段 18：创作者修订与重新提交
- **状态：** complete
- 执行的操作：
  - 选择 creator revise 作为被拒资产后的最小闭环，避免创作者只能看拒绝原因而不能修改重提。
  - 新增 `PATCH /api/market/assets/:id`，仅创建者可修改 draft/rejected 资产。
  - PATCH 成功后统一回到 `draft/private`，清理旧 `review_notes`、`reviewed_by` 和 `submitted_at`。
  - 禁止 submitted/listed/delisted 原地修改，避免 live payload 对已授权用户静默变化。
  - PATCH 复用创建体校验，并额外验证 normalized payload 形状，避免保存无效草稿。
  - marketplace-wallet 增加 Revise 操作，拉取资产详情并复用上传表单编辑。
  - 上传表单增加编辑状态提示和 Cancel 按钮；编辑时 Save/Submit 改走 PATCH 后复用 `/submit`。
  - 扩展后端测试，覆盖非 owner、无效价格/载荷、字段篡改、各状态限制、rejected 修改后重新提交。
  - 扩展前端契约测试，覆盖 Revise action、编辑状态、PATCH、表单填充、取消和 CSS。
- 创建/修改的文件：
  - README.md
  - docs/marketplace-currency-design.md
  - src/endpoints/market.js
  - public/scripts/extensions/marketplace-wallet/window.html
  - public/scripts/extensions/marketplace-wallet/index.js
  - public/scripts/extensions/marketplace-wallet/style.css
  - tests/market-wallet.test.js
  - tests/marketplace-wallet-ui.test.js
  - task_plan.md
  - progress.md
  - findings.md

### 阶段 19：用户资产库
- **状态：** complete
- 执行的操作：
  - 选择 My Library 作为购买/领取后的最小找回入口，避免用户只能从市场列表找已拥有资产。
  - 新增 `GET /api/market/library`，返回当前用户 active entitlements 对应资产。
  - Library 响应包含授权来源、资产摘要、用户安装次数和最近安装摘要，不返回 payload、ledger ids 或绝对路径。
  - 已下架但仍授权资产会继续保留在 Library 中，可重新安装。
  - marketplace-wallet 增加 My Library 面板，放在 Creator Center 与市场筛选之间。
  - Library 后台降级加载，失败只 warn，不阻塞钱包和市场主列表。
  - Library 安装按钮复用现有 install action，安装成功后后台刷新 Library 计数。
  - 扩展后端测试，覆盖当前用户隔离、下架后可见、排序、安装摘要和敏感字段不泄漏。
  - 扩展前端契约测试，覆盖 Library 模板、加载、降级、安装事件和移动样式。
- 创建/修改的文件：
  - README.md
  - docs/marketplace-currency-design.md
  - src/endpoints/market.js
  - public/scripts/extensions/marketplace-wallet/window.html
  - public/scripts/extensions/marketplace-wallet/index.js
  - public/scripts/extensions/marketplace-wallet/style.css
  - tests/market-wallet.test.js
  - tests/marketplace-wallet-ui.test.js
  - task_plan.md
  - progress.md
  - findings.md

### 阶段 20：托管健康检查
- **状态：** complete
- 执行的操作：
  - 选择公开 `GET /api/health` 作为托管 Web/PWA 的最小探活端点。
  - 将 health 路由放在 `requireLoginMiddleware` 之前，避免部署平台未登录探活失败。
  - Health 响应只返回 `ok/status/service/version/uptime/timestamp`，不包含用户、市场、钱包或 git 细节。
  - 新增 `tests/health.test.js` 契约测试，确认 health 路由公开且字段稳定。
  - 将 health 契约测试纳入根目录 `npm run test:marketplace`。
  - 更新 README 和设计文档中的 API/脚本说明。
- 创建/修改的文件：
  - README.md
  - docs/marketplace-currency-design.md
  - package.json
  - src/server-main.js
  - tests/health.test.js
  - task_plan.md
  - progress.md
  - findings.md

### 阶段 21：资产详情弹窗
- **状态：** complete
- 执行的操作：
  - 选择 Details 作为购买前和 Library 中查看资产元数据的最小入口。
  - marketplace 列表和 My Library 条目增加 Details 操作。
  - Review Queue 的 Inspect 复用同一 asset detail 弹窗逻辑。
  - Details 复用 `GET /api/market/assets/:id`；未授权用户只看到元数据，已授权/创建者/管理员可看到 payload。
  - 调整预览渲染，未授权时显示 payload 获取条件，不再渲染空 JSON。
  - 扩展前端契约测试，覆盖 details action、统一详情函数和 payload gate。
  - 扩展后端测试，覆盖 fixed_price 购买后详情可读取 payload。
- 创建/修改的文件：
  - README.md
  - docs/marketplace-currency-design.md
  - public/scripts/extensions/marketplace-wallet/index.js
  - tests/market-wallet.test.js
  - tests/marketplace-wallet-ui.test.js
  - task_plan.md
  - progress.md
  - findings.md

### 阶段 23：市场浏览筛选与排序
- **状态：** complete
- 执行的操作：
  - 选择客户端筛选/排序作为当前 JSON-store MVP 的最小浏览增强。
  - 市场筛选条新增价格筛选：任意、免费、付费。
  - 新增访问状态筛选：全部、可获取、已入库、我的上传。
  - 新增排序：最新、热门、价格低到高、价格高到低。
  - 扩展 `getFilteredAssets()`，按类型、价格、访问状态、搜索词和排序组合过滤。
  - 调整筛选控件 CSS，保证移动端可换行且控件不挤压。
  - 扩展前端契约测试，覆盖新增控件、过滤分支、排序分支和事件绑定。
- 创建/修改的文件：
  - README.md
  - docs/marketplace-currency-design.md
  - public/scripts/extensions/marketplace-wallet/window.html
  - public/scripts/extensions/marketplace-wallet/index.js
  - public/scripts/extensions/marketplace-wallet/style.css
  - tests/marketplace-wallet-ui.test.js
  - task_plan.md
  - progress.md
  - findings.md

### 阶段 24：市场基础脚本语法门禁
- **状态：** complete
- 执行的操作：
  - 新增 `scripts/check-marketplace-syntax.mjs`，集中检查 marketplace/wallet/PWA/health 相关 JS 文件是否存在并通过 `node --check`。
  - 新增根命令 `npm run test:marketplace:syntax`。
  - 更新 `npm run test:marketplace`，先运行语法门禁，再运行市场、钱包、PWA、health Jest 契约测试。
  - 更新 README Useful Scripts，补充 syntax gate 用法。
- 创建/修改的文件：
  - scripts/check-marketplace-syntax.mjs
  - package.json
  - README.md
  - task_plan.md
  - progress.md
  - findings.md

### 阶段 25：PWA 缓存清单完整性
- **状态：** complete
- 执行的操作：
  - 扩展 `tests/pwa.test.js`，在 VM sandbox 中读取 service worker 的 `SHELL_ASSETS`。
  - 断言预缓存清单包含 `/`、`/manifest.json` 和 `/scripts/pwa.js` 等核心 shell 资源。
  - 逐项检查预缓存资源对应的 `public/` 文件存在，其中 `/` 映射为 `public/index.html`。
- 创建/修改的文件：
  - tests/pwa.test.js
  - task_plan.md
  - progress.md
  - findings.md

### 阶段 26：设计文档 MVP/API 边界校准
- **状态：** complete
- 执行的操作：
  - 根据并行 agent 只读扫描结果，校准 `docs/marketplace-currency-design.md` 的当前 MVP 范围。
  - 将 API 模块拆成当前本地 MVP 已实现 API 和 Future SaaS API。
  - 把版本、评论、充值、退款、独立 Creator/Admin API、preset_pack、asset_pack 标为后续。
  - 明确当前 marketplace-wallet 上传端点提交规范化 JSON payload，不做 multipart 文件解析。
  - 校准角色能力表，区分当前管理员工具能力和 Future SaaS 能力。
- 创建/修改的文件：
  - docs/marketplace-currency-design.md
  - task_plan.md
  - progress.md
  - findings.md

### 阶段 27：托管运行态 Smoke 脚本
- **状态：** complete
- 执行的操作：
  - 新增 `scripts/smoke-marketplace-runtime.mjs`，从仓库根目录临时启动真实 `server.js`。
  - 脚本自动分配 `127.0.0.1` 端口，并传入临时 `configPath` 和 `dataRoot`。
  - 启动参数禁用浏览器自动打开、SSL、heartbeat、IPv6、whitelist 和 basic auth，降低 smoke 环境噪音。
  - 轮询 `/api/health` 到 ready，再校验 `/manifest.json` 和 `/service-worker.js`。
  - 新增根命令 `npm run test:marketplace:smoke`，并把 smoke 脚本加入 syntax gate。
- 创建/修改的文件：
  - scripts/smoke-marketplace-runtime.mjs
  - scripts/check-marketplace-syntax.mjs
  - package.json
  - README.md
  - task_plan.md
  - progress.md
  - findings.md

### 阶段 28：市场筛选排序可执行测试
- **状态：** complete
- 执行的操作：
  - 新增 `public/scripts/extensions/marketplace-wallet/filters.js`，将市场列表筛选排序抽为纯函数。
  - 更新 `index.js`，由 DOM 控件读取条件后调用 `filterAndSortAssets()`。
  - 新增 `tests/marketplace-wallet-filters.test.js`，覆盖类型、价格、访问状态、搜索、排序和不修改原数组。
  - 将 filters 和新测试文件加入 `scripts/check-marketplace-syntax.mjs`。
  - 将新测试纳入 `npm run test:marketplace`。
  - 将 marketplace-wallet manifest 版本提升到 `0.2.1`，避免旧 ESM 模块缓存。
- 创建/修改的文件：
  - public/scripts/extensions/marketplace-wallet/filters.js
  - public/scripts/extensions/marketplace-wallet/index.js
  - public/scripts/extensions/marketplace-wallet/manifest.json
  - tests/marketplace-wallet-filters.test.js
  - tests/marketplace-wallet-ui.test.js
  - scripts/check-marketplace-syntax.mjs
  - package.json
  - task_plan.md
  - progress.md
  - findings.md

### 阶段 29：Report Queue Resolve 前端覆盖
- **状态：** complete
- 执行的操作：
  - 在 `tests/marketplace-wallet.e2e.js` 中新增 `makeOpenReport()` fixture。
  - 扩展 `mockMarketplaceApis()`，支持 report 列表、resolve POST 记录和本地 report 移除。
  - 新增浏览器级用例，等待 Report Queue 渲染后点击 Resolve，断言 POST 和空队列文案。
  - 在 `tests/marketplace-wallet-ui.test.js` 中补充契约，确认 resolve 成功后从 `state.reports` 本地移除记录。
- 创建/修改的文件：
  - tests/marketplace-wallet.e2e.js
  - tests/marketplace-wallet-ui.test.js
  - task_plan.md
  - progress.md
  - findings.md

### 阶段 30：Marketplace Wallet GitHub Actions 门禁
- **状态：** complete
- 执行的操作：
  - 新增 `.github/workflows/marketplace-wallet-checks.yml`。
  - workflow 在 PR 相关路径变化时运行，并在 `codex/marketplace-wallet-mvp` 分支 push 时运行。
  - workflow 使用 Node 24，安装根依赖和 `tests/` 依赖。
  - workflow 执行 `npm run test:marketplace:syntax`、`npm run test:marketplace`、`npm run test:marketplace:smoke` 和 `npm run test:marketplace:e2e -- --list`。
- 创建/修改的文件：
  - .github/workflows/marketplace-wallet-checks.yml
  - task_plan.md
  - progress.md
  - findings.md

### 阶段 31：Fork CI 凭证噪音修复
- **状态：** complete
- 执行的操作：
  - 读取 GitHub run `28236597360` 失败日志，确认失败发生在 `actions/create-github-app-token`。
  - 失败原因是 fork 仓库缺少官方 bot 的 `ST_BOT_APP_ID`，导致 `appId option is required`。
  - 更新 `.github/workflows/pr-check-merge-conflicts.yaml`，让 merge-conflict bot job 只在 `SillyTavern/SillyTavern` 官方仓库运行。
- 创建/修改的文件：
  - .github/workflows/pr-check-merge-conflicts.yaml
  - task_plan.md
  - progress.md
  - findings.md

## 测试结果
| 测试 | 输入 | 预期结果 | 实际结果 | 状态 |
|------|------|---------|---------|------|
| 文档存在性检查 | docs/marketplace-currency-design.md | 文件存在 | 文件已创建 | 通过 |
| 新增 endpoint 语法检查 | market.js/wallet.js/server-startup.js | 无语法错误 | 通过 | 通过 |
| Diff 空白检查 | git diff --check | 无空白错误 | 通过 | 通过 |
| 市场/钱包冒烟 | 创建、提交、审核、领取、安装、赠币 | 流程成功且非 admin 不能赠币 | 通过 | 通过 |
| 市场/钱包 Jest 单测 | `npm --prefix tests run test:unit -- market-wallet.test.js` | 3 个用例通过 | 通过：3 passed | 通过 |
| 提交前语法与空白检查 | `node --check ... && git diff --check` | 无语法/空白错误 | 通过 | 通过 |
| payload 权限回归 | 未购买用户查看 listed 资产详情 | 不返回 `normalized_payload` | 通过 | 通过 |
| CI 配置路径回归 | 干净 checkout 中无根目录 `config.yaml` | 测试使用已跟踪 `default/config.yaml` | 通过 | 通过 |
| 审核与账本覆盖 | 非 admin 审核、entitlement/install 记录、wallet ledger | 关键字段均断言 | 通过 | 通过 |
| fixed_price 购买闭环 | 余额不足、扣 bonus/paid、creator earnings、重复购买、安装授权 | 5 个 Jest 用例通过 | 通过 | 通过 |
| marketplace-wallet 扩展语法 | `node --check public/scripts/extensions/marketplace-wallet/index.js` | 无语法错误 | 通过 | 通过 |
| 前端接入后端回归 | `node --check src/endpoints/market.js && node --check src/endpoints/wallet.js && node --check src/server-startup.js` | 无语法错误 | 通过 | 通过 |
| 前端与后端 diff 空白检查 | `git diff --check` | 无空白错误 | 通过 | 通过 |
| 前端阶段市场/钱包单测 | `npm --prefix tests run test:unit -- market-wallet.test.js` | 5 个用例通过 | 通过：5 passed | 通过 |
| marketplace-wallet 浏览器 smoke | 打开 `http://localhost:8000/` | 扩展容器、标题、资产列表和刷新按钮存在 | 通过 | 通过 |
| admin UI 语法检查 | `node --check public/scripts/extensions/marketplace-wallet/index.js` | 无语法错误 | 通过 | 通过 |
| marketplace-wallet manifest 校验 | 解析 `manifest.json` | JSON 有效 | 通过 | 通过 |
| admin UI diff 空白检查 | `git diff --check` | 无空白错误 | 通过 | 通过 |
| admin UI 回归单测 | `npm --prefix tests run test:unit -- market-wallet.test.js` | 5 个用例通过 | 通过：5 passed | 通过 |
| admin UI 浏览器 smoke | 打开 `http://localhost:8000/` | 加载 `v=0.2.0` 脚本/CSS，admin 面板可见，grant 和 review queue 存在 | 通过 | 通过 |
| admin UI 移动端检查 | 窄屏 viewport 验证 | 控件不溢出 | 未完整执行：in-app browser 未暴露 viewport 设置，本地无 Playwright 包；已做 CSS 结构调整 | 部分 |
| marketplace 根脚本基础测试 | `npm run test:marketplace` | backend + frontend contract 测试通过 | 通过：2 suites / 11 tests | 通过 |
| marketplace E2E 列表 | `npm run test:marketplace:e2e -- --list` | 能发现 browser E2E 用例 | 通过：2 tests listed | 通过 |
| 启动脚本帮助 | `npm run start -- --help` | 服务器 CLI 正常输出帮助 | 通过 | 通过 |
| Creator Center 语法检查 | `node --check src/endpoints/market.js && node --check public/scripts/extensions/marketplace-wallet/index.js && node --check tests/market-wallet.test.js && node --check tests/marketplace-wallet-ui.test.js` | 无语法错误 | 通过 | 通过 |
| Creator summary API 回归 | `npm run test:marketplace` | 资产状态、claims、paid sales、installs、earnings、payload/ledger 隐私边界通过 | 通过：新增 creator summary 用例 | 通过 |
| Creator Center E2E 列表 | `npm run test:marketplace:e2e -- --list` | 能发现 browser E2E 用例 | 通过：2 tests listed | 通过 |
| PWA 契约测试 | `npm run test:pwa` | manifest 可安装、页面注册 SW、SW 不缓存 API/非 GET | 通过：1 suite / 3 tests | 通过 |
| marketplace + PWA 根脚本 | `npm run test:marketplace` | 市场/钱包/PWA 契约测试通过 | 通过：3 suites / 14 tests | 通过 |
| delist 生命周期回归 | `npm run test:marketplace` | admin 下架、非 admin 禁止、下架后新用户不可买、已授权用户可安装 | 通过：3 suites / 14 tests | 通过 |
| report 入口回归 | `npm run test:marketplace` | 可见资产可举报、空 reason 拒绝、下架后只允许已授权用户举报 | 通过：3 suites / 14 tests | 通过 |
| report queue 回归 | `npm run test:marketplace` | admin 可查看并 resolve open report，普通用户禁止，重复 resolve 400 | 通过：3 suites / 14 tests | 通过 |
| marketplace E2E 列表复核 | `npm run test:marketplace:e2e -- --list` | 能发现 browser E2E 用例 | 通过：2 tests listed | 通过 |
| admin inspect 回归 | `npm run test:marketplace` | 管理员可读取 payload，Review Queue 有 Inspect 预览契约 | 通过：3 suites / 14 tests | 通过 |
| creator revise 回归 | `npm run test:marketplace` | draft/rejected 可修订重提，submitted/listed/delisted 禁止原地改 | 通过：3 suites / 15 tests | 通过 |
| My Library 回归 | `npm run test:marketplace` | 用户库返回当前用户授权资产、下架后仍可见、安装摘要更新且不泄漏 payload | 通过：3 suites / 15 tests | 通过 |
| health endpoint 契约 | `npm run test:marketplace` | `/api/health` 公开且返回服务级状态字段 | 通过：4 suites / 16 tests | 通过 |
| asset details 回归 | `npm run test:marketplace` | 未授权详情不泄漏 payload，付费购买后详情可读 payload，前端 Details 走统一弹窗 | 通过：4 suites / 16 tests | 通过 |
| marketplace filters 回归 | `npm run test:marketplace` | 类型/价格/访问状态/排序控件与前端过滤分支存在 | 通过：4 suites / 16 tests | 通过 |
| marketplace syntax 门禁 | `npm run test:marketplace:syntax` | market/wallet/PWA/health 相关 JS 文件存在且无语法错误 | 通过：11 files checked | 通过 |
| marketplace 聚合脚本串联 | `npm run test:marketplace` | 先跑 syntax gate，再跑 Jest 契约测试 | 通过：syntax gate + 4 suites / 16 tests | 通过 |
| marketplace E2E 列表复核 | `npm run test:marketplace:e2e -- --list` | 能发现 browser E2E 用例 | 通过：2 tests listed | 通过 |
| PWA 缓存清单完整性 | `npm run test:pwa` | 预缓存资源均存在且 `/` 映射到 `index.html` | 通过：1 suite / 4 tests | 通过 |
| marketplace 聚合含 PWA 缓存检查 | `npm run test:marketplace` | syntax gate + marketplace/PWA/health 契约通过 | 通过：4 suites / 17 tests | 通过 |
| 文档边界校准基础验证 | `rg ... docs/marketplace-currency-design.md` | 当前 MVP 与 Future SaaS API 分区存在，关键 future 项仍保留但不混入 MVP | 通过 | 通过 |
| 文档阶段 marketplace 回归 | `npm run test:marketplace` | 代码基础闭环不受文档更新影响 | 通过：4 suites / 17 tests | 通过 |
| 文档阶段 E2E 列表 | `npm run test:marketplace:e2e -- --list` | 能发现 browser E2E 用例 | 通过：2 tests listed | 通过 |
| marketplace runtime smoke | `npm run test:marketplace:smoke` | 临时启动真实 server 并校验 health/PWA 公开端点 | 通过：`/api/health`、`/manifest.json`、`/service-worker.js` | 通过 |
| smoke 脚本语法门禁 | `npm run test:marketplace:syntax` | smoke 脚本纳入 marketplace syntax gate | 通过：12 files checked | 通过 |
| smoke 阶段 marketplace 回归 | `npm run test:marketplace` | syntax gate + marketplace/PWA/health 契约通过 | 通过：4 suites / 17 tests | 通过 |
| smoke 阶段 E2E 列表 | `npm run test:marketplace:e2e -- --list` | 能发现 browser E2E 用例 | 通过：2 tests listed | 通过 |
| marketplace filters 纯函数测试 | `npm --prefix tests run test:unit -- marketplace-wallet-filters.test.js marketplace-wallet-ui.test.js` | 筛选、搜索、排序和 UI 契约通过 | 通过：2 suites / 7 tests | 通过 |
| filters 阶段 marketplace 回归 | `npm run test:marketplace` | filters 测试纳入 marketplace 根命令 | 通过：5 suites / 19 tests | 通过 |
| filters 阶段 runtime smoke | `npm run test:marketplace:smoke` | 临时 server health/PWA 公开端点仍可访问 | 通过 | 通过 |
| filters 阶段 E2E 列表 | `npm run test:marketplace:e2e -- --list` | 能发现 browser E2E 用例 | 通过：2 tests listed | 通过 |
| Report Queue UI 契约 | `npm --prefix tests run test:unit -- marketplace-wallet-ui.test.js` | resolve endpoint、事件绑定和本地移除契约存在 | 通过：1 suite / 5 tests | 通过 |
| Report Queue E2E 列表 | `npm run test:marketplace:e2e -- --list` | 能发现新增 Report Queue resolve browser 用例 | 通过：3 tests listed | 通过 |
| Report Queue marketplace 回归 | `npm run test:marketplace` | frontend contract 与 marketplace 根测试通过 | 通过：5 suites / 19 tests | 通过 |
| Report Queue 指定 E2E 实跑 | `npm --prefix tests run test:e2e -- marketplace-wallet.e2e.js -g "resolves reports"` | 浏览器级 resolve 流程通过 | 未通过：本机 Playwright 缺 `chromium_headless_shell-1194/headless_shell`；尝试安装后进程卡在解压/注册阶段，已终止 | 环境阻塞 |
| Marketplace workflow YAML 解析 | `node --input-type=module -e "import YAML..."` | workflow 可被 YAML parser 解析 | 通过：`Marketplace Wallet Checks` / job `marketplace-wallet` | 通过 |
| Marketplace workflow syntax step | `npm run test:marketplace:syntax` | workflow 第一个脚本门禁通过 | 通过：14 files checked | 通过 |
| Marketplace workflow Jest step | `npm run test:marketplace` | workflow Jest/contract step 通过 | 通过：5 suites / 19 tests | 通过 |
| Marketplace workflow smoke step | `npm run test:marketplace:smoke` | workflow runtime smoke step 通过 | 通过 | 通过 |
| Marketplace workflow E2E discovery step | `npm run test:marketplace:e2e -- --list` | workflow E2E discovery step 通过 | 通过：3 tests listed | 通过 |
| GitHub Marketplace Wallet Checks | `gh run watch 28236597364 --repo Angelidiot/SillyTavern --exit-status` | GitHub Actions 新 workflow 通过 | 通过：Marketplace Wallet MVP job 47s，全步骤成功；actions 注解提示 pinned actions 内部 Node 20 deprecated 但被 runner 强制 Node 24 | 通过 |
| Fork bot workflow YAML 验证 | `node --input-type=module -e "import YAML..."` | merge-conflict 和 marketplace workflows 都可解析 | 通过 | 通过 |
| Fork bot workflow 基础回归 | `npm run test:marketplace:syntax` | 修改 workflow 不影响 marketplace syntax gate | 通过：14 files checked | 通过 |
| marketplace E2E 实跑 | `npm run test:marketplace:e2e` | 浏览器 E2E 通过 | 未通过：本机 Playwright browser cache 半安装，缺 `chromium_headless_shell` / Chromium Framework | 环境阻塞 |
| Demo seed 脚本 smoke | `npm run marketplace:seed:demo -- --dataRoot $(mktemp -d ...)` | 显式 data root 下生成 demo 市场资产 | 通过：2 个 listed demo assets | 通过 |
| Demo seed Jest 覆盖 | `npm --prefix tests run test:unit -- marketplace-demo-seed.test.js` | 覆盖必填 dataRoot、资产结构、幂等 upsert 和钱包存储隔离 | 通过：1 suite / 3 tests | 通过 |
| Demo seed syntax 门禁 | `npm run test:marketplace:syntax` | seed 脚本和测试纳入 syntax gate | 通过：16 files checked | 通过 |
| Demo seed marketplace 回归 | `npm run test:marketplace` | syntax gate + marketplace/PWA/health/seed 契约通过 | 通过：6 suites / 22 tests | 通过 |
| Demo seed runtime smoke | `npm run test:marketplace:smoke` | 临时 server health/PWA 公开端点仍可访问 | 通过 | 通过 |
| Demo seed E2E discovery | `npm run test:marketplace:e2e -- --list` | 能发现 browser E2E 用例 | 通过：3 tests listed | 通过 |
| Runtime smoke API 覆盖 | `npm run test:marketplace:smoke` | 真实 server 校验 health、PWA、wallet 和 marketplace assets | 通过：`/api/wallet`、`/api/market/assets` | 通过 |
| Buyer E2E discovery | `npm run test:marketplace:e2e -- --list` | 能发现新增 free asset claim/install/browser mock 用例 | 通过：4 tests listed | 通过 |
| 收尾阶段 syntax gate | `npm run test:marketplace:syntax` | seed、smoke、E2E 文件均纳入语法门禁 | 通过：17 files checked | 通过 |
| 收尾阶段 marketplace 回归 | `npm run test:marketplace` | syntax gate + marketplace/PWA/health/seed 契约通过 | 通过：6 suites / 22 tests；一次并发验证中 `market-wallet.test.js` 举报断言短暂 404，单测和串行全量复跑均通过 | 通过 |
| Workflow YAML 收尾验证 | `node --input-type=module -e "import YAML..."` | marketplace 和 merge-conflict workflows 都可解析 | 通过 | 通过 |
| GitHub Demo Seed Checks | `gh run watch 28237551217 --repo Angelidiot/SillyTavern --exit-status` | GitHub Actions marketplace workflow 通过 | 通过：Marketplace Wallet MVP job 39s，全步骤成功；actions 注解提示 pinned actions 内部 Node 20 deprecated 但 runner 强制 Node 24 | 通过 |
| E2E server wrapper discovery | `npm run test:marketplace:e2e:server -- --list` | 临时 server 启动后 Playwright 能发现 marketplace browser 用例 | 通过：4 tests listed | 通过 |
| E2E server wrapper 本地实跑 | `npm run test:marketplace:e2e:server` | 本机真实浏览器 E2E 通过 | 未通过：本机 Playwright cache 缺 `chromium_headless_shell-1194/chrome-mac/headless_shell`；CI 已改为先安装 chromium-headless-shell 再实跑 | 环境阻塞 |
| GitHub E2E headless-shell 安装 | `gh run watch 28237783793` | CI 安装 chromium-headless-shell 后实跑 E2E | 已取消：runner 长时间停在 `Install Playwright browser`；改用 Chromium channel + `--no-shell` 策略 | 环境阻塞 |
| Chromium channel E2E discovery | `npm run test:marketplace:e2e:server -- --list` | `channel: chromium` 配置下 wrapper 仍能启动临时 server 并发现用例 | 通过：4 tests listed | 通过 |
| GitHub Chromium install 策略 | `gh run watch 28238257185` | CI 安装 `chromium --no-shell` 后实跑 E2E | 已取消：runner 仍长时间停在 `Install Playwright browser`；改为使用 runner 自带 Chrome channel | 环境阻塞 |
| Runner Chrome E2E discovery | `npm run test:marketplace:e2e:server -- --list` | `PLAYWRIGHT_BROWSER_CHANNEL` 支持后，wrapper discovery 仍正常 | 通过：4 tests listed | 通过 |
| Runner Chrome GitHub E2E 初跑 | `gh run watch 28238485632` | 使用 runner 自带 Chrome 跑真实 browser E2E | 未通过：3 个用例因 Extensions/inline drawer hidden 或 admin state 未准备而不可点击；mobile layout 通过 | 待修复 |
| E2E UI 状态修复 syntax | `npm run test:marketplace:syntax` | E2E admin mock、onboarding 和 drawer helper 语法门禁 | 通过：19 files checked | 通过 |
| E2E UI 状态修复 marketplace 回归 | `npm run test:marketplace` | syntax gate + marketplace/PWA/health/seed 契约 | 通过：6 suites / 22 tests | 通过 |
| E2E UI 状态修复 discovery | `npm run test:marketplace:e2e:server -- --list` | 临时 server 能发现 4 个 browser E2E 用例 | 通过：4 tests listed | 通过 |
| 本机 Chrome 单 worker E2E | `PLAYWRIGHT_BROWSER_CHANNEL=chrome npm run test:marketplace:e2e:server -- --workers=1` | 用系统 Chrome 验证 admin queue、report resolve、free claim/install 和 mobile layout | 通过：4 passed (1.5m)；本机 Chrome channel 在测试结束后父进程延迟退出，手动 Ctrl-C 后清理，无残留 server | 通过 |
| GitHub Runner Chrome E2E 修复验证 | `gh run watch 28239958010 --repo Angelidiot/SillyTavern --exit-status` | GitHub Actions syntax、Jest、runtime smoke、runner Chrome 和真实 browser E2E 全链路 | 通过：Marketplace Wallet MVP job 1m2s，browser E2E step 成功；actions 注解提示 pinned actions 内部 Node 20 deprecated 但 runner 强制 Node 24 | 通过 |
| Wallet Activity 目标验证 | `npm --prefix tests run test:unit -- market-wallet.test.js marketplace-wallet-ui.test.js` | 钱包流水 UI 契约和固定价并发购买幂等测试通过 | 通过：2 suites / 13 tests | 通过 |
| 阶段 38 syntax gate | `npm run test:marketplace:syntax` | ledger UI、runtime smoke 和并发测试语法门禁 | 通过：19 files checked | 通过 |
| 阶段 38 marketplace 聚合 | `npm run test:marketplace` | syntax + marketplace/PWA/health/seed/filter/UI 契约通过 | 通过：6 suites / 23 tests | 通过 |
| 阶段 38 runtime smoke | `npm run test:marketplace:smoke` | 真实 server 校验 health/PWA/wallet/assets/free purchase/install/library/文件落盘 | 通过 | 通过 |
| Wallet ledger E2E 修复目标验证 | `npm --prefix tests run test:unit -- marketplace-wallet-ui.test.js` | `loadWalletLedger()` 不覆盖主钱包余额 | 通过：1 suite / 5 tests | 通过 |
| Wallet ledger E2E 修复 marketplace 回归 | `npm run test:marketplace` | syntax + marketplace/PWA/health/seed/filter/UI 契约通过 | 通过：6 suites / 23 tests | 通过 |
| Wallet ledger E2E 修复 runtime smoke | `npm run test:marketplace:smoke` | 真实 server free purchase/install/library/文件落盘仍通过 | 通过 | 通过 |
| Wallet ledger E2E 修复本机 Chrome | `PLAYWRIGHT_BROWSER_CHANNEL=chrome npm run test:marketplace:e2e:server -- --workers=1` | 真实浏览器 admin/report/free-claim/mobile 四用例 | 通过：4 passed (1.7m)；本机父进程延迟退出后 Ctrl-C 清理 | 通过 |
| GitHub Wallet ledger E2E 修复验证 | `gh run watch 28240992614 --repo Angelidiot/SillyTavern --exit-status` | GitHub Actions syntax、Jest、runtime smoke、runner Chrome 和真实 browser E2E 全链路 | 通过：Marketplace Wallet MVP job 1m38s，全步骤成功；actions 注解提示 pinned actions 内部 Node 20 deprecated 但 runner 强制 Node 24 | 通过 |
| 阶段 39 wallet 权限坏输入目标测试 | `npm --prefix tests run test:unit -- market-wallet.test.js` | 普通用户跨钱包读取禁止、管理员可读、invalid bucket/amount/unknown user 明确失败 | 通过：1 suite / 9 tests | 通过 |
| 阶段 39 marketplace 聚合回归 | `npm run test:marketplace` | syntax + marketplace/PWA/health/seed/filter/UI 契约通过 | 通过：6 suites / 24 tests | 通过 |
| 阶段 39 marketplace workflow YAML 解析 | `node --input-type=module -e 'import YAML from "yaml"; ...'` | workflow 支持 `workflow_dispatch`，push 分支为 `codex/**`，且 marketplace job 存在 | 通过 | 通过 |
| 阶段 39 README diff 检查 | `node --input-type=module -e '... git diff -- README.md ...'` | README diff 包含验证矩阵和 4 个 marketplace 验证命令 | 通过 | 通过 |
| GitHub 阶段 39 权限测试验证 | `gh run watch 28241497439 --repo Angelidiot/SillyTavern --exit-status` | GitHub Actions syntax、Jest、runtime smoke、runner Chrome 和真实 browser E2E 全链路 | 通过：Marketplace Wallet MVP job 1m4s，全步骤成功；actions 注解提示 pinned actions 内部 Node 20 deprecated 但 runner 强制 Node 24 | 通过 |
| 阶段 40 snapshot export 目标测试 | `npm --prefix tests run test:unit -- marketplace-snapshot-export.test.js` | 显式 dataRoot、stdout、--out、只读 data root、隐私字段过滤和空 store 行为 | 通过：1 suite / 5 tests | 通过 |
| 阶段 40 syntax gate | `npm run test:marketplace:syntax` | snapshot 脚本和测试纳入 marketplace 语法门禁 | 通过：21 files checked | 通过 |
| 阶段 40 marketplace 聚合回归 | `npm run test:marketplace` | syntax + marketplace/wallet/PWA/health/seed/snapshot/filter/UI 契约 | 通过：7 suites / 29 tests | 通过 |
| 阶段 40 runtime smoke | `npm run test:marketplace:smoke` | 真实 server health/PWA/wallet/assets/free purchase/install/library 仍通过 | 通过 | 通过 |
| 阶段 40 snapshot CLI smoke | `node scripts/export-marketplace-snapshot.mjs --dataRoot "$tmp_data" --out "$tmp_out/snapshot.json"` | 空 dataRoot 可导出到外部文件，且不泄露 data_root | 通过 | 通过 |
| 阶段 40 diff 空白检查 | `git diff --check` | 当前补丁无 trailing whitespace 或 whitespace error | 通过 | 通过 |
| 阶段 41 wallet purchase 目标测试 | `npm --prefix tests run test:unit -- market-wallet.test.js` | paid purchase 响应不返回 creator_balance/full ledger entries，账本仍可从 wallet ledger 验证 | 通过：1 suite / 9 tests | 通过 |
| 阶段 41 syntax gate | `npm run test:marketplace:syntax` | market endpoint 和测试语法门禁 | 通过：21 files checked | 通过 |
| 阶段 41 marketplace 聚合回归 | `npm run test:marketplace` | syntax + marketplace/wallet/PWA/health/seed/snapshot/filter/UI 契约 | 通过：7 suites / 29 tests | 通过 |
| 阶段 41 runtime smoke | `npm run test:marketplace:smoke` | 真实 server health/PWA/wallet/assets/free purchase/install/library 仍通过 | 通过 | 通过 |
| 阶段 42 runtime smoke 固定价闭环 | `npm run test:marketplace:smoke` | 真实 server fixed-price purchase、admin grant、buyer debit、creator earning、响应隐私、安装和 Library | 通过 | 通过 |
| 阶段 42 syntax gate | `npm run test:marketplace:syntax` | 扩展后的 runtime smoke 脚本语法门禁 | 通过：21 files checked | 通过 |
| 阶段 42 marketplace 聚合回归 | `npm run test:marketplace` | syntax + marketplace/wallet/PWA/health/seed/snapshot/filter/UI 契约 | 通过：7 suites / 29 tests | 通过 |
| 阶段 43 syntax gate | `npm run test:marketplace:syntax` | fixed-price browser E2E mock 语法门禁 | 通过：21 files checked | 通过 |
| 阶段 43 E2E discovery | `npm run test:marketplace:e2e:server -- --list` | 临时 server 能发现 5 个 marketplace 浏览器用例 | 通过：5 tests listed | 通过 |
| 阶段 43 本机 Chrome E2E | `PLAYWRIGHT_BROWSER_CHANNEL=chrome npm run test:marketplace:e2e:server -- --workers=1` | admin、report、free、fixed-price buy/install/wallet activity、mobile 五个用例 | 通过：5 passed；本机父进程延迟退出后 Ctrl-C 清理 | 通过 |
| 阶段 43 marketplace 聚合回归 | `npm run test:marketplace` | syntax + marketplace/wallet/PWA/health/seed/snapshot/filter/UI 契约 | 通过：7 suites / 29 tests | 通过 |
| 阶段 43 runtime smoke | `npm run test:marketplace:smoke` | 真实 server fixed-price purchase runtime smoke 仍通过 | 通过 | 通过 |
| 阶段 44 syntax gate | `npm run test:marketplace:syntax` | creator upload browser E2E mock 语法门禁 | 通过：21 files checked | 通过 |
| 阶段 44 E2E discovery | `npm run test:marketplace:e2e:server -- --list` | 临时 server 能发现 6 个 marketplace 浏览器用例 | 通过：6 tests listed | 通过 |
| 阶段 44 本机 Chrome E2E | `PLAYWRIGHT_BROWSER_CHANNEL=chrome npm run test:marketplace:e2e:server -- --workers=1` | admin、report、free、fixed-price、creator upload submit、mobile 六个用例 | 通过：6 passed (2.4m) | 通过 |
| 阶段 44 marketplace 聚合回归 | `npm run test:marketplace` | syntax + marketplace/wallet/PWA/health/seed/snapshot/filter/UI 契约 | 通过：7 suites / 29 tests | 通过 |
| 阶段 44 runtime smoke | `npm run test:marketplace:smoke` | 真实 server fixed-price purchase runtime smoke 仍通过 | 通过 | 通过 |
| 阶段 45 syntax gate | `npm run test:marketplace:syntax` | creator upload runtime smoke 脚本语法门禁 | 通过：21 files checked | 通过 |
| 阶段 45 runtime smoke | `npm run test:marketplace:smoke` | 真实 server creator upload/create/submit/detail/approve/list/install 与既有 purchase/install 闭环 | 通过 | 通过 |
| 阶段 45 marketplace 聚合回归 | `npm run test:marketplace` | syntax + marketplace/wallet/PWA/health/seed/snapshot/filter/UI 契约 | 通过：7 suites / 29 tests | 通过 |
| 阶段 46 角色隔离目标单测 | `npm --prefix tests run test:unit -- market-wallet.test.js` | submitted/private asset 对非 owner 隐藏、owner 自审批禁止、非 admin 不可 approve、owner/admin payload 权限、公开后只返回元数据 | 通过：1 suite / 10 tests | 通过 |
| 阶段 46 syntax gate | `npm run test:marketplace:syntax` | market-wallet 新增测试语法门禁 | 通过：21 files checked | 通过 |
| 阶段 46 marketplace 聚合回归 | `npm run test:marketplace` | syntax + marketplace/wallet/PWA/health/seed/snapshot/filter/UI 契约 | 通过：7 suites / 30 tests | 通过 |
| 阶段 47 syntax gate | `npm run test:marketplace:syntax` | rejected revise/resubmit browser E2E mock 语法门禁 | 通过：21 files checked | 通过 |
| 阶段 47 E2E discovery | `npm run test:marketplace:e2e:server -- --list` | 临时 server 能发现 7 个 marketplace 浏览器用例 | 通过：7 tests listed | 通过 |
| 阶段 47 本机 Chrome E2E | `PLAYWRIGHT_BROWSER_CHANNEL=chrome npm run test:marketplace:e2e:server -- --workers=1` | admin、report、free、fixed-price、creator upload、rejected revise/resubmit、mobile 七个用例 | 通过：7 passed (2.8m)；本机父进程延迟退出后 Ctrl-C 清理 | 通过 |
| 阶段 47 marketplace 聚合回归 | `npm run test:marketplace` | syntax + marketplace/wallet/PWA/health/seed/snapshot/filter/UI 契约 | 通过：7 suites / 30 tests | 通过 |
| 阶段 48 syntax gate | `npm run test:marketplace:syntax` | report runtime smoke 脚本语法门禁 | 通过：21 files checked | 通过 |
| 阶段 48 runtime smoke | `npm run test:marketplace:smoke` | 真实 server report create/admin queue/resolve/queue clear 与既有 purchase/install 闭环 | 通过 | 通过 |
| 阶段 48 marketplace 聚合回归 | `npm run test:marketplace` | syntax + marketplace/wallet/PWA/health/seed/snapshot/filter/UI 契约 | 初次与 smoke 并行运行时出现一次 delist 404；随后单独 `market-wallet.test.js` 和串行 `test:marketplace` 均通过：7 suites / 30 tests | 通过 |
| 阶段 49 API reference 目标测试 | `npm --prefix tests run test:unit -- marketplace-api-reference.test.js` | API reference Markdown 生成、`--out` 写文件、未知参数和缺失 `--out` 路径校验 | 通过：1 suite / 4 tests | 通过 |
| 阶段 49 syntax gate | `npm run test:marketplace:syntax` | API reference 脚本和测试纳入 marketplace 语法门禁 | 通过：23 files checked | 通过 |
| 阶段 49 API reference CLI smoke | `npm run marketplace:export:api > /tmp/st-marketplace-api-reference.md && rg ...` | 生成 Markdown 包含 market report、wallet admin grant 和 public health 端点 | 通过 | 通过 |
| 阶段 49 marketplace 聚合回归 | `npm run test:marketplace` | syntax + marketplace/wallet/PWA/health/seed/snapshot/API reference/filter/UI 契约 | 通过：8 suites / 34 tests | 通过 |
| 阶段 49 diff 空白检查 | `git diff --check` | 当前补丁无 trailing whitespace 或 whitespace error | 通过 | 通过 |
| GitHub 阶段 49 API reference 验证 | `gh run watch 28246518305 --repo Angelidiot/SillyTavern --exit-status` | GitHub Actions syntax、Jest、runtime smoke、runner Chrome 和真实 browser E2E 全链路 | 通过：Marketplace Wallet MVP job 1m38s，全步骤成功；actions 注解提示 pinned actions 内部 Node 20 deprecated 但 runner 强制 Node 24 | 通过 |
| 阶段 50 syntax gate | `npm run test:marketplace:syntax` | PWA browser E2E 用例和脚本入口语法门禁 | 通过：23 files checked | 通过 |
| 阶段 50 PWA 静态契约 | `npm run test:pwa` | manifest、PWA 注册脚本、SW API 排除和预缓存清单仍通过 | 通过：1 suite / 4 tests | 通过 |
| 阶段 50 PWA browser E2E | `PLAYWRIGHT_BROWSER_CHANNEL=chrome npm run test:pwa:e2e` | 真实 Chrome 验证 service worker activated、shell CacheStorage 和 `/api/health` 不缓存 | 通过：1 passed | 通过 |
| 阶段 50 marketplace 聚合回归 | `npm run test:marketplace` | syntax + marketplace/wallet/PWA/health/seed/snapshot/API reference/filter/UI 契约 | 通过：8 suites / 34 tests | 通过 |
| 阶段 50 runtime smoke | `npm run test:marketplace:smoke` | 真实 server health/PWA/wallet/market/creator/report/free/fixed-price/library 闭环仍通过 | 通过 | 通过 |
| 阶段 50 E2E discovery | `npm run test:marketplace:e2e:server -- --list` | 临时 server 能发现 PWA + marketplace 8 个浏览器用例 | 通过：8 tests listed | 通过 |
| 阶段 50 本机 Chrome E2E | `PLAYWRIGHT_BROWSER_CHANNEL=chrome npm run test:marketplace:e2e:server -- --workers=1` | PWA service worker、admin、report、free、fixed-price、creator upload、rejected revise/resubmit、mobile 八个用例 | 通过：8 passed (2.2m)；本机父进程延迟退出后 Ctrl-C 清理，无残留 server | 通过 |
| 阶段 50 diff 空白检查 | `git diff --check` | 当前补丁无 trailing whitespace 或 whitespace error | 通过 | 通过 |
| GitHub 阶段 50 PWA browser E2E 验证 | `gh run watch 28247412731 --repo Angelidiot/SillyTavern --exit-status` | GitHub Actions syntax、Jest、runtime smoke、runner Chrome 和真实 browser E2E 全链路 | 通过：Marketplace Wallet MVP job 1m37s，全步骤成功；actions 注解提示 pinned actions 内部 Node 20 deprecated 但 runner 强制 Node 24 | 通过 |
| 阶段 51 脚本契约测试 | `npm --prefix tests run test:unit -- marketplace-scripts.test.js` | `test:marketplace:all` 串起 contract、runtime smoke 和 E2E，且 fast `test:marketplace` 不递归慢速脚本 | 通过：1 suite / 2 tests | 通过 |
| 阶段 51 syntax gate | `npm run test:marketplace:syntax` | marketplace scripts 测试纳入语法门禁 | 通过：24 files checked | 通过 |
| 阶段 51 marketplace 聚合回归 | `npm run test:marketplace` | syntax + marketplace/wallet/PWA/health/seed/snapshot/API reference/scripts/filter/UI 契约 | 通过：9 suites / 36 tests | 通过 |
| 阶段 51 慢速全闭环脚本 | `PLAYWRIGHT_BROWSER_CHANNEL=chrome npm run test:marketplace:all` | 顺序运行 `test:marketplace`、runtime smoke 和临时 server browser E2E | 通过：contract 9 suites / 36 tests、runtime smoke ok、browser E2E 8 passed | 通过 |
| GitHub 阶段 51 全闭环脚本验证 | `gh run watch 28247839474 --repo Angelidiot/SillyTavern --exit-status` | GitHub Actions syntax、Jest、runtime smoke、runner Chrome 和真实 browser E2E 全链路 | 通过：Marketplace Wallet MVP job 1m25s，全步骤成功；actions 注解提示 pinned actions 内部 Node 20 deprecated 但 runner 强制 Node 24 | 通过 |

## 错误日志
| 时间戳 | 错误 | 尝试次数 | 解决方案 |
|--------|------|---------|---------|
| 无 | 无 | 0 | 无 |
| 2026-06-26 | Jest 安装角色卡时找不到 `./public/img/ai4.png` | 1 | 用 `serverDirectory` 解析默认头像绝对路径 |
| 2026-06-26 | `storage.stop is not a function` | 1 | 移除测试清理里的不存在 API 调用 |
| 2026-06-26 | listed 资产详情泄漏 `normalized_payload` | 1 | 未授权详情响应删除 payload，只暴露 `payload_available` |
| 2026-06-26 | 钱包 admin grant 空 body 会抛 TypeError | 1 | 使用空对象兜底解析请求体 |
| 2026-06-26 | 测试依赖被忽略的根目录 `config.yaml` | 1 | 改为使用 `import.meta.url` 解析已跟踪的 `default/config.yaml` |
| 2026-06-26 | 列表接口 `owned` 不是“已购买”状态 | 1 | 前端非创作者只展示“购买/领取并安装”，重复购买交给后端 already_owned 幂等处理 |
| 2026-06-26 | admin 面板 DOM 已渲染但仍保留 `hidden` 属性 | 1 | 改为显式移除/恢复 `hidden` 属性，并给扩展 JS/CSS 入口加版本 query 避免旧 ESM 模块缓存 |
| 2026-06-26 | admin 前端 gate 曾尝试用 `default-user` handle 兜底 | 1 | 按并发审查反馈改回仅使用 `isAdmin()`，与后端 admin 权限模型一致 |
| 2026-06-26 | Playwright Chromium 下载被中断后留下半安装缓存 | 2 | 不再阻塞基础交付；保留 E2E 测试与脚本，新增稳定 Jest UI 契约测试，E2E 需完整安装 `chromium-headless-shell` 后运行 |
| 2026-06-26 | Playwright `chromium-headless-shell` 安装下载完成后长时间卡住 | 1 | 终止卡住的安装进程；保留 E2E 列表验证和 Jest 契约，完整 E2E 仍待本机浏览器缓存修复 |
| 2026-06-26 | Runner Chrome 真实 E2E 中 admin、report、purchase 按钮隐藏或不可点击 | 1 | E2E helper 打开外层 Extensions drawer、展开内层 Marketplace inline drawer，并 mock admin 当前用户 |
| 2026-06-26 | 临时 data root 首次启动 onboarding 弹窗遮挡测试交互 | 1 | E2E helper 等待欢迎弹窗并点击 Save |
| 2026-06-26 | 本机 Chrome channel E2E 通过后父进程延迟退出 | 1 | 手动 Ctrl-C 后 wrapper 清理 server；以 GitHub runner 作为并行 E2E 退出行为最终裁决 |
| 2026-06-26 | Wallet ledger 降级请求覆盖 E2E mock 钱包余额，导致真实 Chrome E2E 看到 0 而非 175 | 1 | `loadWalletLedger()` 只更新最近流水，不再用 `/api/wallet/ledger` 响应覆盖 `state.wallet.balance` |
| 2026-06-26 | YAML workflow 检查脚本把空 `workflow_dispatch:` 当成缺失 | 2 | 改用 `Object.hasOwn(triggers, 'workflow_dispatch')` 检查键存在，而不是检查 truthy 值 |
| 2026-06-26 | snapshot export 测试在未初始化 node-persist 的用例后调用 `storage.clear` 抛 `storage.clear is not a function` | 1 | afterEach 中先判断 `typeof storage.clear === 'function'`，只在存在时执行清理 |
| 2026-06-26 | 阶段 48 并行跑 runtime smoke 和 marketplace Jest 聚合时，`market-wallet.test.js` delist 断言短暂返回 404 | 1 | 单独复跑 `market-wallet.test.js` 和串行 `npm run test:marketplace` 均通过；后续避免将真实 server smoke 与 Jest 聚合并行执行 |
| 2026-06-26 | 阶段 49 API reference 测试最初按 3 空格断言 `GET` 对齐 | 1 | 脚本按 6 字符 method column 输出，测试改为断言 `GET    /...` 并新增缺失 `--out` 路径校验 |
| 2026-06-26 | 阶段 50 PWA browser E2E 首跑时 active service worker 短暂为 `activating` | 1 | 改用 `expect.poll` 等待 `readyRegistration.active.state === 'activated'` 后再断言和 reload |

## 2026-06-26 阶段 38：钱包流水 UI 与真实运行闭环
- 启动并行 worker `019f040f-2485-7a31-9e82-15ca33bfc3fe`，限定其只补测试/文档契约，主线程负责 UI/样式/runtime smoke。
- Explorer `019f040c-2e25-7113-96c4-e05768f0562b` 完成只读审查，推荐优先补 runtime smoke 的真实免费领取/安装/文件落盘闭环，并补固定价购买并发幂等测试。
- 新开阶段 38，目标是让钱包流水在 UI 可见，同时强化真实 server smoke 和钱包双扣风险回归。
- marketplace-wallet 新增 Wallet Activity 面板，降级加载 `/api/wallet/ledger` 的最近 6 条流水，展示正负金额、bucket、类型和时间；manifest 升到 `0.2.2`。
- runtime smoke 增加 `--disableCsrf` 并实际 POST 免费领取、安装，随后校验 Library 和临时 dataRoot 内 world book 文件。
- `market-wallet.test.js` 新增固定价并发购买测试：两次并发 purchase 只生成一条 entitlement、一笔 buyer debit 和一笔 creator earning。
- 已通过 `npm run test:marketplace:syntax`、`npm --prefix tests run test:unit -- market-wallet.test.js marketplace-wallet-ui.test.js`、`npm run test:marketplace`、`npm run test:marketplace:smoke`、`git diff --check`。
- GitHub run `28240670891` 的真实 Chrome E2E 暴露 ledger 降级请求会用真实 `/api/wallet/ledger` 的 0 余额覆盖 mocked `/api/wallet` 的 175 余额；已修复为 ledger 请求只更新最近流水，余额继续由 `/api/wallet` 和 grant/purchase 主流程返回维护。
- GitHub run `28240992614` 已确认修复有效，Marketplace Wallet Checks 全链路通过。

## 2026-06-26 阶段 39：权限坏输入与验证入口补强
- 启动 worker `019f041d-ef72-77d3-a4f4-b78ff0e21bbf` 负责 workflow 手动触发和 README 验证矩阵，主线程负责钱包/市场权限坏输入测试。
- `market-wallet.test.js` 新增 wallet read scope/admin grant input 回归：普通用户不能用 `handle` query 读别人钱包或 ledger，管理员可读指定用户，invalid bucket、0 amount、unknown user 分别返回 400/400/404。
- `.github/workflows/marketplace-wallet-checks.yml` 增加 `workflow_dispatch`，并将 push 分支从 `codex/marketplace-wallet-mvp` 放宽到 `codex/**`，继续依赖 path filter 限制无关改动。
- README 新增 marketplace 本地验证矩阵，覆盖 syntax、contract、runtime smoke 和临时 server E2E 命令。
- 已通过 `npm --prefix tests run test:unit -- market-wallet.test.js`、`npm run test:marketplace`、workflow YAML 键存在性检查、`git diff --check`。
- GitHub run `28241497439` 已确认阶段 39 权限坏输入测试和 workflow/README 改动通过 Marketplace Wallet Checks 全链路。

## 2026-06-26 阶段 40：市场与钱包导出快照脚本
- Explorer `019f0426-8600-7843-bff6-d98443e5a18c` 完成只读审查，建议用 node-persist API 读 ledger，并默认导出白名单字段，避免 payload、举报正文、本地路径、完整 ledger reason/metadata 和绝对 data root 泄漏。
- 新增 `scripts/export-marketplace-snapshot.mjs` 和 `npm run marketplace:export:snapshot`，要求显式 `--dataRoot`，支持 stdout JSON 和 `--out` 文件输出。
- 快照输出包含 `market.summary/assets/entitlements/installs/reports` 与 `wallet.summary/ledger`；wallet ledger 只读取 `wallet:ledger:v1:`，并过滤合法 bucket 与 safe integer amount。
- `--out` 指向 data root 内部时会拒绝执行，保证导出动作不修改用户数据目录。
- 新增 `tests/marketplace-snapshot-export.test.js`，覆盖缺失 dataRoot、stdout 摘要、隐私字段过滤、外部 `--out`、dataRoot 内 `--out` 拒绝和无 `_storage` 时不创建钱包目录。
- README Useful Scripts 和验证矩阵加入 snapshot export；设计文档记录它作为迁移演练和备份检查工具。
- 已通过 `npm --prefix tests run test:unit -- marketplace-snapshot-export.test.js`、`npm run test:marketplace:syntax`、`npm run test:marketplace`、`npm run test:marketplace:smoke`、snapshot CLI smoke、`git diff --check`。

## 2026-06-26 阶段 41：购买响应隐私收紧
- 选择下一个低风险交付缺口：paid purchase 响应之前会把 `purchase.ledger_entries` 和 `purchase.creator_balance` 返回给买家，账务边界偏宽。
- `src/endpoints/market.js` 新增 `toPurchaseResult()`，购买响应只保留 purchase id 和 buyer balance；entitlement 内部仍保存 `ledger_entry_ids`，用于审计和后续迁移。
- `tests/market-wallet.test.js` 改为断言购买响应不含完整 ledger entries 或 creator balance；买家扣款和创作者 earnings 继续通过各自 `/api/wallet/ledger` 响应验证。
- README 和设计文档补充 paid purchase 响应边界：完整账本、创作者余额和收益明细由 Wallet API / Creator Center 读取。
- 已通过 `npm --prefix tests run test:unit -- market-wallet.test.js`、`npm run test:marketplace:syntax`、`npm run test:marketplace`、`npm run test:marketplace:smoke`。

## 2026-06-26 阶段 42：付费购买 runtime smoke 闭环
- Explorer `019f0433-3fd1-7b51-b21f-42187fe1e917` 建议最优先补真实 server 固定价购买 smoke，防止 paid purchase 只在单测中可用。
- `scripts/smoke-marketplace-runtime.mjs` 的临时 market store 增加 `smoke_asset_paid_world` fixed_price world book，保留原 free world book。
- smoke 通过真实 `/api/wallet/grants/admin` 给 `default-user` 发 paid 余额，再购买 fixed-price 资产，验证 purchase response 不含 `ledger_entries`/`creator_balance`。
- smoke 继续通过 `/api/wallet/ledger` 验证买家 paid 扣到 0，并通过 admin query 读取 `smoke-creator` earnings ledger 为 7。
- smoke 安装 free 和 paid world book，验证两个文件都写入临时 dataRoot，Library 中两个资产均可见且 install_count 为 1。
- README 验证矩阵和设计文档已更新 runtime smoke 覆盖范围。
- 已通过 `npm run test:marketplace:smoke`、`npm run test:marketplace:syntax`、`npm run test:marketplace`、`git diff --check`。

## 2026-06-26 阶段 43：浏览器固定价购买与钱包活动 E2E
- 按 Gibbs 的第二推荐补 fixed-price Buy & Install 浏览器路径，让 UI 自动化覆盖余额刷新和 Wallet Activity，而不是只依赖后端单测/runtime smoke。
- `tests/marketplace-wallet.e2e.js` 的 mock 现在维护可变 `wallet`、`ledger` 和 `library`，`/api/wallet` 与 `/api/wallet/ledger` 会随 purchase/grant 更新。
- 新增浏览器用例 `buys a fixed-price asset, refreshes wallet activity, and installs it`：点击 125 coins 资产后断言 purchase/install API 调用、总额 50、bonus 0、paid 25、earnings 25、Wallet Activity 显示 Purchase/-100/-25，Library 显示 Purchased/1 installs。
- README 验证矩阵更新 `test:marketplace:e2e:server` 覆盖范围，包含 fixed-price buy/install、wallet activity 和 Library。
- 已通过 `npm run test:marketplace:syntax`、`npm run test:marketplace:e2e:server -- --list`、`PLAYWRIGHT_BROWSER_CHANNEL=chrome npm run test:marketplace:e2e:server -- --workers=1`（5 passed，父进程延迟退出后 Ctrl-C 清理）、`npm run test:marketplace`、`npm run test:marketplace:smoke`。

## 2026-06-26 阶段 44：Creator 上传到审核队列浏览器闭环
- 按 Gibbs 的第三候选补 creator upload browser path，覆盖 marketplace-wallet 表单从粘贴 JSON 到 Save & Submit 的完整前端路径。
- `tests/marketplace-wallet.e2e.js` 的 mock 新增 create/submit 路由，支持 POST `/api/market/assets` 创建 draft、POST submit 后改成 submitted，并让 creator summary 动态读取当前用户资产。
- 新增浏览器用例 `submits a world book upload into the review queue and creator center`：填写 world_book JSON、提交审核、断言 create payload、submit 调用、Review Queue 出现新资产、Creator Center total assets 为 1 且列表显示 submitted。
- README 验证矩阵更新 `test:marketplace:e2e:server` 覆盖范围，包含 creator upload/submit。
- 已通过 `npm run test:marketplace:syntax`、`npm run test:marketplace:e2e:server -- --list`、`PLAYWRIGHT_BROWSER_CHANNEL=chrome npm run test:marketplace:e2e:server -- --workers=1`（6 passed）、`npm run test:marketplace`、`npm run test:marketplace:smoke`。

## 2026-06-26 阶段 45：Creator 上传审核 runtime smoke 闭环
- 启动只读 explorer `019f0451-68d3-7243-b9a9-7f189727da6f` 复核真实 market API 上传、提交、审批和 smoke 断言边界，主线程并行实现脚本增强。
- `scripts/smoke-marketplace-runtime.mjs` 在真实临时 server 中 POST 创建 world_book draft，验证 creator_id、private/draft、free pricing 和 normalized payload 保留。
- smoke 随后验证 Creator Center draft 统计、POST submit 后 review/submitted、creator detail 可读 payload、POST approve 后 listed/public 与 review metadata。
- smoke 再验证公开市场列表包含 approved upload 但不泄漏 `normalized_payload`，创作者可安装该世界书并让 Creator Center install_count/total_installs 刷新。
- README 验证矩阵和设计文档已更新 runtime smoke 覆盖范围，明确 creator upload/submit/approve 已纳入真实 server 闭环。
- 已通过 `npm run test:marketplace:syntax`、`npm run test:marketplace:smoke` 和 `npm run test:marketplace`。

## 2026-06-26 阶段 46：Creator/Admin 角色隔离后端契约
- 启动只读 explorer `019f0458-acc4-77d2-b61e-50734d66c322` 复核 market endpoint 与测试 helper 的角色隔离缺口，主线程先补现有单测覆盖。
- `tests/market-wallet.test.js` 新增 `keeps submitted creator assets hidden from non-owners until admin approval`，使用 Charlie 普通创作者、Bob 普通旁观者、Alice 管理员三类身份。
- 新测试断言 Bob 看不到 Charlie 的 draft/submitted asset 列表和详情，不能 purchase，且非管理员 approve 返回 403。
- 新测试断言 Charlie 作为 owner 可读取 submitted detail payload 但不能自审批，Alice 作为 admin 可读取 payload 并 approve，approve 后 Bob 只能看到公开元数据且拿不到 normalized payload。
- 已通过 `npm --prefix tests run test:unit -- market-wallet.test.js`、`npm run test:marketplace:syntax` 和 `npm run test:marketplace`。

## 2026-06-26 阶段 47：Rejected 资产修订重提浏览器闭环
- 启动只读 explorer `019f045e-7b65-7761-8b9e-4ea06cd97143` 复核 marketplace-wallet revision UI 与 Playwright mock 缺口。
- `tests/marketplace-wallet.e2e.js` 的 mock 新增 asset detail GET 和 PATCH revision 路由，并记录 `apiCalls.details` 与 `apiCalls.revisions`。
- 新增浏览器用例 `revises a rejected creator asset and resubmits it for review`：owned rejected world_book 点击 Revise 后填充上传表单，修改 title/summary/payload 后 Save & Submit。
- 用例断言 PATCH payload、submit 调用、Review Queue 出现 revised asset、Creator Center 列表显示 submitted，上传表单清空。
- README E2E 验证矩阵已更新 rejected asset revise/resubmit 覆盖范围。
- 已通过 `npm run test:marketplace:syntax`、`npm run test:marketplace:e2e:server -- --list`、`PLAYWRIGHT_BROWSER_CHANNEL=chrome npm run test:marketplace:e2e:server -- --workers=1`（7 passed，本机父进程延迟退出后 Ctrl-C 清理）和 `npm run test:marketplace`。

## 2026-06-26 阶段 48：举报处理 runtime smoke 闭环
- 启动只读 explorer `019f0467-6760-7311-8106-b1513f3f55d0` 复核真实 report API shape、resolve 响应和 smoke 断言边界。
- `scripts/smoke-marketplace-runtime.mjs` 在真实临时 server 中对 `smoke_asset_demo` 创建 open report，断言 reporter、reason、body 和 status。
- smoke 随后读取管理员 report queue，断言能找到 open report，asset 摘要只包含白名单字段，不泄漏 payload 或 metadata。
- smoke 通过真实 `POST /api/market/reports/:id/resolve` 写入 resolution note，断言 resolved_by、resolved_at、resolution_note，并确认再次读取 admin queue 时该 report 已消失。
- README 验证矩阵和设计文档已更新 runtime smoke 覆盖范围，明确 report create/queue/resolve 已纳入真实 server 闭环。
- 已通过 `npm run test:marketplace:syntax`、`npm run test:marketplace:smoke`、`npm --prefix tests run test:unit -- market-wallet.test.js` 和串行 `npm run test:marketplace`。

## 2026-06-26 阶段 49：Marketplace API reference 导出脚本
- 启动只读 explorer `019f0471-97ac-74f3-b15a-1a478dd5a0aa` 复核下一阶段交付缺口；其首要建议是收尾 API reference README/文档闭环，后续建议是浏览器级 PWA/service worker E2E 和慢速全闭环脚本。
- 新增 `scripts/export-marketplace-api-reference.mjs` 和 `npm run marketplace:export:api`，从 `src/endpoints/market.js`、`src/endpoints/wallet.js` 与公开 health route 生成 Markdown API reference。
- CLI 支持 stdout、`--out <file>`、`--out=<file>`、环境变量输出路径、`--help`，并对未知参数和缺失 `--out` 路径明确报错。
- 新增 `tests/marketplace-api-reference.test.js`，覆盖 Market API、Wallet API、Public health API 端点输出、显式 `--out` 写文件和参数错误。
- README Useful Scripts、验证矩阵和设计文档已加入 API reference 导出命令，说明它用于发布前核对当前本地 MVP 路由。
- 已通过 `npm --prefix tests run test:unit -- marketplace-api-reference.test.js`、`npm run test:marketplace:syntax`、`npm run marketplace:export:api` CLI smoke、`npm run test:marketplace` 和 `git diff --check`。
- GitHub run `28246518305` 已确认 Marketplace Wallet Checks 全链路通过。

## 2026-06-26 阶段 50：PWA service worker 浏览器 E2E
- 启动只读 explorer `019f0479-b6aa-7621-b7ca-7d74958342c6` 复核 PWA/Service Worker E2E 风险，确认应避免 API mock、等待 `navigator.serviceWorker.ready`、reload 后确认 controller，并清理 CacheStorage/registrations。
- `tests/marketplace-wallet.e2e.js` 新增 `hosted tavern PWA browser shell` 用例，打开 `/login.html` 触发真实 `scripts/pwa.js` 注册 `/service-worker.js`。
- 用例会清理当前 context 的 service worker 和 cache，等待 active state 进入 `activated`，reload 后确认页面受 `/service-worker.js` controller 控制。
- 用例断言 `sillytavern-shell-v1` 包含 `/`、`/login.html`、`/manifest.json`、`/style.css` 和 `/scripts/pwa.js`，然后请求真实 `/api/health` 并确认 CacheStorage 不包含 `/api/health`。
- 新增根脚本 `npm run test:pwa:e2e`，默认使用临时 server、grep PWA 用例并固定 `--workers=1`，减少同 origin Service Worker 并行串扰。
- README 验证矩阵和设计文档已更新，说明浏览器级 PWA E2E 覆盖 service worker 激活、shell cache 和 API cache exclusion。
- 已通过 `npm run test:marketplace:syntax`、`npm run test:pwa`、`PLAYWRIGHT_BROWSER_CHANNEL=chrome npm run test:pwa:e2e`、`npm run test:marketplace`、`npm run test:marketplace:smoke`、`npm run test:marketplace:e2e:server -- --list`、`PLAYWRIGHT_BROWSER_CHANNEL=chrome npm run test:marketplace:e2e:server -- --workers=1`（8 passed，本机父进程延迟退出后 Ctrl-C 清理）和 `git diff --check`。
- GitHub run `28247412731` 已确认 Marketplace Wallet Checks 全链路通过。

## 2026-06-26 阶段 51：Marketplace 慢速全闭环脚本
- 新增 `npm run test:marketplace:all`，顺序执行 `test:marketplace`、`test:marketplace:smoke` 和 `test:marketplace:e2e:server`。
- 新增 `tests/marketplace-scripts.test.js`，锁定慢速全闭环脚本的命令顺序，并断言日常 `test:marketplace` 不递归 slow loop 或直接跑 browser E2E。
- 将脚本契约测试纳入 `scripts/check-marketplace-syntax.mjs` 和 `npm run test:marketplace`。
- 补齐 `.github/workflows/marketplace-wallet-checks.yml` path filter 中的 API reference/snapshot 脚本和新增测试文件，避免纯测试或导出脚本变更漏跑 marketplace CI。
- README 验证矩阵和设计文档已补充 `test:marketplace:all` 作为发布前慢速验证入口。
- 已通过 `npm --prefix tests run test:unit -- marketplace-scripts.test.js`、`npm run test:marketplace:syntax`、`npm run test:marketplace` 和 `PLAYWRIGHT_BROWSER_CHANNEL=chrome npm run test:marketplace:all`。
- GitHub run `28247839474` 已确认 Marketplace Wallet Checks 全链路通过。

## 2026-06-26 阶段 52：创作者上传 tags 与 JSON 类型识别
- 启动只读 explorer `019f048f-c9f5-7420-bc03-223f8f3dfdbf` 复核 tags 后端约束、测试落点和文档落点，确认后端已有 `tags` 字段、最多 20 个、每个 40 字符，不需要后端改动。
- marketplace-wallet 上传表单新增 `Tags, comma separated` 输入，提交 draft、submit 或 revise 时把 tags 数组写入现有 Market API body。
- 市场资产卡片新增 tags chips，详情弹窗继续显示 tags，筛选搜索明确覆盖 tags 命中。
- Load JSON 现在会读取本地 JSON 文件后按 payload 形状自动设置 `character_card` 或 `world_book`，并优先用 payload name 填标题。
- `marketplace-wallet` manifest bump 到 `0.2.3`，避免浏览器缓存旧 JS/CSS。
- `tests/marketplace-wallet-ui.test.js` 锁定 tags 输入、提交 payload、回填/清空、tags chips 和 JSON 类型识别代码；`tests/marketplace-wallet-filters.test.js` 补 tags 搜索断言。
- `tests/marketplace-wallet.e2e.js` 的 creator upload 用例覆盖角色卡 JSON 自动识别、世界书 JSON 自动识别、tags 去重提交和列表 tags 展示。
- README 验证矩阵和设计文档已更新 tags 上传、列表展示、搜索命中和 JSON type auto-detect 的当前 MVP 边界。
- 已通过 `npm run test:marketplace:syntax`、`npm --prefix tests run test:unit -- marketplace-wallet-filters.test.js marketplace-wallet-ui.test.js`、`npm run test:marketplace`、`PLAYWRIGHT_BROWSER_CHANNEL=chrome npm run test:marketplace:e2e:server -- --workers=1 -g 'submits a world book upload'`、`npm run test:marketplace:smoke`、`npm run test:marketplace:e2e:server -- --list` 和 `git diff --check`。
- 完整本机 Chrome E2E 已通过 8 个用例；父进程延迟退出后 Ctrl-C 清理，临时 server 无残留。
- GitHub run `28248891425` 已确认 Marketplace Wallet Checks 全链路通过。

## 2026-06-26 阶段 53：举报详情正文前端闭环
- 启动只读 explorer `019f049e-fecd-7a90-ac02-728e3203b64f` 复核 report 前端、E2E mock、UI contract 和文档落点，确认后端已有 `{ reason, body }` 支持且管理员队列已显示 `body`。
- marketplace-wallet Report 操作改为两步输入：先填短 reason，再填可选 details/body；提交时按后端上限写入 `reason` 和 `body`。
- Report 提交成功后后台刷新管理员 Report Queue；普通用户没有 admin 队列时仍保持降级无感。
- `tests/marketplace-wallet.e2e.js` 增加 `POST /api/market/assets/*/report` mock，记录 report payload 并把新 report 放入 admin queue。
- 新增浏览器用例覆盖点击 Report、填写 reason/body、断言 POST payload 和管理员队列显示详细正文。
- README 和设计文档已补充 report body 当前 API/前端边界。
- 已通过 `npm run test:marketplace:syntax`、`npm --prefix tests run test:unit -- marketplace-wallet-ui.test.js`、`PLAYWRIGHT_BROWSER_CHANNEL=chrome npm run test:marketplace:e2e:server -- --workers=1 -g 'submits a report with reviewer details'`、`npm run test:marketplace`、`npm run test:marketplace:e2e:server -- --list` 和 `git diff --check`。
- 完整本机 Chrome E2E 已通过 9 个用例；父进程延迟退出后 Ctrl-C 清理，临时 server 无残留。
- GitHub run `28249528500` 已确认 Marketplace Wallet Checks 全链路通过。

## 2026-06-26 阶段 54：粘贴 JSON 自动识别上传类型
- 根据只读 explorer `019f049c-2eb8-7190-bae4-70e52d162886` 的前端体验建议，补齐 textarea 粘贴 JSON 与 Load JSON 文件导入之间的体验差异。
- 抽出 `applyUploadPayloadHints()` 和 `applyUploadPayloadTextHints()`，文件导入和 textarea `change/blur` 共用角色卡/世界书类型识别与标题提示逻辑。
- 粘贴合法 world book JSON 后会自动切换为 `world_book` 并在标题为空时填 payload name；粘贴角色卡 JSON 会切换为 `character_card`，但不覆盖用户已有标题。
- UI contract 锁定粘贴识别 helper 和事件绑定；浏览器 E2E 的 creator upload 用例覆盖粘贴 world book、粘贴 character card、已有标题不覆盖，以及原有文件导入提交路径。
- README、设计文档和 findings 已补充文件/粘贴 JSON 都支持 type auto-detect。
- 已通过 `npm run test:marketplace:syntax`、`npm --prefix tests run test:unit -- marketplace-wallet-ui.test.js`、`PLAYWRIGHT_BROWSER_CHANNEL=chrome npm run test:marketplace:e2e:server -- --workers=1 -g 'submits a world book upload'`、`npm run test:marketplace`、`npm run test:marketplace:e2e:server -- --list` 和 `git diff --check`。
- GitHub run `28249861787` 已确认 Marketplace Wallet Checks 全链路通过。

## 2026-06-26 阶段 55：余额不足购买提示
- 根据前端体验 explorer 的建议，补齐固定价资产余额不足时只依赖按钮 `title` 的移动端可见性缺口。
- marketplace-wallet 在不可购买的 fixed-price 资产动作区显示 `Need X more bonus or paid coins`，并通过 `aria-describedby` 关联 disabled 购买按钮。
- 可消费余额继续只计算 `bonus + paid`，不把 `earnings` 计入买家购买力。
- 新增 `.marketplace-wallet-affordability` 样式，桌面靠右、移动端居中，避免窄屏溢出。
- 浏览器 E2E 新增 unaffordable fixed-price 用例，断言按钮 disabled、缺口金额、aria 关联和不会触发 purchase；移动布局用例加入 affordability 文案无溢出检查。
- README、设计文档和 findings 已补充余额不足提示和 bonus/paid 消费边界。
- 已通过 `npm run test:marketplace:syntax`、`npm --prefix tests run test:unit -- marketplace-wallet-ui.test.js`、`PLAYWRIGHT_BROWSER_CHANNEL=chrome npm run test:marketplace:e2e:server -- --workers=1 -g 'missing spendable balance'`、`npm run test:marketplace`、`npm run test:marketplace:e2e:server -- --list`、`PLAYWRIGHT_BROWSER_CHANNEL=chrome npm run test:marketplace:e2e:server -- --workers=1 -g 'keeps review controls compact'` 和 `git diff --check`。
- GitHub run `28250265735` 已确认 Marketplace Wallet Checks 全链路通过。

## 2026-06-26 阶段 56：市场筛选无结果清空入口
- 根据前端体验 explorer 的建议，补齐市场筛选/搜索无结果时无法快速回到默认浏览的移动端体验缺口。
- marketplace-wallet 筛选条新增 `Clear filters` 按钮，默认 hidden；仅当当前存在 search/type/price/access/sort 条件且结果为空时显示。
- 点击 Clear filters 会清空搜索、类型、价格、访问状态，并将排序恢复到 `recent`，随后重新渲染资产列表。
- 移动端样式让筛选条按钮和输入控件一样全宽，避免窄屏横向溢出。
- UI contract 锁定 Clear filters 模板、显示逻辑和事件绑定；浏览器 E2E 覆盖空结果、按钮显示、清空后资产恢复和控件默认值。
- README、设计文档和 findings 已补充 clear-filter 浏览体验。
- 已通过 `npm run test:marketplace:syntax`、`npm --prefix tests run test:unit -- marketplace-wallet-ui.test.js`、`PLAYWRIGHT_BROWSER_CHANNEL=chrome npm run test:marketplace:e2e:server -- --workers=1 -g 'clears active marketplace filters'`、`npm run test:marketplace`、`npm run test:marketplace:e2e:server -- --list`、`PLAYWRIGHT_BROWSER_CHANNEL=chrome npm run test:marketplace:e2e:server -- --workers=1 -g 'keeps review controls compact'` 和 `git diff --check`。
- GitHub run `28250680898` 已确认 Marketplace Wallet Checks 全链路通过。

## 2026-06-26 阶段 57：资产详情元数据补齐
- 启动只读 explorer `019f04bd-a0fe-7bb3-9ee7-555e92ef1dc7` 复核 Details/Inspect 入口、E2E 落点和 UI contract 字符串，确认市场卡片 Details 与审核 Inspect 都复用 `viewAssetDetails()`。
- marketplace-wallet Details 弹窗新增语言、内容分级、创建日期、上架日期和更新日期。
- 新增 `formatAssetDate()`，把资产生命周期时间格式化为稳定 `YYYY-MM-DD`，避免浏览器 locale 造成测试漂移。
- `marketplace-wallet` manifest bump 到 `0.2.4`，避免浏览器缓存旧 JS/CSS。
- 浏览器 E2E 新增详情元数据用例，点击资产卡片 Details 后断言 language/content rating/created/listed/updated 出现在弹窗中。
- README、设计文档和 findings 已补充详情元数据展示边界。
- 已通过 `npm run test:marketplace:syntax`、`npm --prefix tests run test:unit -- marketplace-wallet-ui.test.js`、`PLAYWRIGHT_BROWSER_CHANNEL=chrome npm run test:marketplace:e2e:server -- --workers=1 -g 'shows asset detail metadata'`、`npm run test:marketplace`、`npm run test:marketplace:e2e:server -- --list` 和 `git diff --check`。
- 完整本机 Chrome E2E 已通过 12 个用例；父进程延迟退出后 Ctrl-C 清理，临时 server 无残留。
- GitHub run `28251336091` 已确认 Marketplace Wallet Checks 全链路通过；仅有 GitHub Actions Node 20 runner deprecation annotation，不影响本次门禁结果。

## 2026-06-26 阶段 58：用户库详情入口补齐
- 启动只读 explorer `019f04c7-7ac8-78e1-9500-dc3ac2c56965` 扫描下一步低风险候选；它建议优先补 My Library 细节、Creator Center 细分统计和 Review Queue 元信息。
- 发现阶段 22/文档已记录“Marketplace 和 Library 条目增加 Details”，但当前 `renderLibrary()` 只渲染 Install，属于实现漂移。
- marketplace-wallet My Library 条目新增 Details + Install action 组，Details 继续复用 `viewAssetDetails()` 和现有 payload 权限。
- 移动端 `.marketplace-wallet-library-actions` 采用两列按钮网格，避免 Details/Install 在窄屏横向溢出。
- `marketplace-wallet` manifest bump 到 `0.2.5`，避免浏览器缓存旧 JS/CSS。
- 浏览器 E2E 在免费领取进入 Library 后，从库条目点击 Details 并断言详情弹窗出现；移动布局用例加入 library action 两列断言。
- README、设计文档和 findings 已补充 Library details/reinstall 当前边界。
- 已通过 `npm run test:marketplace:syntax`、`npm --prefix tests run test:unit -- marketplace-wallet-ui.test.js`、`PLAYWRIGHT_BROWSER_CHANNEL=chrome npm run test:marketplace:e2e:server -- --workers=1 -g 'claims and installs a free asset'`、`PLAYWRIGHT_BROWSER_CHANNEL=chrome npm run test:marketplace:e2e:server -- --workers=1 -g 'keeps review controls compact'`、`npm run test:marketplace`、`npm run test:marketplace:e2e:server -- --list` 和 `git diff --check`。
- 首次 `npm run test:marketplace` 中 `market-wallet.test.js` 的 `requires review before purchase...` 出现一次 `TypeError: fetch failed / SocketError: other side closed`；同用例单独复跑通过，完整聚合随后复跑通过，判断为瞬时本地 socket 抖动。
- 完整本机 Chrome E2E 已通过 12 个用例；父进程延迟退出后 Ctrl-C 清理，临时 server 无残留。
- GitHub run `28251992376` 已确认 Marketplace Wallet Checks 全链路通过；仅有 GitHub Actions Node 20 runner deprecation annotation，不影响本次门禁结果。

## 2026-06-26 阶段 59：用户库安装摘要补齐
- 根据 explorer 的 Library 细节建议，继续补齐 My Library 中已有后端字段的前端展示。
- marketplace-wallet My Library 条目现在展示授权日期 `added YYYY-MM-DD`。
- 若存在 `last_install`，My Library 额外展示最近安装日期、本地引用和安装类型摘要。
- 新增 `.marketplace-wallet-library-install`，长 `local_ref` 使用 `overflow-wrap: anywhere`，避免移动端横向溢出。
- `marketplace-wallet` manifest bump 到 `0.2.6`，避免浏览器缓存旧 JS/CSS。
- 浏览器 E2E 的免费领取/安装用例断言 Library 显示授权日期和最近安装路径。
- README、设计文档和 findings 已补充 Library 授权日期和最近安装摘要边界。
- 已通过 `npm run test:marketplace:syntax`、`npm --prefix tests run test:unit -- marketplace-wallet-ui.test.js`、`PLAYWRIGHT_BROWSER_CHANNEL=chrome npm run test:marketplace:e2e:server -- --workers=1 -g 'claims and installs a free asset'`、`PLAYWRIGHT_BROWSER_CHANNEL=chrome npm run test:marketplace:e2e:server -- --workers=1 -g 'keeps review controls compact'`、`npm run test:marketplace`、`npm run test:marketplace:e2e:server -- --list` 和 `git diff --check`。
- GitHub run `28252365512` 已确认 Marketplace Wallet Checks 全链路通过；仅有 GitHub Actions Node 20 runner deprecation annotation，不影响本次门禁结果。

## 2026-06-26 阶段 60：创作者中心细分统计
- 根据 explorer 的 Creator Center 细分统计建议，补齐后端 summary 已返回但前端未展示的聚合字段。
- Creator Center 统计网格新增 drafts、submitted、rejected、paid sales、installs 和 earnings balance。
- marketplace-wallet E2E mock 的 creator summary 现在返回 draft/submitted/rejected、paid_sales、total_installs 和 earnings_balance，贴近真实后端响应。
- `marketplace-wallet` manifest bump 到 `0.2.7`，避免浏览器缓存旧 JS/CSS。
- 浏览器 E2E 的 creator upload 流程断言提交后 assets=1、submitted=1、其他状态为 0、paid sales/install 为 0，以及 earnings balance 保持 25。
- README、设计文档和 findings 已补充 Creator Center 细分统计当前边界。
- 已通过 `npm run test:marketplace:syntax`、`npm --prefix tests run test:unit -- marketplace-wallet-ui.test.js`、`PLAYWRIGHT_BROWSER_CHANNEL=chrome npm run test:marketplace:e2e:server -- --workers=1 -g 'submits a world book upload'`、`npm run test:marketplace`、`npm run test:marketplace:e2e:server -- --list`、`PLAYWRIGHT_BROWSER_CHANNEL=chrome npm run test:marketplace:e2e:server -- --workers=1 -g 'keeps review controls compact'` 和 `git diff --check`。
- GitHub run `28252716889` 已确认 Marketplace Wallet Checks 全链路通过；仅有 GitHub Actions Node 20 runner deprecation annotation，不影响本次门禁结果。

## 2026-06-26 阶段 61：审核队列元信息摘要
- 根据 explorer 的 Review Queue 元信息建议，补齐管理员审核列表中已有安全字段的前端展示。
- Review Queue 现在展示创作者 handle、价格、更新时间、最多 3 个标签和摘要片段。
- payload 继续只在点击 Inspect 时通过 asset detail 权限懒加载，队列本身不展示 `normalized_payload`。
- 新增 `.marketplace-wallet-review-summary`，摘要使用可换行文本避免移动端溢出。
- `marketplace-wallet` manifest bump 到 `0.2.8`，避免浏览器缓存旧 JS/CSS。
- 浏览器 E2E 的 admin review 用例断言 creator/price/updated/tags/summary 可见，并继续覆盖 approve/grant。
- README、设计文档和 findings 已补充 Review Queue 元信息边界。
- 已通过 `npm run test:marketplace:syntax`、`npm --prefix tests run test:unit -- marketplace-wallet-ui.test.js`、`PLAYWRIGHT_BROWSER_CHANNEL=chrome npm run test:marketplace:e2e:server -- --workers=1 -g 'renders admin review queue'`、`npm run test:marketplace`、`npm run test:marketplace:e2e:server -- --list`、`PLAYWRIGHT_BROWSER_CHANNEL=chrome npm run test:marketplace:e2e:server -- --workers=1 -g 'keeps review controls compact'` 和 `git diff --check`。
- GitHub run `28253068352` 已确认 Marketplace Wallet Checks 全链路通过；仅有 GitHub Actions Node 20 runner deprecation annotation，不影响本次门禁结果。

## 2026-06-26 阶段 62：创作者资产审核状态细节
- 启动只读 explorer `019f04e5-2eac-7e31-8967-f885e88a08df` 复核 Creator Center 资产列表的审核字段来源和测试落点。
- marketplace-wallet Creator Center 资产列表新增 audit 行，显示 submitted 日期、approved 日期和 rejected 原因摘要。
- rejected 原因截断到 120 字符并使用 `.marketplace-wallet-creator-audit` 可换行样式，避免移动端溢出。
- `marketplace-wallet` manifest bump 到 `0.2.9`，避免浏览器缓存旧 JS/CSS。
- 浏览器 E2E 的 creator upload 用例断言 submitted 日期；rejected revision 用例断言修订前能看到 rejected 原因摘要。
- README、设计文档和 findings 已补充 Creator Center 审核状态细节。
- 已通过 `npm run test:marketplace:syntax`、`npm --prefix tests run test:unit -- marketplace-wallet-ui.test.js`、`PLAYWRIGHT_BROWSER_CHANNEL=chrome npm run test:marketplace:e2e:server -- --workers=1 -g 'submits a world book upload'`、`PLAYWRIGHT_BROWSER_CHANNEL=chrome npm run test:marketplace:e2e:server -- --workers=1 -g 'revises a rejected creator asset'`、`npm run test:marketplace`、`npm run test:marketplace:e2e:server -- --list`、`PLAYWRIGHT_BROWSER_CHANNEL=chrome npm run test:marketplace:e2e:server -- --workers=1 -g 'keeps review controls compact'` 和 `git diff --check`。
- GitHub run `28253684795` 已确认 Marketplace Wallet Checks 全链路通过；仅有 GitHub Actions Node 20 runner deprecation annotation，不影响本次门禁结果。

## 2026-06-26 阶段 63：详情弹窗授权信息摘要
- 根据只读 explorer `019f04ea-a25b-7df1-9393-5b99bc4ce616` 的候选建议，补齐 asset detail API 已返回但前端未展示的 entitlement。
- marketplace-wallet Details 弹窗新增当前用户 entitlement 来源、授权日期和购买引用摘要；未授权资产显示 not in library/not entitled/none。
- `marketplace-wallet` manifest bump 到 `0.2.10`，避免浏览器缓存旧 JS/CSS。
- 浏览器 E2E mock 的 asset detail 现在从 Library 状态返回 entitlement，贴近真实后端 `/api/market/assets/:id`。
- README、设计文档和 findings 已补充 Details entitlement 展示边界。
- 已通过 `npm run test:marketplace:syntax`、`npm --prefix tests run test:unit -- marketplace-wallet-ui.test.js`、`PLAYWRIGHT_BROWSER_CHANNEL=chrome npm run test:marketplace:e2e:server -- --workers=1 -g 'shows asset detail metadata'`、`PLAYWRIGHT_BROWSER_CHANNEL=chrome npm run test:marketplace:e2e:server -- --workers=1 -g 'claims and installs a free asset'`、`npm run test:marketplace`、`npm run test:marketplace:e2e:server -- --list`、`PLAYWRIGHT_BROWSER_CHANNEL=chrome npm run test:marketplace:e2e:server -- --workers=1 -g 'keeps review controls compact'` 和 `git diff --check`。
- GitHub run `28254083806` 已确认 Marketplace Wallet Checks 全链路通过；仅有 GitHub Actions Node 20 runner deprecation annotation，不影响本次门禁结果。

## 2026-06-26 阶段 64：举报队列创建日期摘要
- 根据 explorer 的低风险候选，补齐 admin report item 已返回但 Report Queue 未展示的 `created_at`。
- marketplace-wallet Report Queue 元信息新增 `reported YYYY-MM-DD`，帮助管理员判断 open reports 积压时间。
- `marketplace-wallet` manifest bump 到 `0.2.11`，避免浏览器缓存旧 JS/CSS。
- 浏览器 E2E 的 report resolve 和 report submit 流程均断言队列显示举报日期。
- README、设计文档和 findings 已补充 Report Queue reported date 边界。
- 已通过 `npm run test:marketplace:syntax`、`npm --prefix tests run test:unit -- marketplace-wallet-ui.test.js`、`PLAYWRIGHT_BROWSER_CHANNEL=chrome npm run test:marketplace:e2e:server -- --workers=1 -g 'reports'`、`PLAYWRIGHT_BROWSER_CHANNEL=chrome npm run test:marketplace:e2e:server -- --workers=1 -g 'submits a report'`、`npm run test:marketplace`、`npm run test:marketplace:e2e:server -- --list`、`PLAYWRIGHT_BROWSER_CHANNEL=chrome npm run test:marketplace:e2e:server -- --workers=1 -g 'keeps review controls compact'` 和 `git diff --check`。
- GitHub run `28254397838` 已确认 Marketplace Wallet Checks 全链路通过；仅有 GitHub Actions Node 20 runner deprecation annotation，不影响本次门禁结果。

## 2026-06-26 阶段 65：市场搜索元数据覆盖
- 根据只读 explorer `019f04f6-ba7c-7960-b4bc-4e7f65fef03f` 的候选建议，补齐前端搜索未覆盖但后端列表已返回的 `language` 和 `content_rating` 字段。
- marketplace-wallet 的 `filterAndSortAssets()` 搜索文本池新增 language/content_rating，用户可按语言或内容分级查找资产。
- `marketplace-wallet` manifest bump 到 `0.2.12`，避免浏览器缓存旧 JS/CSS。
- filters Jest 单测新增 `ja` 和 `teen` 搜索断言，锁定元数据搜索行为。
- README、设计文档和 findings 已补充 language/rating search 边界。
- 已通过 `npm run test:marketplace:syntax`、`npm --prefix tests run test:unit -- marketplace-wallet-filters.test.js`、`npm --prefix tests run test:unit -- marketplace-wallet-ui.test.js`、`npm run test:marketplace`、`npm run test:marketplace:e2e:server -- --list`、`PLAYWRIGHT_BROWSER_CHANNEL=chrome npm run test:marketplace:e2e:server -- --workers=1 -g 'keeps review controls compact'` 和 `git diff --check`。
- GitHub run `28254669365` 已确认 Marketplace Wallet Checks 全链路通过；仅有 GitHub Actions Node 20 runner deprecation annotation，不影响本次门禁结果。

## 2026-06-26 阶段 66：快照导出审核生命周期字段
- 根据 explorer 的候选建议，补齐 snapshot export 未包含但市场资产已有的审核生命周期字段。
- `scripts/export-marketplace-snapshot.mjs` 的 asset 白名单新增 `submitted_at`、`approved_at` 和 `delisted_at`，保留既有 `listed_at`。
- snapshot export 单测 fixture 和断言新增 submitted/approved/listed/delisted lifecycle 字段，同时继续确认 payload、举报正文、本地路径和私有 metadata 不导出。
- README、设计文档和 findings 已补充 snapshot asset lifecycle 白名单边界。
- 已通过 `npm run test:marketplace:syntax`、`npm --prefix tests run test:unit -- marketplace-snapshot-export.test.js`、`npm run test:marketplace` 和 `git diff --check`。
- GitHub run `28254941882` 已确认 Marketplace Wallet Checks 全链路通过；仅有 GitHub Actions Node 20 runner deprecation annotation，不影响本次门禁结果。

## 2026-06-26 阶段 67：API reference 路由覆盖锁定
- 根据 explorer 的候选建议，补齐 API reference 单测对当前 MVP 路由集合的覆盖。
- `tests/marketplace-api-reference.test.js` 现在断言 assets detail、creator summary、library、reports admin、asset create/submit/approve/reject/delist/report/purchase/install、report resolve、wallet ledger 和 admin grant 都出现在导出的 Markdown 中。
- README、设计文档和 findings 已补充 API reference 测试锁定完整 MVP 路由集合的边界。
- 已通过 `npm run test:marketplace:syntax`、`npm --prefix tests run test:unit -- marketplace-api-reference.test.js`、`npm run test:marketplace` 和 `git diff --check`。
- GitHub run `28255165232` 已确认 Marketplace Wallet Checks 全链路通过；仅有 GitHub Actions Node 20 runner deprecation annotation，不影响本次门禁结果。

## 2026-06-26 阶段 68：详情弹窗下架日期
- marketplace-wallet Details 弹窗新增 `Delisted` 行，显示 `delisted_at` 的稳定 `YYYY-MM-DD` 日期；未下架资产显示 `not delisted`。
- `marketplace-wallet` manifest bump 到 `0.2.13`，避免浏览器缓存旧 JS/CSS。
- UI contract 锁定 Delisted 元信息行，浏览器详情 E2E 覆盖 delisted 日期可见。
- README、设计文档和 findings 已补充 Details delisted date 边界。
- 已通过 `npm run test:marketplace:syntax`、`npm --prefix tests run test:unit -- marketplace-wallet-ui.test.js`、`PLAYWRIGHT_BROWSER_CHANNEL=chrome npm run test:marketplace:e2e:server -- --workers=1 -g 'shows asset detail metadata'`、`npm run test:marketplace`、`npm run test:marketplace:e2e:server -- --list`、`PLAYWRIGHT_BROWSER_CHANNEL=chrome npm run test:marketplace:e2e:server -- --workers=1 -g 'keeps review controls compact'` 和 `git diff --check`。
- GitHub run `28255464078` 已确认 Marketplace Wallet Checks 全链路通过；仅有 GitHub Actions Node 20 runner deprecation annotation，不影响本次门禁结果。

## 2026-06-26 阶段 69：API reference 权限隐私标注
- 根据只读 explorer `019f0509-4be1-7bc3-a5d6-1e4fcd3ccbb1` 的候选建议，给 API reference 导出增加关键权限/隐私 notes。
- `scripts/export-marketplace-api-reference.mjs` 新增 route notes 映射，继续从源码解析路由，同时在 Markdown 中标注 payload redaction、Library scope、admin-only reports/review/delist/grant、Wallet read scope 和 grant alias。
- API reference 单测新增 notes 断言，锁定这些权限/隐私边界。
- README、设计文档和 findings 已补充 API reference permission/privacy notes 边界。
- 已通过 `npm run test:marketplace:syntax`、`npm --prefix tests run test:unit -- marketplace-api-reference.test.js`、`npm run marketplace:export:api -- --out <tmpfile>` smoke、`npm --prefix tests run test:unit -- market-wallet.test.js -t 'requires review before purchase'`、`npm run test:marketplace` 复跑和 `git diff --check`。
- 首次 `npm run test:marketplace` 中 `market-wallet.test.js` 的 `requires review before purchase...` 出现一次 `TypeError: fetch failed / SocketError: other side closed`；该用例单独复跑通过，完整聚合随后复跑通过，判断为瞬时本地 socket 抖动。
- GitHub run `28255738939` 已确认 Marketplace Wallet Checks 全链路通过；仅有 GitHub Actions Node 20 runner deprecation annotation，不影响本次门禁结果。

## 2026-06-26 阶段 70：市场扩展静态资产门禁
- 根据只读 explorer 的候选建议，扩展 `scripts/check-marketplace-syntax.mjs`，在 JS `node --check` 之外检查 marketplace-wallet 静态资产。
- syntax gate 现在会确认 `manifest.json`、`window.html` 和 `style.css` 存在且非空，并对 manifest 执行 JSON parse。
- `tests/marketplace-scripts.test.js` 新增契约断言，锁定静态资产门禁目标。
- README 和 findings 已补充 syntax gate 覆盖 marketplace-wallet 静态资产的边界。
- 已通过 `npm run test:marketplace:syntax`、`npm --prefix tests run test:unit -- marketplace-scripts.test.js`、`npm run test:marketplace` 和 `git diff --check`。
- GitHub run `28255982574` 已确认 Marketplace Wallet Checks 全链路通过；仅有 GitHub Actions Node 20 runner deprecation annotation，不影响本次门禁结果。

## 2026-06-26 阶段 71：钱包管理员发放别名覆盖
- 根据 API reference 已标注的 admin grant alias，补齐后端契约测试覆盖。
- `allows only admins to grant wallet balance` 现在依次通过 `targetHandle`、`handle` 和 `userHandle` 给 bob 发放 bonus/paid/earnings。
- 测试断言三次 grant 响应都返回顶层 `handle: bob`，并写入 bob 的余额分桶与三条 actor 为 alice 的 wallet ledger 记录。
- README 和 findings 已补充 admin grant 收款人字段别名边界。
- 已通过 `npm --prefix tests run test:unit -- market-wallet.test.js -t 'allows only admins to grant wallet balance'`、`npm run test:marketplace:syntax`、`npm run test:marketplace` 和 `git diff --check`。
- GitHub run `28256378537` 已确认 Marketplace Wallet Checks 全链路通过；仅有 GitHub Actions Node 20 runner deprecation annotation，不影响本次门禁结果。

## 2026-06-26 阶段 72：举报处理备注长度边界
- 在举报处理后端用例中补齐 resolve note 长度边界。
- 1001 字符 note 现在断言返回 `400 Invalid report resolution` 和 `note must be 1000 characters or less`，并确认 admin queue 中 report 仍保持 open。
- 正好 1000 字符 note 断言可成功 resolve 并原样保存到 `resolution_note`。
- README 和 findings 已补充 Report Queue resolution note 长度边界。
- 已通过 `npm --prefix tests run test:unit -- market-wallet.test.js -t 'requires review before purchase'`、`npm run test:marketplace:syntax`、`npm run test:marketplace` 和 `git diff --check`。
- GitHub run `28256650347` 已确认 Marketplace Wallet Checks 全链路通过；仅有 GitHub Actions Node 20 runner deprecation annotation，不影响本次门禁结果。

## 2026-06-26 阶段 73：README 可运行脚本同步契约
- `tests/marketplace-scripts.test.js` 新增 README/package 脚本同步契约。
- 测试确认 `start:no-csrf`、marketplace seed/export/test 脚本、marketplace browser E2E 脚本和 PWA/mobile 测试脚本都存在于 `package.json` 且在 README 中有 `npm run ...` 用法。
- 根据只读 explorer 复核，README 检查限制在 Useful Scripts/Validation matrix 段落，并使用命令边界正则，避免短脚本被长脚本假命中。
- README Development Notes 已说明该契约用于防止托管版 marketplace/PWA 命令与文档漂移。
- 已通过 `npm --prefix tests run test:unit -- marketplace-scripts.test.js`、`npm run test:marketplace:syntax`、`npm run test:marketplace` 和 `git diff --check`。
- GitHub run `28257000239` 已确认 Marketplace Wallet Checks 全链路通过；仅有 GitHub Actions Node 20 runner deprecation annotation，不影响本次门禁结果。

## 2026-06-26 阶段 74：举报提交长度边界
- 新增 `validates marketplace report reason and body length` 后端契约测试。
- 121 字符 reason 加 2001 字符 body 断言返回 `400 Invalid market report`，错误详情包含 reason/body 长度限制，并确认管理员 reports 队列仍为空。
- 120 字符 reason 加 2000 字符 body 断言可成功创建 open report，且管理员队列中 reason/body 原样可见。
- README 和 findings 已补充 Report reason/body 长度边界。
- 已通过 `npm --prefix tests run test:unit -- market-wallet.test.js -t 'validates marketplace report reason and body length'`、`npm run test:marketplace:syntax`、`npm run test:marketplace` 和 `git diff --check`。
- GitHub run `28257310065` 已确认 Marketplace Wallet Checks 全链路通过；仅有 GitHub Actions Node 20 runner deprecation annotation，不影响本次门禁结果。

## 2026-06-26 阶段 75：快照举报处理生命周期覆盖
- `tests/marketplace-snapshot-export.test.js` 的 fixture 新增 open 与 resolved 两条 report。
- snapshot summary 现在测试 `reports_by_status.open/resolved`，report 明细测试 resolved report 会导出 `resolved_at`。
- redaction 断言确认 snapshot 不包含 report body、resolved report body、private moderation note 或 `resolved_by` 字段。
- README 和 findings 已补充 snapshot report lifecycle/redaction 边界。
- 已通过 `npm --prefix tests run test:unit -- marketplace-snapshot-export.test.js`、`npm run test:marketplace:syntax`、`npm run test:marketplace` 和 `git diff --check`。
- GitHub run `28257569504` 已确认 Marketplace Wallet Checks 全链路通过；仅有 GitHub Actions Node 20 runner deprecation annotation，不影响本次门禁结果。

## 2026-06-26 阶段 76：API reference 举报边界标注
- `scripts/export-marketplace-api-reference.mjs` 的 route notes 新增 report 创建和 resolve 长度边界。
- API reference 现在标注 `POST /api/market/assets/:id/report` 的 reason 120 字符、body 2000 字符限制。
- API reference 现在标注 `POST /api/market/reports/:id/resolve` 的 note 1000 字符限制。
- `tests/marketplace-api-reference.test.js` 已锁定这两条 notes，README 和 findings 已同步说明。
- 已通过 `npm --prefix tests run test:unit -- marketplace-api-reference.test.js`、`npm run marketplace:export:api -- --out <tmpfile>` smoke、`npm run test:marketplace:syntax`、`npm run test:marketplace` 和 `git diff --check`。
- GitHub run `28257786482` 已确认 Marketplace Wallet Checks 全链路通过；仅有 GitHub Actions Node 20 runner deprecation annotation，不影响本次门禁结果。

## 2026-06-26 阶段 77：市场资产 tags 后端边界
- 新增 `validates and normalizes marketplace asset tags` 后端契约测试。
- 测试覆盖 tags 非数组返回 `tags must be an array`，超过 20 个返回 `tags must contain 20 items or less`。
- 测试覆盖非字符串 tag 和超过 40 字符 tag 的错误详情。
- 测试覆盖成功创建时 tags 会 trim、过滤空字符串、去重，并保留正好 40 字符的 tag。
- 根据只读 explorer 复核，同一用例补充 PATCH 入口最小覆盖，确认 draft asset 修订时 bad tags 返回同样 error shape，valid tags 会重新归一化写入资产。
- README 和 findings 已补充 bounded tags 后端边界。
- 已通过 `npm --prefix tests run test:unit -- market-wallet.test.js -t 'validates and normalizes marketplace asset tags'`、`npm run test:marketplace:syntax`、`npm run test:marketplace` 和 `git diff --check`。
- GitHub run `28258052271` 已确认 Marketplace Wallet Checks 全链路通过；仅有 GitHub Actions Node 20 runner deprecation annotation，不影响本次门禁结果。

## 2026-06-26 阶段 78：市场资产文本元数据边界
- 新增 `validates and normalizes marketplace asset text metadata` 后端契约测试。
- 测试覆盖 title 121、summary 501、description 10001、language 17、content_rating 41 字符时返回对应长度错误。
- 测试覆盖 title 120、summary 500、description 10000、language 16、content_rating 40 字符可创建，并确认后端 trim 后原样保存。
- 根据只读 explorer 复核，PATCH 已由 tags 用例证明走同一验证入口，本阶段保持最小 POST 文本元数据覆盖。
- README 和 findings 已补充 bounded metadata 后端边界。
- 已通过 `npm --prefix tests run test:unit -- market-wallet.test.js -t 'validates and normalizes marketplace asset text metadata'`、`npm run test:marketplace:syntax`、`npm run test:marketplace` 和 `git diff --check`。
- GitHub run `28258315683` 已确认 Marketplace Wallet Checks 全链路通过；仅有 GitHub Actions Node 20 runner deprecation annotation，不影响本次门禁结果。

## 2026-06-26 阶段 79：市场资产创建 payload shape
- 新增 `validates marketplace asset create payload shape` 后端契约测试。
- 测试覆盖非 object JSON 请求体返回 `JSON body is required`。
- 测试覆盖未知 asset type、空标题、未知 price_type、非 object metadata 和非 object normalized_payload 聚合返回对应错误详情。
- README 和 findings 已补充 payload shape validation 后端边界。
- 首次目标测试用 JSON primitive 字符串请求体尝试触达 `JSON body is required`，但 `express.json()` strict parser 会在路由前返回 HTML 400；已改用 JSON array 请求体触达后端 shape 校验分支。
- 目标测试第二次暴露同一 invalid shape 还会返回 `price_coins must be a positive safe integer for fixed_price assets`，已把该聚合错误固定进契约测试。
- 已通过 `npm --prefix tests run test:unit -- market-wallet.test.js -t 'validates marketplace asset create payload shape'`、`npm run test:marketplace:syntax`、`npm run test:marketplace` 和 `git diff --check`。
- GitHub run `28258662835` 已确认 Marketplace Wallet Checks 全链路通过；仅有 GitHub Actions Node 20 runner deprecation annotation，不影响本次门禁结果。

## 2026-06-26 阶段 80：API reference 上传边界说明
- `npm run marketplace:export:api` 生成文档现在说明 `POST /api/market/assets` 的 JSON object body、object metadata/normalized_payload、bounded text/tags、price_type 和 fixed_price price_coins 约束。
- 同一生成文档现在说明 `PATCH /api/market/assets/:id` 仅允许 creator 修订 draft/rejected 资产，且复用 create body validation 并回到 private draft。
- `marketplace-api-reference.test.js` 已锁定上述两条 generated Markdown note。
- README 和 findings 已补充 API reference upload validation 说明。
- 已通过 `npm --prefix tests run test:unit -- marketplace-api-reference.test.js -t 'generates markdown from current MVP routes'`、`npm run test:marketplace:syntax`、`npm run test:marketplace` 和 `git diff --check`。
- GitHub run `28258943055` 已确认 Marketplace Wallet Checks 全链路通过；仅有 GitHub Actions Node 20 runner deprecation annotation，不影响本次门禁结果。

## 2026-06-26 阶段 81：API reference 市场生命周期说明
- `npm run marketplace:export:api` 生成文档现在说明 submit/approve/reject 的 creator/admin 审核状态流。
- 同一生成文档现在说明 purchase 会 claim free 或用 `bonus -> paid` 买 fixed-price listed 资产，且响应不暴露 full ledger entries 或 creator balances。
- 同一生成文档现在说明 install 只允许 creator-owned 或 entitled 资产，响应返回去掉 absolute path 的本地引用。
- `marketplace-api-reference.test.js` 已锁定上述 lifecycle generated Markdown notes。
- 根据只读 explorer 复核，补充角色卡安装响应直接断言 `installed.absolute_path` 不外露，同时保留真实文件落盘检查。
- README 和 findings 已补充 API reference lifecycle/purchase/install 边界说明。
- 首次 `npm run test:marketplace` 在同一安装用例出现一次瞬时 `fetch failed / other side closed`；目标用例单跑和重跑全量市场门禁均通过，记录为本地短连接波动。
- 已通过 `npm --prefix tests run test:unit -- market-wallet.test.js -t 'requires review before purchase and installs approved character cards'`、`npm --prefix tests run test:unit -- marketplace-api-reference.test.js -t 'generates markdown from current MVP routes'`、`npm run test:marketplace:syntax`、`npm run test:marketplace` 和 `git diff --check`。
- GitHub run `28259287966` 已确认 Marketplace Wallet Checks 全链路通过；仅有 GitHub Actions Node 20 runner deprecation annotation，不影响本次门禁结果。

## 2026-06-26 阶段 82：API reference 读接口隐私说明
- `npm run marketplace:export:api` 生成文档现在说明 `GET /api/market/assets` 只返回可见资产元数据摘要，不包含 `normalized_payload`。
- 同一生成文档现在说明 `GET /api/market/creator/summary` 只返回当前创作者资产摘要和聚合统计，不暴露 raw wallet、recent earnings ledgers 或 asset payloads。
- `marketplace-api-reference.test.js` 已锁定上述 read privacy generated Markdown notes。
- README 和 findings 已补充 API reference list/detail/creator privacy 说明。
- 已通过 `npm --prefix tests run test:unit -- marketplace-api-reference.test.js -t 'generates markdown from current MVP routes'`、`npm run test:marketplace:syntax`、`npm run test:marketplace` 和 `git diff --check`。
- GitHub run `28259506738` 已确认 Marketplace Wallet Checks 全链路通过；仅有 GitHub Actions Node 20 runner deprecation annotation，不影响本次门禁结果。

## 2026-06-26 阶段 83：Marketplace CI action runtime 升级
- 查证 `actions/checkout` 的 `v5` tag 为 `93cb6efe18208431cddfb8368fd83d5badbf9bfd`。
- 查证 `actions/setup-node` 的 `v5` tag 为 `a0853c24544627f65ddf259abe73b1d18a591444`。
- `.github/workflows/marketplace-wallet-checks.yml` 已仅升级 Marketplace Wallet Checks workflow 的 checkout/setup-node action pins，测试 Node 仍为 24。
- findings 已记录本阶段用于消除远端 Node 20 action runtime deprecation annotation。
- 已通过 `npm run test:marketplace:syntax`、`npm run test:marketplace`、workflow pin smoke 和 `git diff --check`。
- GitHub run `28259729756` 已确认 Marketplace Wallet Checks 全链路通过，且本次 run 不再出现 GitHub Actions Node 20 runner deprecation annotation。

## 2026-06-26 阶段 84：snapshot export 参数错误边界
- `scripts/export-marketplace-snapshot.mjs` 现在对 `--dataRoot`、`--dataRoot=`、`--out`、`--out=` 缺失值返回明确错误。
- `tests/marketplace-snapshot-export.test.js` 新增未知参数、缺失 dataRoot 值和缺失 out 值覆盖。
- findings 已补充 snapshot export CLI 参数错误边界。
- 已通过 `npm --prefix tests run test:unit -- marketplace-snapshot-export.test.js -t 'rejects unknown and incomplete arguments'`、`npm --prefix tests run test:unit -- marketplace-snapshot-export.test.js`、`npm run test:marketplace:syntax`、`npm run test:marketplace` 和 `git diff --check`。
- GitHub run `28259939751` 已确认 Marketplace Wallet Checks 全链路通过，且无 GitHub Actions Node 20 runner deprecation annotation。

## 2026-06-26 阶段 85：demo seed 参数错误边界
- `scripts/seed-marketplace-demo.mjs` 现在对 `--dataRoot`、`--dataRoot=`、`--creator`、`--creator=` 缺失值返回明确错误。
- `tests/marketplace-demo-seed.test.js` 新增未知参数、缺失 dataRoot 值和缺失 creator 值覆盖。
- findings 已补充 demo seed CLI 参数错误边界。
- 已通过 `npm --prefix tests run test:unit -- marketplace-demo-seed.test.js -t 'rejects unknown and incomplete arguments'`、`npm --prefix tests run test:unit -- marketplace-demo-seed.test.js`、`npm run test:marketplace:syntax`、`npm run test:marketplace` 和 `git diff --check`。
- GitHub run `28260223957` 已确认 Marketplace Wallet Checks 全链路通过，且无 GitHub Actions Node 20 runner deprecation annotation。

## 2026-06-26 阶段 86：legacy approved 公开读取边界
- `src/endpoints/market.js` 的普通公开读取现在只把 `listed` 资产视为公开；历史 `approved` 但未 listed 的资产仍只允许 creator/admin/entitled 用户读取。
- `tests/market-wallet.test.js` 新增 legacy approved 契约测试，覆盖普通用户列表、详情、举报、购买均不可见，同时保留 creator detail 和 admin approve 到 listed 的兼容路径。
- `scripts/export-marketplace-api-reference.mjs` 和 `tests/marketplace-api-reference.test.js` 已把市场读接口说明收紧到 listed public read scope。
- docs、findings 和 task_plan 已补充 legacy approved 公开读取边界。
- 已通过 `npm --prefix tests run test:unit -- market-wallet.test.js -t 'keeps legacy approved assets private'`、`npm --prefix tests run test:unit -- marketplace-api-reference.test.js`、`npm run test:marketplace:syntax`、`npm run test:marketplace` 和 `git diff --check`。
- GitHub run `28260687346` 已确认 Marketplace Wallet Checks 全链路通过，且无 GitHub Actions Node 20 runner deprecation annotation。

## 2026-06-26 阶段 87：固定价购买按买家钱包串行
- `src/endpoints/market.js` 的 fixed-price purchase 锁从 `asset:user` 调整为 `wallet:user`，让同一买家的不同付费资产购买串行读取钱包余额。
- `tests/market-wallet.test.js` 新增同一买家并发购买两个不同 fixed-price 资产的契约测试，余额只够一件时只允许一笔 purchase 成功。
- 新测试断言 buyer debit、creator earning、entitlement 和 asset sales_count 都只落一笔，防止并发透支。
- findings 和 task_plan 已补充买家钱包串行化边界。
- 已通过 `npm --prefix tests run test:unit -- market-wallet.test.js -t 'serializes concurrent fixed price purchases by buyer wallet'`、`npm run test:marketplace:syntax`、`npm run test:marketplace` 和 `git diff --check`。
- GitHub run `28260949879` 已确认 Marketplace Wallet Checks 全链路通过，且无 GitHub Actions Node 20 runner deprecation annotation。

## 2026-06-26 阶段 88：runtime smoke 复用 demo seed
- `scripts/smoke-marketplace-runtime.mjs` 现在直接调用 `scripts/seed-marketplace-demo.mjs --dataRoot <tmp> --creator smoke-creator`，不再手写 smoke-only market store。
- runtime smoke 使用 `demo_character_mira` 覆盖免费角色卡领取、举报、安装和 Library，使用 `demo_world_clockwork` 覆盖固定价购买、buyer debit、creator earning、安装和 Library。
- README、设计文档、findings 和 task_plan 已补充 demo seed 路径纳入真实 server smoke 的说明。
- 已通过 `npm run test:marketplace:syntax`、`npm run test:marketplace`、`npm run test:marketplace:smoke` 和 `git diff --check`。
- GitHub run `28261306754` 已确认 Marketplace Wallet Checks 全链路通过，且无 GitHub Actions Node 20 runner deprecation annotation。

## 2026-06-26 阶段 89：手机真机访问文档
- README 现在明确 `http://127.0.0.1:8000` 只适合同一台电脑，本地真机手机需要 `npm start -- --listen=true` 后访问 `http://<your-computer-lan-ip>:8000`。
- README 现在说明也可使用 HTTPS tunnel/hosted URL，并注明 PWA 安装和 service worker 需要 secure context。
- `tests/marketplace-scripts.test.js` 新增契约测试锁定手机真机访问和 PWA secure context 说明。
- findings 和 task_plan 已补充手机真机访问边界。
- 已通过 `npm --prefix tests run test:unit -- marketplace-scripts.test.js`、`npm run test:marketplace:syntax`、`npm run test:marketplace` 和 `git diff --check`。
- GitHub run `28261520847` 已确认 Marketplace Wallet Checks 全链路通过，且无 GitHub Actions Node 20 runner deprecation annotation。

## 2026-06-26 阶段 90：marketplace 测试清单防漏
- `tests/marketplace-scripts.test.js` 现在扫描所有 `tests/marketplace*.test.js`，并断言每个文件名都在根目录 `test:marketplace` 命令中。
- 该测试保留 fast command 不递归 `test:marketplace:all` 或 `test:marketplace:e2e:server` 的约束，防止基础命令悄悄变慢。
- findings 和 task_plan 已补充 `test:marketplace` 显式清单防漏边界。
- 已通过 `npm --prefix tests run test:unit -- marketplace-scripts.test.js`、`npm run test:marketplace:syntax`、`npm run test:marketplace` 和 `git diff --check`。
- GitHub run `28261722885` 已确认 Marketplace Wallet Checks 全链路通过，且无 GitHub Actions Node 20 runner deprecation annotation。

## 2026-06-26 阶段 91：PWA 缓存 marketplace-wallet 静态资源
- `public/service-worker.js` 的 shell cache 已升级到 `sillytavern-shell-v2`。
- PWA 预缓存清单现在包含 marketplace-wallet manifest、window 模板、版本化 `index.js`、`filters.js` 和版本化 `style.css`。
- `tests/pwa.test.js` 会读取扩展 manifest，并断言 service worker 清单跟随当前 JS/CSS 版本且所有资源真实存在。
- `tests/marketplace-wallet.e2e.js` 的浏览器级 PWA cache 断言已同步检查 marketplace-wallet 扩展资源。
- README、设计文档、findings 和 task_plan 已补充手机安装壳缓存扩展资源的说明。
- 首次 `npm run test:pwa:e2e` 暴露测试侧 `page.evaluate()` 不能读取 Node 常量 `MARKETPLACE_WALLET_EXTENSION_VERSION`；已把 shell path 列表在 Node 侧组装后传入浏览器上下文。
- 已通过 `npm --prefix tests run test:unit -- pwa.test.js`、`npm run test:marketplace:syntax`、`npm run test:marketplace`、`PLAYWRIGHT_BROWSER_CHANNEL=chrome npm run test:pwa:e2e` 和 `git diff --check`。
- GitHub run `28262083653` 已确认 Marketplace Wallet Checks 全链路通过，且无 GitHub Actions Node 20 runner deprecation annotation。

## 2026-06-26 阶段 92：marketplace PWA 弱网错误态
- 根据并发只读复核，marketplace-wallet 初次加载失败时会因 `state.loading && !state.loaded` 留在 `Loading marketplace...`，移动/PWA 弱网下像页面挂死。
- `public/scripts/extensions/marketplace-wallet/index.js` 新增 `state.marketplaceError`，加载失败后退出 loading、渲染错误摘要和 Retry 按钮。
- Retry 通过资产区委托事件重新调用 `loadMarketplace()`，成功后清空错误并恢复钱包、资产、附属面板加载。
- `public/scripts/extensions/marketplace-wallet/style.css` 为 `.marketplace-wallet-error` 增加居中 grid 布局。
- marketplace-wallet manifest、service worker 预缓存清单、UI contract 和 E2E 常量已从 `0.2.13` 升到 `0.2.14`，避免真实用户继续命中旧 JS/CSS。
- `tests/marketplace-wallet.e2e.js` 新增 asset list 首次 500 后显示错误、刷新按钮可用、Retry 恢复资产列表的浏览器测试。
- `tests/marketplace-wallet-ui.test.js` 已锁定错误态 DOM、Retry 事件绑定和 CSS。
- 首次目标 E2E 误用 `test:marketplace:e2e`，该命令需要已有本地 server，已改用 `scripts/run-marketplace-e2e.mjs` 临时 server wrapper。
- 第二次 wrapper 验证漏带 `PLAYWRIGHT_BROWSER_CHANNEL=chrome`，命中本机未安装的 Playwright Chromium；已用 Chrome 通道重跑。
- 第三次目标 E2E 暴露新用例未打开 Extensions/marketplace inline drawer，已抽出 `openMarketplaceWallet()` helper 并允许错误态跳过 loaded wallet 断言。
- 已通过 `npm --prefix tests run test:unit -- marketplace-wallet-ui.test.js pwa.test.js`、`npm run test:marketplace:syntax`、`npm run test:marketplace`、`PLAYWRIGHT_BROWSER_CHANNEL=chrome node scripts/run-marketplace-e2e.mjs -g "shows a retryable marketplace error" --workers=1` 和 `git diff --check`。
- GitHub run `28262733580` 已确认 Marketplace Wallet Checks 全链路通过，且无 GitHub Actions Node 20 runner deprecation annotation。

## 2026-06-26 阶段 93：活跃筛选清空入口
- `public/scripts/extensions/marketplace-wallet/index.js` 现在只要存在活跃 marketplace 筛选就显示 Clear filters，不再要求筛选结果为空。
- loading 和 marketplace error 状态仍显式隐藏 Clear filters，避免错误态混入无关筛选操作。
- marketplace-wallet manifest、service worker 预缓存清单、UI contract 和 E2E 常量已从 `0.2.14` 升到 `0.2.15`，确保 JS 行为变更被浏览器刷新加载。
- `tests/marketplace-wallet.e2e.js` 的 clear-filter 用例新增有结果筛选路径：选择 free 仍看到资产时 Clear filters 可见，点击后恢复默认筛选。
- `tests/marketplace-wallet-ui.test.js` 已同步锁定 `setClearFiltersVisibility(hasFilters)`。
- 已通过 `npm --prefix tests run test:unit -- marketplace-wallet-ui.test.js pwa.test.js`、`npm run test:marketplace:syntax`、`PLAYWRIGHT_BROWSER_CHANNEL=chrome node scripts/run-marketplace-e2e.mjs -g "clears active marketplace filters" --workers=1`、`npm run test:marketplace` 和 `git diff --check`。
- GitHub run `28262958359` 已确认 Marketplace Wallet Checks 全链路通过，且无 GitHub Actions Node 20 runner deprecation annotation。

## 2026-06-26 阶段 94：列表摘要返回内容分级
- `src/endpoints/market.js` 的 `toAssetListItem()` 现在返回 `content_rating`，和已有 `language` 字段一起支撑真实 API 列表搜索。
- `tests/market-wallet.test.js` 的公开 listed 列表断言已覆盖 `language: en` 和 `content_rating: general`。
- 同一测试继续断言列表摘要不返回 `normalized_payload`，保持购买前 payload 隐私边界。
- 已通过 `npm --prefix tests run test:unit -- market-wallet.test.js -t "requires review before purchase"`、`npm run test:marketplace:syntax`、`npm run test:marketplace` 和 `git diff --check`。
- GitHub run `28263173477` 已确认 Marketplace Wallet Checks 全链路通过，且无 GitHub Actions Node 20 runner deprecation annotation。

## 2026-06-26 阶段 95：market store 写入串行化
- `src/endpoints/market.js` 新增 `marketStoreLocks` 与 `withMarketStoreLock(request, action)`，按 `market-assets.json` store path 串行写路由。
- create、revise、submit、approve、reject、delist、report、purchase 和 install 现在都在 store lock 内执行 read-modify-write。
- fixed-price purchase 仍保留 buyer wallet lock，并在 wallet lock 内进入 store lock，继续防止同一买家并发透支。
- `tests/market-wallet.test.js` 新增同一 store 并发创建两个资产的契约测试，确认 creator summary 和底层 store 都保留两条资产。
- 已通过 `npm --prefix tests run test:unit -- market-wallet.test.js -t "serializes concurrent marketplace asset creates"`、`npm --prefix tests run test:unit -- market-wallet.test.js -t "serializes concurrent fixed price purchases by buyer wallet"`、`npm run test:marketplace:syntax`、`npm run test:marketplace` 和 `git diff --check`。
- GitHub run `28263428644` 已确认 Marketplace Wallet Checks 全链路通过，且无 GitHub Actions Node 20 runner deprecation annotation。

## 2026-06-26 阶段 96：详情 payload 预览截断
- `public/scripts/extensions/marketplace-wallet/index.js` 新增 `MAX_PAYLOAD_PREVIEW_LENGTH = 20000` 和 `formatPayloadPreview()`，Details/Inspect 弹窗只渲染大 payload 的前 20KB。
- 被截断的 payload 会显示 `Large payload preview truncated for performance.` 和剩余字符数提示；payload 权限、安装和修订使用的数据不变。
- `public/scripts/extensions/marketplace-wallet/style.css` 新增 `.marketplace-wallet-preview-note` 轻量提示样式。
- marketplace-wallet manifest、service worker 预缓存清单、UI contract 和 E2E 常量已从 `0.2.15` 升到 `0.2.16`。
- `tests/marketplace-wallet.e2e.js` 新增大 payload Details 弹窗测试，确认显示截断提示且尾部哨兵字符串不进入弹窗预览。
- `tests/marketplace-wallet-ui.test.js` 已锁定 payload preview 截断常量、函数和提示样式。
- 已通过 `npm --prefix tests run test:unit -- marketplace-wallet-ui.test.js pwa.test.js`、`npm run test:marketplace:syntax`、`PLAYWRIGHT_BROWSER_CHANNEL=chrome node scripts/run-marketplace-e2e.mjs -g "truncates large payloads" --workers=1`、`npm run test:marketplace` 和 `git diff --check`。
- GitHub run `28263806838` 已确认 Marketplace Wallet Checks 全链路通过，且无 GitHub Actions Node 20 runner deprecation annotation。

## 2026-06-26 阶段 97：上传 payload/metadata 大小门禁
- `src/endpoints/market.js` 新增 `MAX_MARKET_METADATA_BYTES = 65536` 和 `MAX_MARKET_NORMALIZED_PAYLOAD_BYTES = 1048576`。
- create/patch 会在保存前校验 `metadata` 和 `normalized_payload` 的 JSON 字节大小，避免超大资产写入 `market-assets.json`。
- submit 和 approve 也会复查同一大小边界，防止旧 store 或手工写入数据绕过上传入口。
- approve 现在通过 `validateAssetForApproval()` 同时校验 metadata/payload 大小和 payload 格式。
- `tests/market-wallet.test.js` 新增超限 metadata、超限 payload、修订超限、手工 store 绕过 submit/approve 的后端契约测试。
- `scripts/export-marketplace-api-reference.mjs`、README 和设计文档已记录 create/patch 的 metadata/payload 字节上限。
- 已通过 `npm --prefix tests run test:unit -- market-wallet.test.js -t "rejects oversized marketplace asset metadata and normalized payload"`、`npm --prefix tests run test:unit -- marketplace-api-reference.test.js`、`npm run test:marketplace:syntax`、`npm run test:marketplace` 和 `git diff --check`。
- GitHub run `28264287518` 已确认 Marketplace Wallet Checks 全链路通过，且无 GitHub Actions Node 20 runner deprecation annotation。

## 2026-06-26 阶段 98：移动端筛选区紧凑布局
- `public/scripts/extensions/marketplace-wallet/style.css` 在 700px 以下将 `.marketplace-wallet-controls` 改为两列 grid。
- 搜索框和 Clear filters 跨整行，type/price/access/sort select 在手机宽度下两列排列，减少首屏筛选区高度。
- `tests/marketplace-wallet.e2e.js` 新增 360px 宽度浏览器测试，断言筛选区两列、搜索/清空跨整行、资产列表在控件下方且无横向溢出。
- `tests/marketplace-wallet-ui.test.js` 已锁定 mobile controls grid、跨行选择器和 no-overflow 相关 CSS contract。
- 首次移动端 E2E 显示筛选区高度为 172px，略超 170px 预算；已把 mobile controls gap 从 8px 收紧到 6px。
- 已通过 `npm --prefix tests run test:unit -- marketplace-wallet-ui.test.js`、`npm run test:marketplace:syntax`、`PLAYWRIGHT_BROWSER_CHANNEL=chrome node scripts/run-marketplace-e2e.mjs -g "keeps marketplace filters compact" --workers=1`、`npm run test:marketplace` 和 `git diff --check`。
- GitHub run `28264542190` 已确认 Marketplace Wallet Checks 全链路通过，且无 GitHub Actions Node 20 runner deprecation annotation。

## 2026-06-26 阶段 99：购买成功后自动安装失败恢复
- `public/scripts/extensions/marketplace-wallet/index.js` 的 `purchaseAsset()` 现在把自动安装包在单独 `try/catch` 中。
- 购买/领取成功后若自动安装失败，会提示用户资产仍在 Library，而不是把整个购买动作显示为失败。
- `purchaseAsset()` 的 `finally` 会刷新 marketplace、Wallet Ledger 和 My Library，确保余额、流水和授权库状态跟随后端购买结果。
- `tests/marketplace-wallet.e2e.js` 的 mock API 支持指定资产首次 install 失败。
- 新增浏览器 E2E 覆盖固定价购买成功、自动安装失败、Library 显示 Purchased/not installed、用户从 Library 重试安装成功。
- `tests/marketplace-wallet-ui.test.js` 已锁定安装失败 warning、刷新 Promise 和 marketplace silent reload contract。
- 已通过 `npm --prefix tests run test:unit -- marketplace-wallet-ui.test.js`、`npm run test:marketplace:syntax`、`PLAYWRIGHT_BROWSER_CHANNEL=chrome node scripts/run-marketplace-e2e.mjs -g "keeps a purchased asset in the library" --workers=1`、`npm run test:marketplace` 和 `git diff --check`。
- GitHub run `28264844045` 已确认 Marketplace Wallet Checks 全链路通过，且无 GitHub Actions Node 20 runner deprecation annotation。

## 2026-06-26 阶段 100：上传 payload 大小前端预检
- `public/scripts/extensions/marketplace-wallet/index.js` 新增 `MAX_UPLOAD_PAYLOAD_BYTES = 1024 * 1024`。
- 上传表单解析 payload 后用 `TextEncoder` 计算 `JSON.stringify(payload)` 的 UTF-8 字节数。
- payload 超过 1048576 字节时前端直接提示错误，不发 create/patch 请求，表单内容保留给创作者修改。
- 后端 `metadata` 和 `normalized_payload` 字节限制仍保留为权威兜底；当前 UI 没有独立 metadata 输入。
- `tests/marketplace-wallet.e2e.js` 新增超大 world book payload 用例，确认 create API 未被调用。
- `tests/marketplace-wallet-ui.test.js` 已锁定前端 payload byte limit、`getJsonByteLength()` 和错误文案。
- 已通过 `npm --prefix tests run test:unit -- marketplace-wallet-ui.test.js`、`npm run test:marketplace:syntax`、`PLAYWRIGHT_BROWSER_CHANNEL=chrome node scripts/run-marketplace-e2e.mjs -g "blocks oversized upload payloads" --workers=1`、`npm run test:marketplace` 和 `git diff --check`。
- GitHub run `28265091507` 已确认 Marketplace Wallet Checks 全链路通过，且无 GitHub Actions Node 20 runner deprecation annotation。

## 2026-06-26 阶段 101：checked-in Marketplace API reference
- 新增 `docs/marketplace-api-reference.md`，作为当前 marketplace/wallet/health MVP route 的 checked-in Markdown 参考。
- `scripts/export-marketplace-api-reference.mjs` 现在支持 `MARKETPLACE_API_REFERENCE_GENERATED_AT`，便于生成固定时间戳的可测试文档。
- `tests/marketplace-api-reference.test.js` 会用 `2026-06-26T00:00:00.000Z` 生成结果与 checked-in 文档逐字比对。
- 同一测试也覆盖 `run()` 读取固定时间戳环境变量并写入输出文件。
- README 和设计文档的 API reference 示例路径已统一为 `./docs/marketplace-api-reference.md`。
- `tests/marketplace-scripts.test.js` 已锁定 README 的 checked-in API reference 路径。
- 首次目标测试暴露 `fileURLToPath` 未导入；已补导入并在固定时间戳测试里捕获 `console.log`。
- 已通过 `npm --prefix tests run test:unit -- marketplace-api-reference.test.js marketplace-scripts.test.js`、`npm run test:marketplace:syntax`、`npm run test:marketplace` 和 `git diff --check`。
- GitHub run `28265389723` 已确认 Marketplace Wallet Checks 全链路通过，且无 GitHub Actions Node 20 runner deprecation annotation。

## 2026-06-26 阶段 102：上传语言与内容分级元数据
- `public/scripts/extensions/marketplace-wallet/window.html` 上传表单新增 language 输入和 content rating datalist 输入，默认 `en/general`，同时保留自定义 content rating。
- `public/scripts/extensions/marketplace-wallet/index.js` 的 create/patch 请求现在提交 `language` 和 `content_rating`；`fillUploadForm()` 修订流会回填旧元数据，`clearUploadForm()` 会恢复默认值。
- marketplace-wallet manifest、service worker 预缓存清单、UI contract 和 E2E 常量已从 `0.2.16` 升到 `0.2.17`，避免 PWA/mobile shell 加载旧模板。
- `tests/marketplace-wallet.e2e.js` 覆盖创作者上传 world book 时提交 language/content_rating，以及 rejected 资产修订时回填并提交新 language/content_rating。
- `scripts/export-marketplace-api-reference.mjs` 和 `docs/marketplace-api-reference.md` 已同步 create body 文案，明确 bounded text metadata 包含 tags/language/content_rating。
- README 和设计文档已点名上传表单支持 language/content_rating 元数据，测试矩阵也同步到 upload tags/language/rating。
- 已通过 `npm --prefix tests run test:unit -- marketplace-wallet-ui.test.js pwa.test.js`、`npm run test:marketplace:syntax`、`npm --prefix tests run test:unit -- marketplace-api-reference.test.js marketplace-scripts.test.js marketplace-wallet-ui.test.js pwa.test.js` 和 `PLAYWRIGHT_BROWSER_CHANNEL=chrome node scripts/run-marketplace-e2e.mjs -g "submits a world book upload|revises a rejected creator asset" --workers=1`。
- 已通过 `npm run test:marketplace` 和 `git diff --check`。
- GitHub run `28265880089` 已确认 Marketplace Wallet Checks 全链路通过。

## 2026-06-26 阶段 103：上传保存成功但提交失败恢复
- `public/scripts/extensions/marketplace-wallet/index.js` 现在把 create/patch 保存和 submit-for-review 分成两层错误处理。
- 保存成功但 submit 失败时，前端会提示 `Draft saved, but submit failed` 或 `Changes saved, but submit failed`，并附带后端错误摘要。
- 保存响应缺少 asset id 时仍按保存异常处理，避免对未知资产 id 误报 draft 已保存。
- 提交失败后仍会 `clearUploadForm()` 并 `loadMarketplace({ silent: true })`，让已保存 draft 出现在市场列表和 Creator Center 中。
- marketplace-wallet manifest、service worker 预缓存清单、UI contract 和 E2E 常量已从 `0.2.17` 升到 `0.2.18`。
- `tests/marketplace-wallet.e2e.js` 新增 submit 失败恢复用例，覆盖首次 Save & Submit 只创建一个 draft、Creator Center draft 计数刷新、用户从资产卡片重试 Submit 成功。
- `tests/marketplace-wallet-ui.test.js` 已锁定 submit 失败 warning、保存成功提示前缀和 silent marketplace reload contract。
- 已通过 `npm --prefix tests run test:unit -- marketplace-wallet-ui.test.js pwa.test.js`、`npm run test:marketplace:syntax` 和 `PLAYWRIGHT_BROWSER_CHANNEL=chrome node scripts/run-marketplace-e2e.mjs -g "keeps a saved draft when submit after upload fails" --workers=1`。
- 已通过 `npm run test:marketplace` 和 `git diff --check`。
- GitHub run `28266246225` 已确认 Marketplace Wallet Checks 全链路通过。

## 2026-06-26 阶段 104：PWA 导航壳更新策略
- `public/service-worker.js` 对 `request.mode === 'navigate'` 的页面导航改为 `fetch(request).catch(() => caches.match(request))`。
- 非导航静态 GET 仍使用 `caches.match(request).then(cached => cached || fetch(request))`，保留静态 shell cache-first 行为。
- 非 GET、跨域请求和 `/api/*` 仍直接返回，不进入 service worker cache 响应逻辑。
- `tests/pwa.test.js` 新增 network-first navigation 契约断言，锁定导航更新策略和静态 cache-first fallback。
- `tests/marketplace-wallet.e2e.js` 的 PWA 浏览器测试会把陈旧 `/login.html` 哨兵写进 CacheStorage，再导航验证 network-first 不会渲染旧 shell。
- README 和设计文档已同步 PWA navigation network-first + cached offline fallback 说明。
- 已通过 `npm --prefix tests run test:unit -- pwa.test.js marketplace-wallet-ui.test.js`、`npm run test:marketplace:syntax` 和 `PLAYWRIGHT_BROWSER_CHANNEL=chrome npm run test:pwa:e2e`。
- 首次并行运行 `npm run test:marketplace` 时 `market-wallet.test.js` 的固定价购买用例出现一次 `TypeError: fetch failed` / `SocketError: other side closed`；单独重跑该用例通过，随后完整 `npm run test:marketplace` 重跑通过 53/53。
- 已通过 `npm --prefix tests run test:unit -- pwa.test.js marketplace-scripts.test.js`、`npm run test:marketplace` 和 `git diff --check`。
- GitHub run `28266565822` 已确认 Marketplace Wallet Checks 全链路通过。

## 2026-06-26 阶段 105：PWA service worker 主动接管
- `public/service-worker.js` 的 install 事件现在通过 `Promise.all([self.skipWaiting(), cache.addAll(...)])` 预缓存 shell 并立即跳过 waiting。
- activate 事件现在会先清理旧 cache，再调用 `self.clients.claim()` 立即接管受 scope 覆盖的页面。
- `tests/pwa.test.js` 新增 `skipWaiting()` 和 `clients.claim()` 契约断言。
- `tests/marketplace-wallet.e2e.js` 的 PWA 浏览器测试现在会在 reload 前确认页面已经受 `/service-worker.js` controller 控制。
- README 和设计文档已同步 service worker 跳过 waiting、清理旧缓存后 claim clients 的更新策略。
- 已通过 `npm --prefix tests run test:unit -- pwa.test.js marketplace-scripts.test.js`、`npm run test:marketplace:syntax` 和 `PLAYWRIGHT_BROWSER_CHANNEL=chrome npm run test:pwa:e2e`。
- 已通过 `npm run test:marketplace` 和 `git diff --check`。
- GitHub run `28266894912` 已确认 Marketplace Wallet Checks 全链路通过。

## 2026-06-26 阶段 106：PWA 应用内安装入口
- Faraday 子 agent 确认当前 `public/scripts/pwa.js` 只有 service worker 注册，没有应用内 install/add-to-home 入口。
- Ptolemy 子 agent 识别出后续移动端小缺口：Details 弹窗需要 360px viewport 可用性验证；本阶段先处理 PWA 安装入口。
- `public/scripts/pwa.js` 新增 `beforeinstallprompt`、`appinstalled` 和 standalone display-mode 处理。
- 支持安装时页面会显示 `#pwa_install_prompt`，Install 按钮调用浏览器原生 PWA prompt，dismiss/appinstalled/standalone 时移除。
- `public/style.css` 新增安全区内固定安装入口样式，复用 `menu_button`，关闭动作为图标按钮。
- `public/service-worker.js` shell cache 名称从 `sillytavern-shell-v2` 升到 `sillytavern-shell-v3`，保证 PWA 安装壳能拿到新版 `scripts/pwa.js`。
- `tests/pwa.test.js` 新增应用内安装入口契约；`tests/marketplace-wallet.e2e.js` 新增浏览器级 `beforeinstallprompt` 模拟用例。
- README 和设计文档已同步应用内 Install 入口说明；`tests/marketplace-scripts.test.js` 锁定 README 文案。
- 已通过 `npm --prefix tests run test:unit -- pwa.test.js marketplace-scripts.test.js`、`npm run test:marketplace:syntax`、`PLAYWRIGHT_BROWSER_CHANNEL=chrome npm run test:pwa:e2e`、`npm run test:marketplace` 和 `git diff --check`。
- 已提交 `df3382145 Add PWA install prompt` 并推送到 `fork/codex/marketplace-wallet-mvp`。
- GitHub run `28267566537` 已确认 Marketplace Wallet Checks 全链路通过。

## 2026-06-26 阶段 107：移动端 Details 弹窗可用性
- 采纳 Ptolemy 子 agent 建议，补齐 Details popup 在 360px 手机 viewport 下的可用性验证。
- `public/scripts/extensions/marketplace-wallet/style.css` 为 `.marketplace-wallet-asset-preview` 和 payload preview 增加 `max-width: 100%`/`overflow-wrap` 兜底，避免长标题、长 tag 或长 payload 撑宽弹窗。
- marketplace-wallet manifest、service worker 预缓存清单、UI contract 和 E2E 常量已从 `0.2.18` 升到 `0.2.19`。
- `tests/marketplace-wallet.e2e.js` 新增移动 Details popup 用例，使用长字段打开详情，断言外层 dialog 和 Close 按钮在视口内、metadata 单列、内容区纵向滚动、payload 不横向溢出且可关闭。
- 首次目标 E2E 把内部滚动内容的纵向超出误判为失败；已改为只对 meta/payload 检查横向溢出，并断言 `.popup-content` 负责纵向滚动。
- 已通过 `PLAYWRIGHT_BROWSER_CHANNEL=chrome node scripts/run-marketplace-e2e.mjs -g "keeps the Details popup usable on mobile width" --workers=1`。
- 已通过 `npm --prefix tests run test:unit -- marketplace-wallet-ui.test.js pwa.test.js marketplace-scripts.test.js`、`npm run test:marketplace:syntax`、`npm run test:marketplace` 和 `git diff --check`。
- `PLAYWRIGHT_BROWSER_CHANNEL=chrome npm run test:marketplace:e2e:server` 显示 20/20 browser E2E 全部通过；父会话在测试摘要后未自动返回 shell，手动 Ctrl-C 后输出 `20 passed (3.2m)`。
- 已提交 `956275a05 Validate mobile asset details popup` 并推送到 `fork/codex/marketplace-wallet-mvp`。
- GitHub run `28268051992` 已确认 Marketplace Wallet Checks 全链路通过。

## 2026-06-26 阶段 108：PWA 文档缓存版本防漂移
- 发现 `docs/marketplace-currency-design.md` 仍写 `sillytavern-shell-v2`，而当前 service worker 已升级为 `sillytavern-shell-v3`。
- 设计文档的 PWA E2E 描述已同步为应用内 Install prompt、`sillytavern-shell-v3`、network-first navigation 和 `/api/health` cache exclusion。
- `tests/pwa.test.js` 新增从 `public/service-worker.js` 解析 `CACHE_NAME` 的辅助函数，并断言设计文档包含当前 cache 名称和 Install prompt 覆盖说明。
- 已通过 `npm --prefix tests run test:unit -- pwa.test.js marketplace-scripts.test.js`、`npm run test:marketplace`、`git diff --check`，并确认 README 和设计文档不再引用旧 `sillytavern-shell-v2`。
- 已提交 `731adb394 Keep PWA cache docs in sync` 并推送到 `fork/codex/marketplace-wallet-mvp`。
- GitHub run `28268286676` 已确认 Marketplace Wallet Checks 全链路通过。

## 2026-06-26 阶段 109：托管 Docker 容器 smoke
- Franklin 子 agent 建议补 Docker/托管镜像 smoke：现有 runtime smoke 证明 `node server.js`，但没有证明 Docker 部署产物可用。
- 本机执行 `docker --version` 返回 `command not found`，因此本地不能实跑容器 smoke；后续通过脚本语法、契约测试和 GitHub runner Docker 环境验证。
- 新增 `scripts/smoke-hosted-container.mjs`：检查 Docker、构建镜像、启动临时容器，挂载临时 config/data，并验证 `/api/health`、`/manifest.json`、`/service-worker.js` 和 `/`。
- 容器 smoke 会预创建挂载目录并传入当前进程 UID/GID 作为 `PUID/PGID`，避免 CI 清理 root-owned 临时文件失败。
- 新增根脚本 `npm run test:hosted:docker`，并接入 `scripts/check-marketplace-syntax.mjs`。
- README、设计文档和 `tests/marketplace-scripts.test.js` 已同步 Docker smoke 命令、验证矩阵和 CI 接线。
- Marketplace Wallet Checks workflow 已纳入 Dockerfile/.dockerignore/docker 路径和 `scripts/smoke-hosted-container.mjs`，并在 runtime smoke 后执行 `npm run test:hosted:docker`。
- 本地 `npm run test:hosted:docker` 失败信息已收敛为 `Docker is required for hosted container smoke tests: spawn docker ENOENT`，符合本机无 Docker 的环境限制。
- 已通过 `npm run test:marketplace:syntax`、`npm --prefix tests run test:unit -- marketplace-scripts.test.js`、`node --check scripts/smoke-hosted-container.mjs`、`npm run test:marketplace` 和 `git diff --check`。
- GitHub run `28268635091` 的 `Run hosted Docker smoke` 失败：镜像构建和容器启动成功，但 `/api/health` 等待超时；由于 `docker run --rm` 自动删除失败容器，日志只能显示 `No such container`。
- `scripts/smoke-hosted-container.mjs` 已去掉 `--rm`，改由 finally `docker rm -f` 清理；新增 `docker inspect --format '{{json .State}}'`，容器提前退出时直接打印状态、exit code 和 docker logs。
- Docker smoke 现在为 PUID/PGID 非 root 运行补充 `HOME=/home/node` 和 `NPM_CONFIG_CACHE=/tmp/sillytavern-npm-cache`，降低 CI 中 `npm run init` 因 cache/home 权限退出的风险。
- Docker smoke 改为从 `public/service-worker.js` 解析当前 `CACHE_NAME`，不再硬编码 `sillytavern-shell-v3`。
- Marketplace Wallet Checks workflow 的 path filter 已补充 `default/**`、`public/lib.js`、`src/middleware/webpack-serve.js` 和 `webpack.config.js`，Docker smoke step 也加了 `timeout-minutes: 10`。
- README 中 runtime smoke 注释已改为 marketplace/wallet/PWA flows；`test:marketplace:all` 明确不包含 Docker image smoke，Docker 检查作为 `test:hosted:docker` 单独运行。
- 已通过 `npm run test:marketplace:syntax`、`npm --prefix tests run test:unit -- marketplace-scripts.test.js pwa.test.js`、`node --check scripts/smoke-hosted-container.mjs`、`npm run test:marketplace`、`git diff --check`；本机 `npm run test:hosted:docker` 仍因没有 Docker 按预期失败并提示 `spawn docker ENOENT`。
- GitHub run `28269151597` 的 Docker smoke 失败已暴露真实根因：容器启动时 `--listen` 与 `--whitelist=false --basicAuthMode=false` 组合触发 SillyTavern listen-mode 安全保护，进程主动退出并提示 `Enable whitelisting, basic authentication or user accounts`。
- `scripts/smoke-hosted-container.mjs` 已移除 `--whitelist=false` 和 `--basicAuthMode=false`，保留默认 whitelist 保护；同时通过 `--add-host host.docker.internal:host-gateway` 和 `gateway.docker.internal:host-gateway` 帮助容器白名单解析宿主/网关地址。
- GitHub run `28269291526` 已确认 Marketplace Wallet Checks 全链路通过：syntax、Jest contract、runtime smoke、hosted Docker smoke、runner Chrome 和 browser E2E 全部 success。

## 2026-06-26 阶段 110：E2E wrapper 退出兜底
- 历史本机 Chrome E2E 多次显示 browser 用例已通过但 `scripts/run-marketplace-e2e.mjs` 父进程延迟返回，需要给可运行脚本加超时和清理兜底。
- `scripts/run-marketplace-e2e.mjs` 新增 `MARKETPLACE_E2E_PLAYWRIGHT_TIMEOUT_MS`，默认 300000ms。
- Playwright 子进程现在以独立进程组启动；超时后先 SIGTERM 再 SIGKILL，并报 `Timed out waiting for Playwright marketplace E2E`。
- Marketplace Wallet Checks 的 browser E2E step 新增 `timeout-minutes: 10`。
- README 验证矩阵已记录 E2E wrapper 默认 5 分钟 Playwright child timeout 和覆盖环境变量。
- 已通过 `npm --prefix tests run test:unit -- marketplace-scripts.test.js`、`npm run test:marketplace:syntax`、`node --check scripts/run-marketplace-e2e.mjs`、`npm run test:marketplace`、`PLAYWRIGHT_BROWSER_CHANNEL=chrome npm run test:marketplace:e2e:server -- --list`、`PLAYWRIGHT_BROWSER_CHANNEL=chrome MARKETPLACE_E2E_PLAYWRIGHT_TIMEOUT_MS=180000 node scripts/run-marketplace-e2e.mjs -g "keeps review controls compact" --workers=1` 和 `git diff --check`。
- 已提交 `f27d8bd19 Bound marketplace E2E wrapper` 并推送到 `fork/codex/marketplace-wallet-mvp`。
- GitHub run `28269647693` 已确认 Marketplace Wallet Checks 全链路通过：syntax、Jest contract、runtime smoke、hosted Docker smoke、runner Chrome 和 browser E2E 全部 success。

## 2026-06-26 阶段 111：托管 Docker 业务读路由 smoke
- 回收 Franklin 子 agent 审计后发现 `scripts/run-marketplace-e2e.mjs` 在 Playwright 非 0 退出时仍会 `process.exit(exitCode)`，这会跳过 `finally` 清理。
- `scripts/run-marketplace-e2e.mjs` 已改为设置 `process.exitCode = exitCode` 并 `return`，让临时 server 和 tmpRoot 在失败路径也会清理。
- `tests/marketplace-scripts.test.js` 新增 `getWorkflowStep()`，Docker smoke 和 browser E2E timeout 断言现在锁定到具体 workflow step，避免被另一个 step 的 `timeout-minutes` 误满足。
- `scripts/smoke-hosted-container.mjs` 在 Docker 容器健康后新增 GET `/api/wallet`，验证 handle、balance.total 和 bonus/paid/earnings bucket 都是数字。
- `scripts/smoke-hosted-container.mjs` 新增 GET `/api/market/assets`，验证 assets 为数组，证明托管镜像中 market route 已注册且默认用户上下文可读。
- Docker 容器 smoke 仍保持只读，不做 demo seed、purchase、install 或 wallet grant；写路径和完整业务闭环继续由 `npm run test:marketplace:smoke` 覆盖。
- Euler 子 agent 只读确认：默认 Docker config 关闭 user accounts，私有 `/api/wallet` 和 `/api/market/assets` 会通过 middleware 注入 `default-user`；空 data volume 下 wallet 从空 ledger 算余额，market 缺 store 时返回空数组。
- README 验证矩阵和设计文档已同步 `test:hosted:docker` 现在覆盖 `/api/wallet` 与 `/api/market/assets`。
- 已通过 `npm --prefix tests run test:unit -- marketplace-scripts.test.js`、`npm run test:marketplace:syntax`、`node --check scripts/run-marketplace-e2e.mjs && node --check scripts/smoke-hosted-container.mjs`、`npm run test:marketplace`、`PLAYWRIGHT_BROWSER_CHANNEL=chrome npm run test:marketplace:e2e:server -- --list`、`npm run test:marketplace:smoke` 和 `git diff --check`。
- 本机 `npm run test:hosted:docker` 仍因没有 Docker 按预期失败并提示 `Docker is required for hosted container smoke tests: spawn docker ENOENT`；真正容器验证需要 GitHub runner。
- 已提交 `eeb30cb18 Extend hosted smoke business checks` 并推送到 `fork/codex/marketplace-wallet-mvp`。
- GitHub run `28270145252` 已确认 Marketplace Wallet Checks 全链路通过：syntax、Jest contract、runtime smoke、hosted Docker smoke、runner Chrome 和 browser E2E 全部 success。

## 2026-06-26 阶段 112：Docker smoke 动态端口绑定
- 采纳 Nietzsche 子 agent 早前发现：`findFreePort()` 先 bind 再 close，随后 Docker 再绑定同一端口，中间有低概率端口抢占窗口。
- `scripts/smoke-hosted-container.mjs` 已移除 `node:net` 和 `findFreePort()`。
- Docker smoke 现在使用 `-p 127.0.0.1::8000`，让 Docker 在 loopback 上分配随机 host port。
- 新增 `getPublishedPort(container)`，通过 `docker port <id> 8000/tcp` 解析实际端口并构造 `http://127.0.0.1:<port>`。
- `tests/marketplace-scripts.test.js` 已锁定脚本不再导入 `node:net`/`findFreePort`，并包含动态 publish、`getPublishedPort()` 和 `docker port 8000/tcp`。
- Sagan 子 agent 复核确认 GitHub hosted runner 上该方案可行，同时建议不要回退接受非 loopback 映射。
- `getPublishedPort(container)` 已收紧为必须匹配 `127.0.0.1:<port>`；若 `docker port` 输出 `0.0.0.0:<port>` 或空输出会直接失败，保持 Docker smoke 只暴露本机的安全边界。
- `tests/marketplace-scripts.test.js` 已新增契约，禁止 `?? mappings[0]` 回退并锁定 loopback regex 与错误文案。
- 已通过 `npm --prefix tests run test:unit -- marketplace-scripts.test.js`、`npm run test:marketplace:syntax`、`node --check scripts/smoke-hosted-container.mjs` 和 `git diff --check`。
- 首次 `npm run test:marketplace` 中 `market-wallet.test.js` 的 report queue 边界用例出现一次 404；单独重跑该用例通过，随后完整 `npm run test:marketplace` 重跑通过 59/59。
- 本机 `npm run test:hosted:docker` 仍因没有 Docker 按预期失败并提示 `Docker is required for hosted container smoke tests: spawn docker ENOENT`。
- 已提交 `4da0d71f1 Use Docker-assigned smoke ports` 并推送到 `fork/codex/marketplace-wallet-mvp`。
- GitHub run `28270526366` 已确认 Marketplace Wallet Checks 全链路通过：syntax、Jest contract、runtime smoke、hosted Docker smoke、runner Chrome 和 browser E2E 全部 success。

## 2026-06-26 阶段 113：上传描述字段前端闭环
- 开始补齐 marketplace-wallet 创作者上传/修订表单的 `description` 字段；后端已有 description 长度与 trim 契约，本阶段聚焦网页/PWA/手机表单闭环。
- `public/scripts/extensions/marketplace-wallet/window.html` 新增 10000 字符 `Description` textarea。
- `public/scripts/extensions/marketplace-wallet/index.js` 现在会在 create/patch body 中提交 `description`，修订 draft/rejected 时回填旧描述，清空表单时重置描述。
- marketplace-wallet manifest、service worker 预缓存清单、UI contract 和浏览器 E2E 常量已从 `0.2.19` 升到 `0.2.20`。
- `tests/marketplace-wallet-ui.test.js` 已锁定 description 表单、提交 body、回填和清空逻辑。
- `tests/marketplace-wallet.e2e.js` 已在 creator upload 与 rejected revision/resubmit 流程里断言 description 写入 create/patch payload。
- README、设计文档和 API reference 生成脚本已同步为 `title/summary/description/tags/language/content_rating` 上传元数据；`docs/marketplace-api-reference.md` 已重生成。
- Lagrange 子 agent 只读复核发现设计文档一度过度暗示 description 进入列表/搜索；已收窄为列表/搜索继续用短摘要、标签、语言和分级，详情/审核保留完整描述。
- `tests/market-wallet.test.js` 已补充 PATCH 修订时更新和清空 `description` 的后端断言。
- 已通过 `npm --prefix tests run test:unit -- marketplace-wallet-ui.test.js pwa.test.js marketplace-api-reference.test.js marketplace-scripts.test.js`、`npm run test:marketplace:syntax`、`npm --prefix tests run test:unit -- market-wallet.test.js -t "allows creators to revise draft and rejected assets before resubmission"`、`npm run test:marketplace`、`PLAYWRIGHT_BROWSER_CHANNEL=chrome node scripts/run-marketplace-e2e.mjs -g "submits a world book upload|revises a rejected creator asset" --workers=1`、`npm run test:marketplace:smoke` 和 `git diff --check`。
- 已提交 `17a80cc7a Add marketplace upload descriptions` 并推送到 `fork/codex/marketplace-wallet-mvp`。
- GitHub run `28271087368` 已确认 Marketplace Wallet Checks 全链路通过：syntax、Jest contract、runtime smoke、hosted Docker smoke、runner Chrome 和 browser E2E 全部 success。

## 2026-06-26 阶段 114：详情弹窗显示完整描述
- 开始补齐 Details/Inspect 弹窗中的 `description` 展示；本阶段不把 description 加到列表摘要或搜索字段，避免长文本拖慢手机端浏览。
- `public/scripts/extensions/marketplace-wallet/index.js` 的 asset preview 现在会在 summary 后用 `.text(description)` 安全渲染非空描述。
- `public/scripts/extensions/marketplace-wallet/style.css` 新增 `.marketplace-wallet-preview-description`，用 `white-space: pre-wrap` 和 `overflow-wrap: anywhere` 支撑换行和窄屏长词。
- marketplace-wallet manifest、service worker 预缓存清单、UI contract 和浏览器 E2E 常量已从 `0.2.20` 升到 `0.2.21`。
- `tests/marketplace-wallet-ui.test.js` 已锁定详情描述渲染和 CSS；`tests/marketplace-wallet.e2e.js` 已断言 Details 弹窗将 `<strong>` 作为纯文本显示。
- README 和设计文档已同步 Details/Inspect 显示完整描述的边界。
- Noether 子 agent 只读复核建议锁定 description 不进入搜索、长描述移动端不横向溢出和设计文档字段列表；已补对应过滤测试、移动 E2E 和文档。
- 已通过 `npm --prefix tests run test:unit -- marketplace-wallet-filters.test.js marketplace-wallet-ui.test.js pwa.test.js marketplace-scripts.test.js`、`PLAYWRIGHT_BROWSER_CHANNEL=chrome node scripts/run-marketplace-e2e.mjs -g "shows asset detail metadata|keeps the Details popup usable on mobile width|truncates large payloads" --workers=1`、`npm run test:marketplace`、`npm run test:marketplace:smoke` 和 `git diff --check`。
- 已提交 `036a4d34c Show marketplace asset descriptions` 并推送到 `fork/codex/marketplace-wallet-mvp`。
- GitHub run `28271463413` 已确认 Marketplace Wallet Checks 全链路通过：syntax、Jest contract、runtime smoke、hosted Docker smoke、runner Chrome 和 browser E2E 全部 success。

## 2026-06-26 阶段 115：举报空原因本地校验
- Bacon 子 agent 只读复核发现 Report 空原因会继续打开第二个 details popup，最后才由后端拒绝，手机/PWA 用户体验较差。
- `public/scripts/extensions/marketplace-wallet/index.js` 的 `reportAsset()` 现在会 trim 第一段 reason，空值直接 `toastr.warning('Report reason is required')` 并 return。
- report API body 现在使用 trim 后的 reason，并继续保留 `MAX_REPORT_REASON_LENGTH` 和 `MAX_REPORT_BODY_LENGTH` 上限。
- marketplace-wallet manifest、service worker 预缓存清单、UI contract 和浏览器 E2E 常量已从 `0.2.21` 升到 `0.2.22`。
- `tests/marketplace-wallet.e2e.js` 新增空 reason 用例，断言不会打开 report details 弹窗，也不会调用 report API。
- README 和设计文档已同步 report reason 必填且前端会本地拦截空值。
- 已通过 `npm --prefix tests run test:unit -- marketplace-wallet-ui.test.js pwa.test.js marketplace-scripts.test.js`、`PLAYWRIGHT_BROWSER_CHANNEL=chrome node scripts/run-marketplace-e2e.mjs -g "submits a report with reviewer details|keeps empty report reasons local" --workers=1`、`npm run test:marketplace`、`npm run test:marketplace:smoke` 和 `git diff --check`。
- 已提交 `378830813 Validate report reasons locally` 并推送到 `fork/codex/marketplace-wallet-mvp`。
- GitHub run `28271797886` 已确认 Marketplace Wallet Checks 全链路通过：syntax、Jest contract、runtime smoke、hosted Docker smoke、runner Chrome 和 browser E2E 全部 success。

## 2026-06-26 阶段 116：API reference 文档触发 CI
- Bohr 子 agent 只读复核发现 `.github/workflows/marketplace-wallet-checks.yml` 覆盖了 API reference 导出脚本和测试，但漏掉 checked-in `docs/marketplace-api-reference.md`。
- Marketplace Wallet Checks 的 pull_request 和 push path filter 已各自加入 `docs/marketplace-api-reference.md`。
- `tests/marketplace-scripts.test.js` 新增契约，断言该文档路径在 workflow 中出现两次，避免 PR/push 任一侧漏配。
- 已通过 `npm --prefix tests run test:unit -- marketplace-scripts.test.js`、`npm run test:marketplace:syntax` 和 `git diff --check`。
- 已提交 `cdb8e763d Run marketplace checks for API reference docs` 并推送到 `fork/codex/marketplace-wallet-mvp`。
- GitHub run `28271970369` 已确认 Marketplace Wallet Checks 全链路通过：syntax、Jest contract、runtime smoke、hosted Docker smoke、runner Chrome 和 browser E2E 全部 success。

## 2026-06-26 阶段 117：资产详情响应 allowlist 脱敏
- 开始处理 Bohr 子 agent 发现的 asset detail 黑名单式脱敏风险：当前 `toAssetDetail()` 会 `structuredClone(asset)` 后只删除未授权 payload，未来新增内部字段会默认外泄。
- 本阶段目标是改为 allowlist 响应：详情保留列表摘要字段、完整 `description`、生命周期时间、当前用户 entitlement 和 `payload_available`；只有 creator/admin/entitled 用户才附加 `normalized_payload`。
- 已启动 James/Boole 两个只读 agent 并行复核后端测试字段和前端依赖面；主线先实现后端与契约测试。
- 已实现 `toAssetDetail()` allowlist 响应，并同步 API reference 生成脚本、checked-in 文档、README 和设计文档。
- 首次目标 Jest 和 syntax gate 发现 `tests/market-wallet.test.js` 中新增 `storedAsset` 与同一大测试后续变量重名；已改为 `detailStore/detailStoredAsset`。
- Boole 确认前端 Details/Revise 只依赖摘要字段、`description`、`created_at/listed_at/delisted_at/updated_at`、`payload_available`、权限内 `normalized_payload` 和 entitlement `source/created_at/purchase_id`。
- James 确认 detail 应基于 `toAssetListItem()` allowlist，并建议顺手收紧 detail/purchase 返回的 entitlement；已新增 `toEntitlementSummary()`，不再返回 `ledger_entry_ids`、`revoked_at` 或 `asset_version_id`。
- 已通过 `npm --prefix tests run test:unit -- market-wallet.test.js marketplace-api-reference.test.js`、`npm run test:marketplace:syntax`、`npm run test:marketplace`、`npm run test:marketplace:smoke` 和 `git diff --check`。
- 已提交 `3fd10283f Tighten marketplace detail privacy` 并推送到 `fork/codex/marketplace-wallet-mvp`，等待 GitHub Marketplace Wallet Checks。
- GitHub run `28272487711` 已确认 Marketplace Wallet Checks 全链路通过：syntax、Jest contract、runtime smoke、hosted Docker smoke、runner Chrome 和 browser E2E 全部 success。

## 2026-06-26 阶段 118：侧栏子面板失败重试
- 开始处理 Bacon 子 agent 留下的 UI 缺口：Library、Creator Center、Wallet Activity 和 Report Queue 的降级加载失败时会清空状态并渲染 “No ... yet.”，容易把网络或权限问题伪装成空数据。
- 本阶段目标是给这些附属面板增加独立错误状态和 Retry 操作，保持主 Marketplace 仍可加载和浏览。
- 已启动 Locke 只读复核前端实现点；Hypatia worker 并行处理 CSRF-on smoke，写入范围和本阶段前端改动分开。
- marketplace-wallet state 新增 `creatorError`、`ledgerError`、`libraryError`、`reportsError`，render 顺序调整为 loading -> error -> empty -> data。
- `createPanelError()` 统一生成错误文案和 Retry 按钮，`retryPanel()` 通过 `data-marketplace-wallet-retry` 分发到对应 loader。
- marketplace-wallet manifest、service worker 预缓存清单、UI contract 和浏览器 E2E 常量从 `0.2.22` 升到 `0.2.23`。
- 浏览器 E2E 新增 “shows retryable side-panel errors instead of empty states”，覆盖 Creator Center、Wallet Activity、Library 和 Report Queue 失败一次后点击 Retry 恢复。
- Hypatia worker 已补 `scripts/smoke-marketplace-runtime.mjs` 的默认 CSRF 最小 smoke：获取 `/csrf-token` 的 token + session cookie，再 POST 创建 draft world_book，保留原 `--disableCsrf` 完整业务闭环不变。
- `tests/marketplace-scripts.test.js` 已锁定 runtime smoke 同时覆盖旧 full smoke 和默认 CSRF token/cookie POST 路径，README 验证矩阵已同步该边界。
- 已通过 `npm run test:marketplace:syntax`、`npm --prefix tests run test:unit -- marketplace-wallet-ui.test.js pwa.test.js marketplace-scripts.test.js`、`PLAYWRIGHT_BROWSER_CHANNEL=chrome node scripts/run-marketplace-e2e.mjs -g "shows retryable side-panel errors" --workers=1`、`npm run test:marketplace`、`npm run test:marketplace:smoke`、`PLAYWRIGHT_BROWSER_CHANNEL=chrome node scripts/run-marketplace-e2e.mjs -g "shows retryable side-panel errors|shows a retryable marketplace error" --workers=1` 和 `git diff --check`。
- 已提交 `da1f756f3 Add retryable marketplace side panels` 并推送到 `fork/codex/marketplace-wallet-mvp`，等待 GitHub Marketplace Wallet Checks。
- GitHub run `28272873816` 已确认 Marketplace Wallet Checks 全链路通过：syntax、Jest contract、runtime smoke、hosted Docker smoke、runner Chrome 和 browser E2E 全部 success。

## 2026-06-26 阶段 119：移动端上传表单长内容覆盖
- 开始处理 Bacon 子 agent 早前发现的 mobile upload form 覆盖缺口：现有移动端验证覆盖详情、筛选、审核、库动作，但没有 360px viewport 下的上传表单长内容无横向溢出测试。
- 本阶段先补浏览器 E2E；若测试暴露 `.marketplace-wallet-upload-grid`、tags 输入或 payload textarea 的 CSS 问题，再做最小修复。
- `tests/marketplace-wallet.e2e.js` 新增 “keeps the upload form usable on mobile width with long content”，填入长标题、summary、description、tags 和 JSON payload。
- 首次运行该 E2E 发现测试错误地要求上传按钮区两列；实际 CSS 在手机宽度下让上传动作按钮 100% 宽单列且无横向溢出，因此测试改为断言按钮区和按钮都留在上传表单内。
- 已通过 `PLAYWRIGHT_BROWSER_CHANNEL=chrome node scripts/run-marketplace-e2e.mjs -g "keeps the upload form usable on mobile width" --workers=1`、`npm run test:marketplace:syntax`、`npm --prefix tests run test:unit -- marketplace-wallet-ui.test.js pwa.test.js marketplace-scripts.test.js` 和 `PLAYWRIGHT_BROWSER_CHANNEL=chrome npm run test:marketplace:e2e:server -- --list`。
- 已通过 `npm run test:marketplace` 和 `git diff --check`。
- 已提交 `b0043e6a4 Cover mobile upload form overflow` 并推送到 `fork/codex/marketplace-wallet-mvp`，等待 GitHub Marketplace Wallet Checks。
- GitHub run `28273118431` 已确认 Marketplace Wallet Checks 全链路通过：syntax、Jest contract、runtime smoke、hosted Docker smoke、runner Chrome 和 browser E2E 全部 success。

## 2026-06-27 阶段 120：默认 CSRF 写入负向 smoke
- 开始补齐 runtime smoke 的默认 CSRF 负向路径：原脚本已证明 token/cookie 可以创建 draft，但没有证明同 session 缺少 `X-CSRF-Token` 时会被拒绝。
- 已启动 Chandrasekhar/Dewey 两个只读 explorer 并行复核 CSRF 行为和文档契约；主线先实现脚本与测试文档补丁。
- `scripts/smoke-marketplace-runtime.mjs` 新增 `assertStatusEndpoint()`，在默认 CSRF server 获取 token/cookie 后，先用相同 Cookie 但不带 `X-CSRF-Token` POST `/api/market/assets`，断言 403。
- 默认 CSRF 正向 draft upload 复用同一 JSON body，并继续断言带 `X-CSRF-Token` 时返回 201。
- README、设计文档和 `tests/marketplace-scripts.test.js` 已同步默认 CSRF tokenless rejection + token/cookie success 的 smoke 边界。
- Chandrasekhar 子 agent 只读复核确认：负向 POST 放在 token 获取之后、正向 POST 之前，可以验证同 session 缺 header 的真实 CSRF 失败；状态断言即可，不应要求 marketplace JSON body。
- Dewey 子 agent 只读复核确认：README、设计文档和脚本契约测试是需要同步的三处；已补充契约断言锁定 403 状态码和负向在正向前执行。
- 已通过 `node --check scripts/smoke-marketplace-runtime.mjs`、`npm --prefix tests run test:unit -- marketplace-scripts.test.js`、`npm run test:marketplace`、`npm run test:marketplace:smoke` 和 `git diff --check`。
- 已提交 `ea53abc48 Cover CSRF tokenless marketplace smoke` 并推送到 `fork/codex/marketplace-wallet-mvp`。
- GitHub run `28273398809` 已确认 Marketplace Wallet Checks 全链路通过：syntax、Jest contract、runtime smoke、hosted Docker smoke、runner Chrome 和 browser E2E 全部 success。

## 2026-06-27 阶段 121：API reference 客户端 CSRF 契约
- 开始补齐 API reference 的客户端请求要求：runtime smoke 已验证默认 CSRF 行为，但 `docs/marketplace-api-reference.md` 仍只列 market/wallet/health 路由和业务 notes。
- 已启动 Averroes/Heisenberg 两个只读 explorer 并行复核 API 文档措辞和前端 `getRequestHeaders()` 实际行为。
- `scripts/export-marketplace-api-reference.mjs` 新增 `Client Request Requirements` 段落，说明外部客户端默认需要 `GET /csrf-token`、session cookie 和 `X-CSRF-Token` 写请求 header。
- `tests/marketplace-api-reference.test.js` 已新增生成内容断言；README 和设计文档已同步 API reference 会记录客户端 CSRF 请求要求。
- Heisenberg 子 agent 只读确认内置 Web/PWA 通过 `getRequestHeaders()` 携带 `X-CSRF-Token`，PWA service worker 跳过 `/api/*`，外部客户端必须保存 `/csrf-token` 返回的同一 session cookie。
- Averroes 子 agent 建议保持文档窄口径：不承诺跨域、长期 token 或 `start:no-csrf` 适合托管；文案已补充 token/session 必须匹配和 runtime smoke 的 tokenless 403 覆盖。
- 已用固定时间戳重生成 `docs/marketplace-api-reference.md`。
- 首次 `npm run test:marketplace` 中 `market-wallet.test.js` 两个用例出现一次 `fetch failed: other side closed`；单独重跑 `npm --prefix tests run test:unit -- market-wallet.test.js` 通过，随后完整 `npm run test:marketplace` 重跑通过。
- 已通过 `node --check scripts/export-marketplace-api-reference.mjs`、`npm --prefix tests run test:unit -- marketplace-api-reference.test.js marketplace-scripts.test.js`、`npm --prefix tests run test:unit -- market-wallet.test.js`、`npm run test:marketplace` 和 `git diff --check`。
- 已提交 `8a1c7d5fb Document marketplace CSRF client contract` 并推送到 `fork/codex/marketplace-wallet-mvp`。
- GitHub run `28273649665` 已确认 Marketplace Wallet Checks 全链路通过：syntax、Jest contract、runtime smoke、hosted Docker smoke、runner Chrome 和 browser E2E 全部 success。

## 2026-06-27 阶段 122：上传文本边界前端对齐
- 开始补齐 marketplace-wallet 上传表单的本地文本边界：后端 title/summary/description/language/content_rating 已有长度限制，手机端应在本地提前拦截。
- 已启动 Hubble/Maxwell 两个只读 explorer 并行复核字段边界和测试策略。
- `window.html` 已把 Title `maxlength` 从 160 调整为 120，把 Summary `maxlength` 从 280 调整为 500，与后端 `normalizeMarketAssetInput()` 保持一致。
- `index.js` 新增上传文本字段长度常量和 `validateUploadTextFields()`，在 parse tags/payload 前拦截超长 title、summary、description、language 和 content rating。
- Hubble 子 agent 发现自动 payload title hint 仍会截到 160，已改为 `MAX_UPLOAD_TITLE_LENGTH`，避免导入 JSON 自动填出本地无法提交的标题。
- Maxwell 子 agent 建议只补 1 个 UI contract 和 1 个浏览器 E2E；已在 UI contract 锁定 DOM maxlength、JS 常量和 title hint 截断，在 E2E 中用 `evaluate` 绕过 maxlength 验证超长文本不会发 create 请求。
- marketplace-wallet manifest、service worker 预缓存清单、UI contract 和浏览器 E2E 常量已从 `0.2.23` 升到 `0.2.24`。
- 设计文档已同步上传表单前端本地校验与后端边界一致：title 120、summary 500、description 10000、language 16、content_rating 40。
- 已通过 `npm --prefix tests run test:unit -- marketplace-wallet-ui.test.js pwa.test.js`、`PLAYWRIGHT_BROWSER_CHANNEL=chrome node scripts/run-marketplace-e2e.mjs -g "blocks overlong upload text fields|blocks oversized upload payloads" --workers=1`、`node --check public/scripts/extensions/marketplace-wallet/index.js && node --check public/service-worker.js`、`npm run test:marketplace`、`PLAYWRIGHT_BROWSER_CHANNEL=chrome npm run test:marketplace:e2e:server -- --list` 和 `git diff --check`。
- 已提交 `860267095 Align marketplace upload text limits` 并推送到 `fork/codex/marketplace-wallet-mvp`。
- GitHub run `28273965217` 已确认 Marketplace Wallet Checks 全链路通过：syntax、Jest contract、runtime smoke、hosted Docker smoke、runner Chrome 和 browser E2E 全部 success。

## 2026-06-27 阶段 123：PWA 离线导航首页兜底
- Huygens/Mencius/Hooke 三个只读子 agent 已完成下一步缺口复核：后端 reject reason 长度契约、PWA 离线导航兜底、CI 等价发布门禁都是后续候选；本阶段先处理直接影响手机版安装壳可打开性的 PWA 离线导航。
- `public/service-worker.js` 的 navigation fetch 仍保持 network-first；网络失败后先查当前 request cache，再回退预缓存的 `/` 根页面，避免安装版 PWA 离线恢复带 query URL 时 miss cache。
- `tests/pwa.test.js` 已锁定 cached root fallback；`tests/marketplace-wallet.e2e.js` 已在真实 service worker 激活后模拟离线访问 `/?pwa-offline-query=1`，确认回退到缓存首页 shell。
- README 和设计文档已同步说明离线带 query 导航会回退缓存根页面，业务 `/api/*` 仍不缓存。
- 已通过 `node --check public/service-worker.js`、`npm --prefix tests run test:unit -- pwa.test.js`、`PLAYWRIGHT_BROWSER_CHANNEL=chrome node scripts/run-marketplace-e2e.mjs -g "registers the service worker shell cache" --workers=1`、`npm run test:marketplace:syntax`、`npm run test:marketplace`、`PLAYWRIGHT_BROWSER_CHANNEL=chrome npm run test:pwa:e2e` 和 `git diff --check`。
- 已提交 `424363667 Add PWA offline navigation fallback` 并推送到 `fork/codex/marketplace-wallet-mvp`。
- GitHub run `28274349542` 已确认 Marketplace Wallet Checks 全链路通过：syntax、Jest contract、runtime smoke、hosted Docker smoke、runner Chrome 和 browser E2E 全部 success。

## 2026-06-27 阶段 124：审核拒绝理由长度契约
- 开始处理 Huygens 子 agent 发现的后端契约缺口：`POST /api/market/assets/:id/reject` 文档写明 reason 最多 1000 字符，但实现会静默 `slice(0, 1000)`。
- `src/endpoints/market.js` 已改为复用 `normalizeString()` 校验 reject reason；超长时返回 `400 { error: 'Invalid rejection reason', details: [...] }`，不修改资产状态。
- `tests/market-wallet.test.js` 新增 reject reason 边界测试，覆盖 1001 字符失败且资产保持 submitted/review，以及 1000 字符成功保存。
- 首次目标 Jest 失败是测试假设 submitted 资产预先带空 `review_notes`，实际字段不存在；已改为 `review_notes ?? ''`，只断言超长 reject 不污染备注。
- 已通过 `node --check src/endpoints/market.js`、`npm --prefix tests run test:unit -- market-wallet.test.js`、`npm run test:marketplace:syntax`、`npm run test:marketplace`、`npm run test:marketplace:smoke` 和 `git diff --check`。
- 已提交 `cfd952ba5 Validate marketplace rejection reason length` 并推送到 `fork/codex/marketplace-wallet-mvp`。
- GitHub run `28274521204` 已确认 Marketplace Wallet Checks 全链路通过：syntax、Jest contract、runtime smoke、hosted Docker smoke、runner Chrome 和 browser E2E 全部 success。

## 2026-06-27 阶段 125：CI 等价 marketplace 发布门禁命令
- 开始处理 Hooke 子 agent 发现的交付脚本缺口：本地慢速 `test:marketplace:all` 不含 hosted Docker smoke，而 GitHub Marketplace Wallet Checks 会额外跑 Docker smoke。
- `package.json` 新增 `test:marketplace:ci`，串联 `test:marketplace:syntax`、`test:marketplace`、`test:marketplace:smoke`、`test:hosted:docker` 和 `test:marketplace:e2e:server`，作为具备 Docker/Chrome 机器上的 release gate。
- CI workflow 保持分步运行，以保留独立日志和 timeout；`tests/marketplace-scripts.test.js` 已锁定 `test:marketplace:ci` 包含 workflow 中五个 marketplace npm run 步骤，且不包含 CI 专用的 `google-chrome --version` 环境探针。
- README 和设计文档已同步 `test:marketplace:ci` 的用途、Docker/Chrome 依赖，以及无 Docker 机器继续使用 `test:marketplace:all` 或依赖 CI 的边界。
- 本机没有 `docker` 命令，因此无法本地完整运行 `test:marketplace:ci`；Docker 覆盖将由 GitHub Marketplace Wallet Checks 验证。
- 首次 `PLAYWRIGHT_BROWSER_CHANNEL=chrome npm run test:marketplace:all` 中 contract、runtime smoke 和 24 个 browser E2E 用例均显示通过，但 wrapper 在等待 Playwright 子进程退出时触发默认 300000ms 超时；已将默认 `MARKETPLACE_E2E_PLAYWRIGHT_TIMEOUT_MS` 对齐 CI browser E2E step 的 10 分钟预算（600000ms），并更新 README/脚本契约测试。
- 再次运行全量 browser E2E 时 24 个用例仍全部显示通过，但 4 个 Playwright worker 留在孤儿进程状态；已清理本轮临时进程和临时目录，并将 `test:marketplace:e2e:server` 默认改为 `--workers=1`，让发布脚本稳定收尾。
- 随后 `test:marketplace:all` 和单独 `test:marketplace` 都在并行 Jest 总套件里复现 `market-wallet.test.js` 的 `fetch failed: other side closed`；失败用例和完整 `market-wallet.test.js` 单独重跑均通过。已将根 `test:marketplace` 改为先 `--runInBand` 单独跑 `market-wallet.test.js`，再跑其它 marketplace/PWA/health contract 文件，降低临时 HTTP server 并行抖动。
- 已通过 `npm --prefix tests run test:unit -- marketplace-scripts.test.js`、`node --check scripts/run-marketplace-e2e.mjs`、`npm run test:marketplace:syntax`、`npm run test:marketplace`、`PLAYWRIGHT_BROWSER_CHANNEL=chrome npm run test:marketplace:e2e:server -- --list`、`npm run test:marketplace:smoke`、`PLAYWRIGHT_BROWSER_CHANNEL=chrome npm run test:marketplace:e2e:server`（24 passed, 串行正常退出）、`git diff --check`。
- 本机仍没有 `docker` 命令，无法本地执行完整 `test:marketplace:ci`；Docker smoke 将由 GitHub Marketplace Wallet Checks 验证。串行 browser E2E 后确认没有遗留 Playwright/临时 server 进程或临时 E2E 目录。
- 已提交 `d312a353b Add marketplace CI release gate` 并推送到 `fork/codex/marketplace-wallet-mvp`。
- GitHub run `28275289762` 已确认 Marketplace Wallet Checks 全链路通过：syntax、Jest contract、runtime smoke、hosted Docker smoke、runner Chrome 和串行 browser E2E 全部 success。

## 2026-06-27 阶段 126：审核批准前完整资产校验
- 开始处理 Tesla 子 agent 确认的审核安全缺口：`validateAssetForApproval()` 只复查 metadata/payload，缺少 title/type/price 等可上架核心字段复核。
- 已将提交和批准共享 `validateMarketAssetCore()`，approve 前会复查 title、type、price_type、price_coins、metadata 字节和 normalized_payload 格式。
- `tests/market-wallet.test.js` 新增 store-corruption 回归：submitted 资产被手工改成空 title、unsupported type 和无效 fixed price 后，管理员 approve 返回 400，资产仍停留在 submitted/review，且不会写入 approved/listed 时间。
- README、设计文档、API reference 生成脚本、checked-in API reference 和 API reference 测试已同步 approve 前完整可上架资产复核边界。
- Aquinas 子 agent 只读发现下一步小缺口：Marketplace Wallet Checks path filter 漏监听 `public/style.css`，已记录为下一阶段候选，当前阶段未改。
- 首次目标 Jest 失败是新测试假设 approve 失败后 `approved_at/listed_at` 为 null；实际腐化 store 中字段不存在。已改为 `?? null`，断言“未被设置”而不是要求预先存在。
- 已通过 `node --check src/endpoints/market.js`、`node --check scripts/export-marketplace-api-reference.mjs`、`npm --prefix tests run test:unit -- market-wallet.test.js marketplace-api-reference.test.js`、`npm run test:marketplace`、`npm run test:marketplace:smoke` 和 `git diff --check`。
- 已提交 `b57d73934 Revalidate marketplace approval assets` 并推送到 `fork/codex/marketplace-wallet-mvp`。
- GitHub run `28275627267` 已确认 Marketplace Wallet Checks 全链路通过：syntax、Jest contract、runtime smoke、hosted Docker smoke、runner Chrome 和 browser E2E 全部 success。

## 2026-06-27 阶段 127：PWA 样式变更触发 Marketplace CI
- 开始处理 Aquinas 子 agent 发现的 CI path-filter 缺口：PWA install prompt 和移动 safe-area 样式依赖 `public/style.css`，但 Marketplace Wallet Checks 未监听该文件。
- `.github/workflows/marketplace-wallet-checks.yml` 已在 pull_request 和 push paths 中加入 `public/style.css`。
- `tests/marketplace-scripts.test.js` 新增契约测试，锁定 `public/style.css` 在 workflow path filters 中出现两次，防止后续漂移。
- 已通过 `npm --prefix tests run test:unit -- marketplace-scripts.test.js pwa.test.js`、`npm run test:marketplace:syntax` 和 `git diff --check`。
- 已提交 `3ce0d3286 Trigger marketplace checks for PWA stylesheet` 并推送到 `fork/codex/marketplace-wallet-mvp`。
- GitHub run `28275815827` 已确认 Marketplace Wallet Checks 全链路通过：syntax、Jest contract、runtime smoke、hosted Docker smoke、runner Chrome 和 browser E2E 全部 success。

## 2026-06-27 阶段 128：举报与拒绝理由前端长度校验
- 开始处理前端提交静默截断缺口：marketplace-wallet 的 reject reason、report reason 和 report body 会在发送前 `slice()`，而后端已改为超长 400。
- `rejectAsset()` 已新增 `MAX_REJECT_REASON_LENGTH = 1000` 本地校验；超长时显示 warning 并不发送 `/reject` 请求。
- `reportAsset()` 已对 120 字符 reason 和 2000 字符 details 做本地长度校验；超长时 warning 并不发送 `/report` 请求，提交体使用完整 trim 后文本，不再 slice。
- marketplace-wallet manifest、service worker 预缓存清单、UI contract 和浏览器 E2E 常量已从 `0.2.24` 升到 `0.2.25`；未 bump cache name，因为版本化资源 URL 已变化。
- `tests/marketplace-wallet-ui.test.js` 锁定三条本地 warning、提交体使用 `trimmedReason/trimmedDetails`，并防止 report/reject 静默截断字符串回归。
- `tests/marketplace-wallet.e2e.js` 新增超长 rejection reason 和超长 report reason/details 浏览器用例，确认 popup 输入后不会发出对应 API 请求。
- README 和设计文档已同步：report/reject 表单对超长文本本地提示，而不是静默截断。
- 已通过 `npm --prefix tests run test:unit -- marketplace-wallet-ui.test.js pwa.test.js`、`PLAYWRIGHT_BROWSER_CHANNEL=chrome node scripts/run-marketplace-e2e.mjs -g "keeps overlong rejection reasons|keeps overlong report text" --workers=1`、`npm run test:marketplace:syntax`、`npm run test:marketplace`、`PLAYWRIGHT_BROWSER_CHANNEL=chrome node scripts/run-marketplace-e2e.mjs -g "registers the service worker shell cache" --workers=1` 和 `git diff --check`。
- 已提交 `4616b8363 Validate marketplace moderation text lengths` 并推送到 `fork/codex/marketplace-wallet-mvp`。
- GitHub run `28276123729` 已确认 Marketplace Wallet Checks 全链路通过：syntax、Jest contract、runtime smoke、hosted Docker smoke、runner Chrome 和 browser E2E 全部 success。

## 2026-06-27 阶段 129：Library 安装忙碌态同步
- 开始处理 My Library 内 reinstall 操作的 UI 状态缺口：`withBusyAsset()` 只重绘 Marketplace 列表，Library 条目的 `state.busyAssetIds` 变化不会立即反映到按钮 disabled/Installing 文案。
- `withBusyAsset()` 已在 busy 集合进入和退出时同步调用 `renderLibrary()`，让 Library install/details 入口和 Marketplace 资产卡使用同一资产级 busy 状态。
- marketplace-wallet manifest、service worker 预缓存清单、UI contract 和浏览器 E2E 常量已从 `0.2.25` 升到 `0.2.26`。
- `tests/marketplace-wallet-ui.test.js` 已锁定 `withBusyAsset()` 两侧都会重绘 Library；`tests/marketplace-wallet.e2e.js` 新增挂起一次 install 请求的真实浏览器用例，确认 Library Install 点击后会变成 disabled + Installing，并在释放请求后刷新安装摘要。
- Mill 子 agent 只读复核确认 patch 覆盖风险；按建议把 E2E helper 的 held install release 改为 async/await，便于未来定位 `route.fulfill()` 失败。
- Descartes 子 agent 只读扫描出下一阶段候选：PWA 预缓存里的 marketplace-wallet `filters.js` 仍是裸路径，可能导致安装壳 cache-first 命中过期过滤逻辑；另有 PWA shell 预缓存依赖 path filter 和根 `public/manifest.json` syntax gate 小缺口。
- 已通过 `node --check tests/marketplace-wallet.e2e.js`、`node --check public/scripts/extensions/marketplace-wallet/index.js`、`node --check public/service-worker.js`、`npm --prefix tests run test:unit -- marketplace-wallet-ui.test.js pwa.test.js`、`PLAYWRIGHT_BROWSER_CHANNEL=chrome node scripts/run-marketplace-e2e.mjs -g "shows busy state while reinstalling a library asset" --workers=1`、`npm run test:marketplace`、`npm run test:marketplace:smoke`、`PLAYWRIGHT_BROWSER_CHANNEL=chrome node scripts/run-marketplace-e2e.mjs -g "registers the service worker shell cache" --workers=1` 和 `git diff --check`。
- 已提交 `23cde66a4 Sync library install busy state` 并推送到 `fork/codex/marketplace-wallet-mvp`。
- GitHub run `28276502225` 已确认 Marketplace Wallet Checks 全链路通过：syntax、Jest contract、runtime smoke、hosted Docker smoke、runner Chrome 和 browser E2E 全部 success。

## 2026-06-29 阶段 130：PWA 预缓存 filters 版本化
- 开始处理 PWA 安装壳静态资源更新缺口：marketplace-wallet 的 `index.js` 和 `style.css` 已随 manifest version 加 query，但 `index.js` 静态 import 的 `filters.js` 以及 service worker 预缓存仍是裸路径。
- 采用最小修法：不新增 manifest 字段、不改 extension loader，只把 `index.js` 中 `./filters.js` import 改为当前扩展版本 query，并同步 service worker `SHELL_ASSETS`；marketplace-wallet manifest、PWA 预缓存和 E2E 常量已从 `0.2.26` 升到 `0.2.27`。
- `tests/marketplace-wallet-ui.test.js` 已锁定 filters import 跟随 manifest version；`tests/pwa.test.js` 和 `tests/marketplace-wallet.e2e.js` 已锁定 shell cache 里的 filters 路径同样版本化。
- 首轮目标 Jest 失败是 UI contract 在第二个 test 中引用了第一条 test 的局部 `manifest` 变量；已在当前 test 内重新读取 manifest 后修复。
- 已通过 `node --check public/scripts/extensions/marketplace-wallet/index.js && node --check public/scripts/extensions/marketplace-wallet/filters.js && node --check public/service-worker.js && node --check tests/marketplace-wallet.e2e.js`、`npm --prefix tests run test:unit -- marketplace-wallet-ui.test.js pwa.test.js marketplace-wallet-filters.test.js`、`PLAYWRIGHT_BROWSER_CHANNEL=chrome node scripts/run-marketplace-e2e.mjs -g "registers the service worker shell cache" --workers=1`、`npm run test:marketplace:syntax`、`npm run test:marketplace` 和 `git diff --check`。
- 已提交 `0e32be88f Version marketplace filters cache asset` 并推送到 `fork/codex/marketplace-wallet-mvp`。
- GitHub run `28344703149` 已确认 Marketplace Wallet Checks 全链路通过：syntax、Jest contract、runtime smoke、hosted Docker smoke、runner Chrome 和 browser E2E 全部 success。

## 2026-06-29 阶段 131：根 PWA manifest 语法门禁
- 开始处理可运行脚本小缺口：`test:marketplace:syntax` 会解析 marketplace-wallet manifest，但根安装型 PWA 的 `public/manifest.json` 只在 Jest PWA contract 中解析。
- `scripts/check-marketplace-syntax.mjs` 已把 `public/manifest.json` 加入 `staticAssets` JSON 检查；`tests/marketplace-scripts.test.js` 已锁定该路径，避免根 manifest 坏 JSON 绕过最快门禁。
- 已通过 `npm --prefix tests run test:unit -- marketplace-scripts.test.js pwa.test.js` 和 `npm run test:marketplace:syntax`。
- 已提交 `69e4bef6a Check root PWA manifest syntax` 并推送到 `fork/codex/marketplace-wallet-mvp`。
- GitHub run `28344928807` 已确认 Marketplace Wallet Checks 全链路通过：syntax、Jest contract、runtime smoke、hosted Docker smoke、runner Chrome 和 browser E2E 全部 success。

## 2026-06-29 阶段 132：PWA shell 预缓存依赖触发 CI
- 开始处理 CI path-filter 小缺口：service worker 预缓存了 `/css/st-tailwind.css`、`/css/mobile-styles.css`、`/css/login.css`、`/favicon.ico` 和 apple icon，但 Marketplace Wallet Checks 只监听了 `public/style.css`、manifest、HTML、service worker 和 PWA script。
- `.github/workflows/marketplace-wallet-checks.yml` 已在 pull_request 和 push paths 中加入这些 PWA shell 预缓存依赖；保持精确文件路径，不扩大到整个 `public/css/**`。
- `tests/marketplace-scripts.test.js` 已锁定每个 PWA shell 样式/图标路径在 workflow 中出现两次，防止后续预缓存依赖改动绕过 marketplace/PWA checks。
- 已通过 `npm --prefix tests run test:unit -- marketplace-scripts.test.js pwa.test.js`、`npm run test:marketplace:syntax`、`node --check tests/marketplace-scripts.test.js` 和 `git diff --check`。
- 已提交 `4fbd57867 Trigger checks for PWA shell assets` 并推送到 `fork/codex/marketplace-wallet-mvp`。
- GitHub run `28345179813` 已确认 Marketplace Wallet Checks 全链路通过：syntax、Jest contract、runtime smoke、hosted Docker smoke、runner Chrome 和 browser E2E 全部 success。

## 2026-06-29 阶段 133：README syntax gate 文案同步
- 开始处理 README 验证矩阵文案漂移：`test:marketplace:syntax` 已解析 root PWA manifest，但 README 仍只提 marketplace-wallet manifest/window/style。
- README 已更新为 root PWA manifest + marketplace-wallet manifest/window/style asset checks；`tests/marketplace-scripts.test.js` 已锁定该说明，避免 README 和脚本覆盖继续漂移。
- 已通过 `npm --prefix tests run test:unit -- marketplace-scripts.test.js` 和 `git diff --check`。
- 已提交 `2e9bf09e4 Document root PWA manifest syntax gate` 并推送到 `fork/codex/marketplace-wallet-mvp`。
- GitHub run `28345447283` 已确认 Marketplace Wallet Checks 全链路通过：syntax、Jest contract、runtime smoke、hosted Docker smoke、runner Chrome 和 browser E2E 全部 success。

## 2026-07-03 阶段 134：Creator Center 直接操作入口
- 开始处理 Creator Center 可用性缺口：用户自己的草稿/驳回稿已在 Creator Center 展示，但 Details、Revise、Submit、Install 等操作只在主 Marketplace 列表里，手机用户需要回列表反找资产。
- `renderCreatorSummary()` 已复用现有 `createAssetAction(asset)`，在 Creator Center 每个资产条目右侧提供同一套 asset actions；点击事件绑定到 `#marketplace_wallet_creator_assets_list`，因此仍走现有 `onAssetAction`、busy state、详情、修订、提交和安装流程。
- Creator Center 操作区域新增 `.marketplace-wallet-creator-side`，移动端复用两列 action grid，避免按钮挤压资产标题；marketplace-wallet manifest、service worker 预缓存清单和 E2E 常量已从 `0.2.27` 升到 `0.2.28`。
- `tests/marketplace-wallet-ui.test.js` 已锁定 Creator Center action 容器、事件绑定和移动端按钮网格；浏览器 E2E 已改为从 Creator Center 直接 Submit 保存失败后的 draft、从 Creator Center 直接 Revise rejected 资产。
- Hilbert 子 agent 只读扫描提出后续候选：Report Queue resolve 失败/忙态、Revise 后 Cancel 编辑模式重置、Library 直接安装失败恢复。
- Parfit 子 agent 只读扫描提出后续候选：Marketplace CI path filter 应覆盖后端共享依赖和前端共享 helper；README API reference 生成命令应固定时间戳，避免 checked-in docs 因时间漂移产生 diff。
- 已通过 `node --check public/scripts/extensions/marketplace-wallet/index.js && node --check public/service-worker.js && node --check tests/marketplace-wallet.e2e.js`、`npm --prefix tests run test:unit -- marketplace-wallet-ui.test.js pwa.test.js`、`PLAYWRIGHT_BROWSER_CHANNEL=chrome node scripts/run-marketplace-e2e.mjs -g "keeps a saved draft|revises a rejected" --workers=1`、`npm run test:marketplace`、`PLAYWRIGHT_BROWSER_CHANNEL=chrome node scripts/run-marketplace-e2e.mjs -g "registers the service worker shell cache" --workers=1` 和 `git diff --check`。
- 已提交 `56f495326 Add creator center direct actions` 并推送到 `fork/codex/marketplace-wallet-mvp`。
- GitHub run `28655169770` 已确认 Marketplace Wallet Checks 全链路通过：syntax、Jest contract、runtime smoke、hosted Docker smoke、runner Chrome 和 browser E2E 全部 success。

## 2026-07-03 阶段 135：Marketplace 共享依赖触发 CI
- 开始处理 CI path-filter 缺口：只改 `src/users.js`、`src/util.js`、`src/constants.js`、`src/server-directory.js`、`src/character-card-parser.js`、`src/validator/TavernCardValidator.js` 或 marketplace-wallet 前端共享 helper 时，可能影响 market/wallet 权限、安装写入、角色卡校验、CSRF header 或 popup/user/helper 行为，但之前不会触发 Marketplace Wallet Checks。
- `.github/workflows/marketplace-wallet-checks.yml` 已在 pull_request 和 push paths 中加入后端共享依赖：`src/character-card-parser.js`、`src/constants.js`、`src/server-directory.js`、`src/users.js`、`src/util.js`、`src/validator/TavernCardValidator.js`。
- workflow 同步加入 marketplace-wallet 前端共享 helper：`public/script.js`、`public/scripts/extensions.js`、`public/scripts/popup.js`、`public/scripts/user.js`、`public/scripts/utils.js`。
- `tests/marketplace-scripts.test.js` 新增 shared dependency path-filter 契约，锁定这些路径在 PR/push 两个 filter 中各出现一次。
- 已通过 `npm --prefix tests run test:unit -- marketplace-scripts.test.js`、`npm run test:marketplace:syntax`、`npm run test:marketplace` 和 `git diff --check`。
- 已提交 `cfa59ef44 Trigger marketplace checks for shared dependencies` 并推送到 `fork/codex/marketplace-wallet-mvp`。
- GitHub run `28655694473` 已确认 Marketplace Wallet Checks 全链路通过：syntax、Jest contract、runtime smoke、hosted Docker smoke、runner Chrome 和 browser E2E 全部 success。

## 2026-07-06 阶段 136：API reference 生成命令固定时间戳
- 开始处理 README 交付漂移：checked-in `docs/marketplace-api-reference.md` 由测试固定 `Generated at: 2026-06-26T00:00:00.000Z`，但 README 示例命令未设置 `MARKETPLACE_API_REFERENCE_GENERATED_AT`，照抄会只因当前时间戳产生 diff。
- README 示例命令和 Development Notes 已改为 `MARKETPLACE_API_REFERENCE_GENERATED_AT=2026-06-26T00:00:00.000Z npm run marketplace:export:api -- --out ./docs/marketplace-api-reference.md`。
- `tests/marketplace-scripts.test.js` 已锁定 README 中的固定时间戳 API reference 生成命令，避免 checked-in 文档再因时间戳漂移。
- 已通过 `env MARKETPLACE_API_REFERENCE_GENERATED_AT=2026-06-26T00:00:00.000Z npm run marketplace:export:api -- --out /private/tmp/st-marketplace-api-reference.md`、`cmp -s /private/tmp/st-marketplace-api-reference.md docs/marketplace-api-reference.md`、`npm --prefix tests run test:unit -- marketplace-scripts.test.js marketplace-api-reference.test.js` 和 `git diff --check`。
- 已通过完整 `npm run test:marketplace`。
- 已提交 `c5c083c92 Document fixed API reference timestamp` 并推送到 `fork/codex/marketplace-wallet-mvp`。
- GitHub run `28763820723` 已确认 Marketplace Wallet Checks 全链路通过：syntax、Jest contract、runtime smoke、hosted Docker smoke、runner Chrome 和 browser E2E 全部 success。

## 2026-07-06 阶段 137：Revise Cancel 退出编辑模式回归
- 开始处理 Creator Center 直接 Revise 后的取消回归缺口：用户点击 rejected 资产的 Revise 后，如果再 Cancel，下一次 Save Draft 必须创建新资产而不是继续 PATCH 旧资产。
- `tests/marketplace-wallet.e2e.js` 新增浏览器用例，覆盖 Revise -> Cancel -> 填写新 world_book -> Save Draft，断言调用 create API 且没有 revision API 调用。
- 首次目标 E2E 暴露真实 UI 问题：`#marketplace_wallet_upload_status` 带有 `hidden` 属性，但 `.marketplace-wallet-upload-status { display: flex; }` 让元素仍被浏览器认为可见。
- `public/scripts/extensions/marketplace-wallet/style.css` 已给 `.marketplace-wallet-upload-status[hidden]` 明确设置 `display: none;`；`tests/marketplace-wallet-ui.test.js` 已锁定该 hidden 样式契约。
- 已通过 `node --check tests/marketplace-wallet.e2e.js`、`npm --prefix tests run test:unit -- marketplace-wallet-ui.test.js`、`PLAYWRIGHT_BROWSER_CHANNEL=chrome node scripts/run-marketplace-e2e.mjs -g "cancels a rejected asset revision" --workers=1`、`npm run test:marketplace` 和 `git diff --check`。
- 已提交 `58ca6080f Fix upload cancel hidden state` 并推送到 `fork/codex/marketplace-wallet-mvp`。
- GitHub run `28764253876` 已确认 Marketplace Wallet Checks 全链路通过：syntax、Jest contract、runtime smoke、hosted Docker smoke、runner Chrome 和 browser E2E 全部 success。

## 2026-07-06 阶段 138：Admin Reject 成功闭环 E2E
- 开始处理审核主路径浏览器缺口：现有 E2E 已覆盖超长 rejection reason 的本地拦截，但没有覆盖正常 Reject 的 POST、队列刷新和创作者可见驳回理由。
- `tests/marketplace-wallet.e2e.js` 新增 `rejects a submitted asset from the review queue`，使用 owned submitted world_book 资产，模拟管理员输入驳回原因并点击 Reject。
- 用例断言 `apiCalls.rejects` 收到 `{ assetId, payload.reason }`，Review Queue 变为 `No assets awaiting review.`，Creator Center 显示 `rejected: Needs clearer lore safety tags`，submitted/rejected 计数从 `1/0` 刷新为 `0/1`。
- 已通过 `node --check tests/marketplace-wallet.e2e.js`、`PLAYWRIGHT_BROWSER_CHANNEL=chrome node scripts/run-marketplace-e2e.mjs -g "rejects a submitted asset from the review queue" --workers=1`、`npm run test:marketplace` 和 `git diff --check`。
- 已提交 `85db8ec6e Cover admin reject review flow` 并推送到 `fork/codex/marketplace-wallet-mvp`。
- GitHub run `28764628823` 已确认 Marketplace Wallet Checks 全链路通过：syntax、Jest contract、runtime smoke、hosted Docker smoke、runner Chrome 和 browser E2E 全部 success。

## 2026-07-06 阶段 139：启动入口 CI 与 syntax 覆盖
- 开始处理可运行脚本/CI 闭环缺口：marketplace runtime smoke、Docker smoke 和 browser E2E 实际都通过 `server.js` 启动，并依赖 CLI、config init 和 healthcheck helper，但这些入口之前没有进入 marketplace syntax gate。
- `scripts/check-marketplace-syntax.mjs` 已加入 `server.js`、`src/command-line.js`、`src/config-init.js`、`src/healthcheck.js`，快速门禁会先解析这些启动入口。
- `.github/workflows/marketplace-wallet-checks.yml` 已在 pull_request 和 push path filters 中加入同一组启动入口，避免启动链变更绕过 Marketplace Wallet Checks。
- `tests/marketplace-scripts.test.js` 新增契约，锁定这些路径在 workflow 中出现两次，并且出现在 syntax gate 文件清单中。
- 已通过 `npm run test:marketplace:syntax`、`npm --prefix tests run test:unit -- marketplace-scripts.test.js`、`npm run test:marketplace` 和 `git diff --check`。
- 已提交 `8e34fbce3 Cover marketplace startup entries` 并推送到 `fork/codex/marketplace-wallet-mvp`。
- GitHub run `28764972000` 已确认 Marketplace Wallet Checks 全链路通过：syntax、Jest contract、runtime smoke、hosted Docker smoke、runner Chrome 和 browser E2E 全部 success。

## 2026-07-06 阶段 140：Admin Delist 成功闭环 E2E
- 开始处理管理员下架前端闭环缺口：后端已有 delist 契约，前端已有按钮和字符串 contract，但没有真实浏览器覆盖确认弹窗、POST 和刷新后的按钮/状态变化。
- `tests/marketplace-wallet.e2e.js` 的 mock API 已新增 `apiCalls.delists` 和 `/api/market/assets/:id/delist` route，成功后把资产状态更新为 `delisted` 并写入 `delisted_at`。
- 新增 `delists a listed asset from the marketplace`，覆盖管理员从 Marketplace 卡片点击 Delist、确认弹窗、POST 调用、状态 badge 变为 `delisted`、Delist 按钮消失。
- 已通过 `node --check tests/marketplace-wallet.e2e.js`、`PLAYWRIGHT_BROWSER_CHANNEL=chrome node scripts/run-marketplace-e2e.mjs -g "delists a listed asset from the marketplace" --workers=1`、`npm run test:marketplace` 和 `git diff --check`。
- 已提交 `507495086 Cover admin delist review flow` 并推送到 `fork/codex/marketplace-wallet-mvp`。
- GitHub run `28765379272` 已确认 Marketplace Wallet Checks 全链路通过：syntax、Jest contract、runtime smoke、hosted Docker smoke、runner Chrome 和 browser E2E 全部 success。

## 2026-07-06 阶段 141：Report Resolve Note 前端闭环
- 开始处理 Report Queue 处理备注闭环：后端 `POST /api/market/reports/:id/resolve` 和 API reference 已支持可选 `note`，但前端 Resolve 之前直接空 body，管理员无法记录处理说明。
- `public/scripts/extensions/marketplace-wallet/index.js` 新增 `MAX_REPORT_RESOLUTION_NOTE_LENGTH = 1000`，Resolve 会弹出 `Resolution note (optional):` 输入框，取消则不处理，超长时本地 warning，不做静默截断。
- Resolve 成功请求现在发送 `body: JSON.stringify({ note: trimmedNote })`，继续用 `withBusyReport()` 和本地队列过滤刷新。
- `tests/marketplace-wallet-ui.test.js` 已锁定备注弹窗、长度警告、POST body 和不 slice 的本地校验策略；`tests/marketplace-wallet.e2e.js` 已将 resolve mock 记录为 `{ reportId, payload }` 并断言 reviewer note。
- 已通过 `node --check public/scripts/extensions/marketplace-wallet/index.js`、`node --check tests/marketplace-wallet.e2e.js`、`npm --prefix tests run test:unit -- marketplace-wallet-ui.test.js`、`PLAYWRIGHT_BROWSER_CHANNEL=chrome node scripts/run-marketplace-e2e.mjs -g "resolves reports from the admin report queue with a reviewer note" --workers=1`、`npm run test:marketplace` 和 `git diff --check`。
- 已提交 `a80962fec Add report resolve notes` 并推送到 `fork/codex/marketplace-wallet-mvp`。
- GitHub run `28765782758` 已确认 Marketplace Wallet Checks 全链路通过：syntax、Jest contract、runtime smoke、hosted Docker smoke、runner Chrome 和 browser E2E 全部 success。

## 2026-07-06 阶段 142：Snapshot 导出拒绝缺失 dataRoot
- 开始处理备份/迁移脚本防呆缺口：`marketplace:export:snapshot -- --dataRoot <typo>` 之前会把不存在的目录当作空 store，容易让迁移彩排误判为成功导出空市场。
- `scripts/export-marketplace-snapshot.mjs` 已在 `createSnapshot()` 入口校验 resolved dataRoot 必须存在且是目录；目录存在但没有 `market-assets.json` 或 `_storage` 时仍按空 market/wallet 只读导出。
- `tests/marketplace-snapshot-export.test.js` 新增缺失 dataRoot 回归，断言命令抛出 `Data root does not exist:`，且不会创建该目录。
- 已通过 `npm --prefix tests run test:unit -- marketplace-snapshot-export.test.js`、`npm run test:marketplace:syntax`、`npm run test:marketplace` 和 `git diff --check`。
- 已提交 `f2bca54e5 Reject missing snapshot data roots` 并推送到 `fork/codex/marketplace-wallet-mvp`。
- GitHub run `28766137193` 已确认 Marketplace Wallet Checks 全链路通过：syntax、Jest contract、runtime smoke、hosted Docker smoke、runner Chrome 和 browser E2E 全部 success。

## 2026-07-06 阶段 143：API reference route notes 覆盖
- 开始处理 API reference 文档质量缺口：生成脚本会从源码自动列 route，但如果新增 route 时忘记补 `routeNotes`，checked-in 文档仍会同步，只是少了权限/隐私/边界说明。
- `tests/marketplace-api-reference.test.js` 新增 Markdown section 解析 helper，读取 Market API 与 Wallet API 的 route code block 和 Notes 列表。
- 新增 `documents every generated market and wallet route with a note`，要求每个生成的 market/wallet route key 都有对应 note；首次测试解析器未支持 `:id` 路径参数，已改为匹配 `/api/(market|wallet)` path。
- 当前生成文档已满足该契约，无需修改 `docs/marketplace-api-reference.md` 或生成脚本。
- 已通过 `npm --prefix tests run test:unit -- marketplace-api-reference.test.js`、`node --check tests/marketplace-api-reference.test.js`、`npm run test:marketplace` 和 `git diff --check`。
- 已提交 `eea0d0c36 Require API route notes` 并推送到 `fork/codex/marketplace-wallet-mvp`。
- GitHub run `28766448423` 已确认 Marketplace Wallet Checks 全链路通过：syntax、Jest contract、runtime smoke、hosted Docker smoke、runner Chrome 和 browser E2E 全部 success。

## 2026-07-06 阶段 144：README runnable scripts 动态覆盖
- 开始处理 README runnable scripts 覆盖漂移：`tests/marketplace-scripts.test.js` 会校验 README Useful Scripts，但之前用硬编码清单，新增 marketplace/PWA/hosted 脚本时测试本身也要手动维护。
- 新增 `getHostedReadmeScriptNames(scripts)`，从 `package.json` 动态发现 `marketplace:*`、`test:marketplace*`、`test:pwa*`、`test:hosted:*` 和 `start:no-csrf`。
- `documents hosted marketplace and PWA scripts in README` 现在对每个动态发现到的托管市场/PWA 脚本都要求 README 有可复制的 `npm run ...` 命令，同时保留 API reference 固定时间戳和 syntax gate 文案断言。
- 当前 README 已覆盖全部动态发现脚本，无需修改 README 正文。
- 已通过 `npm --prefix tests run test:unit -- marketplace-scripts.test.js`、`npm run test:marketplace` 和 `git diff --check`。
- 已提交 `66eb19ab5 Discover README marketplace scripts` 并推送到 `fork/codex/marketplace-wallet-mvp`。
- GitHub run `28766788258` 已确认 Marketplace Wallet Checks 全链路通过：syntax、Jest contract、runtime smoke、hosted Docker smoke、runner Chrome 和 browser E2E 全部 success。

## 2026-07-06 阶段 145：Report resolve 失败恢复 E2E
- 开始处理 Report Queue resolve 失败恢复缺口：已有 E2E 覆盖报告队列加载失败 retry 和 resolve 成功路径，但没有证明 resolve POST 失败时报告仍留在队列且按钮恢复可重试。
- `tests/marketplace-wallet.e2e.js` 的 mock API 新增 `failResolveOnceFor` 和 `holdNextResolveFor`，可模拟第一次 resolve 请求挂起后返回 503。
- 新增 `keeps a report queued and retryable when resolve fails`，覆盖 Resolve 按钮进入 `Resolving` disabled 状态、失败后报告仍显示、按钮恢复、第二次带新 note 重试成功并清空队列。
- 已通过 `node --check tests/marketplace-wallet.e2e.js`、`PLAYWRIGHT_BROWSER_CHANNEL=chrome node scripts/run-marketplace-e2e.mjs -g "keeps a report queued and retryable" --workers=1`、`npm run test:marketplace` 和 `git diff --check`。
- 已提交 `d28d92791 Cover report resolve retry flow` 并推送到 `fork/codex/marketplace-wallet-mvp`。
- GitHub run `28767166009` 已确认 Marketplace Wallet Checks 全链路通过：syntax、Jest contract、runtime smoke、hosted Docker smoke、runner Chrome 和 browser E2E 全部 success。

## 2026-07-06 阶段 146：创建 draft 提前校验 payload 类型
- 开始处理后端 payload 校验时机缺口：`POST /api/market/assets` 之前只校验 `normalized_payload` 是 object 和字节大小，坏 world book 或坏角色卡会先进入私有 draft，直到 PATCH/submit/approve 才暴露。
- `src/endpoints/market.js` 的创建路由现在在写 store 前复用 `validateNormalizedPayload(normalized.value)`，与 revision/submit/approve 的 type-specific 校验保持一致。
- `tests/market-wallet.test.js` 在 create payload shape 契约中新增坏 `world_book` `{}` 和坏 `character_card` payload 的 400 断言，并确认无效创建不会写出 `market-assets.json`。
- 已通过 `npm --prefix tests run test:unit -- market-wallet.test.js --runInBand`、`npm run test:marketplace` 和 `git diff --check`。
- 已提交 `24d9384ce Validate created marketplace payloads` 并推送到 `fork/codex/marketplace-wallet-mvp`。
- GitHub run `28767541664` 已确认 Marketplace Wallet Checks 全链路通过：syntax、Jest contract、runtime smoke、hosted Docker smoke、runner Chrome 和 browser E2E 全部 success。

## 2026-07-06 阶段 147：非管理员市场 UI 门禁 E2E
- 开始处理非管理员 UI 门禁缺口：已有 UI 字符串契约和管理员正向 E2E，但没有真实浏览器证明普通用户看不到 Admin Tools、审核队列和管理按钮。
- `tests/marketplace-wallet.e2e.js` 的 mock API 新增 `currentUser` 覆盖，并在需要时拦截 `/api/settings/get` 将 `enable_accounts` 设为 true；首次只改 `/api/users/me` 失败，确认账号系统关闭时 `isAdmin()` 会默认 true。
- 新增 `hides admin queues and moderation actions from non-admin users`，覆盖普通用户仍可看钱包/市场，但 Admin Tools、Review Queue、Report Queue、Delist、Approve、Reject、Inspect、Resolve 控制不可见。
- 已通过 `PLAYWRIGHT_BROWSER_CHANNEL=chrome node scripts/run-marketplace-e2e.mjs -g "non-admin" --workers=1`、`npm run test:marketplace` 和 `git diff --check`。
- 已提交 `d90626639 Cover non-admin marketplace UI` 并推送到 `fork/codex/marketplace-wallet-mvp`。
- GitHub run `28768143451` 已确认 Marketplace Wallet Checks 全链路通过：syntax、Jest contract、runtime smoke、hosted Docker smoke、runner Chrome 和 browser E2E 全部 success。

## 2026-07-06 阶段 148：Review Queue Inspect 浏览器闭环
- 开始处理审核预览浏览器缺口：Review Queue 已有 Inspect 按钮和 UI contract，但没有真实浏览器覆盖从审核队列拉 detail API 并展示 payload 预览。
- `tests/marketplace-wallet.e2e.js` 新增 `inspects a submitted asset from the review queue`，使用 submitted world_book 资产和 payload lore 内容。
- 用例断言点击 Inspect 后 `apiCalls.details` 收到资产 id，详情弹窗显示 `submitted` 状态、语言和 payload 预览中的 `Review queue payload lore.`。
- 已通过 `node --check tests/marketplace-wallet.e2e.js`、`PLAYWRIGHT_BROWSER_CHANNEL=chrome node scripts/run-marketplace-e2e.mjs -g "inspects a submitted asset" --workers=1`、`npm run test:marketplace` 和 `git diff --check`。
- 已提交 `804de6c30 Cover review queue inspect flow` 并推送到 `fork/codex/marketplace-wallet-mvp`。
- GitHub run `28770300651` 已确认 Marketplace Wallet Checks 全链路通过：syntax、Jest contract、runtime smoke、hosted Docker smoke、runner Chrome 和 browser E2E 全部 success。

## 2026-07-06 阶段 149：Fixed-price 上传草稿浏览器闭环
- 开始处理 fixed-price 上传浏览器缺口：购买固定价资产已有 E2E，但创作者上传表单是否真实提交 `price_type`/`price_coins` 还没有单独浏览器覆盖。
- `tests/marketplace-wallet.e2e.js` 新增 `saves a fixed-price upload draft with coin pricing`，填写 world_book 上传表单、选择 fixed_price、设置 75 coins 并点击 Save Draft。
- 用例断言 create POST body 带 `price_type: fixed_price` 和 `price_coins: 75`、没有 submit 调用、Marketplace 卡片和 Creator Center 都显示 `75 coins`，保存后上传 price controls 回到 free/0。
- 已通过 `node --check tests/marketplace-wallet.e2e.js`、`PLAYWRIGHT_BROWSER_CHANNEL=chrome node scripts/run-marketplace-e2e.mjs -g "fixed-price upload" --workers=1`、`npm run test:marketplace` 和 `git diff --check`。
- 已提交 `0fd1899e0 Cover fixed price upload draft` 并推送到 `fork/codex/marketplace-wallet-mvp`。
- GitHub run `28770714198` 已确认 Marketplace Wallet Checks 全链路通过：syntax、Jest contract、runtime smoke、hosted Docker smoke、runner Chrome 和 browser E2E 全部 success。

## 2026-07-06 阶段 150：钱包赠币 reason 边界
- 开始处理不可变 ledger 审计文本边界：`createLedgerEntry()` 会把 reason 静默截断到 200 字符，admin grant 路由此前没有提前返回错误。
- `src/endpoints/wallet.js` 新增同源 reason 上限常量和 admin grant 显式校验；空白 reason 仍规范为 `Admin grant`，超长 reason 返回 `Invalid grant reason` 且不写 ledger。
- marketplace-wallet 管理员赠币表单新增 `maxlength="200"` 和本地超长 warning，并将扩展/PWA 预缓存版本同步到 `0.2.29`。
- README、设计文档、API reference 生成脚本和 checked-in API reference 已同步记录 admin grant reason 200 字符边界。
- 已通过 `npm run test:marketplace:syntax`、`npm --prefix tests run test:unit -- marketplace-wallet-ui.test.js marketplace-api-reference.test.js pwa.test.js`、`npm --prefix tests run test:unit -- market-wallet.test.js -t "enforces wallet read scope and validates admin grant input" --runInBand`、`npm run test:marketplace` 和 `git diff --check`。
- 已提交 `26ea7928d Validate wallet grant reasons` 并推送到 `fork/codex/marketplace-wallet-mvp`；后续 GitHub run `28772039253` 已在阶段 153 修复 PWA E2E 版本漂移后确认全链路通过。

## 2026-07-06 阶段 151：Demo seed 拒绝文件 dataRoot
- 开始处理 demo seed 防呆缺口：`--dataRoot` 指向普通文件时此前会到 `fs.mkdirSync()` 抛 Node 原生 `EEXIST`，没有明确说明 dataRoot 必须是目录。
- `scripts/seed-marketplace-demo.mjs` 现在在 seed 入口检查已存在路径，普通文件会抛出 `Data root is not a directory:`；不存在的 dataRoot 仍保持自动创建，方便 README 开箱命令。
- `tests/marketplace-demo-seed.test.js` 新增 `rejects a file data root with a clear error`，确认普通文件内容不被改写且不会创建 `market-assets.json`。
- 已通过 `npm run test:marketplace:syntax`、`npm --prefix tests run test:unit -- marketplace-demo-seed.test.js`、`npm run test:marketplace` 和 `git diff --check`。
- 已提交 `5f0791d7b Clarify demo seed data root errors` 并推送到 `fork/codex/marketplace-wallet-mvp`；后续 GitHub run `28772039253` 已在阶段 153 修复 PWA E2E 版本漂移后确认全链路通过。

## 2026-07-06 阶段 152：赠币 reason 前端浏览器拦截
- 开始处理 admin grant reason 的浏览器覆盖缺口：已有 UI contract 锁定 `maxlength`/warning 字符串，但没有真实浏览器证明超长 reason 不会发 POST。
- `tests/marketplace-wallet.e2e.js` 新增 `blocks overlong admin grant reasons before posting`，断言 reason input `maxlength=200`，脚本注入 201 字符 reason 后点击 Grant 不会调用 `/api/wallet/grants/admin`。
- 已通过 `PLAYWRIGHT_BROWSER_CHANNEL=chrome node scripts/run-marketplace-e2e.mjs -g "overlong admin grant" --workers=1`、`npm run test:marketplace:syntax`、`npm run test:marketplace` 和 `git diff --check`。
- 已提交 `d895c4563 Cover grant reason browser validation` 并推送到 `fork/codex/marketplace-wallet-mvp`；后续 GitHub run `28772039253` 已在阶段 153 修复 PWA E2E 版本漂移后确认全链路通过。

## 2026-07-06 阶段 153：PWA E2E 读取 manifest 版本
- GitHub run `28771332053` 暴露 PWA 浏览器 E2E 漂移：service worker 已缓存 marketplace-wallet `0.2.29` 资源，但 `tests/marketplace-wallet.e2e.js` 仍检查硬编码 `0.2.28` 路径，导致缓存断言失败。
- `tests/marketplace-wallet.e2e.js` 现在从 `public/scripts/extensions/marketplace-wallet/manifest.json` 动态读取版本，PWA shell cache 断言会跟随 manifest/service worker 版本。
- 已通过 `PLAYWRIGHT_BROWSER_CHANNEL=chrome node scripts/run-marketplace-e2e.mjs -g "service worker shell cache" --workers=1`、`npm run test:marketplace:syntax`、`npm run test:marketplace`、`PLAYWRIGHT_BROWSER_CHANNEL=chrome npm run test:marketplace:e2e:server -- --workers=1` 和 `git diff --check`。
- 已提交 `d599c4144 Sync PWA E2E shell asset versions` 并推送到 `fork/codex/marketplace-wallet-mvp`。
- GitHub run `28772039253` 已确认 Marketplace Wallet Checks 全链路通过：syntax、Jest contract、runtime smoke、hosted Docker smoke、runner Chrome 和 browser E2E 全部 success。

## 2026-07-06 阶段 154：PWA E2E manifest 版本契约
- 开始补 Stage 153 的防回归护栏：PWA browser E2E 不能再硬编码 marketplace-wallet `0.2.x` 资源版本。
- `tests/marketplace-scripts.test.js` 新增脚本契约，确认 `tests/marketplace-wallet.e2e.js` 从 marketplace-wallet manifest 读取版本，且 PWA shell asset paths 通过 `MARKETPLACE_WALLET_EXTENSION_VERSION` 拼接。
- 按只读 agent 建议补充负向 regex，禁止 browser E2E 源码里出现 marketplace-wallet `index`、`filters` 或 `style.css` 的硬编码 `?v=0.2.x` URL。
- 已通过 `npm --prefix tests run test:unit -- marketplace-scripts.test.js`、`npm run test:marketplace:syntax`、`npm run test:marketplace` 和 `git diff --check`。
- 已提交 `8901dcfc4 Guard PWA E2E asset version sync` 并推送到 `fork/codex/marketplace-wallet-mvp`。
- GitHub run `28772596290` 已确认 Marketplace Wallet Checks 全链路通过：syntax、Jest contract、runtime smoke、hosted Docker smoke、runner Chrome 和 browser E2E 全部 success。

## 2026-07-06 阶段 155：钱包赠币 reason 类型校验
- 开始处理 admin grant reason 类型边界：之前超长字符串已被拒绝，但对象/数组等非字符串值仍会被 `String()` 成审计文本写入不可变 ledger。
- `src/endpoints/wallet.js` 的 admin grant reason 解析现在只接受空值或字符串；非字符串返回 `Invalid grant reason`，详情为 `reason must be a string`。
- `tests/market-wallet.test.js` 在 admin grant 输入契约中新增对象 reason 400 断言，并确认失败请求不会新增 bob 的 ledger。
- API reference 生成脚本、checked-in `docs/marketplace-api-reference.md` 和 `docs/marketplace-currency-design.md` 已同步标注 reason 必须是可选字符串。
- 已通过 `npm --prefix tests run test:unit -- market-wallet.test.js -t "enforces wallet read scope and validates admin grant input" --runInBand`、`npm --prefix tests run test:unit -- marketplace-api-reference.test.js --runInBand`、`npm run test:marketplace:syntax` 和 `npm run test:marketplace`。
- 已提交 `32244421c Validate wallet grant reason type` 并推送到 `fork/codex/marketplace-wallet-mvp`。
- GitHub run `28773200312` 已确认 Marketplace Wallet Checks 全链路通过：syntax、Jest contract、runtime smoke、hosted Docker smoke、runner Chrome 和 browser E2E 全部 success。

## 2026-07-06 阶段 156：Snapshot 导出 symlink 输出防护
- 开始处理只读 agent 指出的 snapshot `--out` symlink 绕过：旧检查只比较字符串路径，外部 symlink 指向 dataRoot 时可能把导出文件写回用户数据根。
- `scripts/export-marketplace-snapshot.mjs` 新增 `resolvePossiblyMissingPath()`，在创建输出目录前解析路径中已存在的 symlink 段，并用真实目标路径判断是否落入 dataRoot。
- `tests/marketplace-snapshot-export.test.js` 新增 `rejects output paths that resolve inside the data root through a symlink`，覆盖外部 symlink 加缺失子目录的场景，并确认不会在 dataRoot 下创建该子目录。
- 已通过 `npm --prefix tests run test:unit -- marketplace-snapshot-export.test.js --runInBand`、`node --check scripts/export-marketplace-snapshot.mjs`、`node --check tests/marketplace-snapshot-export.test.js` 和 `npm run test:marketplace`。
- 已提交 `520fb89d1 Reject snapshot exports through data-root symlinks` 并推送到 `fork/codex/marketplace-wallet-mvp`。
- GitHub run `28773350817` 已确认 Marketplace Wallet Checks 全链路通过：syntax、Jest contract、runtime smoke、hosted Docker smoke、runner Chrome 和 browser E2E 全部 success。

## 2026-07-06 阶段 157：管理员读取未知钱包 handle 返回 404
- 开始处理管理员钱包读取误判缺口：`GET /api/wallet?handle=missing` 和 `/api/wallet/ledger?handle=missing` 旧行为返回 200 空余额，容易把 typo 当成真实零余额用户。
- `src/endpoints/wallet.js` 将 `resolveReadableHandle()` 改为异步存在性校验；非管理员读取别人钱包仍先返回 403，管理员读取不存在 handle 返回 `User not found` 404。
- `tests/market-wallet.test.js` 在 wallet scope/input 契约中新增 unknown handle 的 wallet 和 ledger 404 断言。
- API reference 生成脚本、checked-in `docs/marketplace-api-reference.md` 和 `docs/marketplace-currency-design.md` 已同步说明管理员读取未知 handle 返回 404。
- 已通过 `npm --prefix tests run test:unit -- market-wallet.test.js -t "enforces wallet read scope and validates admin grant input" --runInBand`、`npm --prefix tests run test:unit -- marketplace-api-reference.test.js --runInBand`、`npm run test:marketplace:syntax` 和 `npm run test:marketplace`。
- 已提交 `d911d5924 Return 404 for unknown wallet handles` 并推送到 `fork/codex/marketplace-wallet-mvp`。
- GitHub run `28773505441` 在 runtime smoke 的 `/api/wallet/ledger creator earnings` 失败，因为 demo creator `smoke-creator` 有 marketplace 资产和 earnings ledger，但没有临时账号记录，新的 wallet handle 404 正确暴露了 smoke fixture 不完整。
- `scripts/smoke-marketplace-runtime.mjs` 现在在临时 data root 的 `_storage` 中 seed `default-user` 和 `smoke-creator` 账号，再启动 server；已通过 `npm run test:marketplace:smoke` 和 `npm run test:marketplace:syntax`。
- 已提交 `cc4c9622d Seed smoke creator wallet account` 并推送到 `fork/codex/marketplace-wallet-mvp`，用于恢复 Stage 157 的 runtime smoke。
- GitHub run `28773715810` 已确认 Marketplace Wallet Checks 全链路通过：syntax、Jest contract、runtime smoke、hosted Docker smoke、runner Chrome 和 browser E2E 全部 success。

## 2026-07-06 阶段 158：World book 安装写回 fallback name
- 开始处理 world book 安装细节缺口：合法 world book payload 只要求 `entries`，旧安装逻辑会用资产标题生成文件名，但落盘 JSON 仍可能没有 `name`。
- `src/endpoints/market.js` 的 `installWorldBookAsset()` 现在在计算 fallback 安装名后写回 `world.name`，保持文件名和 JSON 显示名称一致。
- `tests/market-wallet.test.js` 的 world book 安装用例改为上传无 `name` 的 payload，并读取落盘 JSON 断言 `name` 为资产标题 `Market World`。
- 已通过 `npm --prefix tests run test:unit -- market-wallet.test.js -t "installs approved world books" --runInBand`、`npm run test:marketplace:syntax` 和 `npm run test:marketplace`。
- 已提交 `c64e3dec1 Write fallback world book names on install` 并推送到 `fork/codex/marketplace-wallet-mvp`；GitHub run `28773776733` 已触发并处于执行中。
- GitHub run `28773776733` 已确认 Marketplace Wallet Checks 全链路通过：syntax、Jest contract、runtime smoke、hosted Docker smoke、runner Chrome 和 browser E2E 全部 success。

## 2026-07-06 阶段 159：工具栏刷新失败恢复 E2E
- 开始处理前端只读 agent 建议的 toolbar refresh 覆盖缺口：已有错误面板 Retry 浏览器测试，但顶部 `#marketplace_wallet_refresh` 的失败后恢复路径没有真实点击覆盖。
- `tests/marketplace-wallet.e2e.js` 新增 `refreshes marketplace from the toolbar after a failed load`，使用 `failAssetListOnce` 让首个资产列表请求返回 500。
- 用例断言初始错误文案和后端错误摘要可见，点击 toolbar refresh 后 `Toolbar Recoverable World` 出现、错误文案消失、钱包总额仍为 `175`。
- 已通过 `PLAYWRIGHT_BROWSER_CHANNEL=chrome node scripts/run-marketplace-e2e.mjs -g "refreshes marketplace from the toolbar" --workers=1`、`node --check tests/marketplace-wallet.e2e.js` 和 `npm run test:marketplace`。
- 已提交 `1dea45060 Cover marketplace toolbar refresh recovery` 并推送到 `fork/codex/marketplace-wallet-mvp`；GitHub run `28773905694` 已触发并处于执行中。
- GitHub run `28773905694` 已确认 Marketplace Wallet Checks 全链路通过：syntax、Jest contract、runtime smoke、hosted Docker smoke、runner Chrome 和 browser E2E 全部 success。

## 2026-07-06 阶段 160：PWA 安装提示关闭浏览器覆盖
- 开始处理 PWA install prompt dismiss 覆盖缺口：已有浏览器测试覆盖 install click 和 `appinstalled` 移除提示，但没有验证关闭按钮不会触发原生安装 prompt。
- `tests/marketplace-wallet.e2e.js` 新增 `dismisses the browser install action`，在 `/login.html` 模拟 `beforeinstallprompt` 后点击 `aria-label="Dismiss install prompt"`。
- 用例断言 `#pwa_install_prompt` 从 DOM 移除，且 mock 的 `prompt()` 没有被调用。
- 已通过 `PLAYWRIGHT_BROWSER_CHANNEL=chrome node scripts/run-marketplace-e2e.mjs -g "dismisses the browser install action" --workers=1`、`node --check tests/marketplace-wallet.e2e.js` 和 `npm run test:marketplace`。

## 2026-07-06 阶段 161：市场 access/sort DOM 接线 E2E
- 开始处理前端只读 agent 建议的筛选排序 DOM 接线缺口：`filterAndSortAssets()` 已有纯函数测试，但浏览器中 access/sort select 的 change 事件和卡片顺序缺少覆盖。
- `tests/marketplace-wallet.e2e.js` 新增 `applies marketplace access filters and sort controls in the DOM`，构造 available、library、mine 三类资产。
- 用例依次断言 available 只显示未拥有/未授权 listed 资产、`price_desc` 下高价卡片在前、library 只显示已授权资产、mine 只显示当前用户资产。
- 已通过 `PLAYWRIGHT_BROWSER_CHANNEL=chrome node scripts/run-marketplace-e2e.mjs -g "access filters and sort" --workers=1`、`node --check tests/marketplace-wallet.e2e.js` 和 `npm run test:marketplace`。

## 2026-07-06 阶段 162：PWA standalone 模式隐藏安装提示
- 开始处理 PWA standalone 浏览器覆盖缺口：单元测试已检查 `matchMedia('(display-mode: standalone)')` 和 `navigator.standalone` 字符串，但没有真实页面证明 standalone 模式会压制 install prompt。
- `tests/marketplace-wallet.e2e.js` 新增 `hides the browser install action in standalone display mode`，在 page init 阶段 mock standalone media query 为 true。
- 用例在 `/login.html` 派发 `beforeinstallprompt` 后断言 `#pwa_install_prompt` 不出现，并确认 mock `prompt()` 未被调用。
- 已通过 `PLAYWRIGHT_BROWSER_CHANNEL=chrome node scripts/run-marketplace-e2e.mjs -g "standalone display mode" --workers=1`、`node --check tests/marketplace-wallet.e2e.js` 和 `npm run test:marketplace`。

## 五问重启检查
| 问题 | 答案 |
|------|------|
| 我在哪里？ | 已完成市场/钱包后端、前端、管理员入口、基础脚本、Creator Center summary、PWA 安装壳、市场下架闭环、举报处理队列、审核预览、创作者修订重提、用户资产库、托管健康检查、资产详情弹窗、市场筛选排序、marketplace 语法门禁、PWA 缓存清单完整性检查、设计文档 MVP/API 边界校准、运行态 smoke 脚本、筛选排序可执行测试、Report Queue resolve 前端覆盖、GitHub Actions 门禁、fork CI 凭证噪音修复、真实 Chrome E2E UI 状态修复、市场/钱包只读快照导出脚本、购买响应隐私收紧、固定价购买 runtime smoke 闭环、固定价购买浏览器 E2E、Creator 上传到审核队列浏览器闭环、Creator 上传审核 runtime smoke 闭环、Creator/Admin 角色隔离后端契约、Rejected 资产修订重提浏览器闭环、举报处理 runtime smoke 闭环、Marketplace API reference 导出脚本、PWA service worker 浏览器 E2E、Marketplace 慢速全闭环脚本、创作者上传 tags 与 JSON 类型识别、举报详情正文前端闭环、粘贴 JSON 自动识别上传类型、余额不足购买提示、市场筛选无结果清空入口、托管 Docker smoke、E2E wrapper 清理兜底、Library 安装忙碌态同步、PWA filters 版本化预缓存、README syntax gate 文案同步、Creator Center 直接操作入口、marketplace 共享依赖 CI path filter 和 README API reference 固定时间戳生成命令 |
| 我要去哪里？ | 下一步继续数据库迁移、真实支付、搜索审核和原生移动封装 |
| 目标是什么？ | 让托管版 AI 酒馆支持用户上传、购买和安装角色卡/世界书等资产 |
| 我学到了什么？ | 见 findings.md |
| 我做了什么？ | 创建规划文件、设计文档、后端 MVP、前端 marketplace-wallet 扩展、管理员审核/赠币入口、Creator Center、PWA 安装壳、市场下架闭环、举报处理闭环、审核预览、创作者修订闭环、用户资产库、托管健康检查、资产详情弹窗、市场筛选排序、README、基础测试脚本、PWA 缓存完整性测试、文档边界校准、运行态 smoke 脚本、筛选排序可执行测试、Report Queue resolve 前端覆盖、GitHub Actions 门禁、fork CI 凭证噪音修复、真实 Chrome E2E UI 状态修复、marketplace/wallet 快照导出脚本、购买响应隐私收紧、固定价购买 runtime smoke 闭环、固定价购买浏览器 E2E、Creator 上传到审核队列浏览器闭环、Creator 上传审核 runtime smoke 闭环、Creator/Admin 角色隔离后端契约、Rejected 资产修订重提浏览器闭环、举报处理 runtime smoke 闭环、Marketplace API reference 导出脚本、PWA service worker 浏览器 E2E、Marketplace 慢速全闭环脚本、创作者上传 tags/JSON 类型识别、举报详情正文前端闭环、粘贴 JSON 自动识别上传类型、余额不足购买提示、市场筛选无结果清空入口、Docker 容器业务读路由 smoke、E2E wrapper 失败清理修正、Library 安装忙碌态同步、PWA filters 版本化预缓存、Creator Center 直接操作入口、marketplace 共享依赖 CI path filter 和 README API reference 固定时间戳生成命令 |

---
*每个阶段完成后或遇到错误时更新此文件*
