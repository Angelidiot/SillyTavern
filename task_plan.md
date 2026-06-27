# 任务计划：AI 酒馆市场与货币系统设计

## 目标
为托管版 AI 酒馆设计可落地的市场、货币、UGC 上传、创作者收益与审核安全系统，并形成后续开发可引用的设计文档。

## 当前阶段
阶段 120

## 各阶段

### 阶段 1：需求与发现
- [x] 理解用户意图：网页版/手机版 AI 酒馆，用户免部署即可使用
- [x] 确定新增需求：市场功能、货币系统、用户上传角色卡和世界书
- [x] 识别 SillyTavern 现有内容结构
- [x] 将发现记录到 findings.md
- **状态：** complete

### 阶段 2：产品与系统边界
- [x] 定义市场资产类型和用户流程
- [x] 定义货币、钱包、账本和创作者收益边界
- [x] 记录关键决策及理由
- **状态：** complete

### 阶段 3：技术设计
- [x] 设计数据库核心实体
- [x] 设计 API 模块边界
- [x] 设计上传、审核、购买、安装到酒馆的核心流程
- **状态：** complete

### 阶段 4：验证与风险
- [x] 检查和现有 SillyTavern 内容导入机制的贴合点
- [x] 记录移动端支付、UGC 安全、AGPL 等风险
- **状态：** complete

### 阶段 5：交付
- [x] 创建 docs/marketplace-currency-design.md
- [x] 检查输出文件
- [x] 交付给用户
- **状态：** complete

### 阶段 6：多 Agent 并发开发
- [x] 启动并发 agent 分工
- [x] 集成市场资产后端骨架
- [x] 集成钱包账本 MVP
- [x] 集成市场资产安装适配
- [x] 补充最小测试或静态验证
- [x] 更新开发进度和风险记录
- **状态：** complete

### 阶段 7：验证与交付
- [x] 运行 lint 或目标测试
- [x] 检查路由注册和导入错误
- [x] 汇总完成内容、限制和下一步
- **状态：** complete

### 阶段 8：正式测试与 GitHub 同步
- [x] 修复 Jest 环境下默认头像路径解析
- [x] 修复 node-persist 测试清理兼容性
- [x] 修复 listed 资产详情 payload 泄漏
- [x] 修复钱包 admin grant 空 body 500
- [x] 修复测试配置路径依赖本地 `config.yaml`
- [x] 补充审核权限、授权记录、安装记录和钱包 ledger 断言
- [x] 运行 marketplace/wallet 目标单测
- [x] 运行 endpoint 语法检查和 diff 空白检查
- [x] 创建开发分支并提交
- [x] 推送到 GitHub fork 仓库
- **状态：** complete

### 阶段 9：固定价格购买闭环
- [x] 扩展钱包 helper，支持余额查询、扣款规划、管理员赠币复用和市场购买结算
- [x] 支持 `fixed_price` 市场资产创建、提交、购买和 entitlement 记录
- [x] 购买时按 `bonus -> paid` 扣款，并给创作者写入 `earnings`
- [x] 对同一资产和用户增加购买幂等与同进程串行化保护
- [x] 补充余额不足、免费领取不写账、重复购买、创作者收益和价格校验测试
- [x] 提交并推送到 GitHub fork
- **状态：** complete

### 阶段 10：前端市场与钱包入口
- [x] 使用多 agent 并发复核前端挂载点和 API 契约
- [x] 新增内置扩展 `marketplace-wallet`，挂载到 Extensions 面板
- [x] 展示钱包总额、bonus/paid/earnings 分桶和市场资产列表
- [x] 支持搜索、类型过滤、购买/领取并安装、创作者安装和草稿提交审核
- [x] 支持上传/粘贴 JSON payload 创建角色卡或世界书市场草稿
- [x] 增加本地 payload 形状校验、固定价格校验和按钮忙碌态
- [x] 运行目标语法检查、空白检查和市场/钱包单测
- [x] 提交并推送到 GitHub fork
- **状态：** complete

### 阶段 11：管理员审核与赠币入口
- [x] 使用并发 agent 复核 admin UI、审核队列和移动端风险
- [x] 新增管理员面板，支持 Review Queue 审核入口和 admin grant 表单
- [x] 管理员可在审核队列中批准或拒绝 submitted 资产
- [x] 管理员可按用户 handle 发放 bonus/paid/earnings 余额
- [x] 将 admin 可见性收紧到 `isAdmin()`，避免仅靠 handle 推断权限
- [x] 增加扩展 manifest 版本化入口，避免前端模块缓存旧脚本
- [x] 补充 grant bucket/reason 本地校验和移动端 review 按钮布局
- [x] 运行目标语法检查、manifest JSON 检查、空白检查、市场/钱包单测和浏览器 smoke
- [x] 提交并推送到 GitHub fork
- **状态：** complete

### 阶段 12：仓库交付闭环与基础测试
- [x] 明确持续目标：代码、README、基础测试和可运行脚本形成可交付闭环
- [x] 新增 marketplace-wallet Playwright E2E 测试，覆盖 admin queue、grant POST 和移动布局
- [x] 新增 marketplace-wallet Jest 前端契约测试，覆盖 manifest、模板、admin gate、grant 校验和移动 CSS
- [x] 新增根目录测试脚本 `test:marketplace` 和 `test:marketplace:e2e`
- [x] 扩展 README，写明市场钱包功能、安装启动、测试命令和生产化边界
- [x] 运行基础测试和可运行脚本验证
- [x] 提交并推送到 GitHub fork
- **状态：** complete

### 阶段 13：创作者中心与收益概览
- [x] 使用多 agent 并发复核 creator API 和前端入口边界
- [x] 新增创作者资产/收益 API，返回我的上传资产、统计和 earnings 余额
- [x] 在 marketplace-wallet 扩展增加 Creator 面板，展示上传数、上架数、claims、安装数和 earned coins
- [x] 将 creator summary 设为前端降级加载，避免附属请求阻断钱包和市场列表
- [x] 补充创作者中心单测和前端契约测试
- [x] 更新 README、设计文档和规划记录
- [x] 运行基础测试和脚本验证
- [x] 提交并推送到 GitHub fork
- **状态：** complete

### 阶段 14：网页版/手机版 PWA 安装壳
- [x] 复用现有 web manifest 和移动 meta，不引入原生 App 壳
- [x] 补充 manifest `id`、`scope` 和描述，满足安装型 PWA 基础元数据
- [x] 在主页面和登录页注册 service worker
- [x] 新增保守静态 shell service worker，只缓存静态壳，跳过 `/api/*` 和非 GET 请求
- [x] 新增 PWA 契约测试和根目录 `test:pwa` 脚本
- [x] 将 PWA 测试纳入 `test:marketplace`
- [x] 更新 README 和规划记录
- [x] 运行基础测试和脚本验证
- [x] 提交并推送到 GitHub fork
- **状态：** complete

### 阶段 15：市场资产下架闭环
- [x] 确认 delist 是当前市场生命周期里最小且无需产品拍板的缺口
- [x] 新增管理员下架 listed 资产 API
- [x] 保持已授权用户可继续查看和安装下架资产
- [x] 在 marketplace-wallet 增加管理员 Delist 操作
- [x] 补充后端和前端契约测试
- [x] 更新 README、设计文档和规划记录
- [x] 运行基础测试和脚本验证
- [x] 提交并推送到 GitHub fork
- **状态：** complete

### 阶段 16：市场资产举报入口
- [x] 确认 report 是 UGC 安全里无需产品拍板的最小补齐项
- [x] 新增用户举报 listed/owned/entitled 资产 API
- [x] 在 marketplace-wallet 增加 Report 操作
- [x] 补充后端和前端契约测试
- [x] 更新 README、设计文档和规划记录
- [x] 运行基础测试和脚本验证
- [x] 提交并推送到 GitHub fork
- **状态：** complete

### 阶段 17：管理员举报处理队列
- [x] 确认 report queue + resolve 是举报入口后的最小管理闭环
- [x] 新增管理员 open report 队列 API
- [x] 新增管理员 resolve report API
- [x] 在 marketplace-wallet 管理员面板增加 Report Queue
- [x] 将 report resolve 使用独立 busy/report action 状态，避免和资产操作混淆
- [x] 补充后端和前端契约测试
- [x] 更新 README、设计文档和规划记录
- [x] 运行基础测试和脚本验证
- [x] 提交并推送到 GitHub fork
- **状态：** complete

### 阶段 18：管理员审核内容预览
- [x] 确认审核队列不能盲批，需要最小 Inspect 入口
- [x] 复用管理员资产详情权限，不新增后端路由
- [x] 在 Review Queue 增加 Inspect 操作
- [x] 使用安全 DOM + TEXT popup 展示资产摘要和 JSON payload
- [x] 补充管理员可读取 payload 的后端断言和前端契约测试
- [x] 更新 README 和规划记录
- [x] 运行基础测试和脚本验证
- [x] 提交并推送到 GitHub fork
- **状态：** complete

### 阶段 19：创作者修订与重新提交
- [x] 确认 rejected 资产需要修改后重提，不能只显示拒绝原因
- [x] 新增创作者 PATCH draft/rejected asset API
- [x] PATCH 后统一回到 draft/private，并清理旧 review 状态
- [x] 禁止 submitted/listed/delisted 原地修改，避免 live payload 静默变化
- [x] 在 marketplace-wallet 增加 Revise 编辑态，复用上传表单和取消按钮
- [x] 补充后端和前端契约测试
- [x] 更新 README、设计文档和规划记录
- [x] 运行基础测试和脚本验证
- [x] 提交并推送到 GitHub fork
- **状态：** complete

