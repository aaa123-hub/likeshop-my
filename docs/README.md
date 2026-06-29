# 小程序上线整改与后端接口联调标准

更新时间：2026-06-29

这份文档用于指导项目上线前整改。内容包含：已经复现的线上接口报错、功能未完成点、前端逻辑待联调点、后端接口交付标准、联调顺序和最终验收标准。

目标很明确：后端按本文档补接口、补字段、统一错误码；前端按本文档联调页面和业务流程；测试按本文档验收是否达到上线条件。

## 整改目标

- 所有前端正在调用的接口都必须真实存在，不能再返回 `A0108 No static resource`。
- 所有登录后接口都必须有稳定的用户识别方式，优先通过 token 识别用户，避免前端到处传 `userId`。
- 所有页面需要展示的字段必须后端稳定返回，不能依赖前端猜字段、拼字段或长期兜底假数据。
- 订单、支付、钱包、提现、KYC、商家资质等关键流程必须用真实账号完整跑通。
- 未完成的活动或业务入口必须隐藏，不能让用户进入不可用流程。

## 优先级说明

| 优先级 | 含义 | 上线要求 |
| --- | --- | --- |
| P0 | 阻塞上线，影响登录、交易、资金、用户资料、核心页面加载 | 必须修复并联调通过 |
| P1 | 影响主要业务体验或数据准确性 | 上线前必须修复，特殊情况需产品确认降级方案 |
| P2 | 非核心功能或活动能力 | 可以灰度或隐藏入口，但不能暴露不可用流程 |

## 统一接口交付标准

后端补接口时，请统一满足下面标准，避免一个页面修好了，另一个页面又因为字段或错误码不一致出问题。

| 标准 | 要求 |
| --- | --- |
| 路由 | 前端调用的 `/api/miniapp/*` 路由必须真实注册，不能落到静态资源处理 |
| 鉴权 | 登录后接口优先从 token 识别用户；确实需要 `userId` 时，登录接口必须稳定返回同名字段 |
| 成功返回 | 建议统一 `code: 1`，并返回 `data` |
| 失败返回 | 返回明确 `code`、`message/msg`，缺字段时说明缺哪个字段 |
| 分页返回 | 列表接口至少返回列表数据和是否还有更多，兼容字段建议用 `list`、`total`、`pageNo`、`pageSize` |
| 图片 URL | 上传和业务图片必须返回可公网访问的完整 URL |
| 时间字段 | 订单、支付、活动、消息建议统一返回 ISO 时间或时间戳，并明确单位 |
| 金额字段 | 金额单位必须固定，建议返回元为单位的数字；如果用分，字段名必须说明 |
| 状态字段 | 支付、订单、提现、审核、活动状态必须固定枚举值，不能每个接口返回不同文案 |

## 统一错误码要求

| 场景 | 后端需要返回 |
| --- | --- |
| 未登录或 token 失效 | 固定错误码，前端可跳登录 |
| 参数缺失 | 明确缺少字段，例如 `missingFields: ["userId"]` |
| 权限不足 | 明确是无权限，不要返回通用失败 |
| 业务状态不允许 | 说明原因，例如订单已支付、商品下架、库存不足 |
| 接口未开放 | 不要返回静态资源错误；如果功能未做，返回明确业务错误，并让前端隐藏入口 |
| 系统异常 | 返回统一错误码和可展示文案，后端日志保留 traceId |

## 先修这些问题

