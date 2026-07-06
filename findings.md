# 发现与决策

## 需求
- 用户要做托管版 AI 酒馆，网页版和手机版都能打开即用，不需要自行部署。
- 新增市场功能，用户可以上传自己设计的角色卡、世界书等内容。
- 新增货币系统，用于购买市场内容、消耗模型服务、奖励创作者。

## 研究发现
- 当前 SillyTavern 仓库是 Node/Express 应用，版本 1.18.0，许可证为 AGPL-3.0。
- 当前仓库已有用户账号、多用户数据目录、Session/CSRF 等基础，但仍偏自托管工具。
- 角色卡已有 PNG 卡片读写与导入逻辑，世界书已有 JSON 导入、编辑、列表和删除逻辑。
- 现有内容类型包括 character、world、avatar、theme、workflow、preset、instruct、context、quick replies、sysprompt、reasoning 等。
- 公开市场需要新增 SaaS 控制平面：注册登录、支付、钱包账本、审核、风控、对象存储、搜索推荐、创作者中心。

## 技术决策
| 决策 | 理由 |
|------|------|
| 市场资产入库，不直接把用户上传文件暴露为可执行内容 | 便于审核、版本管理、搜索、购买授权和下架 |
| 安装市场资产时复制到用户私有 SillyTavern 数据空间 | 保持用户运行态隔离，符合现有 per-user directory 模型 |
| 使用不可变 ledger 记录货币变动 | 支持对账、退款、争议处理和风控 |
| 创作者收益账户和消费币账户分离 | 避免把用户充值币直接等同于可提现余额 |
| MVP 阶段先限制资产类型和脚本能力 | 降低 UGC 安全风险和审核成本 |
| submitted 资产不允许普通用户购买 | 避免未经审核内容直接进入市场 |
| 钱包 admin grant 必须管理员调用 | 避免普通用户刷赠送币 |