### 阶段 20：用户资产库
- [x] 确认购买/领取后需要 My Library 视图，避免资产只能从市场列表找回
- [x] 新增 `GET /api/market/library`，返回当前用户 active entitlements
- [x] Library 只返回资产摘要、授权来源和安装摘要，不返回 payload、ledger 明细或绝对路径
- [x] 已下架但仍授权的资产保留在 Library，可继续安装
- [x] 在 marketplace-wallet 增加 My Library 面板和 Install 操作
- [x] Library 后台降级加载，不阻塞钱包和市场主列表
- [x] 安装成功后后台刷新 Library 安装计数
- [x] 补充后端和前端契约测试
- [x] 更新 README、设计文档和规划记录
- [x] 运行基础测试和脚本验证
- [x] 提交并推送到 GitHub fork
- **状态：** complete

### 阶段 21：托管健康检查
- [x] 确认托管 Web/PWA 需要无需登录的轻量探活端点
- [x] 新增 `GET /api/health`
- [x] Health 响应只返回服务状态、版本、uptime 和时间戳，不返回用户或业务数据
- [x] 将 health 契约测试纳入 `test:marketplace`
- [x] 更新 README、设计文档和规划记录
- [x] 运行基础测试和脚本验证
- [x] 提交并推送到 GitHub fork
- **状态：** complete

### 阶段 22：资产详情弹窗
- [x] 确认购买前和 Library 中需要轻量详情查看入口
- [x] 复用 `GET /api/market/assets/:id`，不新增后端路由
- [x] marketplace 和 Library 条目增加 Details 操作
- [x] Review Queue 的 Inspect 复用同一详情弹窗
- [x] 未授权详情只显示元数据，不显示空 payload 误导用户
- [x] 补充前端契约测试和文档
- [x] 更新规划记录
- [x] 运行基础测试和脚本验证
- [x] 提交并推送到 GitHub fork
- **状态：** complete

### 阶段 23：市场浏览筛选与排序
- [x] 确认市场列表需要更实用的前端浏览控制
- [x] 新增价格筛选
- [x] 新增访问状态筛选：可获取、已入库、我的上传
- [x] 新增排序：最新、热门、价格低到高、价格高到低
- [x] 保持当前 MVP 为客户端筛选排序，不引入后端搜索索引
- [x] 补充前端契约测试和文档
- [x] 更新规划记录
- [x] 运行基础测试和脚本验证
- [x] 提交并推送到 GitHub fork
- **状态：** complete

### 阶段 24：市场基础脚本语法门禁
- [x] 确认根目录需要更稳定的一键验证脚本
- [x] 新增 `scripts/check-marketplace-syntax.mjs`
- [x] 覆盖 market/wallet/PWA/health 相关服务端、前端和测试文件的 `node --check`
- [x] 新增 `npm run test:marketplace:syntax`
- [x] 让 `npm run test:marketplace` 先运行语法门禁再运行 Jest 契约测试
- [x] 更新 README 和规划记录
- [x] 运行基础测试和脚本验证
- [x] 提交并推送到 GitHub fork
- **状态：** complete

### 阶段 25：PWA 缓存清单完整性
- [x] 确认 mobile/PWA 安装壳需要验证 service worker 预缓存路径
- [x] 扩展 `tests/pwa.test.js`，解析 `SHELL_ASSETS`
- [x] 断言每个预缓存资源都存在于 `public/`
- [x] 保持 `/` 映射到 `public/index.html`
- [x] 运行基础测试和脚本验证
- [x] 提交并推送到 GitHub fork
- **状态：** complete

### 阶段 26：设计文档 MVP/API 边界校准
- [x] 对照当前 market/wallet/health 实现梳理已实现 API
- [x] 将当前本地 MVP API 与 Future SaaS API 拆分
- [x] 将 preset_pack、asset_pack、版本、评论、充值、退款、独立 Creator/Admin API 标为后续
- [x] 说明当前上传端点接收规范化 JSON payload，不做 multipart 文件解析
- [x] 校准角色能力中的当前能力与 Future SaaS 能力
- [x] 运行文档和基础验证
- [x] 提交并推送到 GitHub fork
- **状态：** complete

### 阶段 27：托管运行态 Smoke 脚本
- [x] 确认需要从根目录验证真实 server 可启动
- [x] 新增 `scripts/smoke-marketplace-runtime.mjs`
- [x] 使用临时 `configPath` 和 `dataRoot`，避免触碰本地用户数据
- [x] 自动分配本地端口并只启用 IPv4 localhost
- [x] 校验 `/api/health`、`/manifest.json`、`/service-worker.js`
- [x] 新增 `npm run test:marketplace:smoke`
- [x] 将 smoke 脚本纳入 `test:marketplace:syntax`
- [x] 运行基础测试和脚本验证
- [x] 提交并推送到 GitHub fork
- **状态：** complete

### 阶段 28：市场筛选排序可执行测试
- [x] 确认当前筛选排序测试过于依赖源码字符串
- [x] 抽出 `filterAndSortAssets()` 纯函数
- [x] 前端 `index.js` 继续从 DOM 收集筛选条件并调用纯函数
- [x] 新增 Jest 测试覆盖类型、价格、访问状态、搜索、排序和不变性
- [x] 将新文件纳入 syntax gate 和 `npm run test:marketplace`
- [x] 提升扩展 manifest 版本，避免旧模块缓存
- [x] 运行基础测试和脚本验证
- [x] 提交并推送到 GitHub fork
- **状态：** complete

### 阶段 29：Report Queue Resolve 前端覆盖
- [x] 确认 Report Queue 后端已有测试，前端缺少 resolve 流程覆盖
- [x] 扩展 Playwright mock，支持 reports/admin 和 reports/:id/resolve
- [x] 新增浏览器级 Report Queue resolve 用例
- [x] 前端契约测试锁定 resolve 后本地移除 report
- [x] 运行基础测试和脚本验证
- [x] 提交并推送到 GitHub fork
- **状态：** complete

### 阶段 30：Marketplace Wallet GitHub Actions 门禁
- [x] 确认当前本地脚本已覆盖 syntax、Jest、runtime smoke 和 E2E discovery
- [x] 新增 marketplace-wallet 专用 workflow
- [x] PR 仅在 marketplace/wallet/PWA/health 相关路径变更时触发
- [x] 当前 MVP 分支 push 时触发
- [x] workflow 安装 root/tests 依赖并运行 marketplace 脚本闭环
- [x] 运行 workflow 语法和基础验证
- [x] 提交并推送到 GitHub fork
- **状态：** complete

### 阶段 31：Fork CI 凭证噪音修复
- [x] 确认 `Marketplace Wallet Checks` 已在 GitHub fork 上通过
- [x] 定位 fork 上失败的是既有 merge-conflict bot workflow
- [x] 确认失败原因是 fork 缺少官方 `ST_BOT_APP_ID`/private key 凭证
- [x] 将 merge-conflict bot job 限制为官方仓库运行
- [x] 运行 workflow 语法和基础验证
- [x] 提交并推送到 GitHub fork
- **状态：** complete

### 阶段 32：Marketplace Demo Seed 脚本
- [x] 确认本地新市场首屏需要可体验示例资产
- [x] 新增 `scripts/seed-marketplace-demo.mjs`
- [x] 要求显式 `--dataRoot`，避免默认污染用户数据
- [x] 写入一张免费角色卡和一本文付费世界书
- [x] 保持脚本幂等，二次运行 upsert 不重复创建
- [x] 新增 Jest 测试覆盖 seed 输出、store 结构和状态保留
- [x] 将 seed 脚本纳入 README、syntax gate、`test:marketplace` 和 CI path filter
- [x] 运行基础测试和脚本验证
- [x] 提交并推送到 GitHub fork
- **状态：** complete

### 阶段 33：Runtime Smoke 与 CI 收尾补强
- [x] 使用并行审查代理检查交付闭环缺口
- [x] 扩展 runtime smoke，真实访问 `/api/wallet`
- [x] 扩展 runtime smoke，预置并读取 `/api/market/assets`
- [x] 补齐 marketplace workflow path filter 中的 PWA/E2E 依赖文件
- [x] 补充 README E2E 运行前置条件
- [x] 补充 mocked E2E buyer 主路径，覆盖 free asset claim/install 后进入 Library
- [x] 将 marketplace E2E 文件纳入 syntax gate
- [x] 运行基础测试和脚本验证
- [x] 提交并推送到 GitHub fork
- **状态：** complete

### 阶段 34：真实浏览器 E2E CI 闭环
- [x] 新增临时 server E2E wrapper `scripts/run-marketplace-e2e.mjs`
- [x] Playwright config 支持 `PLAYWRIGHT_BASE_URL`
- [x] 新增根脚本 `test:marketplace:e2e:server`
- [x] 将 wrapper 和 Playwright config 纳入 syntax gate
- [x] CI 安装 `chromium-headless-shell`
- [x] CI 从 E2E discovery 升级为真实运行 marketplace browser E2E
- [x] 运行基础测试和脚本验证
- [x] 提交并推送到 GitHub fork
- **状态：** complete

### 阶段 35：Playwright CI 安装策略修复
- [x] 确认 GitHub runner 卡在 `chromium-headless-shell` 安装步骤
- [x] 将 Playwright 配置切到 `channel: chromium`
- [x] 将 CI 安装命令切到 `playwright install --with-deps --no-shell chromium`
- [x] 更新 README 的本地浏览器安装说明
- [x] 运行基础测试和脚本验证
- [x] 提交并推送到 GitHub fork
- **状态：** complete

### 阶段 36：CI 使用 Runner Chrome 跑 E2E
- [x] 确认 `--no-shell chromium` 在 GitHub runner 上仍停留在浏览器安装步骤
- [x] Playwright config 支持 `PLAYWRIGHT_BROWSER_CHANNEL`
- [x] workflow 改为验证并使用 runner 自带 Chrome
- [x] 删除 CI 中 Playwright 浏览器下载步骤
- [x] 更新 README，说明可用 `PLAYWRIGHT_BROWSER_CHANNEL=chrome`
- [x] 运行基础测试和脚本验证
- [x] 提交并推送到 GitHub fork
- **状态：** complete