| 优先级 | 问题 | 现在的报错 | 后端要做什么 |
| --- | --- | --- | --- |
| P0 | 用户资料接口不存在 | `GET /api/miniapp/user/profile?userId=30` 返回 `A0108 No static resource api/miniapp/user/profile` | 增加 `GET /api/miniapp/user/profile` 和 `PUT /api/miniapp/user/profile`；优先用 token 识别用户，兼容 `userId` |
| P0 | 生态应用接口不存在 | `GET /api/miniapp/eco-applications` 返回 `A0108 No static resource api/miniapp/eco-applications` | 增加 `GET /api/miniapp/eco-applications`，返回生态应用、客服、商家资质入口需要的数据 |
| P0 | 积分账户接口不存在 | `GET /api/miniapp/points/account?userId=30` 返回 `A0108 No static resource api/miniapp/points/account` | 增加 `GET /api/miniapp/points/account`，返回积分余额、冻结积分、累计积分、自动领取状态 |
| P0 | 绑定手机号参数不匹配 | `POST /api/miniapp/auth/bind-mobile` 返回 `A0101 userId, mobile and smsCode are required` | 明确是否必须传 `userId`；建议后端直接从 token 取用户，前端只传 `mobile` 和 `smsCode` |
| P0 | 上传图片失败 | 头像、反馈、KYC、商家资质、提现收款码上传报错 | 确认 `POST /api/miniapp/files/upload` 可用；字段名是 `file`；返回 `data.fileUrl` 或 `data.url` |
| P1 | 编辑地址不显示省市区 | 编辑地址页“所在地址”为空 | 地址列表或地址详情必须返回省市区名称和 code，详见“地址字段” |

## 接口有返回但没有有效数据的统计

这些地方不是简单的“接口不存在”。接口可能返回了 `code: 1`，但 `data` 为空、字段不全，或者请求失败后前端用了默认数据兜底。这样页面看起来不报错，但实际业务数据是空的，容易误判为前端没做。

