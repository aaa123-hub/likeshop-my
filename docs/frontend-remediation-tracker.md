# 前端上线整改跟踪

更新时间：2026-06-29

本文用于跟踪前端侧已经完成的整改、已经固化到脚本的检查项，以及后续需要和后端继续联调的事项。总标准以 `docs/README.md` 为准。

## 已完成的前端整改

- 请求网关：`utils/request.js` 统一以 `baseURL + /api/` 作为请求前缀，业务 API 调用保持 `miniapp/*`。
- 登录态：登录结果已兼容 `accessToken/token`、`userId/user_id/id`，请求头同时携带 `token` 和 `Authorization: Bearer <token>`。
- 图片上传：`utils/tools.js` 统一上传到 `/api/miniapp/files/upload`，字段名为 `file`，并兼容 `data.fileUrl/data.url/data.uri`。
- 上传容错：上传返回 JSON 解析失败时会 reject，不再静默吞错。
- 生产日志：已清理核心支付、上传、支付密码、权限工具中的调试输出。
- 登录跳转：`utils/login.js` 避免重复跳转登录页，并修复 `getUserProfile` 失败时 Promise 悬挂。

## 已固化的验证项

运行 `npm test` 会执行 `scripts/verify-project.mjs`，当前包含：

- `pages.json` 注册页面文件存在性检查。
- tabBar 页面注册和图标文件存在性检查。
- `api`、`utils`、`store` 核心 JS 语法检查。
- 源码路由引用目标存在性检查。
- `pages.json` 重复页面路由检查。
- 合并冲突标记检查。
- `api/*.js` 中 `request.get/post/put/delete` 字符串路径必须以 `miniapp/` 开头。

## 下一步 P0 联调重点

- 用户资料：验证 `GET/PUT /api/miniapp/user/profile` 不再返回 `A0108`，并确认 token 可识别用户。
- 生态应用：验证 `GET /api/miniapp/eco-applications` 返回应用入口和客服所需字段。
- 积分账户：验证 `GET /api/miniapp/points/account` 返回可用积分、冻结积分、累计积分和自动领取状态。
- 绑定手机号：验证 `POST /api/miniapp/auth/bind-mobile` 是否仍强制 `userId`，优先要求后端从 token 识别用户。
- 图片上传：用头像、反馈、KYC、商家资质、提现收款码分别验证返回 URL 可访问和可回显。
- 地址编辑：验证地址列表或详情返回省市区名称和 code，编辑页能完整回显。

## 下一步 P1 联调重点

- 商品详情：验证 SKU、库存、价格、详情图、评价、优惠券字段。
- 购物车：验证列表、选中、改数量、删除、失效商品、金额汇总。
- 订单预览：验证地址、配送方式、运费、优惠券、不可下单原因、`submitToken`。
- 创建订单：验证幂等、库存校验、价格校验、`orderNo/payOrderNo` 返回。
- 支付：真机验证支付创建、支付取消、支付成功、支付失败、支付状态查询。
- 钱包提现：验证余额、冻结、可提现、手续费、提现方式、审核状态、流水分页。

## 前端后续整改规则

- 后端明确未完成的入口，前端必须隐藏或禁用，不能只靠接口失败兜底。
- 真实接口可用后，逐步移除长期假数据和过度猜字段逻辑。
- 高风险流程必须保留加载态、失败态、空态，包括支付、提现、KYC、商家资质。
- 新增业务 API 必须放在 `api/*.js`，路径使用 `miniapp/*`，不要在页面里直接拼 `/api/miniapp/*`。
- 每次联调发现新的 P0/P1 问题，都同步补充到 `docs/README.md` 或本文档。