### 阶段 37：真实浏览器 E2E UI 状态修复
- [x] 定位 Runner Chrome E2E 已进入真实浏览器，但失败在隐藏抽屉、admin 可见性和首启 onboarding 状态
- [x] 在 E2E 夹具中 mock admin 当前用户，避免账号配置漂移
- [x] 在 E2E helper 中处理首次启动 onboarding 弹窗
- [x] 在 E2E helper 中打开外层 Extensions drawer，再展开 Marketplace Wallet inline drawer
- [x] 等待钱包总额渲染完成，避免只等 DOM attached 的竞态
- [x] 运行 syntax、marketplace Jest 契约、E2E discovery 和本机 Chrome 单 worker 实跑
- [x] 提交并推送到 GitHub fork
- [x] 等待 GitHub Actions 真实 Chrome E2E 通过
- **状态：** complete

### 阶段 38：钱包流水 UI 与真实运行闭环
- [x] 使用多 agent 并发审查下一步交付缺口
- [x] 在 marketplace-wallet UI 展示最近钱包流水
- [x] 从 `/api/wallet/ledger` 降级加载账本，不阻断市场主列表
- [x] 扩展 runtime smoke，覆盖免费领取、安装、Library 可见和文件落盘
- [x] 补充固定价购买并发幂等回归测试
- [x] 更新 README、设计文档、规划记录
- [x] 运行基础测试、smoke 和 CI 相关验证
- [x] 提交并推送到 GitHub fork
- **状态：** complete

### 阶段 39：权限坏输入与验证入口补强
- [x] 使用多 agent 并发补强测试和 CI/README 验证说明
- [x] 补充 wallet/market 权限与坏输入基础测试
- [x] 增加 marketplace workflow 手动触发或更通用分支触发
- [x] 增加 README 本地验证矩阵
- [x] 运行基础测试、workflow 解析和 diff 检查
- [x] 提交并推送到 GitHub fork
- **状态：** complete

### 阶段 40：市场与钱包导出快照脚本
- [x] 使用多 agent 并发审查导出边界
- [x] 新增只读 marketplace/wallet 导出脚本
- [x] 支持显式 `--dataRoot`、stdout 和 `--out` 文件输出
- [x] 导出 market store 摘要和 wallet ledger，避免修改用户数据
- [x] 补充脚本测试、README 和设计文档说明
- [x] 将脚本纳入 syntax gate 和 marketplace 聚合测试
- [x] 运行基础测试和 smoke 验证
- [x] 提交并推送到 GitHub fork
- **状态：** complete

### 阶段 41：购买响应隐私收紧
- [x] 使用多 agent 并发审查下一阶段交付缺口
- [x] 将 paid purchase API 响应改为买家可见摘要
- [x] 不在购买响应中返回创作者余额或完整 ledger entries
- [x] 保留 entitlement 内部 ledger ids 和买家余额摘要
- [x] 补充后端契约测试和 README/设计文档说明
- [x] 运行基础测试和 smoke 验证
- [x] 提交并推送到 GitHub fork
- **状态：** complete

### 阶段 42：付费购买 runtime smoke 闭环
- [x] 按并发审查建议补齐真实 server 固定价购买 smoke
- [x] 在 runtime smoke 临时 market store 中加入 fixed_price 资产
- [x] 通过真实 admin grant 给默认用户 paid 余额
- [x] 验证 paid purchase 响应隐私 shape、买家扣款和创作者收益账本
- [x] 验证付费资产可安装、Library 可见和文件落盘
- [x] 更新 README、设计文档和规划记录
- [x] 运行 syntax、marketplace 聚合和 runtime smoke
- [x] 提交并推送到 GitHub fork
- **状态：** complete

### 阶段 43：浏览器固定价购买与钱包活动 E2E
- [x] 按并发审查建议补齐 fixed-price Buy & Install 浏览器路径
- [x] 让 Playwright mock 维护钱包余额、ledger、library 状态
- [x] 断言购买后 paid 余额刷新、Wallet Activity 出现 Purchase
- [x] 断言 Library 安装数刷新且购买响应不依赖完整 ledger entries
- [x] 更新 README/规划记录
- [x] 运行 syntax、marketplace 聚合和浏览器 E2E
- [x] 提交并推送到 GitHub fork
- **状态：** complete

### 阶段 44：Creator 上传到审核队列浏览器闭环
- [x] 按并发审查建议补齐上传表单浏览器路径
- [x] 让 Playwright mock 支持创建 asset 和 submit 状态流转
- [x] 覆盖 world_book JSON Save & Submit 后进入 Review Queue
- [x] 覆盖 Creator Center 资产统计/列表刷新
- [x] 更新 README/规划记录
- [x] 运行 syntax、marketplace 聚合和浏览器 E2E
- [x] 提交并推送到 GitHub fork
- **状态：** complete

### 阶段 45：Creator 上传审核 runtime smoke 闭环
- [x] 按真实 API 补齐 creator asset create/submit/approve smoke
- [x] 验证真实 server 下 draft、submitted、listed 状态流转
- [x] 验证 Creator Center summary 刷新和 asset detail payload 权限
- [x] 更新 README、设计文档和规划记录
- [x] 运行 syntax、marketplace 聚合和 runtime smoke
- [x] 提交并推送到 GitHub fork
- **状态：** complete

### 阶段 46：Creator/Admin 角色隔离后端契约
- [x] 补充 submitted/private 资产对非拥有者不可见测试
- [x] 补充 owner submitted detail payload 可读测试
- [x] 补充非管理员不可 approve、管理员可 approve 测试
- [x] 运行目标单测、marketplace 聚合和 syntax gate
- [x] 更新规划记录
- [x] 提交并推送到 GitHub fork
- **状态：** complete

### 阶段 47：Rejected 资产修订重提浏览器闭环
- [x] 让 Playwright mock 支持 asset detail 和 PATCH revision
- [x] 覆盖 rejected 资产 Revise 后填充上传表单
- [x] 覆盖 Save & Submit 会 PATCH 后 submit 并刷新 Creator Center/Review Queue
- [x] 运行 E2E discovery、本机 Chrome E2E、marketplace 聚合和 syntax gate
- [x] 更新 README/规划记录
- [x] 提交并推送到 GitHub fork
- **状态：** complete

### 阶段 48：举报处理 runtime smoke 闭环
- [x] 在真实 server smoke 中创建 marketplace report
- [x] 验证管理员 report queue 可读取 open report 且不泄漏 payload
- [x] 验证 resolve report 后队列清空且响应记录 resolved metadata
- [x] 更新 README、设计文档和规划记录
- [x] 运行 runtime smoke、marketplace 聚合和 syntax gate
- [x] 提交并推送到 GitHub fork
- **状态：** complete

### 阶段 49：Marketplace API reference 导出脚本
- [x] 新增只读 API reference 导出脚本
- [x] 从 market/wallet/health 实现中提取当前端点清单
- [x] 支持 stdout 和显式 `--out` 写入 Markdown
- [x] 补充脚本测试、README 和设计文档说明
- [x] 将脚本纳入 syntax gate 和 marketplace 聚合测试
- [x] 运行基础验证并提交推送
- **状态：** complete

### 阶段 50：PWA service worker 浏览器 E2E
- [x] 新增真实浏览器 PWA service worker/cache 用例
- [x] 新增单独 `test:pwa:e2e` 可运行脚本
- [x] 验证 shell cache 注册且 `/api/*` 不被缓存
- [x] 补充 README、设计文档和规划记录
- [x] 运行基础验证并提交推送
- **状态：** complete

### 阶段 51：Marketplace 慢速全闭环脚本
- [x] 新增 `test:marketplace:all` 串行验证脚本
- [x] 补充脚本契约测试并纳入 syntax gate 与 marketplace 聚合
- [x] 补齐 marketplace workflow path filter 中的脚本/导出测试文件
- [x] 更新 README、设计文档和规划记录
- [x] 运行基础验证并提交推送
- **状态：** complete

### 阶段 52：创作者上传 tags 与 JSON 类型识别
- [x] 增加 marketplace-wallet 上传 tags 输入并提交到现有 `tags` API 字段
- [x] 在市场资产卡片展示 tags，并继续支持搜索命中 tags
- [x] Load JSON 时自动识别角色卡或世界书 payload 并设置上传类型
- [x] 补充 UI contract、filters 和浏览器 E2E 覆盖
- [x] 更新 README、设计文档和规划记录
- [x] 运行基础验证并提交推送
- **状态：** complete

### 阶段 53：举报详情正文前端闭环
- [x] 让 marketplace-wallet Report 操作提交 reason 和可选 body
- [x] 在浏览器 E2E mock 中记录 report payload 并验证管理员队列显示 body
- [x] 补充 UI contract、README、设计文档和规划记录
- [x] 运行基础验证并提交推送
- **状态：** complete

### 阶段 54：粘贴 JSON 自动识别上传类型
- [x] 抽出上传 payload 类型/标题提示 helper
- [x] 文件导入和 textarea 粘贴/失焦复用同一识别逻辑
- [x] 补充 UI contract 和浏览器 E2E 覆盖
- [x] 更新 README、设计文档和规划记录
- [x] 运行基础验证并提交推送
- **状态：** complete

### 阶段 55：余额不足购买提示
- [x] 在固定价资产余额不足时显示可见缺口金额
- [x] 保持购买按钮 disabled，不把 earnings 计入可消费余额
- [x] 补充 UI contract、浏览器 E2E 和移动无溢出验证
- [x] 更新 README、设计文档和规划记录
- [x] 运行基础验证并提交推送
- **状态：** complete

### 阶段 56：市场筛选无结果清空入口
- [x] 增加 Clear filters 控件并仅在有激活筛选时显示
- [x] 无结果时支持一键恢复默认筛选和搜索
- [x] 补充 UI contract、浏览器 E2E 和移动无溢出验证
- [x] 更新 README、设计文档和规划记录
- [x] 运行基础验证并提交推送
- **状态：** complete