| 模块 | 前端调用接口 | 当前前端兜底/空数据表现 | 用户看到什么 | 后端需要补什么 |
| --- | --- | --- | --- | --- |
| 首页 | `GET /api/miniapp/home/index` | 请求失败时前端返回空首页结构 | 首页模块、广告、推荐、快捷入口可能为空 | 返回 `banners`、`quickEntries/navigation_menu`、`recommendedProducts`、`shareTitle/shareImage`、首页配置 |
| 首页广告 | `GET /api/miniapp/home/index` | `getAdList` 只取 `banners`，没有就空数组 | 首页无轮播/广告 | `banners` 返回图片、跳转类型、跳转地址、排序、上下架状态 |
| 首页菜单 | `GET /api/miniapp/home/index` | `getMenu` 只取 `navigation_menu/quickEntries` | 首页快捷入口为空 | 返回入口名称、图标、跳转路径、是否 tab、启用状态 |
| 推荐商品 | `GET /api/miniapp/home/index` | `getBestList` 只取 `recommendedProducts` | 首页推荐商品为空 | 返回商品 ID、名称、价格、图片、销量、库存、店铺信息 |
| 支付方式 | `GET /api/miniapp/orders/{orderNo}` 或 `GET /api/miniapp/wallet/balance` | 没有 `pay/payMethods/paymentMethods` 时前端默认显示余额支付、微信支付 | 页面可能显示后端实际未开放的支付方式 | 后端必须返回真实可用支付方式、支付方式状态、不可用原因 |
| 未读消息订阅 | `GET /api/miniapp/messages/unread-count` | 不管接口成功失败，前端都可能转成空数组 | 未读提醒不准确 | 返回未读数量、消息类型、是否需要订阅提醒 |
| 最近访问气泡 | `GET /api/miniapp/home/recent-visits` | 失败后返回 `lists: []` | 首页/商街没有最近访问提示 | 返回最近访问列表、访问时间、店铺/商品 ID、名称、图片 |
| 最近访问店铺 | `GET /api/miniapp/home/recent-visits` | 失败后返回空数组 | 最近访问页面为空 | 返回店铺 ID、店铺名、LOGO、评分、距离、访问时间 |
| 生态应用 | `GET /api/miniapp/eco-applications` | 返回列表为空时生态应用、客服、资质入口都没数据 | 生态应用页空，客服信息走默认文案 | 返回应用列表；客服建议单独返回电话、微信、二维码、服务时间 |
| 客服 | `GET /api/miniapp/eco-applications` | 没匹配到客服时前端会用默认客服名、电话、微信 | 客服信息可能是假数据 | 返回明确客服配置，避免前端从生态应用里猜 |
| 商街首页 | `GET /api/miniapp/street/index` | 失败后返回空商街结构 | 商街页面店铺/分类/推荐为空 | 返回商街分类、推荐店铺、推荐商品、广告、筛选项 |
| 商街商品 | `GET /api/miniapp/search/products`，兜底 `GET /api/miniapp/street/products` | 两个接口没数据时再从商街推荐店铺兜底 | 商街商品页可能显示店铺而不是商品，或直接为空 | 返回商品列表，并区分商品和店铺字段，不能混用 |
| 店铺详情 | `GET /api/miniapp/shop/{shopId}` 等多个兜底路径 | 前端会连续尝试多个店铺详情路径 | 店铺详情可能加载失败或字段不全 | 固定一个正式店铺详情接口，返回店铺、相册、商品、团购、二维码、订阅状态 |
| 分类 | `GET /api/miniapp/category/tree` | 失败后返回空数组 | 分类页无分类 | 返回树形分类：分类 ID、名称、图标、子分类、排序、启用状态 |
| 商品搜索 | `GET /api/miniapp/search/products` | 失败后返回空商品列表 | 搜索结果为空 | 返回分页商品列表、总数、是否还有更多、排序结果 |
| 商品评价 | `GET /api/miniapp/product/{spuId}/comments` | 失败后返回空评价列表 | 商品详情没有评价 | 返回评价列表、评价总数、好评率、图片、用户昵称、规格、时间 |
| 购物车 | `GET /api/miniapp/cart/items` | 失败后返回空购物车、金额 0、数量 0 | 购物车看起来没商品 | 返回购物车项、选中状态、商品有效状态、数量、总价、优惠、失效原因 |
| 配送方式 | 当前 `getDelivery` 是前端默认数据，没有真实接口 | 默认认为快递和自提都可用 | 确认订单页配送方式不可信 | 后端在订单预览返回真实配送方式、运费、自提点、不可配送原因 |
| 我的优惠券 | `GET /api/miniapp/coupons` | 失败后返回空数组 | 我的优惠券为空 | 返回已领取、可用、已使用、已过期优惠券，并说明可用/不可用原因 |
| 充值套餐 | 当前 `rechargeTemplate` 直接返回 `暂无推荐充值套餐` | 充值套餐为空 | 用户无法选推荐充值金额 | 提供充值套餐接口或明确不开放充值套餐 |
| KYC 状态 | `GET /api/miniapp/kyc/status` | 失败后前端当成 `NOT_SUBMITTED` | 用户可能重复提交或看不到真实审核结果 | 返回真实状态：未提交、审核中、通过、驳回、驳回原因、证件图片 |
| 商家资质 | `GET /api/miniapp/eco-applications/merchant-qualification/status` | 无数据时前端无法回显资质 | 商家资质页只能重新提交 | 返回审核状态、驳回原因、已提交资料、资质图片 URL |
| 消息列表 | `GET /api/miniapp/messages` | 无列表时消息页为空 | 用户看不到系统/订单/活动消息 | 返回分页消息列表、消息 ID、标题、内容、类型、已读状态、跳转业务 ID |
| 签到列表 | `GET /api/miniapp/points/account` | 前端生成 7 天默认签到列表 | 签到规则和奖励可能是假数据 | 返回真实签到天数、每日奖励、今日是否已签、连续签到天数 |
| 签到提交 | 当前 `userSign` 基于积分账户返回前端模拟成功 | 可能显示签到成功但后端没记账 | 积分不会真实到账 | 提供真实签到接口，返回获得积分、连续天数、账户余额 |
| 抽奖配置 | `GET /api/miniapp/lottery` | 缺配置时前端补默认规则和奖品字段 | 抽奖页数据不完整 | 返回抽奖状态、规则、奖品、剩余次数、中奖记录、用户积分 |
| 中奖记录 | `GET /api/miniapp/messages?bizType=LOTTERY` | 无消息时中奖记录为空 | 用户看不到中奖记录 | 返回抽奖记录，建议独立中奖记录接口或固定消息类型字段 |
| 支付密码状态 | `GET /api/miniapp/wallet/pay-password/status` | 返回字段不明确时前端可能判断为未设置 | 用户重复设置或无法进入转账/提现 | 返回 `hasPayPassword`，并固定布尔类型 |
| 最近转账人 | `GET /api/miniapp/wallet/ledger?bizType=TRANSFER` | 无流水时最近转账人为空 | 转账页没有最近联系人 | 返回转账流水中的收款人编号、昵称、头像 |
| 收款人信息 | `GET /api/miniapp/wallet/transfer/receiver` | 字段不全时前端用“转账用户”兜底 | 用户无法确认收款人身份 | 返回收款人编号、昵称、头像、手机号脱敏、是否可转账 |
| 分销海报 | `GET /api/miniapp/alliance/poster` | 没有 `poster/posterUrl/imageUrl` 时海报为空 | 邀请海报不可用 | 返回可访问海报 URL、邀请码、分享标题 |
| 内容页/资讯 | `GET /api/miniapp/content-pages/{pageCode}` | 无内容时标题默认“内容详情”，内容为空 | 协议、帮助、资讯页面空白 | 返回标题、摘要、封面、富文本内容、更新时间 |