## 遇到的问题
| 问题 | 解决方案 |
|------|---------|
| 移动端内购规则可能限制第三方支付 | 先做 Web/PWA 支付；App 内数字商品按平台内购规则规划 |
| AGPL 许可证对托管修改有开源义务 | 保留许可证合规项，商业化前做法律确认 |
| UGC 资产可能包含侵权、恶意提示词或违法内容 | 引入上传校验、机器审核、人工复审、举报和下架机制 |
| 现有角色导入函数会删除上传源文件 | 市场安装不直接复用导入函数，改为在 market endpoint 中生成安装副本 |
| JSON 文件市场存储无法防止并发覆盖 | MVP 可用于单进程验证；正式 SaaS 需要数据库事务、append-only ledger 或按 store path 串行化写入 |
| market JSON store 需要单进程写锁 | 当前 MVP 使用 `market-assets.json`，同进程写路由应按 store path 串行 read-modify-write，降低 create/report/install 等并发覆盖风险 |
| 市场上传 payload/metadata 需要字节上限 | 主服务 JSON parser 允许大请求，marketplace 自己必须限制 `metadata` 和 `normalized_payload`，避免单个资产拖垮 JSON store、审核详情和移动端 PWA |
| 前端上传也应提前检查 payload 大小 | 后端必须兜底，但移动/PWA 用户粘贴超大 JSON 时应在本地立刻提示并避免一次必失败的网络请求 |
| listed 资产详情不能泄漏 `normalized_payload` | 未购买用户只能看元数据；创建者、管理员或已授权用户才能读取 payload |
| 市场/钱包前端适合作为 SillyTavern 内置扩展 | 复用 extension manifest、模板渲染、CSS 加载和 Extensions 面板，避免污染主入口脚本 |
| 市场列表的 `owned` 只代表创建者身份 | 前端不能把它当成已购买状态；普通用户购买后再安装，重复购买依赖后端幂等返回 |
| 购买按钮不能使用 `balance.total` 判定可消费余额 | `total` 包含 earnings，购买只消耗 bonus 和 paid，因此前端使用 `bonus + paid` |
| 管理员前端 gate 必须和后端 admin 模型一致 | 后端按 `request.user.profile.admin` 授权，前端应使用 `isAdmin()`，不能根据 `default-user` handle 推断 |
| 扩展 JS/CSS 入口需要版本化 | 浏览器会复用 ESM 模块；manifest 中加入 `?v=0.2.0` 可以让刷新加载新 admin UI |
| 基础交付需要根目录可运行脚本 | `npm run test:marketplace` 聚合后端和前端契约测试，方便从仓库根目录验证市场/钱包闭环 |
| Creator Center summary 应是聚合读模型 | 市场 summary 只返回创作者资产和统计，完整 wallet balance/ledger 继续由 Wallet API 负责，避免前端误用流水明细 |
| Creator summary 前端请求必须可降级 | 钱包和市场资产是主体验，创作者面板失败不能阻断刷新、购买和安装流程 |
| claims 和 installs 需要分开展示 | `sales_count` 当前代表免费领取和付费购买的总 claims，`install_count` 才代表安装次数 |
| 手机端 MVP 优先走 PWA | 现有 HTML 已有移动 meta、manifest 和 touch icons；补 service worker 比原生壳更小、更快可验证 |
| PWA 缓存只覆盖静态壳 | `/api/*`、POST 和动态业务请求不能进 shell cache，避免钱包、市场、聊天出现旧数据 |
| PWA 预缓存资源需要文件存在性测试 | `cache.addAll(SHELL_ASSETS)` 是全有或全无，任一路径丢失都会影响手机安装壳离线缓存 |
| marketplace-wallet 静态资源也属于 PWA shell | 手机安装壳需要缓存扩展 manifest、window 模板、入口 JS、filters 和样式；API 仍保持不缓存，避免钱包/市场业务数据陈旧 |
| PWA 弱网不能卡在 Loading | API 不缓存是正确边界，但 marketplace 主资产列表失败后必须退出 loading 并给出 Retry，否则手机安装壳会像挂死 |
| 设计文档需要拆分当前 MVP 与 Future SaaS | 当前代码只实现本地 market/wallet/health 路由；充值、退款、版本、评论、独立 Creator/Admin API 都应明确为后续 |
| 运行态 smoke 使用临时 config/data | 从根目录启动真实 server 验证公开端点时，必须传入临时 `configPath` 和 `dataRoot`，避免污染仓库或用户数据 |
| 筛选排序逻辑适合抽成纯函数测试 | marketplace-wallet 的 DOM 只负责读取控件值，核心筛选排序可在 Jest 里直接用资产样本断言 |
| Report Queue resolve 需要前端流程测试 | 管理员队列点击 Resolve 后应 POST resolve endpoint 并从本地队列移除 report |
| Marketplace CI 适合路径触发 | 专用 GitHub Actions workflow 只在 marketplace/wallet/PWA/health 相关文件变化时运行，减少普通 PR 负担 |
| merge-conflict bot workflow 需要官方仓库凭证 | fork 缺少 `ST_BOT_APP_ID` / private key 时会在 token mint 阶段失败，适合限制为官方仓库运行 |
| 下架不等于撤销授权 | delisted 资产不再公开售卖，但已领取/购买用户仍可查看 payload 并安装副本，避免破坏已有体验 |
| 举报入口先不做自动处罚 | 先留下 open report 审计记录；封禁、自动处罚和申诉流会牵涉策略，后续再加 |
| 举报处理先做管理员队列和 resolve | 让人工审核可以清理 open reports，同时避免提前固化处罚规则 |
| 审核预览必须按详情懒加载 payload | 市场列表不带 payload；管理员 Inspect 时再取详情，减少列表泄漏面 |
| 用户上传 JSON 预览用 DOM text 渲染 | payload 不能拼成 HTML；使用 `.text(JSON.stringify(...))` 降低 XSS 风险 |
| 创作者只能修订 draft/rejected 资产 | submitted/listed/delisted 不允许原地 PATCH，避免审核中或已售内容静默变化 |
| 用户库只基于 active entitlements | My Library 展示已领取/购买资产和安装摘要，包含已下架但仍授权内容，不返回 payload 或账本明细 |
| Health endpoint 只做 liveness | `/api/health` 公开且无需登录，但只报告服务存活，不检查数据库、插件或外部模型 readiness |
| 资产详情弹窗复用详情权限 | 购买前只显示元数据；创建者、管理员和已授权用户才看到 `normalized_payload` |
| 市场浏览 MVP 使用客户端筛选排序 | 当前数据量小，先用前端组合筛选；正式 SaaS 需要服务端搜索、分页和排序索引 |
| marketplace 验证入口应先跑语法门禁 | 服务端 endpoint、PWA、扩展脚本和 Jest 契约文件分散在不同目录，集中 `node --check` 能更早暴露破损 |
| Demo seed 应只写市场 store | 开箱体验需要示例资产；钱包余额仍通过 admin grant 流程验证，避免 seed 脚本绕过 ledger |
| Runtime smoke 需要覆盖业务路由 | health/PWA 只能证明服务启动；`/api/wallet` 和 `/api/market/assets` 能验证登录中间件、默认用户和 market/wallet 路由注册 |
| 钱包最近流水适合作为前端降级视图 | marketplace-wallet 可展示当前用户最近 ledger 帮助核对余额，但完整审计仍以 `/api/wallet/ledger` 为准 |
| Runtime smoke 应覆盖真实安装落盘 | 真实 server 验证需要包含 free purchase、install、Library 和文件存在性，才能证明市场最小闭环可运行 |
| 固定价购买必须防并发双扣 | 同一用户同一资产并发 purchase 应只结算一次，重复请求返回 already_owned 并复用 entitlement |

## 资源
- 本地文件：package.json、default/config.yaml、src/users.js、src/server-main.js
- 本地文件：src/endpoints/characters.js、src/endpoints/worldinfo.js、src/endpoints/content-manager.js