### 阶段 57：资产详情元数据补齐
- [x] 在 Details 弹窗展示语言、内容分级和生命周期日期
- [x] 使用稳定日期格式，避免浏览器 locale 导致测试漂移
- [x] 补充 UI contract 和浏览器 E2E 覆盖
- [x] 更新 README、设计文档和规划记录
- [x] 运行基础验证并提交推送
- **状态：** complete

### 阶段 58：用户库详情入口补齐
- [x] 修复 My Library 条目缺少 Details 操作的实现漂移
- [x] Library 条目同时提供 Details 和 Install，并保持移动端紧凑布局
- [x] 补充 UI contract 和浏览器 E2E 覆盖
- [x] 更新 README、设计文档和规划记录
- [x] 运行基础验证并提交推送
- **状态：** complete

### 阶段 59：用户库安装摘要补齐
- [x] 在 My Library 展示授权日期和最近安装摘要
- [x] 长本地引用使用可换行文本，保持移动端不溢出
- [x] 补充 UI contract 和浏览器 E2E 覆盖
- [x] 更新 README、设计文档和规划记录
- [x] 运行基础验证并提交推送
- **状态：** complete

### 阶段 60：创作者中心细分统计
- [x] 展示 draft/submitted/rejected/paid sales/total installs/earnings balance
- [x] 保持 Creator Center 统计在移动端自适应换行
- [x] 补充 UI contract 和浏览器 E2E 覆盖
- [x] 更新 README、设计文档和规划记录
- [x] 运行基础验证并提交推送
- **状态：** complete

### 阶段 61：审核队列元信息摘要
- [x] 在 Review Queue 展示创作者、价格、更新时间和标签摘要
- [x] 显示安全摘要片段，仍通过 Inspect 懒加载 payload
- [x] 补充 UI contract 和浏览器 E2E 覆盖
- [x] 更新 README、设计文档和规划记录
- [x] 运行基础验证并提交推送
- **状态：** complete

### 阶段 62：创作者资产审核状态细节
- [x] 在 Creator Center 资产列表展示 submitted/approved 日期
- [x] rejected 资产显示拒绝原因摘要
- [x] 补充 UI contract 和浏览器 E2E 覆盖
- [x] 更新 README、设计文档和规划记录
- [x] 运行基础验证并提交推送
- **状态：** complete

### 阶段 63：详情弹窗授权信息摘要
- [x] 在 Details 弹窗展示当前用户 entitlement 来源
- [x] 展示授权日期和购买引用摘要
- [x] 补充 UI contract 和浏览器 E2E 覆盖
- [x] 更新 README、设计文档和规划记录
- [x] 运行基础验证并提交推送
- **状态：** complete

### 阶段 64：举报队列创建日期摘要
- [x] 在 Report Queue 展示举报创建日期
- [x] 补充 UI contract 和浏览器 E2E 覆盖
- [x] 更新 README、设计文档和规划记录
- [x] 运行基础验证并提交推送
- **状态：** complete

### 阶段 65：市场搜索元数据覆盖
- [x] 市场搜索匹配 language
- [x] 市场搜索匹配 content_rating
- [x] 补充 filters 单测和 UI contract 版本覆盖
- [x] 更新 README、设计文档和规划记录
- [x] 运行基础验证并提交推送
- **状态：** complete

### 阶段 66：快照导出审核生命周期字段
- [x] snapshot asset 白名单包含 submitted_at
- [x] snapshot asset 白名单包含 approved_at
- [x] snapshot asset 白名单包含 delisted_at
- [x] 补充 snapshot export 单测
- [x] 更新 README、设计文档和规划记录
- [x] 运行基础验证并提交推送
- **状态：** complete

### 阶段 67：API reference 路由覆盖锁定
- [x] 增加 market 当前完整 MVP 路由断言
- [x] 增加 wallet ledger 路由断言
- [x] 更新 README、设计文档和规划记录
- [x] 运行基础验证并提交推送
- **状态：** complete

### 阶段 68：详情弹窗下架日期
- [x] Details 弹窗展示 delisted_at
- [x] 未下架资产显示 not delisted
- [x] 补充 UI contract 和浏览器 E2E 覆盖
- [x] 更新 README、设计文档和规划记录
- [x] 运行基础验证并提交推送
- **状态：** complete

### 阶段 69：API reference 权限隐私标注
- [x] 标注 asset detail payload redaction
- [x] 标注 admin-only 队列、审核、下架和赠币路由
- [x] 标注 Library 和 Wallet 读取 scope
- [x] 补充 API reference 单测
- [x] 更新 README、设计文档和规划记录
- [x] 运行基础验证并提交推送
- **状态：** complete

### 阶段 70：市场扩展静态资产门禁
- [x] syntax gate 检查 marketplace-wallet manifest JSON
- [x] syntax gate 检查 marketplace-wallet window HTML
- [x] syntax gate 检查 marketplace-wallet CSS
- [x] 补充脚本契约测试
- [x] 更新 README 和规划记录
- [x] 运行基础验证并提交推送
- **状态：** complete

### 阶段 71：钱包管理员发放别名覆盖
- [x] 后端测试覆盖 `targetHandle` 收款人字段
- [x] 后端测试覆盖 `handle` 收款人字段
- [x] 后端测试覆盖 `userHandle` 收款人字段
- [x] 断言三种别名都会写入同一用户余额分桶和 ledger
- [x] 更新 README 和规划记录
- [x] 运行基础验证并提交推送
- **状态：** complete

### 阶段 72：举报处理备注长度边界
- [x] 后端测试覆盖 1001 字符 resolve note 返回 400
- [x] 后端测试确认超长 note 不会关闭 open report
- [x] 后端测试覆盖 1000 字符 resolve note 成功保存
- [x] 更新 README 和规划记录
- [x] 运行基础验证并提交推送
- **状态：** complete

### 阶段 73：README 可运行脚本同步契约
- [x] 测试确认 README 文档列出 hosted marketplace 关键脚本
- [x] 测试确认 README 文档列出 PWA/mobile 关键脚本
- [x] 测试确认这些脚本都存在于 `package.json`
- [x] 更新 README 和规划记录
- [x] 运行基础验证并提交推送
- **状态：** complete

### 阶段 74：举报提交长度边界
- [x] 后端测试覆盖 121 字符 reason 和 2001 字符 body 返回 400
- [x] 后端测试确认超长 report 不会写入管理员队列
- [x] 后端测试覆盖 120 字符 reason 和 2000 字符 body 成功入队
- [x] 更新 README 和规划记录
- [x] 运行基础验证并提交推送
- **状态：** complete

### 阶段 75：快照举报处理生命周期覆盖
- [x] snapshot export 测试覆盖 open report
- [x] snapshot export 测试覆盖 resolved report 的 `resolved_at`
- [x] snapshot export 测试确认不导出 report body、resolution note 或 resolver
- [x] 更新 README 和规划记录
- [x] 运行基础验证并提交推送
- **状态：** complete

### 阶段 76：API reference 举报边界标注
- [x] API reference 标注 report reason/body 长度边界
- [x] API reference 标注 report resolve note 长度边界
- [x] 补充 API reference 单测断言
- [x] 更新 README 和规划记录
- [x] 运行基础验证并提交推送
- **状态：** complete

### 阶段 77：市场资产 tags 后端边界
- [x] 后端测试覆盖 tags 必须是数组
- [x] 后端测试覆盖 tags 最多 20 个、每个最多 40 字符
- [x] 后端测试覆盖 tags 只能包含字符串
- [x] 后端测试覆盖 trim、空值过滤和去重
- [x] 更新 README 和规划记录
- [x] 运行基础验证并提交推送
- **状态：** complete

### 阶段 78：市场资产文本元数据边界
- [x] 后端测试覆盖 title 120 字符边界
- [x] 后端测试覆盖 summary 500 字符边界
- [x] 后端测试覆盖 description 10000 字符边界
- [x] 后端测试覆盖 language 16 字符和 content_rating 40 字符边界
- [x] 更新 README 和规划记录
- [x] 运行基础验证并提交推送
- **状态：** complete

### 阶段 79：市场资产创建 payload shape
- [x] 后端测试覆盖请求体必须是 JSON object
- [x] 后端测试覆盖 asset type 仅允许 character_card/world_book
- [x] 后端测试覆盖 price_type 仅允许 free/fixed_price
- [x] 后端测试覆盖 metadata 和 normalized_payload 必须是 object
- [x] 更新 README 和规划记录
- [x] 运行基础验证并提交推送
- **状态：** complete

### 阶段 80：API reference 上传边界说明
- [x] API reference note 覆盖 POST asset create body shape
- [x] API reference note 覆盖 PATCH asset revision 复用 create validation
- [x] API reference 测试锁定 upload validation notes
- [x] 更新 README 和规划记录
- [x] 运行基础验证并提交推送
- **状态：** complete

### 阶段 81：API reference 市场生命周期说明
- [x] API reference note 覆盖 submit/approve/reject 审核状态流
- [x] API reference note 覆盖 purchase 钱包消费顺序和响应隐私
- [x] API reference note 覆盖 install 本地引用脱敏
- [x] API reference 测试锁定 lifecycle notes
- [x] 更新 README 和规划记录
- [x] 运行基础验证并提交推送
- **状态：** complete

### 阶段 82：API reference 读接口隐私说明
- [x] API reference note 覆盖 market list 不返回 payload
- [x] API reference note 覆盖 creator summary 不返回 wallet/recent earnings/payload
- [x] API reference 测试锁定 read privacy notes
- [x] 更新 README 和规划记录
- [x] 运行基础验证并提交推送
- **状态：** complete

### 阶段 83：Marketplace CI action runtime 升级
- [x] 查证 `actions/checkout@v5` 和 `actions/setup-node@v5` 固定 SHA
- [x] 仅更新 Marketplace Wallet Checks workflow
- [x] 更新 findings 和规划记录
- [x] 运行基础验证并提交推送
- **状态：** complete