处理要求：这些接口不能只返回 `code: 1`，必须返回页面需要的真实 `data`。如果业务确实没有数据，也要返回稳定空结构和空态原因，例如 `emptyReason`，方便前端展示正确提示。

## 每个接口要返回什么

### 1. 用户资料

接口：`GET /api/miniapp/user/profile`

后端需要返回：

- `id` 或 `userId`
- `nickname`
- `avatar`
- `mobile`
- `gender`
- `realName`

保存接口：`PUT /api/miniapp/user/profile`

解决方案：

- 登录后用 token 找用户，不要强依赖前端传 `userId`。
- 如果必须传 `userId`，请把登录接口返回的用户 ID 字段固定下来。

### 2. 生态应用和客服

接口：`GET /api/miniapp/eco-applications`

后端需要返回：

- 应用 ID：`id`
- 名称：`appName` 或 `name`
- 编码：`appCode`
- 图标：`iconUrl` 或 `imageUrl`
- 跳转地址：`url` 或 `linkUrl`
- 描述：`appDesc` 或 `description`

解决方案：

- 先把接口路由补上，别再返回 `A0108`。
- 如果客服也放在这个接口里，请返回客服电话、微信号、二维码、服务时间。
- 更推荐单独给一个客服接口，避免生态应用和客服字段混在一起。

### 3. 积分账户

接口：`GET /api/miniapp/points/account`

后端需要返回：

- 可用积分：`availablePoints`
- 冻结积分：`frozenPoints`
- 累计积分：`totalPoints`
- 自动领取开关：`autoReceive`
- 等级或成长值字段

解决方案：

- 补接口路由。
- 支持 token 查当前用户。
- 如果支持 `userId`，也要和登录返回字段保持一致。

### 4. 绑定手机号

接口：`POST /api/miniapp/auth/bind-mobile`

前端会传：

- `mobile`
- `smsCode` 或 `code`
- 微信登录码：`jsCode`、`loginCode` 或 `code`
- `encryptedData`
- `iv`

现在的问题：

- 后端要求 `userId, mobile and smsCode are required`。
- 前端当前不一定能稳定拿到 `userId`。

解决方案：

- 后端优先从 token 识别用户。
- 如果一定要 `userId`，请登录接口固定返回 `userId`，并确认字段名不要变。
- 缺参数时返回明确字段，比如 `missingFields: ["userId"]`。

### 5. 图片上传

接口：`POST /api/miniapp/files/upload`

前端上传方式：

- `multipart/form-data`
- 文件字段名：`file`
- 请求头：`token`
- 请求头：`Authorization: Bearer <token>`

后端需要返回：

- `code: 1`
- `data.fileUrl` 或 `data.url`
- URL 必须能公网访问

解决方案：

- 确认接口路由、文件字段名、鉴权方式都和前端一致。
- 上传失败时返回具体原因，不要只返回通用失败。
- KYC、商家资质、反馈、头像、提现收款码都用这个上传接口。

### 6. 地址字段

接口：`GET /api/miniapp/addresses`

建议补充：`GET /api/miniapp/addresses/{id}`

现在的问题：