## 视觉/浏览器发现
- 新增 `marketplace-wallet` 扩展采用 Extensions 面板内联抽屉；本地浏览器 smoke test 已确认扩展容器、标题、资产列表和刷新按钮成功加载。
- admin 面板初始模板带 `hidden`，需要显式 `removeAttr('hidden')` 才能在真实浏览器里可靠显示。
- 浏览器 smoke test 已确认 `marketplace-wallet` 加载 `index.js?v=0.2.0` 和 `style.css?v=0.2.0` 后，admin 面板可见，grant 控件和 review queue 存在。
- in-app browser 当前未暴露 viewport 设置，本地也没有 Playwright 包；本轮移动端仅完成 CSS 结构调整，后续应补真实窄屏截图或 UI 自动化。
- 新增 Playwright E2E 覆盖 admin review/grant 和移动布局；当前本机 Playwright Chromium 缓存半安装，完整 E2E 需先成功安装 `chromium-headless-shell`。
- 新增 Jest UI 契约测试作为稳定基础测试，已覆盖 manifest 版本化、admin 模板、`isAdmin()` gate、grant 校验和移动 CSS。
- Creator Center 已移动到钱包余额下方，使用自适应统计网格展示 assets、drafts、submitted、listed、rejected、claims、paid sales、installs、earned 和 earnings balance；最近资产列表显示 status、claims、installs 和价格。
- Creator Center 资产列表现在显示 submitted/approved 日期和 rejected 原因摘要，帮助创作者判断下一步是否修订重提。
- PWA 安装壳复用现有 mobile meta 和 icons；新增 service worker 只缓存静态页面壳，手机用户可通过浏览器 Add to Home Screen / Install 使用。
- 真机手机不能使用电脑上的 `127.0.0.1`；本地手机测试需要 `--listen=true` 加局域网 IP，或 HTTPS tunnel/hosted URL，PWA 安装和 service worker 需要安全上下文。
- marketplace-wallet 管理员操作新增 Delist；后端 `POST /api/market/assets/:id/delist` 只接受 listed 资产，返回 delisted/private 状态。
- marketplace-wallet 用户操作新增 Report；后端 `POST /api/market/assets/:id/report` 对可见资产创建 open report。
- marketplace-wallet 管理员工具新增 Report Queue；后端 `GET /api/market/reports/admin` 返回 open reports，`POST /api/market/reports/:id/resolve` 将举报标记为 resolved。
- marketplace-wallet Review Queue 新增 Inspect；管理员通过 asset detail 懒加载 payload，并在可滚动 TEXT popup 中预览。
- marketplace-wallet Review Queue 展示创作者、价格、更新时间、标签和摘要片段，但仍不直接显示 payload。
- marketplace-wallet 创作者资产新增 Revise；后端 `PATCH /api/market/assets/:id` 只允许 owner 修改 draft/rejected，保存后回 draft 并可重新 submit。
- marketplace-wallet 新增 My Library；后端 `GET /api/market/library` 返回当前用户 active entitlements 的资产摘要、授权来源和安装摘要。
- marketplace-wallet My Library 条目现在同时提供 Details 和 Install；Details 复用 asset detail API，已授权用户可在库里查看 payload 权限内的详情，不必回公开市场列表。
- marketplace-wallet My Library 会显示授权日期和最近安装摘要；`local_ref` 使用可换行小字展示，避免手机窄屏被本地路径撑宽。
- marketplace-wallet 购买或领取成功后，自动安装失败不应掩盖已授权结果；前端需要刷新 Wallet、Ledger 和 Library，让用户稍后从库里重试安装。
- 托管探活新增 `GET /api/health`；响应包含服务级状态、版本、uptime 和时间戳，不返回用户、市场或钱包数据。
- marketplace-wallet 新增 Details；市场列表、用户库和审核预览共用 asset detail 弹窗，未授权时不渲染 payload JSON。
- marketplace-wallet Details 弹窗现在展示 language、content rating 和创建/上架/更新时间；日期使用 `YYYY-MM-DD` 稳定格式，避免浏览器 locale 影响自动化断言。
- marketplace-wallet Details 弹窗现在展示 delisted 日期；未下架资产显示 not delisted。
- marketplace-wallet Details 弹窗现在展示当前用户 entitlement 来源、授权日期和购买引用；未授权资产显示 not in library/not entitled。
- marketplace-wallet Details/Inspect 对大 payload 只渲染 20KB 预览并显示截断提示，避免手机/PWA 弹窗因为超大角色卡或世界书 JSON 卡顿。
- marketplace 后端现在限制 `metadata` 不超过 65536 字节、`normalized_payload` 不超过 1048576 字节；create/patch/submit/approve 都会执行该边界。
- marketplace-wallet 上传表单现在会在本地预检 payload JSON 字节数，超过 1048576 字节时不会发起创建/修订请求。
- marketplace-wallet 市场筛选条新增价格、访问状态和排序控件，继续使用本地列表做客户端过滤。
- marketplace-wallet 搜索现在会匹配资产 language 和 content_rating，和 Details 里已展示的元数据保持一致。
- 市场资产列表摘要现在返回 `language` 和 `content_rating`，让真实 API 数据也能支持前端按语言/分级搜索，同时继续不返回 `normalized_payload`。
- marketplace-wallet 空结果且存在激活筛选时会显示 Clear filters，避免移动端用户被空搜索困住。
- marketplace-wallet 任意活跃筛选都会显示 Clear filters，即使当前仍有结果；移动端用户不用先筛到空列表才能发现清空入口。
- marketplace-wallet 移动端筛选区使用两列 grid；搜索和 Clear filters 跨整行，减少手机/PWA 首屏被筛选控件挤占。
- 新增 `scripts/check-marketplace-syntax.mjs` 作为 marketplace/wallet/PWA/health 基础语法门禁，并接入根目录 `npm run test:marketplace`。
- marketplace syntax gate 会检查 marketplace-wallet 的 `manifest.json`、`window.html` 和 `style.css` 存在且非空，manifest 还会执行 JSON parse。
- wallet admin grant 接口接受 `handle`、`userHandle` 或 `targetHandle` 作为目标用户字段；后端契约测试应覆盖三者都写入同一目标用户的余额分桶和 ledger。
- README 中的 hosted marketplace/PWA 可运行脚本清单应由 `tests/marketplace-scripts.test.js` 对照 `package.json` 保护，避免交付命令漂移。
- `test:marketplace` 仍是显式测试文件清单；需要契约测试扫描所有 `marketplace*.test.js` 都被包含，避免新增测试文件后根命令漏跑。
- PWA 契约测试新增 service worker 预缓存清单解析，确认 `/` 映射到 `index.html` 且所有 shell assets 都存在于 `public/`。
- 设计文档的 API 模块已拆为“当前本地 MVP 已实现 API”和“Future SaaS API”，并明确当前上传流接收规范化 JSON payload。
- 新增运行态 smoke 脚本，临时启动真实 SillyTavern server 并校验 `/api/health`、`/manifest.json`、`/service-worker.js`。
- marketplace-wallet 筛选排序逻辑抽为 `filters.js` 纯函数，新增 Jest 可执行测试覆盖筛选、搜索、排序和不变性。
- marketplace-wallet E2E mock 扩展 Report Queue resolve 流程，覆盖管理员点击 Resolve 后队列变空。
- 新增 Marketplace Wallet GitHub Actions 门禁，覆盖 syntax、Jest contract、runtime smoke 和 E2E discovery。
- 既有 merge-conflict bot workflow 已限制为官方仓库运行，避免 fork 缺 bot 凭证导致 push checks 失败。
- 新增 demo marketplace seed 脚本，显式指定 data root 后写入免费角色卡和付费世界书，并保持幂等 upsert。
- demo marketplace seed CLI 现在对未知参数、缺失 `--dataRoot` 和缺失 `--creator` 值给出明确错误，避免把下一个 flag 当 handle/path。
- runtime smoke 现在直接调用 demo seed 脚本生成 `demo_character_mira` 与 `demo_world_clockwork`，确保 README 推荐的开箱 seed 路径能在真实 server 购买、安装、举报和 Library 闭环中跑通。
- runtime smoke 现在通过 demo seed 预置免费角色卡和固定价世界书，并通过真实 server 校验 `/api/wallet` 与 `/api/market/assets` JSON shape。
- Runner Chrome 真实 E2E 会暴露两层可见性：SillyTavern 外层 Extensions drawer 需要打开，Marketplace Wallet 自身的 inline drawer 也需要展开，否则 admin、Report Queue 和购买按钮都在隐藏父级下。
- 临时 data root 首次启动会出现 onboarding persona 弹窗；浏览器 E2E 必须等待并确认 Save，避免欢迎弹窗遮挡 Extensions 面板点击。
- E2E 中 mock `/api/users/me` 为 admin 用户能防止账号配置漂移影响前端 `isAdmin()` gate；真实后端权限仍由接口单测覆盖。
- marketplace-wallet 新增 Wallet Activity 面板，最近流水从 `/api/wallet/ledger` 降级加载，正数用 `+` 标识，负数标为 purchase/debit。
- runtime smoke 现在会实际 POST 免费领取和安装 demo character card，并确认 Library 里 install_count 为 1 且文件写入临时用户 characters 目录。
- 新增 `scripts/export-marketplace-snapshot.mjs`，用显式 `--dataRoot` 只读导出市场与钱包快照；stdout 输出 JSON，`--out` 写文件但拒绝写入 data root 内部。
- marketplace/wallet 快照默认只导出白名单字段：market assets 的生命周期摘要、entitlements/installs/reports 安全明细、wallet ledger 的 id/type/userHandle/actorHandle/bucket/amount/createdAt 和少量迁移 metadata；不导出 normalized payload、举报正文、本地安装路径、完整 ledger reason/metadata 或绝对 data root。
- marketplace snapshot 对 resolved report 只导出 `resolved_at` 这类生命周期时间；不导出 report body、resolution note 或 resolver handle。
- marketplace snapshot export CLI 现在对未知参数、缺失 `--dataRoot` 和缺失 `--out` 路径给出明确错误，避免错误参数静默变成路径值。
- wallet snapshot 使用和 wallet endpoint 一致的 node-persist key prefix，并过滤合法 bucket 与 safe integer amount，避免损坏或非钱包记录进入余额摘要。
- paid purchase API 响应现在只返回 entitlement、`already_owned`、purchase id 和 buyer balance；完整 ledger entries 与 creator balance 不再通过购买响应暴露，仍可由买家/创作者通过各自 Wallet API 和 Creator Center 查询。
- runtime smoke 现在同时覆盖免费角色卡和固定价世界书：真实 server 下执行 admin grant、fixed-price purchase、buyer paid debit、creator earnings ledger、purchase response 隐私 shape、安装落盘和 Library 可见性。
- 固定价购买需要按买家钱包串行化，而不仅是按资产+买家串行；否则同一买家并发购买两个不同资产时可能同时读到旧余额并透支。
- market store 写路由现在按 store path 串行执行；并发创建测试确认同一 `market-assets.json` 中不会因为 read-modify-write 覆盖丢资产。
- marketplace-wallet 浏览器 E2E mock 现在维护可变 wallet/ledger/library 状态，覆盖 fixed-price Buy & Install 后余额刷新、Purchase 负流水、Library 安装数和移动布局。
- marketplace-wallet 固定价资产只按 bonus+paid 判断购买力；余额不足时卡片显示缺口金额，避免移动端只看到 disabled 按钮。
- marketplace-wallet 浏览器 E2E 现在覆盖创作者 world_book JSON 上传并 Save & Submit，断言新资产进入 Review Queue，Creator Center 统计和资产列表刷新。
- marketplace-wallet 上传表单现在复用后端 `tags` 约束，创作者可填逗号分隔标签；列表卡片展示标签，搜索可命中 tags。
- 后端 asset create 会校验 `tags` 必须是数组、最多 20 个、每个字符串最多 40 字符，并会 trim、过滤空值和去重。
- 后端 asset create 会校验并 trim 市场展示文本：title 120、summary 500、description 10000、language 16、content_rating 40 字符。
- 后端 asset create 会拒绝非 JSON object 请求体、未知 asset type/price_type、非 object metadata 以及非 object normalized_payload。
- Marketplace API reference 导出现在记录 asset create/revision 的 body shape、metadata/payload、tags/text 和 fixed_price 价格约束。
- Marketplace API reference 导出现在记录 submit/approve/reject/purchase/install 的审核状态、购买隐私和安装路径脱敏边界。
- Marketplace API reference 导出现在记录列表和 Creator summary 读接口的 payload、wallet 与 recent earnings 脱敏边界。
- marketplace 普通用户公开读取现在只认 `listed` 资产；历史 `approved` 但未 listed 的资产仍仅 creator/admin 可读，避免审核中间态出现在公开浏览、详情、举报或购买入口。
- Marketplace Wallet Checks workflow 升级到 pinned `actions/checkout@v5` 与 `actions/setup-node@v5`，避免远端门禁继续产生 Node 20 action runtime deprecation annotation。
- marketplace-wallet Load JSON 会按 payload 形状自动切换 `character_card` 或 `world_book`，减少用户上传角色卡/世界书时选错类型。
- marketplace-wallet 粘贴 JSON textarea 也复用同一类型/标题识别逻辑，且已有标题不会被 payload name 覆盖。
- runtime smoke 现在也覆盖真实 creator upload 状态机：POST 创建 draft world_book、Creator Center 看到 draft、submit 后进入 review、creator detail 可读 payload、approve 后 listed/public、市场列表不泄漏 payload、创作者可安装并刷新 install_count。
- 后端契约测试现在明确覆盖角色隔离：普通用户看不到他人的 draft/submitted asset，不能 purchase 或 approve；owner 可以读取 submitted detail payload 但不能自审批，admin 可以审核，approved 后普通用户只能看元数据。
- marketplace-wallet 浏览器 E2E 现在覆盖 rejected 资产修订重提：Revise 先 GET detail 填充表单，Save & Submit 走 PATCH 后 submit，Review Queue 和 Creator Center 刷新为 submitted。
- runtime smoke 现在覆盖举报处理真实闭环：用户对可见资产创建 open report，管理员队列可见但不带 asset payload/metadata，resolve 后记录 resolved metadata 且队列清空。
- marketplace-wallet Report 前端现在提交短 reason 和可选 body，管理员 Report Queue 会显示详细正文，避免审核员只看到一句原因。
- marketplace-wallet Report Queue 会显示举报创建日期，帮助管理员判断 open reports 的积压时间。
- report resolve 的 `note` 上限是 1000 字符；超长 note 应返回 `Invalid report resolution` 并保持 report 为 open。
- report 提交的 `reason` 上限是 120 字符，`body` 上限是 2000 字符；超长举报应返回 `Invalid market report` 且不进入管理员队列。
- API reference 导出脚本从当前 market/wallet endpoint 源码和公开 health route 生成 Markdown，适合作为发布前检查点，减少 README/设计文档里的端点清单和实现漂移。
- API reference 单测锁定当前完整 MVP 路由集合，包括 library、reports admin、submit/approve/reject/delist/purchase/install 和 wallet ledger。
- API reference 现在包含关键权限/隐私标注：payload redaction、admin-only 队列/审核/赠币、Library scope、Wallet read scope 和 report 长度边界。
- `docs/marketplace-api-reference.md` 作为 checked-in 生成产物，测试会用固定时间戳和当前路由生成结果比对，避免移动端/外部客户端 API 文档缺席或漂移。
- PWA 浏览器 E2E 需要等待 service worker 从 `activating` 进入 `activated`，再 reload 确认页面受 controller 控制；这样才能稳定验证 shell cache 和 `/api/*` 不缓存。
- PWA shell cache 当前为 `sillytavern-shell-v3`，并预缓存 marketplace-wallet 的 manifest、window 模板、版本化入口 JS/CSS 和 filters 模块；PWA Jest 与浏览器 E2E 都会校验这些资源。
- marketplace-wallet 初次加载市场资产失败时现在会显示 “Marketplace could not be loaded.”、后端错误摘要和 Retry 按钮；浏览器 E2E 覆盖 500 后点击 Retry 恢复列表。
- `test:marketplace:all` 作为慢速发布前闭环命令，顺序跑 contract/Jest、runtime smoke 和 browser E2E；Docker image smoke 保持独立步骤，日常快速反馈仍用 `test:marketplace`。
- marketplace-wallet 上传表单现在可以提交 `language` 和 `content_rating`；修订 rejected/draft 资产时会回填旧值，保存/提交后会进入 create/patch body。
- `content_rating` 前端使用 datalist 输入而不是硬枚举 select，避免后端允许的自定义分级在修订时被清空。
- marketplace-wallet manifest 和 PWA shell 预缓存版本需要随上传模板变更同步 bump，避免移动端/PWA 保留旧表单。
- Marketplace API reference 的 create body 文案现在点名 `tags/language/content_rating` 边界，便于网页/手机版外部客户端按同一契约提交资产。
- marketplace-wallet 上传 Save & Submit 需要把保存和提交拆开处理；保存成功但 submit 失败时，草稿已经存在，UI 不应提示保存失败或诱导用户重复创建。
- 提交失败恢复后刷新 marketplace/Creator Center，可让创作者看到 draft 并从资产卡片重试 Submit。
- submit 失败提示应始终包含“Draft saved/Changes saved”，后端错误只能作为附加上下文，避免用户误以为内容丢失。
- PWA service worker 对导航请求使用 cache-first 会让已安装手机壳长期看到旧首页/登录页；导航应 network-first，离线时再回退静态缓存。
- PWA 静态 JS/CSS/manifest 资源仍可 cache-first，业务 `/api/*` 和非 GET 请求继续不进入 CacheStorage。
- PWA 更新发布后若不调用 `skipWaiting()` 和 `clients.claim()`，已安装手机壳可能继续由旧 service worker 控制到用户关闭所有标签页；主动接管能缩短更新生效窗口。
- `clients.claim()` 应在旧 cache 清理之后执行，减少新 service worker 接管后命中旧 shell cache 的短窗口。
- 实现应用内 Install 入口前，PWA 只能依赖浏览器菜单或偶发浏览器提示；现在支持的浏览器会显示应用内安装动作。
- `beforeinstallprompt` 是最小可验证的应用内 PWA 安装入口；支持的浏览器可以显示 Install 动作并调用原生 prompt，已安装/standalone 模式和 `appinstalled` 后必须隐藏入口。
- PWA 安装入口样式应固定在安全区内并复用现有按钮体系；关闭按钮应是图标按钮，避免手机登录/聊天界面出现额外说明文案。
- marketplace-wallet Details 弹窗已补手机 viewport 下的可滚动/无横向溢出验证，避免长字段撑宽 PWA 弹窗。
- Details 弹窗在 360px 手机宽度下外层 dialog 和 Close 按钮应留在视口内；metadata/payload 不应横向溢出，纵向内容由 popup `.popup-content` 滚动承载。
- PWA cache 名称升级后设计文档也必须同步；`tests/pwa.test.js` 应从 service worker 解析 `CACHE_NAME` 并检查文档含当前 cache 名称和 Install prompt E2E 覆盖。
- 托管版仅有 Node runtime smoke 还不能证明部署产物可用；Docker smoke 应构建镜像、用临时 config/data volume 启动容器，并验证 health、manifest、service worker 和首页。
- 本机当前没有 `docker` 命令，容器 smoke 需要由 CI 或有 Docker 的机器执行；脚本应在缺 Docker 时清晰失败，不能静默跳过。
- 首轮 Docker smoke CI run `28268635091` 构建和启动容器成功但健康检查超时；脚本不能用 `--rm` 隐藏失败容器日志，应保留到 finally 清理并用 `docker inspect` 提前报告退出状态。
- Docker smoke 应从 `public/service-worker.js` 解析当前 `CACHE_NAME`，不能把 `sillytavern-shell-v3` 写死在脚本里；正常 cache bump 不应让容器 smoke 文档/脚本漂移。
- Marketplace CI path filter 需要包含 Docker build 依赖的 default config、webpack 入口和 `public/lib.js`，否则镜像可用性相关变更可能绕过 Docker smoke。
- Docker smoke 不能通过 `--whitelist=false --basicAuthMode=false` 关闭所有 listen-mode 保护；SillyTavern 会因不安全配置主动退出。容器 smoke 应保留默认 whitelist，并映射 Docker host/gateway 让宿主健康检查通过白名单。
- 本机 Chrome E2E 历史上多次出现测试已通过但 wrapper 父进程延迟退出；`run-marketplace-e2e.mjs` 应给 Playwright 子进程设置超时并清理进程组，避免可运行脚本无限挂起。
- E2E wrapper 失败也必须清理：`process.exit(exitCode)` 会跳过 `finally`，Playwright 非 0 退出应设置 `process.exitCode` 后返回，确保临时 server 和 tmpRoot 被清理。
- Docker smoke 也应触达业务读路由：托管镜像 smoke 只测 health/PWA shell 仍可能漏掉 wallet/market 路由注册或默认用户上下文问题；保守 GET `/api/wallet` 和 `/api/market/assets` 可补齐这层验证。
- Docker 业务 smoke 保持只读：容器 smoke 不应重复 runtime smoke 的 seed、购买、安装和写账闭环；只验证 wallet balance shape 和 market asset list shape，降低 CI 时间和状态复杂度。
- Docker smoke 端口应由 Docker 分配：Node 先找空端口再关闭 socket 会留下端口抢占窗口；`-p 127.0.0.1::8000` 加 `docker port` 可避免同一 runner 上的低概率绑定竞态。
- Docker smoke 端口解析必须保持 loopback 契约：如果 `docker port` 只返回 `0.0.0.0:<port>`，脚本应失败而不是回退通过，否则会削弱只暴露到本机的 CI 安全边界。
- marketplace 后端已经把 `description` 作为一等文本元数据校验到 10000 字符；前端上传和修订表单也应暴露该字段，否则网页/手机创作者只能提交短 summary。
- 上传模板增加字段后必须同步 marketplace-wallet manifest 和 PWA shell 预缓存版本，避免已安装手机壳继续使用旧模板和旧 ESM 入口。
- API reference 应点名 `title`/`summary`/`description`/`tags`/`language`/`content_rating`，而不是笼统写 text metadata，方便网页/手机版外部客户端按同一上传契约实现。
- Details/Inspect 可以展示完整 description，但列表摘要和搜索仍应保持短字段，避免 10000 字符长描述进入高频列表渲染和移动端筛选路径。
- 详情描述必须用 `.text()` 之类安全文本渲染并配合 `white-space: pre-wrap`/`overflow-wrap: anywhere`，保留换行同时防止 HTML 注入和窄屏横向溢出。
- 举报 reason 是后端必填字段；前端应在第一个弹窗后 trim 并本地拦截空原因，避免手机用户进入第二个详情弹窗后才看到服务端错误。
- `docs/marketplace-api-reference.md` 是 checked-in 生成产物，变更它应触发 Marketplace Wallet Checks；否则只改生成文档可能绕过 API reference sync 测试和 marketplace CI。
- marketplace asset detail 不应从 store asset 克隆后删除少数字段；详情响应需要用 allowlist 返回资产摘要、`description`、公开展示生命周期、`payload_available`，并只在 creator/admin/entitled 时附加 `normalized_payload`。
- raw `metadata`、`visibility`、`submitted_at`、`approved_at`、`reviewed_by`、`review_notes`、`delisted_by` 和 entitlement ledger 引用等字段属于存储/审核内部信息；public/admin/owner detail 都不应默认暴露它们，审核状态细节继续通过 Creator Center 或快照导出白名单暴露。
- marketplace-wallet 降级加载的 Library、Creator Center、Wallet Activity 和 Report Queue 不应在失败时清空数组后显示空状态；错误态需要可见文案和 Retry，尤其适合手机/PWA 弱网场景。
- marketplace-wallet 上传表单是手机端输入最密集的区域；长标题、长标签和长 JSON payload 需要浏览器 E2E 覆盖，防止 360px viewport 出现横向溢出。
- 默认 CSRF runtime smoke 不应只证明 token/cookie 可以写入；同一 session cookie 下缺少 `X-CSRF-Token` 的市场写入也应返回 403，才能防止 CSRF 中间件或脚本启动参数退化时被正向路径掩盖。
- Marketplace API reference 也需要记录客户端 CSRF 契约；外部网页/PWA/移动客户端若只看 market/wallet 路由清单，可能会漏掉默认部署下写请求必须先取 `/csrf-token`、保留 session cookie 并发送 `X-CSRF-Token`。
- 上传文本字段的前端 `maxlength`、本地 JS 校验和自动 payload title hint 必须与后端长度上限一致；否则手机创作者可能被表单允许或自动生成一个后端会拒绝的 title/summary。
- PWA 导航的 network-first 离线回退不能只查当前 request；安装版手机壳恢复带 query 的 URL 时可能没有同 URL 缓存，需要再回退到预缓存的根页面，同时继续跳过 `/api/*`。
- 市场审核 reject reason 的 1000 字符上限应由服务端拒绝超长请求，而不是静默截断；否则外部管理客户端会误以为完整审核理由已保存。
- 钱包 admin grant reason 的 200 字符上限也应由服务端拒绝超长请求，而不是进入不可变 ledger 后静默截断；前端 input 和本地校验需要同步同一边界。
- 发布前需要保留两条慢速验证路径：`test:marketplace:all` 给无 Docker 本地机器跑非容器闭环，`test:marketplace:ci` 给具备 Docker/Chrome 的机器跑与 GitHub Marketplace Wallet Checks 覆盖等价的 release gate。
- 本地 marketplace browser E2E wrapper 默认超时应与 GitHub Actions 的 10 分钟 browser E2E step 对齐；5 分钟会让全量 24 用例在本机全部显示通过后仍被 wrapper 提前杀掉。
- 本机全量 marketplace browser E2E 并行 4 workers 时会出现所有用例通过但 Playwright worker 不自然退出的场景；发布脚本默认应走 `--workers=1` 串行模式，稳定清理优先于速度。
- `market-wallet.test.js` 会启动大量临时 Express server 并用真实 `fetch` 打端点；与其它 marketplace Jest 文件并行时会偶发 `SocketError: other side closed`，因此根 `test:marketplace` 应先用 `--runInBand` 单独跑该后端契约文件，再跑其它脚本/UI/PWA contract 测试。
- marketplace approve 不能只复查 metadata/payload；管理员批准前也应复查 title、type、price_type、price_coins、metadata 字节和 normalized_payload 格式，避免 submitted 资产被外部脚本或旧数据腐化后仍公开上架。
- PWA/移动壳的 `public/style.css` 当前属于可交付面但 Marketplace Wallet Checks path filter 未监听；后续应把它加入 push/pull_request paths，并用脚本契约测试锁住。
- marketplace-wallet report/reject 提交不能在前端 `slice()` 后静默发送；后端已经对 report reason/body 和 reject reason 返回 400，前端也应本地提示并阻止请求，避免手机用户误以为完整审核/举报文字已保存。
- marketplace-wallet 的 `withBusyAsset()` 若只重绘 Marketplace 列表，My Library 中同一 asset 的 Install 按钮不会立刻反映 disabled/Installing 状态；资产级 busy 变化需要同时 `renderAssets()` 和 `renderLibrary()`。
- PWA 预缓存里的 marketplace-wallet 脚本资源应尽量全部带 manifest version query；`index.js`、`filters.js` 和 `style.css` 现在都随 manifest version 进入 service worker shell cache，避免安装壳 cache-first 命中过期过滤逻辑。
- PWA 浏览器 E2E 也必须从 marketplace-wallet manifest 读取版本；硬编码 `0.2.xx` 会在 manifest/service worker bump 后继续检查旧 cache path。
- PWA 浏览器 E2E manifest 版本同步需要 Jest contract 防回归；否则只有远端 browser E2E 才会发现硬编码版本漂移。
- 根安装型 PWA 的 `public/manifest.json` 也应在 `test:marketplace:syntax` 的 static JSON asset gate 中解析；这样坏 manifest JSON 不必等完整 PWA Jest 才暴露。
- Marketplace Wallet Checks path filter 应覆盖 service worker 真实预缓存的 PWA shell CSS 和图标；否则移动/PWA 外观或安装图标变更可能绕过 Docker/PWA/browser checks。
- README 验证矩阵需要跟脚本门禁同步点名 root PWA manifest；`tests/marketplace-scripts.test.js` 负责锁住这类 README/脚本覆盖漂移。
- Creator Center 条目应提供直接操作入口；创作者在手机端处理 draft/rejected 资产时，不应回 Marketplace 列表反找自己的资产才能 Details、Revise 或 Submit。
- marketplace-wallet manifest 版本和 PWA shell 预缓存需要随 Creator Center 操作入口变更同步 bump，避免已安装壳保留没有操作按钮的旧入口。
- 后续小缺口候选：Report Queue resolve 失败/忙态 E2E、Revise 后 Cancel 编辑模式重置、Library 直接安装失败恢复。
- Marketplace Wallet Checks 后续应覆盖 market/wallet 共享依赖和 marketplace-wallet 前端共享 helper；否则 `src/users.js`、`src/util.js` 或 `public/scripts/popup.js` 等改动可能绕过 marketplace gate。
- Marketplace Wallet Checks path filter 应覆盖 market/wallet 后端共享依赖和 marketplace-wallet 前端共享 helper；这些文件不属于 marketplace 专属目录，但会直接影响权限、安装写入、角色卡校验、CSRF header、popup 和用户上下文。
- README 的 API reference 生成命令应说明固定 `MARKETPLACE_API_REFERENCE_GENERATED_AT`，避免 checked-in docs 因当前时间戳漂移。
- checked-in API reference 再生成命令必须固定 `MARKETPLACE_API_REFERENCE_GENERATED_AT=2026-06-26T00:00:00.000Z`；否则文档内容未变也会因为 `Generated at` 当前时间产生 diff。
- marketplace-wallet upload status 的 `[hidden]` 需要显式 `display: none`；组件自身 `display: flex` 会让 Revise 后 Cancel 的编辑状态在浏览器里仍被视为可见。
- Revise 后 Cancel 必须清空编辑资产上下文；浏览器 E2E 应断言下一次 Save Draft 走 create POST 而不是旧资产 revision PATCH。
- Admin Reject 成功路径需要真实浏览器覆盖；只测超长 reason 本地拦截无法证明 POST payload、Review Queue 刷新和 Creator Center 驳回原因展示仍然连通。
- Marketplace smoke/E2E 的可运行性依赖 `server.js`、CLI、config init 和 healthcheck helper；这些启动入口应同时进入 syntax gate 和 workflow path filters，否则启动链语法错误或入口变更可能绕过 marketplace CI。
- Admin Delist 应有真实浏览器回归；确认框、POST、刷新后的 `delisted` badge 和 Delist 按钮消失共同证明前端下架闭环仍然可用。
- Report resolve note 不应只停留在 API；管理员前端需要可选备注输入、1000 字本地边界和真实 POST body，才能形成可审计的举报处理说明。
- Snapshot export 必须拒绝不存在的 dataRoot；目录存在但 store/storage 未初始化可以导出空快照，路径拼错则应失败，避免备份/迁移演练误判成功。
- Demo seed 的 dataRoot 可以不存在并由脚本创建，但如果路径已存在且是普通文件，应明确失败而不是暴露 Node 原生 mkdir `EEXIST`。
- API reference route 列表和 Notes 必须一一对应；新增 market/wallet route 时，测试应强制补权限、隐私、请求边界或行为说明，而不是只生成裸路由清单。
- README runnable scripts 覆盖应从 `package.json` 动态发现 marketplace/PWA/hosted 脚本；新增可运行脚本时测试应强制同步 README，而不是依赖维护者手写测试清单。
- Report Queue resolve 失败后必须保持报告在队列中并恢复 Resolve 按钮；管理员弱网或后端短暂失败时应能二次提交处理备注，而不是误以为举报已关闭或按钮卡死。
- Marketplace draft 创建也必须做 type-specific payload 校验；坏 `world_book` 或坏 `character_card` 不应先进私有 draft store，再等 submit/approve/install 才失败。
- marketplace-wallet 非管理员 UI 回归必须启用账号系统；账号系统关闭时 `isAdmin()` 会默认 true，这符合本地免账号模式但不能证明真实非 admin 门禁。
- Review Queue 的 Inspect 入口需要真实浏览器覆盖；审核员批准/拒绝前必须能从队列拉取详情并查看 payload 预览，而不只依赖按钮字符串契约。
- Fixed-price 创作者上传需要浏览器闭环；购买路径验证不了上传表单是否真实提交 `price_type`/`price_coins`，也验证不了草稿保存后付费标签展示。
- Admin grant reason 的前端边界需要浏览器行为覆盖；`maxlength` 是输入防线，但脚本注入超长值时仍应由 JS 拦截并避免 POST。
- Admin grant reason 必须保持字符串契约；对象或数组等非字符串值不应被 `String()` 成 `[object Object]` 写入不可变 ledger，避免审计文本被客户端类型错误污染。

---
*每执行2次查看/浏览器/搜索操作后更新此文件*
*防止视觉信息丢失*