### 阶段 84：snapshot export 参数错误边界
- [x] snapshot export 对缺失 `--dataRoot` 值报明确错误
- [x] snapshot export 对缺失 `--out` 值报明确错误
- [x] snapshot export 测试覆盖未知参数和空 `--dataRoot/--out`
- [x] 更新 findings 和规划记录
- [x] 运行基础验证并提交推送
- **状态：** complete

### 阶段 85：demo seed 参数错误边界
- [x] seed demo 对缺失 `--dataRoot` 值报明确错误
- [x] seed demo 对缺失 `--creator` 值报明确错误
- [x] seed demo 测试覆盖未知参数和空 `--dataRoot/--creator`
- [x] 更新 findings 和规划记录
- [x] 运行基础验证并提交推送
- **状态：** complete

### 阶段 86：legacy approved 公开读取边界
- [x] 普通用户公开读取只认 `listed` 资产
- [x] 契约测试覆盖历史 `approved` 未 listed 资产不出现在列表/详情/举报/购买
- [x] 契约测试保留 creator/admin 读取与 admin approve 兼容路径
- [x] API reference 说明 listed public read scope
- [x] 更新 findings 和规划记录
- [x] 运行基础验证并提交推送
- **状态：** complete

### 阶段 87：固定价购买按买家钱包串行
- [x] purchase lock 从 asset+buyer 调整为 buyer wallet scope
- [x] 契约测试覆盖同一买家并发购买两个不同付费资产
- [x] 断言余额只扣一笔、creator earning 只入一笔、entitlement 只创建一笔
- [x] 更新 findings 和规划记录
- [x] 运行基础验证并提交推送
- **状态：** complete

### 阶段 88：runtime smoke 复用 demo seed
- [x] runtime smoke 调用 `scripts/seed-marketplace-demo.mjs`
- [x] 真实 server smoke 使用 `demo_character_mira` 跑免费领取/安装/举报
- [x] 真实 server smoke 使用 `demo_world_clockwork` 跑固定价购买/安装/收益
- [x] README、设计文档、findings 说明 seed 路径已纳入 smoke
- [x] 运行基础验证并提交推送
- **状态：** complete

### 阶段 89：手机真机访问文档
- [x] README 区分本机 `127.0.0.1` 和手机真机访问
- [x] README 说明 `npm start -- --listen=true` 与局域网 IP
- [x] README 说明 HTTPS tunnel/hosted URL 与 PWA secure context
- [x] 脚本契约测试锁定手机访问说明
- [x] 更新 findings 和规划记录
- [x] 运行基础验证并提交推送
- **状态：** complete

### 阶段 90：marketplace 测试清单防漏
- [x] 扫描 `tests/marketplace*.test.js`
- [x] 断言每个 marketplace 单测文件都包含在 `test:marketplace` 命令中
- [x] 保持 fast command 不递归慢速 smoke/E2E
- [x] 更新 findings 和规划记录
- [x] 运行基础验证并提交推送
- **状态：** complete

### 阶段 91：PWA 缓存 marketplace-wallet 静态资源
- [x] 当时将 service worker shell cache 升级到 `sillytavern-shell-v2`（后续阶段 106 已升级到 `sillytavern-shell-v3`）
- [x] 预缓存 marketplace-wallet manifest、模板、入口 JS、filters 模块和版本化 CSS
- [x] PWA 单测校验扩展资源路径存在，并跟随 manifest JS/CSS 版本
- [x] 浏览器 PWA E2E 断言 marketplace-wallet 扩展资源进入 CacheStorage
- [x] 更新 README、设计文档、findings 和 progress
- [x] 运行基础验证并提交推送
- **状态：** complete

### 阶段 92：marketplace PWA 弱网错误态
- [x] 初次市场资产列表加载失败时退出 loading 状态
- [x] 在资产区显示可恢复错误文案和 Retry 按钮
- [x] Retry 重新调用 marketplace refresh 并能恢复资产列表
- [x] 扩展 manifest/cache 版本随 JS/CSS 改动升级
- [x] 补充浏览器 E2E 和 UI contract 测试
- [x] 更新 findings 和 progress
- [x] 运行基础验证并提交推送
- **状态：** complete

### 阶段 93：活跃筛选清空入口
- [x] Clear filters 在任意活跃筛选时显示，不再只等到空结果
- [x] 保持 loading/error 状态隐藏 Clear filters
- [x] 扩展浏览器 E2E 覆盖有结果筛选的清空入口
- [x] 同步 marketplace-wallet manifest/service worker cache 版本
- [x] 更新 UI contract、findings 和 progress
- [x] 运行基础验证并提交推送
- **状态：** complete

### 阶段 94：列表摘要返回内容分级
- [x] `toAssetListItem` 返回 `content_rating`
- [x] 后端公开列表测试断言 language/content_rating 都在摘要中
- [x] 确认列表仍不返回 `normalized_payload`
- [x] 更新 findings 和 progress
- [x] 运行基础验证并提交推送
- **状态：** complete

### 阶段 95：market store 写入串行化
- [x] 新增按 `market-assets.json` store path 分组的写锁
- [x] 将 create/revise/submit/review/delist/report/purchase/install 等写路由包进 store lock
- [x] 保留 fixed-price purchase 的 buyer wallet lock，避免钱包并发透支
- [x] 后端测试覆盖同一 store 并发创建不会丢资产
- [x] 更新 findings 和 progress
- [x] 运行基础验证并提交推送
- **状态：** complete

### 阶段 96：详情 payload 预览截断
- [x] Details/Inspect payload 预览超过 20KB 时截断显示
- [x] 保留 payload 权限和安装/修订数据不变，仅限制弹窗渲染体积
- [x] 增加大 payload 详情弹窗浏览器 E2E
- [x] 同步 marketplace-wallet manifest/service worker cache 版本
- [x] 更新 UI contract、findings 和 progress
- [x] 运行基础验证并提交推送
- **状态：** complete

### 阶段 97：上传 payload/metadata 大小门禁
- [x] 后端限制 `metadata` JSON 不超过 65536 字节
- [x] 后端限制 `normalized_payload` JSON 不超过 1048576 字节
- [x] create/patch/submit/approve 都复用大小边界，避免旧 store 绕过
- [x] 后端 Jest 覆盖超限 metadata、payload、修订和审核兜底
- [x] 更新 API reference、README、设计文档、findings 和 progress
- [x] 运行基础验证并提交推送
- **状态：** complete

### 阶段 98：移动端筛选区紧凑布局
- [x] 手机宽度下 marketplace 筛选控件改为两列 grid
- [x] 搜索框和 Clear filters 保持跨整行，select 控件两列排列
- [x] 增加 360px 宽度浏览器 E2E，断言无横向溢出
- [x] 更新 UI contract、findings 和 progress
- [x] 运行基础验证并提交推送
- **状态：** complete

### 阶段 99：购买成功后自动安装失败恢复
- [x] 购买/领取成功后自动安装失败时不再让整个动作失败
- [x] 自动安装失败后仍刷新 marketplace、Wallet Ledger 和 My Library
- [x] 浏览器 E2E 覆盖资产进入 Library、显示未安装并可重试安装
- [x] 更新 UI contract、findings 和 progress
- [x] 运行基础验证并提交推送
- **状态：** complete

### 阶段 100：上传 payload 大小前端预检
- [x] marketplace-wallet 上传表单对 payload JSON 执行 1048576 字节本地预检
- [x] 超限 payload 不发 create/patch 请求，保留表单内容供用户修改
- [x] 浏览器 E2E 覆盖超限 payload 不创建资产
- [x] 更新 UI contract、findings 和 progress
- [x] 运行基础验证并提交推送
- **状态：** complete

### 阶段 101：checked-in Marketplace API reference
- [x] 生成 `docs/marketplace-api-reference.md`
- [x] 导出脚本支持固定 `MARKETPLACE_API_REFERENCE_GENERATED_AT`
- [x] Jest 校验 checked-in API reference 与当前路由生成结果一致
- [x] README 和设计文档使用 docs 输出路径
- [x] 更新 findings 和 progress
- [x] 运行基础验证并提交推送
- **状态：** complete

### 阶段 102：上传语言与内容分级元数据
- [x] 上传表单增加 `language` 和 `content_rating` 控件，并保留自定义分级输入
- [x] create/patch 请求提交 language/content_rating 顶层字段
- [x] rejected/draft 修订流回填并可修改 language/content_rating
- [x] 同步 marketplace-wallet manifest 和 PWA 预缓存版本
- [x] 更新 README、设计文档、API reference、UI contract 和浏览器 E2E
- [x] 运行完整基础验证并提交推送
- **状态：** complete

### 阶段 103：上传保存成功但提交失败恢复
- [x] 拆分 marketplace-wallet 上传保存与 submit-for-review 错误处理
- [x] 保存成功但提交失败时提示 draft/changes 已保存，并附带提交错误
- [x] 提交失败后刷新 marketplace 和 Creator Center，让已保存 draft 可见
- [x] 用户可从资产卡片重试 Submit，避免重复创建草稿
- [x] 同步 marketplace-wallet manifest 和 PWA 预缓存版本
- [x] 补充 UI contract 和浏览器 E2E
- [x] 运行完整基础验证并提交推送
- **状态：** complete

### 阶段 104：PWA 导航壳更新策略
- [x] service worker 对导航请求使用 network-first，失败时回退缓存
- [x] 静态资源继续 cache-first，保持离线 shell 能力
- [x] `/api/*` 和非 GET 请求继续完全绕过缓存
- [x] 补充 PWA Jest 契约和浏览器 service worker E2E
- [x] 运行完整基础验证并提交推送
- **状态：** complete

### 阶段 105：PWA service worker 主动接管
- [x] install 阶段调用 `self.skipWaiting()`
- [x] activate 阶段调用 `self.clients.claim()`
- [x] 保留旧 cache 清理和 shell 预缓存行为
- [x] 补充 PWA Jest 契约和浏览器 service worker E2E
- [x] 运行完整基础验证并提交推送
- **状态：** complete