- 编辑地址时，所在地址没有回显。
- 根因通常是后端没有返回省市区名称，或者只返回了 code，前端无法稳定拼出展示文案。

地址列表和详情必须返回：

| 数据 | 建议字段 | 兼容字段 |
| --- | --- | --- |
| 地址 ID | `id` | `addressId` |
| 联系人 | `receiverName` | `contact` |
| 手机号 | `mobile` | `telephone` |
| 省名称 | `provinceName` | `province` |
| 市名称 | `cityName` | `city` |
| 区名称 | `districtName` | `district` |
| 省编码 | `provinceCode` | `province_id`、`provinceId` |
| 市编码 | `cityCode` | `city_id`、`cityId` |
| 区编码 | `districtCode` | `district_id`、`districtId` |
| 详细地址 | `detailAddress` | `address` |
| 是否默认 | `isDefault` | `is_default` |

解决方案：

- 地址列表就返回完整省市区名称和编码。
- 最好补 `GET /api/miniapp/addresses/{id}`，编辑地址时直接查单条完整地址。

## 功能未完成，需要后端配合

下面这些不一定已经报错，但属于功能没闭环，必须后端配合确认或补接口。

| 模块 | 现在缺什么 | 不处理的影响 | 后端解决方案 |
| --- | --- | --- | --- |
| 短信验证码 | 注册、忘记密码、换绑手机号、找回支付密码都需要真实短信 | 用户无法注册、找回密码、绑定手机号 | 提供 `POST /api/miniapp/sms/send`，按场景校验手机号、验证码、频率限制 |
| 忘记密码 | 前端已接 `POST /api/miniapp/auth/password/reset`，需要后端确认参数和错误码 | 忘记密码流程不能用 | 支持 `mobile`、`smsCode`、`password`，返回明确错误原因 |
| 微信登录/绑定手机号 | 登录态、用户 ID、手机号绑定字段不稳定 | 后续所有需要用户身份的接口都会出错 | 登录接口固定返回 `token`、`userId`、`mobile`、`nickname`、`avatar` |
| 配送方式 | 确认订单页现在缺真实配送方式、运费、自提规则 | 下单金额和配送方式不可信 | 提供配送能力接口，订单预览返回快递、自提、门店配送、运费、不可配送原因 |
| 商品 SKU | 商品详情需要真实规格、库存、价格、规格图片 | 用户可能选错规格，下单金额/库存错误 | `GET /api/miniapp/product/{spuId}` 返回 SKU 列表、规格组合、库存、限购、上下架状态 |
| 购物车 | 加购、改数量、选中、删除、总价需要完整闭环 | 购物车不能稳定下单 | 完成 `GET/POST/PUT/DELETE /api/miniapp/cart/items` 相关能力，返回选中状态和金额汇总 |
| 订单预览 | 缺真实优惠券、运费、默认地址、不可下单原因 | 确认订单页展示不准确 | `POST /api/miniapp/orders/preview` 返回 `submitToken`、商品、金额、运费、优惠券、地址、错误原因 |
| 创建订单 | 需要幂等、库存校验、价格校验 | 重复下单、库存超卖、金额错误 | `POST /api/miniapp/orders` 校验 `submitToken` 和 `idempotentKey`，返回 `orderNo`、`payOrderNo`、订单状态 |
| 支付创建 | 需要真实微信支付参数和支付单号 | 用户无法支付，支付后不能确认状态 | `POST /api/miniapp/payments/create` 返回 `payOrderNo`、`timeStamp`、`nonceStr`、`package`、`signType`、`paySign` |
| 支付状态 | 前端支付成功后需要查后端状态 | 支付成功但页面不知道是否成功 | `GET /api/miniapp/payments/{payOrderNo}` 返回稳定 `payStatus` |
| 钱包余额 | 钱包、提现、支付方式都依赖余额接口 | 钱包页和提现页不可用 | `GET /api/miniapp/wallet/balance` 返回余额、可提现、冻结、手续费、提现开关 |
| 提现申请 | 提现方式、手续费、审核状态需要后端支持 | 用户无法提现或提现状态不清楚 | `POST /api/miniapp/wallet/withdraw/apply` 支持银行卡、支付宝、微信收款码，返回申请单号和审核状态 |
| 钱包流水 | 账单、提现记录、转账记录、月账单需要分页 | 用户查不到资金明细 | `GET /api/miniapp/wallet/ledger` 支持分页、类型筛选、时间筛选 |
| 支付密码 | 设置、修改、找回、状态查询未闭环 | 转账、提现等安全流程无法上线 | 提供支付密码状态、设置、修改、找回接口，并统一错误码 |
| 余额转账 | 收款人校验和转账提交需要后端支持 | 转账功能不能上线 | 提供收款人查询、转账提交、转账记录接口，返回明确失败原因 |
| KYC 实名认证 | 提交、状态、驳回原因、证件图片回显需要闭环 | 实名认证无法审核或回显 | 完成 `POST /api/miniapp/kyc/submit` 和 `GET /api/miniapp/kyc/status` |
| 商家资质 | 提交、状态、驳回原因、已通过资料回显需要闭环 | 商家入驻/资质页不能用 | 完成商家资质申请和状态查询接口 |
| 反馈 | 反馈文字和图片上传需要真实提交 | 用户反馈提交失败 | `POST /api/miniapp/feedback` 支持类型、内容、联系方式、图片 URL 列表 |
| 客服 | 当前客服信息依赖生态应用接口兜底 | 客服电话、二维码、微信号可能不准确 | 建议提供独立客服接口，返回电话、微信、二维码、服务时间 |
| 内容页 | 协议、隐私政策、售后保障、关于我们缺内容发布接口 | 页面空白或展示假数据 | `GET /api/miniapp/content-pages/{pageCode}` 返回标题和富文本内容 |
| 消息通知 | 列表、详情、未读数、已读需要字段统一 | 消息页无法稳定展示和标记已读 | 完成消息列表、详情、已读、未读数接口，统一 `messageId` 字段 |
| 积分设置 | 自动领取积分开关和积分账户需要后端支持 | 积分设置页不可用 | 完成 `points/account` 和 `points/settings/auto-receive` |
| 面对面付款 | 扫码付款需要商户、金额、支付结果 | 面对面付款不能上线 | `POST /api/miniapp/offline-payments/scan` 返回商户信息、付款状态、失败原因 |
| 活动中心 | 秒杀、拼团、砍价、兑换活动需要真实活动数据 | 活动入口展示后不可用 | `GET /api/miniapp/activity/list` 支持活动类型、状态、时间、库存 |
| 拼团 | 团购队伍校验接口缺失 | 商品详情会提示 `拼团暂不可用` | 提供团购资格、队伍状态、参团校验接口 |
| 砍价 | 发起、帮砍、关闭砍价订单接口缺失 | 砍价流程不能上线 | 提供发起砍价、帮砍、关闭/过期处理接口；没做就让前端隐藏入口 |