### 阶段 106：PWA 应用内安装入口
- [x] 确认当前 PWA 只有 service worker 注册，没有用户可见安装入口
- [x] 在 `scripts/pwa.js` 监听 `beforeinstallprompt` 并显示 Install 动作
- [x] Install 点击调用浏览器原生 PWA prompt，并在安装、dismiss 或 standalone 模式下隐藏
- [x] 增加安全区内固定样式，复用现有 `menu_button` 和 Font Awesome 图标
- [x] 同步 service worker shell cache 版本，避免已安装壳继续使用旧 PWA 脚本
- [x] 补充 PWA Jest、README 契约和浏览器 E2E
- [x] 更新 README、设计文档、findings 和 progress
- [x] 运行完整基础验证并提交推送
- **状态：** complete

### 阶段 107：移动端 Details 弹窗可用性
- [x] 采纳子 agent 发现：Details 弹窗是手机端买前/库内复查的高频入口，但缺少窄屏验证
- [x] 在 360px viewport 下覆盖 Details 弹窗打开、内容展示、关闭和无横向溢出
- [x] 必要时为 marketplace-wallet preview/popup 增加移动端宽度兜底
- [x] 更新 UI contract、findings 和 progress
- [x] 运行目标 E2E、基础验证并提交推送
- **状态：** complete

### 阶段 108：PWA 文档缓存版本防漂移
- [x] 发现设计文档仍引用旧 `sillytavern-shell-v2`
- [x] 同步设计文档到当前 `sillytavern-shell-v3` 和应用内 Install E2E 说明
- [x] 增加测试，锁定设计文档中的 PWA cache 名称与 service worker 一致
- [x] 更新 findings/progress
- [x] 运行基础验证并提交推送
- **状态：** complete

### 阶段 109：托管 Docker 容器 smoke
- [x] 采纳子 agent 发现：当前 smoke 证明 Node runtime，但未证明 Docker 部署产物可启动
- [x] 确认本机缺少 Docker，不能本地实跑容器 smoke
- [x] 新增 `scripts/smoke-hosted-container.mjs`，构建镜像、启动临时容器并验证 health/PWA shell
- [x] 新增 `test:hosted:docker` 脚本，并纳入 syntax gate、README、脚本契约测试和 Marketplace CI
- [x] 更新设计文档、findings 和 progress
- [x] 运行本地可执行验证并提交推送
- [x] 调查 GitHub run `28268635091` 失败：容器启动后健康检查超时，且 `--rm` 导致失败日志不可取
- [x] 让 Docker smoke 保留失败容器到 finally 清理，增加 `docker inspect` 状态检测和非 root npm cache 环境
- [x] 从 service worker 解析当前 cache 名称，避免 Docker smoke 硬编码旧 PWA cache
- [x] 扩展 Marketplace CI Docker 触发路径并给 Docker smoke step 增加 timeout
- [x] 调查 GitHub run `28269151597` 失败：Docker smoke 关闭 whitelist/basic auth 后触发 listen-mode 安全保护退出
- [x] 保留默认 whitelist 安全启动，并为 Docker host/gateway 增加 host-gateway 映射
- [x] GitHub run `28269291526` 确认 Docker smoke、runtime smoke 和 browser E2E 全链路通过
- **状态：** complete

### 阶段 110：E2E wrapper 退出兜底
- [x] 确认本机历史多次出现 Chrome E2E 通过后父进程延迟退出
- [x] 为 `scripts/run-marketplace-e2e.mjs` 增加 Playwright 子进程 timeout 和进程组清理
- [x] 为 Marketplace CI browser E2E step 增加 timeout
- [x] 用脚本契约测试锁定 timeout/清理行为和 README 边界
- [x] 运行基础验证并提交推送
- [x] GitHub run `28269647693` 确认 Marketplace Wallet Checks 全链路通过
- **状态：** complete

### 阶段 111：托管 Docker 业务读路由 smoke
- [x] 采纳子 agent 发现：E2E wrapper 非 0 退出路径不应直接 `process.exit(exitCode)` 跳过 `finally`
- [x] 将 Playwright 非 0 退出改为设置 `process.exitCode` 后返回，确保临时 server/tmpRoot 清理
- [x] 将 workflow timeout 契约测试收紧到具体 Docker/E2E step
- [x] 扩展 `scripts/smoke-hosted-container.mjs`，在容器内验证 `/api/wallet` 余额 shape
- [x] 扩展 `scripts/smoke-hosted-container.mjs`，在容器内验证 `/api/market/assets` 列表 shape
- [x] 保持 Docker smoke 只做保守 GET 读路径，不 seed、不写账、不上传，避免和 runtime smoke 重叠过重
- [x] 更新 README、设计文档、findings 和 progress
- [x] 运行本地基础验证
- [x] 提交并推送到 GitHub fork
- [x] GitHub Actions 确认 Marketplace Wallet Checks 全链路通过
- **状态：** complete

### 阶段 112：Docker smoke 动态端口绑定
- [x] 采纳子 agent 早前风险：先找空闲端口再释放给 Docker 绑定存在低概率抢占 flake
- [x] 移除 Docker smoke 里的 Node `net` 端口探测
- [x] 改为 `docker run -p 127.0.0.1::8000`，让 Docker 分配宿主端口
- [x] 新增 `docker port <container> 8000/tcp` 解析实际端口并构造 base URL
- [x] 补充脚本契约测试，锁定动态端口和 `docker port` 行为
- [x] 更新 progress
- [x] 运行本地基础验证
- [x] 提交并推送到 GitHub fork
- [x] GitHub Actions 确认 Marketplace Wallet Checks 全链路通过
- **状态：** complete

### 阶段 113：上传描述字段前端闭环
- [x] 确认后端已经支持 `description` 文本元数据，但 marketplace-wallet 上传/修订表单未暴露该字段
- [x] 上传表单新增 `description` textarea，并限制为后端同源的 10000 字符
- [x] create/patch body 提交 `description`，draft/rejected 修订回填旧描述，清空表单时重置
- [x] marketplace-wallet manifest 和 PWA shell 预缓存版本升级到 `0.2.20`
- [x] 同步 README、设计文档、API reference 生成脚本与 checked-in 文档
- [x] 补充 UI contract 和浏览器 E2E 断言
- [x] 运行本地基础验证
- [x] 提交并推送到 GitHub fork
- [x] GitHub Actions 确认 Marketplace Wallet Checks 全链路通过
- **状态：** complete

### 阶段 114：详情弹窗显示完整描述
- [x] 确认 description 已可上传/修订，但 Details/Inspect 弹窗仍只显示 summary
- [x] Details/Inspect 弹窗以安全文本渲染 description，不把 HTML 当标记执行
- [x] 为长描述增加移动端换行样式，避免撑宽 PWA 弹窗
- [x] marketplace-wallet manifest 和 PWA shell 预缓存版本升级到 `0.2.21`
- [x] 同步 README、设计文档和规划记录
- [x] 补充 UI contract 和浏览器 E2E 断言
- [x] 运行本地基础验证
- [x] 提交并推送到 GitHub fork
- [x] GitHub Actions 确认 Marketplace Wallet Checks 全链路通过
- **状态：** complete

### 阶段 115：举报空原因本地校验
- [x] 确认空 report reason 当前会进入第二个详情弹窗，最后才由后端拒绝
- [x] Report 流程在第一个弹窗后 trim reason，空值直接提示并停止
- [x] 提交给后端的 reason 使用 trim 后的值并继续保留 120 字符上限
- [x] marketplace-wallet manifest 和 PWA shell 预缓存版本升级到 `0.2.22`
- [x] 同步 README、设计文档和规划记录
- [x] 补充 UI contract 和浏览器 E2E 断言
- [x] 运行本地基础验证
- [x] 提交并推送到 GitHub fork
- [x] GitHub Actions 确认 Marketplace Wallet Checks 全链路通过
- **状态：** complete

### 阶段 116：API reference 文档触发 CI
- [x] 确认 Marketplace Wallet Checks path filter 覆盖 API reference 生成脚本和测试，但漏掉 checked-in `docs/marketplace-api-reference.md`
- [x] pull_request path filter 增加 `docs/marketplace-api-reference.md`
- [x] push path filter 增加 `docs/marketplace-api-reference.md`
- [x] 补充脚本契约测试，锁定该文档路径在 workflow 中出现两次
- [x] 更新 findings/progress
- [x] 运行本地基础验证
- [x] 提交并推送到 GitHub fork
- [x] GitHub Actions 确认 Marketplace Wallet Checks 全链路通过
- **状态：** complete

### 阶段 117：资产详情响应 allowlist 脱敏
- [x] 确认 `toAssetDetail()` 黑名单式删除 payload 的泄漏风险
- [x] 改为基于资产摘要的 allowlist 响应，补充详情需要的描述和生命周期字段
- [x] 仅 creator/admin/entitled 用户在详情响应中获得 `normalized_payload`
- [x] 后端契约测试锁定 public/admin/owner detail 不返回 raw metadata、review/moderation 内部字段
- [x] 同步 API reference、README 或设计文档中的详情隐私边界
- [x] 运行本地基础验证
- [x] 提交并推送到 GitHub fork
- [x] GitHub Actions 确认 Marketplace Wallet Checks 全链路通过
- **状态：** complete

### 阶段 118：侧栏子面板失败重试
- [x] 确认 Library、Creator Center、Wallet Activity、Report Queue 加载失败时会显示成空数据
- [x] 为每个子面板增加独立错误状态和 Retry 操作
- [x] 保持主 Marketplace 加载不因附属子面板失败而阻断
- [x] 补充前端契约或浏览器 E2E，锁定错误态不伪装为空列表
- [x] 更新 README、设计文档和规划记录
- [x] 运行本地基础验证
- [x] 提交并推送到 GitHub fork
- [x] GitHub Actions 确认 Marketplace Wallet Checks 全链路通过
- **状态：** complete