## 前端逻辑还没完善，依赖后端联调

这些不是单纯“接口不存在”，而是前端已经写了流程，但还没有用真实后端数据跑通。

| 模块 | 当前状态 | 需要联调确认什么 |
| --- | --- | --- |
| 登录状态 | 前端依赖 token、用户 ID、缓存用户信息 | 登录返回字段必须固定；退出登录后接口要返回统一未登录错误 |
| 用户资料 | 前端可展示和保存资料 | 查询、保存、头像 URL、手机号脱敏、性别字段要联调 |
| 地址编辑 | 前端已兼容多个省市区字段 | 后端必须返回省市区名称和 code，否则编辑页无法回显 |
| 商品详情 | 前端有默认图和部分兜底 | 必须用真实商品验证 SKU、库存、价格、优惠券、评价、详情图 |
| 购物车 | 前端有列表、选中、结算入口 | 需要真实验证数量修改、删除、选中、总价、失效商品 |
| 确认订单 | 前端已接订单预览 | 需要真实验证地址必填、配送方式、运费、优惠券、不可下单商品 |
| 支付页 | 前端已做支付创建和状态查询 | 需要真机验证微信支付参数、支付取消、支付成功、支付失败、重复支付 |
| 订单详情 | 前端需要订单状态流 | 需要验证待付款、待发货、待收货、已完成、退款售后、核销/自提 |
| 钱包 | 前端已接余额、流水、提现 | 需要真实验证余额、冻结、手续费、提现方式、审核状态 |
| 图片上传 | 前端统一走 `files/upload` | 需要验证不同业务上传后的 URL 都能访问和回显 |
| KYC | 前端有提交页面 | 需要验证证件上传、合同签署、提交成功、审核中、通过、驳回 |
| 商家资质 | 前端有申请和展示入口 | 需要验证资料提交、状态查询、驳回原因、已通过资料回显 |
| 消息 | 前端有列表和详情 | 需要验证分页、未读数、已读状态、消息类型、跳转业务详情 |
| 活动 | 前端有活动页和入口 | 未完成活动必须隐藏；已完成活动要验证库存、时间、状态、下单链路 |
| 客服/生态应用 | 前端目前复用生态应用数据 | 需要确认哪些是生态应用，哪些是客服配置，避免字段混用 |
| 小程序端适配 | 前端需要真机验证 | 后端错误码和空数据结构要稳定，避免页面只在真实环境才报错 |