### 阶段 119：移动端上传表单长内容覆盖
- [x] 确认 upload form 是手机/PWA 中输入最密集的区域
- [x] 增加 360px viewport 浏览器 E2E，填入长标题、长标签和长 payload
- [x] 断言上传表单控件、动作按钮和 payload textarea 不横向溢出
- [x] 如测试暴露 CSS 问题则修复移动布局
- [x] 更新规划记录
- [x] 运行本地基础验证
- [x] 提交并推送到 GitHub fork
- [x] GitHub Actions 确认 Marketplace Wallet Checks 全链路通过
- **状态：** complete

### 阶段 120：默认 CSRF 写入负向 smoke
- [x] 确认 runtime smoke 已覆盖默认 CSRF token/cookie 正向写入
- [x] 在默认 CSRF server 中增加同 session、无 `X-CSRF-Token` 的 market 写入 403 断言
- [x] 保留带 token/cookie 的 draft upload 成功断言
- [x] 更新 README、设计文档和脚本契约测试
- [x] 运行本地基础验证
- [x] 提交并推送到 GitHub fork
- [x] GitHub Actions 确认 Marketplace Wallet Checks 全链路通过
- **状态：** complete

### 阶段 121：API reference 客户端 CSRF 契约
- [x] 确认 checked-in API reference 缺少默认 CSRF 写请求要求
- [x] 在 API reference 生成器中新增 Client Request Requirements
- [x] 说明外部 Web/PWA/移动客户端需要 `GET /csrf-token`、session cookie 和 `X-CSRF-Token`
- [x] 同步 README、设计文档和 API reference 测试
- [x] 重生成 checked-in API reference
- [x] 运行本地基础验证
- [x] 提交并推送到 GitHub fork
- [x] GitHub Actions 确认 Marketplace Wallet Checks 全链路通过
- **状态：** complete

### 阶段 122：上传文本边界前端对齐
- [x] 确认 Title/Summary 前端 maxlength 与后端限制不一致
- [x] 增加上传文本字段本地长度校验
- [x] 对齐 payload 自动 title hint 截断长度
- [x] bump marketplace-wallet manifest 和 PWA 预缓存版本
- [x] 补充 UI contract 和浏览器 E2E
- [x] 运行本地基础验证
- [ ] 提交并推送到 GitHub fork
- [ ] GitHub Actions 确认 Marketplace Wallet Checks 全链路通过
- **状态：** in_progress

## 关键问题
1. 是否优先做网页/PWA，再做 iOS/Android 上架包？
2. 创作者收益是否一开始允许提现，还是先做站内积分与免费市场？
3. 是否允许成人向内容？这会显著影响审核、支付和应用商店策略。