## 关键接口补充要求

### 订单和支付

必须可用：

- `POST /api/miniapp/orders/preview`
- `POST /api/miniapp/orders`
- `GET /api/miniapp/orders/{orderNo}`
- `POST /api/miniapp/payments/create`
- `GET /api/miniapp/payments/{payOrderNo}`

后端要保证：

- 创建订单返回 `orderNo`。
- 创建支付返回 `payOrderNo`。
- 支付状态返回 `PAID`、`SUCCESS`、`PENDING`、`FAILED` 这类稳定状态。
- 订单详情要包含金额、商品、地址、配送、状态、核销/自提/物流信息。

### 钱包和提现

必须可用：

- `GET /api/miniapp/wallet/balance`
- `GET /api/miniapp/wallet/ledger`
- `POST /api/miniapp/wallet/withdraw/apply`

后端要保证：

- 钱包余额返回 `balance`、`withdrawableAmount`、`frozenAmount`。
- 提现支持银行卡、支付宝、微信收款码等类型。
- 提现失败要返回明确原因。

### KYC 和商家资质

必须可用：

- `POST /api/miniapp/kyc/submit`
- `GET /api/miniapp/kyc/status`
- `POST /api/miniapp/eco-applications/merchant-qualification/apply`
- `GET /api/miniapp/eco-applications/merchant-qualification/status`

后端要保证：

- 提交后能查审核状态。
- 驳回时返回驳回原因。
- 图片 URL 能回显。
- 合同签署字段要明确是否必填。

### 活动和消息

需要确认：

- `GET /api/miniapp/activity/list`
- 团购队伍校验接口
- 砍价发起、帮砍、关闭订单接口
- `GET /api/miniapp/messages`
- `GET /api/miniapp/messages/{messageId}`
- `POST /api/miniapp/messages/{messageId}/read`
- `GET /api/miniapp/messages/unread-count`

后端要保证：

- 如果活动接口没做，前端需要隐藏入口。
- 消息列表、详情、已读、未读数的消息 ID 字段必须一致。

## 后端处理顺序

1. 先修接口不存在问题：`user/profile`、`eco-applications`、`points/account` 不能再返回 `A0108`。
2. 再修用户身份问题：登录、用户资料、绑定手机号都统一用 token 识别用户，必要时固定返回 `userId`。
3. 再修图片上传：`files/upload` 必须能上传并返回可访问 URL。
4. 再修地址字段：地址列表和详情必须能让编辑页回显省市区。
5. 再修交易主链路：商品详情、购物车、确认订单、创建订单、支付、订单详情。
6. 再修资金链路：钱包余额、流水、提现、转账、支付密码。
7. 再修资质链路：KYC、商家资质、反馈、上传回显、审核状态。
8. 最后处理非核心入口：消息、客服、内容页、积分、活动、拼团、砍价。

## 前后端联调标准