## 已做决策
| 决策 | 理由 |
|------|------|
| MVP 先做托管 Web/PWA 市场 | 最快验证免部署体验，避免一开始被应用商店支付和审核规则卡住 |
| 货币采用消费币、赠送币、创作者收益三类余额 | 清晰区分用户购买力、运营赠送、可结算收益，降低账务混乱 |
| 市场资产先支持角色卡、世界书、预设包、资源包 | 与 SillyTavern 现有内容类型贴合，能最快复用导入/安装逻辑 |
| 所有钱包变动必须走不可变账本 | 虚拟货币和分账系统不能只存余额，否则难以审计和修复问题 |
| 使用多 agent 并发切片开发 | 后端钱包、市场、安装适配和代码调查可以并行推进，主 agent 负责集成 |
| 市场资产必须审核后才能购买 | submitted 状态仅进入审核队列，listed 后才对普通用户可购买 |
| admin grant 只允许管理员调用 | 避免测试赠币接口成为公开刷币入口 |
| Creator Center summary 只返回聚合视图 | 钱包原始余额和 ledger 由 Wallet API 负责，市场接口不暴露流水明细或资产 payload |
| Creator Center 应展示已返回的状态拆分 | 后端已提供 draft/submitted/rejected、paid sales、total installs 和 earnings balance；前端显示这些值能减少创作者来回筛资产列表 |
| 默认角色卡头像路径使用 serverDirectory 解析 | Jest 和生产运行目录可能不同，不能依赖相对 cwd |
| listed 资产详情默认不返回 payload | 防止未购买用户绕过购买/安装直接获得角色卡或世界书正文 |
| fixed_price 购买按 bonus 后 paid 扣款 | 符合设计文档中赠送币优先消耗的产品策略 |
| 免费领取不写钱包账本 | 避免产生 0 金额账本噪音，付费购买才生成可审计 ledger |
| 市场/钱包前端做成内置扩展 | 复用 SillyTavern extension manifest、模板、CSS 加载和 Extensions 面板，避免继续膨胀主入口脚本 |
| 非创作者购买按钮采用“购买并安装” | 列表接口不暴露 entitlement，直接组合 purchase/install 可以兼容重复购买返回 already_owned |
| 管理员前端入口只使用 `isAdmin()` 判断 | 后端实际按 `request.user.profile.admin` 授权，前端不能用 `default-user` handle 推断权限 |
| `marketplace-wallet` manifest 使用版本化 JS/CSS URL | 避免浏览器复用旧 ESM 模块，保证 admin UI 修复刷新后生效 |
| 手机版先走 PWA 安装壳 | 最少代码满足手机打开即用；原生 iOS/Android 壳等支付、推送、商店策略明确后再做 |
| PWA service worker 不缓存 API | 钱包、市场、聊天和账号请求必须保持实时，静态壳缓存即可 |
| 手机真机访问不能用电脑的 127.0.0.1 | 127.0.0.1 在手机上指向手机自身；本地手机测试需要 listen + LAN IP 或 HTTPS tunnel/hosted URL，PWA 还依赖安全上下文 |
| PWA 预缓存清单必须可验证 | `cache.addAll()` 遇到任一缺失资源会让 install 失败，基础测试要覆盖文件存在性 |
| PWA service worker 需要浏览器级验证 | 静态 Jest 只能读文件，真实 Chrome E2E 才能证明注册、激活、CacheStorage 和 API cache exclusion 同时成立 |
| PWA 安装需要应用内入口 | manifest/service worker 只能满足可安装条件；支持 `beforeinstallprompt` 的浏览器应显示 Install 动作来触发原生安装 |
| 发布前需要一条慢速全闭环命令 | 日常 `test:marketplace` 保持快速；`test:marketplace:all` 串起 contract、runtime smoke 和 browser E2E，便于交付验收 |
| 上传表单应复用后端 tags 约束 | 后端已支持最多 20 个、每个 40 字符的 `tags` 数组；前端提前校验并展示，能让创作者素材更容易被搜索发现 |
| tags 后端边界必须有契约测试 | 前端校验不能替代服务端约束；POST 资产时应锁定 tags 数组、数量、类型、长度和去重行为 |
| 文本元数据后端边界必须有契约测试 | title、summary、description、language、content_rating 是市场展示和搜索字段，长度与 trim 行为应由后端测试锁定 |
| 资产创建 payload shape 必须有契约测试 | 托管上传入口必须拒绝非 object、未知类型、未知价格类型和非 object payload/metadata |
| API reference 必须记录上传边界 | 托管 API 使用者需要从生成文档看到 create/revision 的 body shape、tags/text 和 fixed_price 价格约束 |
| API reference 必须记录交易与安装边界 | 购买响应隐私、bonus/paid 消费顺序和安装路径脱敏是托管 API 使用者必须知道的行为 |
| API reference 必须记录读接口隐私 | 列表和 Creator summary 是高频读取接口，必须明确不返回 payload、raw wallet 或 recent earnings ledger |
| 公开市场读取只认 listed 资产 | `approved` 是历史/中间状态，当前审核通过会直接 listed；未 listed 资产不应对普通用户开放浏览、举报或购买 |
| Marketplace CI 应消除 action runtime 噪音 | 远端门禁已用 Node 24 跑测试，但 v4 actions 仍产生 Node 20 deprecation annotation；升级 v5 能让门禁结果更干净 |
| snapshot export 参数错误必须清晰 | 迁移/备份脚本若把下一个 flag 当路径值会误导操作者；缺失值应直接失败并说明字段 |
| demo seed 参数错误必须清晰 | 开箱体验脚本会被新部署者直接复制运行，缺失 creator/dataRoot 值必须明确失败 |
| runtime smoke 应复用 demo seed | README 推荐的开箱 seed 命令必须在真实 server smoke 中跑通，避免 seed 脚本只被 JSON 形状测试覆盖 |
| Load JSON 应自动识别资产类型 | 角色卡和世界书 payload 形状可本地判断，自动设置类型能减少用户选错后才报错的摩擦 |
| 粘贴 JSON 应复用文件导入识别逻辑 | 创作者可能直接粘贴角色卡/世界书 JSON；只在文件导入时自动识别会造成体验不一致 |
| 余额不足原因应在移动端可见 | 仅靠 disabled 按钮的 title 提示不适合手机和读屏，需要在卡片动作区显示缺口金额 |
| 无结果筛选应可快速清空 | 移动端筛选项多，空结果只显示文本会让用户难以回到可浏览状态 |
| 详情弹窗应显示已有元数据 | 后端 summary/detail 已返回 language、content_rating 和生命周期时间，前端可直接展示，帮助用户购买或审核前判断资产状态 |
| 举报正文应从前端传到审核队列 | 后端已保存 `reason + body`，前端只发 reason 会让管理员缺少上下文 |
| 设计文档必须区分当前 MVP 与 Future SaaS | 避免 README/设计文档承诺当前代码尚未实现的充值、退款、版本、评论和独立后台 API |
| 运行态 smoke 必须隔离本地数据 | 临时启动真实 server 时使用临时 config/data，只请求公开 health/PWA 端点，避免写入用户工作数据 |
| 前端筛选排序应有可执行测试 | 筛选逻辑抽为纯函数后，Jest 能直接验证类型、价格、访问状态、搜索和排序，不依赖浏览器环境 |
| 举报队列前端需要覆盖 resolve 流程 | 后端 resolve 测试不足以保证管理员点击后 UI 队列清空，需要浏览器 mock 或契约测试覆盖 |
| Marketplace MVP 需要独立 CI 门禁 | 相关路径变更时自动跑 syntax、Jest、runtime smoke 和 E2E discovery，避免只依赖本地验证 |
| 官方 bot workflow 不应在 fork 缺凭证时失败 | fork 没有 `ST_BOT_APP_ID` 和 private key，merge-conflict bot 应只在官方仓库运行 |
| 下架不撤销既有 entitlement | 下架阻止新购买和公开浏览，但已购买用户的安装副本能力保留，避免破坏已有体验 |
| 举报先只创建 open report | MVP 需要可审计入口，自动处罚和处理队列等管理策略后续再加 |
| 举报处理先做队列和 resolve | 管理员需要能清理 open reports；封禁、自动处罚和申诉规则仍需产品策略 |
| 审核预览复用管理员 asset detail | 管理员已有 payload 读取权限，Inspect 只需要前端拉详情并用安全 DOM 展示 |
| Review Queue 应展示安全元数据 | 审核员不应只看标题和类型；列表已有 creator/price/tags/summary/updated_at，前端可展示摘要但 payload 仍需 Inspect 懒加载 |
| 创作者修订只允许 draft/rejected | listed 资产已有购买/授权关系，原地改 payload 会破坏买家预期；后续需要版本化发布 |
| Creator Center 应显示审核状态细节 | 后端 creator asset item 已返回 submitted_at、approved_at 和 rejection_reason，前端显示后能让创作者知道何时提交、通过或被拒原因 |
| Details 应显示 entitlement 摘要 | 详情接口已返回当前用户 entitlement，展示来源/日期/购买引用能帮助用户确认自己何时领取或购买资产 |
| Report Queue 应显示举报日期 | 后端 report item 已返回 created_at，管理员需要看到举报时间来判断积压和处理优先级 |
| Report resolve note 长度必须有边界测试 | 后端以 1000 字符限制 resolution note；超长请求应 400 且保持 report open，避免误关闭举报 |
| Report reason/body 长度必须有边界测试 | 后端以 120/2000 字符限制举报原因和正文；超长请求应 400 且不能污染管理员队列 |
| Marketplace 搜索应覆盖展示元数据 | language 和 content_rating 已在列表/详情数据中存在，搜索覆盖它们能让用户按语言和分级找到资产 |
| Snapshot 应导出审核生命周期 | submitted_at、approved_at、delisted_at 不含 payload，但能帮助迁移和备份校验市场资产状态 |
| API reference 测试应锁定路由集合 | 导出脚本从源码解析路由，测试覆盖完整 MVP 路由可以尽早发现文档导出漂移 |
| Details 应展示下架日期 | delisted_at 是安全生命周期元数据，已授权用户和管理员查看详情时需要知道资产何时从公开市场下架 |
| API reference 应包含权限/隐私标注 | 路由清单不足以说明 admin-only、payload redaction 和 wallet scope，导出文档应携带这些关键边界 |
| API reference 应包含举报长度边界 | Report 创建和处理备注都有后端长度限制，导出文档应记录这些可调用契约 |
| Syntax gate 应覆盖扩展静态资产 | marketplace-wallet 依赖 manifest/window/style，JS 语法通过不代表这些关键资产存在且可解析 |
| admin grant 目标字段别名必须锁定 | API reference 已标注 `handle`、`userHandle`、`targetHandle`，后端契约测试要保证三种别名都能正确发到目标用户 |
| Library 基于 active entitlements | 用户库应展示已领取/购买资产，包含下架但仍授权的内容；payload 继续按详情懒加载 |
| README 脚本清单应受测试保护 | 托管版交付依赖可运行脚本，README 的 marketplace/PWA 命令必须和 `package.json` 同步 |
| test:marketplace 显式清单必须防漏 | 新增 `marketplace*.test.js` 若忘记加入根命令，会让本地和 CI 误以为 marketplace 基础测试已完整运行 |
| Library Details 入口必须真实存在 | 计划和设计文档已把 My Library 作为找回/查看入口，库中只提供 Install 会迫使用户回市场列表找详情 |
| Library 安装摘要应可见 | 后端已返回 entitlement 时间和 last_install 摘要，前端显示这些信息能让用户确认何时领取/购买以及最近安装到哪里 |
| Health endpoint 公开但不含用户数据 | 部署平台和移动壳需要未登录探活，响应只能包含服务级状态 |
| 资产详情复用 payload 权限 | Details 统一使用 asset detail API；未授权用户看元数据，已授权/创建者/管理员才看 payload |
| MVP 浏览先做客户端筛选排序 | 当前 JSON store 数据量有限，先补 UI 可用性；正式 SaaS 再上服务端搜索、排序和索引 |
| marketplace 根测试先跑语法门禁 | 低成本捕捉服务端、前端扩展、PWA 和测试文件语法破损，再进入较慢 Jest 契约 |
| Demo seed 必须显式指定 dataRoot | 本地体验需要可见市场内容，但脚本不应悄悄写入真实用户目录 |
| Runtime smoke 应触达私有 market/wallet API | 只测 health/PWA 无法发现 marketplace 路由注册、默认用户上下文或存储初始化问题 |
| 钱包流水 UI 是最近视图 | 前端展示最近 wallet ledger 方便用户核对余额；完整审计账本仍以 `/api/wallet/ledger` 为准 |
| Runtime smoke 应覆盖真实领取安装 | 真实 server smoke 需要验证 free purchase、install、Library 和文件落盘，避免只证明服务能启动 |
| 固定价购买必须有并发回归 | 同一用户同一资产并发购买只应结算一次，避免重复扣款和创作者重复入账 |
| Marketplace workflow push 分支放宽到 `codex/**` | 后续并行 Codex 工作分支仍应触发同一 marketplace 门禁；path filter 已限制只在相关文件变更时运行，避免扩大到无关分支 |
| 市场/钱包快照默认导出白名单字段 | 备份和迁移检查需要资产/授权/安装/举报/账本摘要，但不应默认导出 payload、举报正文、本地安装路径、完整 ledger reason/metadata 或绝对 dataRoot |
| 快照应保留 report 处理时间但不泄漏处理内容 | resolved report 的 `resolved_at` 有迁移价值；`body`、`resolution_note` 和 `resolved_by` 属于审核隐私，不应进入默认快照 |
| 快照 `--out` 不允许写入 dataRoot | 导出命令应保持用户数据目录只读，避免备份检查动作改变正在运行的本地数据根 |
| 购买 API 响应应只返回买家需要的信息 | 买家需要 entitlement、是否已拥有和自己的余额摘要；创作者余额和完整 ledger entries 属于更敏感的账务审计数据，应通过各自 wallet/creator 接口读取 |
| runtime smoke 需要覆盖固定价货币闭环 | 免费领取能证明安装路径，固定价购买才能证明真实 server 下 admin grant、扣款、创作者收益和响应隐私 shape 同时可用 |
| 固定价购买必须按买家钱包串行 | 同一买家可以同时点击两个不同付费资产；只按 asset+buyer 加锁会让两笔交易同时读旧余额并透支 |
| 资产详情响应必须使用 allowlist | `structuredClone(asset)` 再删除 payload 是黑名单式脱敏；新增 `metadata`、`reviewed_by`、`delisted_by` 等内部字段会默认外泄，应只返回详情明确需要的摘要、描述、生命周期和权限内 payload |
| 附属面板失败不能渲染为空数据 | Library、Creator Center、Wallet Activity 和 Report Queue 都是降级加载；失败时应显示错误和 Retry，否则用户会把网络/权限问题误认为没有资产、没有流水或没有举报 |
| 上传表单需要移动端长内容回归 | 创作者上传 title/tags/payload 是手机端最容易被长文本撑宽的表单；需要 360px viewport 覆盖防止 PWA 出现横向滚动 |

## 遇到的错误
| 错误 | 尝试次数 | 解决方案 |
|------|---------|---------|
| Jest 安装角色卡时找不到 `./public/img/ai4.png` | 1 | 在 market endpoint 中用 `serverDirectory` 解析默认头像绝对路径 |
| `storage.stop is not a function` | 1 | 移除 node-persist 测试清理中的不存在方法调用 |
| 未购买用户可从 listed 详情拿到 `normalized_payload` | 1 | 详情接口按创建者、管理员、授权用户过滤 payload |
| 钱包 admin grant 空 body 返回 500 | 1 | 使用 `request.body ?? {}` 后再解析字段 |
| admin 面板 DOM 已渲染但仍保留 `hidden` | 1 | 改为显式 `removeAttr('hidden')`/`attr('hidden', '')`，并提高扩展入口版本避免模块缓存 |
| Runner Chrome E2E 中 marketplace admin 和按钮不可见 | 1 | E2E helper 打开外层 Extensions drawer、展开内层 inline drawer，并 mock admin 用户 |
| Runner Chrome E2E 首次启动被 onboarding 弹窗遮挡 | 1 | E2E helper 等待并点击 onboarding Save |
| marketplace snapshot 测试未初始化 node-persist 时 `storage.clear` 不是函数 | 1 | afterEach 中先判断 `storage.clear` 是否存在，再执行清理 |
| 阶段 117 新增测试变量名 `storedAsset` 与同作用域后续断言冲突 | 1 | 将新增 store 读取变量改名为 `detailStore/detailStoredAsset` 后重跑语法和 Jest |
| 阶段 121 首次完整 `npm run test:marketplace` 中 `market-wallet.test.js` 两个用例 `fetch failed: other side closed` | 1 | 单独重跑 `market-wallet.test.js` 通过，随后完整 `npm run test:marketplace` 重跑通过，记录为一次性本地 test server 连接抖动 |

## 备注
- 设计文档阶段已完成。
- 后端 MVP 骨架和前端扩展入口已完成；暂不包含真实支付接入、数据库迁移和完整 UI 自动化测试。