| 阶段 | 联调内容 | 通过标准 |
| --- | --- | --- |
| 接口可用性 | 所有本文档列出的接口逐个请求 | 不返回 `A0108`，错误也必须是业务错误 |
| 鉴权 | 登录后请求用户资料、地址、订单、钱包 | token 可识别用户，不依赖不稳定 `userId` |
| 字段契约 | 用户、地址、商品、订单、支付、钱包、KYC 字段 | 页面不需要靠假数据才能显示完整内容 |
| 空数据 | 空购物车、无地址、无订单、无消息、无积分记录 | 后端返回空列表结构，前端正常展示空状态 |
| 失败场景 | 缺参数、库存不足、订单过期、支付失败、审核驳回 | 后端返回明确错误码和文案，前端能展示给用户 |
| 真机流程 | 微信小程序端完整跑主流程 | 登录、下单、支付、钱包、上传、KYC 无阻塞错误 |

## 后端交付物

后端修完后，需要给前端以下信息，方便快速联调和定位问题：

- 接口清单：每个接口的请求方式、路径、请求参数、返回示例。
- 错误码表：未登录、参数缺失、权限不足、业务失败、系统异常分别返回什么。
- 状态枚举：订单状态、支付状态、提现状态、审核状态、活动状态。
- 测试账号：至少包含普通用户、可支付用户、有钱包余额用户、KYC 待审核/已通过/被驳回用户。
- 上传说明：上传接口字段名、大小限制、格式限制、返回 URL 示例。
- 支付说明：支付创建、支付回调、支付查询、订单状态流转规则。
- 灰度说明：哪些功能已完成，哪些功能暂时隐藏，哪些功能只在测试环境开放。

## 前端整改要求

前端也要按下面标准配合整改，不能只等后端补接口。

- 接口返回业务失败时，页面要展示明确提示，不能静默失败。
- 后端明确未完成的入口，前端要隐藏或禁用，不能让用户进入不可用流程。
- 页面不能长期依赖假数据；真实接口可用后要切到真实数据。
- 支付、提现、KYC、商家资质等高风险流程必须保留加载态、失败态、空态。
- 地址、商品、订单、钱包字段如果后端已固定，前端要去掉不必要的猜字段逻辑。
- 真机联调时发现新错误，要继续补充到本文档，直到上线前清零 P0/P1。

## 验收标准

### P0 验收

- `user/profile`、`eco-applications`、`points/account` 不再返回 `A0108 No static resource`。
- 绑定手机号不再因为缺 `userId` 失败。
- 图片上传成功后，前端能直接展示返回的图片 URL。
- 编辑地址时，省市区能正常显示。
- 用户资料、生态应用、积分账户能正常加载。
- 商品详情、购物车、确认订单、创建订单、支付、订单详情能用真实数据跑通。
- 钱包余额、提现配置、提现申请、钱包流水能用真实账号跑通。
- KYC 和商家资质能提交、查询状态、展示驳回原因或通过资料。

### P1 验收

- 商品 SKU、库存、价格、优惠券、配送费和订单金额一致。
- 地址新增、编辑、删除、默认地址都能正常使用。
- 消息列表、消息详情、未读数、已读状态一致。
- 客服电话、微信、二维码、服务时间展示真实配置。
- 内容页能展示真实协议、隐私政策、售后保障、关于我们等内容。
- 反馈能提交文字、联系方式和图片。

### P2 验收

- 秒杀、拼团、砍价、兑换等活动如果后端没完成，前端入口必须隐藏。
- 如果活动入口展示，活动列表、详情、库存、时间、状态、下单链路必须真实可用。
- 自动领取积分、面对面付款、余额转账等扩展功能如果未完成，需要隐藏入口或明确提示暂不可用。

## 上线前最终检查

- P0 问题全部关闭。
- P1 问题有明确修复结果或产品确认的降级方案。
- 所有接口错误码已固定，前端能按错误码展示明确提示。
- 所有关键页面都有加载态、空态、失败态。
- 所有图片 URL 在小程序端能正常访问。
- 订单、支付、钱包、提现、KYC、商家资质有完整测试记录。
- 未完成业务入口已经隐藏，不会暴露给正式用户。
