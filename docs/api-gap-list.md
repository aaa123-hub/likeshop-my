# 项目接口缺口与问题清单

更新时间：2026-06-29

本文基于当前前端代码中的 `api/*.js`、`utils/request.js`、`utils/tools.js` 和已有整改文档整理。用途是快速确认现在还缺哪些后端接口、哪些接口虽然已接入但字段或行为不稳定、哪些前端仍在用兜底数据掩盖接口问题。

## 结论

- P0 阻塞项仍集中在用户资料、生态应用、积分账户、绑定手机号、图片上传、地址省市区回显、交易主链路和支付真机联调。
- P1 风险集中在钱包/提现/转账、KYC、商家资质、消息、客服、商街、商品详情、购物车、订单预览等字段契约不稳定。
- P2 未闭环功能包括充值套餐、签到提交、拼团队伍校验、砍价发起/帮砍/关闭、活动兑换、搜索历史清空、独立客服配置等。
- 前端目前大量兼容多字段、多路径和空数据兜底，页面可能“不报错但显示假数据或空数据”。后端不能只返回 `code: 1`，必须返回页面实际需要的 `data`。

## P0：优先补齐或验证

| 模块 | 前端当前调用 | 当前问题 | 后端需要交付 |
| --- | --- | --- | --- |
| 用户资料 | `GET /api/miniapp/user/profile`，`PUT /api/miniapp/user/profile` | 既有文档记录曾返回 `A0108`；请求封装还把该接口列入必须带 `userId` 的校验，说明 token/userId 识别仍需确认 | 路由真实存在；优先 token 识别用户；返回 `userId/id`、`nickname`、`avatar`、`mobile`、`gender`、`realName`；保存后返回最新资料 |
| 绑定手机号 | `POST /api/miniapp/auth/bind-mobile` | 后端曾要求 `userId, mobile and smsCode`；前端会传 `mobile/smsCode/jsCode/encryptedData/iv`，但不应强依赖页面手动传 `userId` | 支持 token 识别当前用户；如果必须 `userId`，登录接口固定返回同名字段；缺参返回 `missingFields` |
| 图片上传 | `POST /api/miniapp/files/upload` | 头像、退款、评论、提现收款码、商家场景共用；必须确认字段名和返回 URL，否则多个业务无法回显图片 | `multipart/form-data`，字段名 `file`；请求头支持 `token` 和 `Authorization`；返回 `data.fileUrl` 或 `data.url`，且 URL 可公网访问 |
| 生态应用/客服 | `GET /api/miniapp/eco-applications` | 生态应用、客服、邀请入口、商家资质入口混用同一接口；客服没数据时前端会显示默认电话/微信 | 返回应用列表字段：`id/appCode/appName/iconUrl/linkUrl/appDesc`；客服配置建议拆独立接口或在该接口返回明确 `customerService` |
| 积分账户 | `GET /api/miniapp/points/account` | 积分、等级、签到、自动领取都依赖该接口；缺数据时前端生成默认签到数据 | 返回 `availablePoints/frozenPoints/totalPoints/autoReceive/signDays/dailySignPoints` 等稳定字段 |
| 地址 | `GET /api/miniapp/addresses`，`POST/PUT/DELETE /api/miniapp/addresses/{id}` | 编辑页需要省市区名称和 code；当前取单条地址是从列表里查，不是真正详情接口 | 列表返回完整省市区名称和编码；建议新增 `GET /api/miniapp/addresses/{id}`；保存接口兼容默认地址字段 |
| 订单预览/创建 | `POST /api/miniapp/orders/preview`，`POST /api/miniapp/orders` | 下单依赖 `submitToken`、运费、优惠券、地址、不可下单原因；创建订单需要幂等和库存校验 | 预览返回 `submitToken`、商品、金额、运费、可用/不可用优惠券、配送能力；创建返回 `orderNo/payOrderNo/orderStatus/payStatus` |
| 支付 | `POST /api/miniapp/payments/create`，`GET /api/miniapp/payments/{payOrderNo}` | 小程序支付参数必须真机验证；支付状态字段需要统一，否则前端无法判断成功/失败 | 创建支付返回 `payOrderNo/timeStamp/nonceStr/package/signType/paySign`；查询返回稳定 `payStatus` 枚举 |

## P1：接口存在但契约不稳定

| 模块 | 前端当前调用 | 当前风险 | 后端需要交付 |
| --- | --- | --- | --- |
| 首页聚合 | `GET /api/miniapp/home/index` | 首页、广告、菜单、推荐商品、分享配置都从同一接口拆字段；失败时前端返回空首页 | 返回 `banners`、`quickEntries/navigation_menu`、`recommendedProducts`、`recommendedShops`、`shareTitle/shareImage` |
| 最近访问 | `GET /api/miniapp/home/recent-visits` | 失败后返回空数组；首页气泡和最近店铺可能直接消失 | 返回商品/店铺最近访问记录、访问时间、目标 ID、名称、图片、用户头像昵称 |
| 商街首页 | `GET /api/miniapp/street/index` | 失败后返回空结构；分类和推荐店铺为空 | 返回搜索框配置、推荐分类、推荐店铺、推荐商品、广告位 |
| 商街商品 | `GET /api/miniapp/search/products`，兜底 `GET /api/miniapp/street/products` | 前端会把店铺数据当商品列表兜底，容易列表类型混乱 | 固定商品搜索接口，明确商品字段和店铺字段，返回分页结构 |
| 店铺详情 | `GET /api/miniapp/shop/{shopId}`，兜底 `shop/detail`、`street/shop/detail`、`merchant-shop/detail` | 前端连续试多个路径，说明正式路由未统一 | 固定一个店铺详情接口；返回门店基础信息、相册、视频、团购商品、评价、二维码、订阅状态 |
| 店铺订阅 | `POST /api/miniapp/shop/{shopId}/subscribe`，兜底 `POST /api/miniapp/user/shop-subscribe` | 两套路由并存，成功结果和订阅状态可能不一致 | 保留一个正式订阅接口；返回 `subscribed` 和当前店铺 ID |
| 商品详情 | `GET /api/miniapp/product/{spuId}` | 前端会补默认 SKU、默认库存、默认详情内容；真实规格和库存必须确认 | 返回商品基础信息、轮播图、详情富文本、SKU 列表、规格组、库存、优惠券、评价摘要、店铺信息 |
| 商品评价 | `GET /api/miniapp/product/{spuId}/comments`，`POST /api/miniapp/product/comments` | 评价列表失败时空数组；评价提交依赖订单项和图片 URL | 返回评价分页、好评率、总数、图片、规格、商家回复；提交成功返回评价 ID |
| 购物车 | `GET/POST/PUT/DELETE /api/miniapp/cart/items` | 失败后购物车显示为空；总价、选中状态、失效商品都依赖后端 | 返回购物车项、选中状态、商品有效状态、数量、单价、汇总金额、失效原因 |
| 订单列表/详情 | `GET /api/miniapp/orders`，`GET /api/miniapp/orders/{orderNo}` | 状态、按钮、物流、自提核销、售后信息字段需要统一 | 返回订单状态枚举、按钮权限、商品、金额、地址、物流、自提码、退款/售后、状态流 |
| 订单操作 | `POST /api/miniapp/orders/{orderNo}/cancel`、`POST /api/miniapp/orders/{orderNo}/confirm-receipt`、`POST /api/miniapp/orders/{orderNo}/verify`、`POST /api/miniapp/orders/{orderNo}/verify/confirm` | 操作需要幂等和业务状态校验 | 返回明确成功/失败原因，禁止状态下返回业务错误而不是通用失败 |
| 售后 | `POST /api/miniapp/orders/{orderNo}/refunds`，`POST /api/miniapp/after-sales/express`，`POST /api/miniapp/after-sales/cancel` | 售后列表目前复用订单列表；售后详情也复用订单详情，业务字段不独立 | 建议补售后列表/详情接口；返回售后单号、状态、退款金额、原因、凭证、物流、审核记录 |
| 钱包余额 | `GET /api/miniapp/wallet/balance` | 支付方式、提现配置、钱包页都依赖；字段缺失会显示默认提现方式 | 返回 `balance/withdrawableAmount/frozenAmount/poundagePercent/openWithdraw/type` |
| 钱包流水 | `GET /api/miniapp/wallet/ledger` | 账单、充值记录、提现记录、转账记录、月账单都复用该接口，筛选字段必须稳定 | 支持 `bizType/status/startTime/endTime/pageNo/pageSize`，返回分页、流水类型、变动金额、余额、时间 |
| 提现 | `POST /api/miniapp/wallet/withdraw/apply` | 提现方式和手续费依赖余额接口；申请状态需要回查 | 返回申请单号、审核状态、手续费、到账方式、失败原因 |
| 转账 | `GET /api/miniapp/wallet/transfer/receiver`，`POST /api/miniapp/wallet/transfer` | 收款人字段不全时前端显示“转账用户”；支付密码校验也要联动 | 收款人返回编号、昵称、头像、手机号脱敏、是否可转账；转账返回单号和状态 |
| 支付密码 | `GET/POST/PUT /api/miniapp/wallet/pay-password`，`POST /api/miniapp/wallet/pay-password/retrieve` | 状态字段不固定会导致重复设置或不能转账/提现 | 状态接口固定返回布尔 `hasPayPassword`；设置/修改/找回统一错误码 |
| KYC | `POST /api/miniapp/kyc/submit`，`GET /api/miniapp/kyc/status` | 状态失败时前端当作未提交，可能让用户重复提交 | 返回 `kycStatus`、实名信息脱敏、证件图、提交时间、驳回原因和原因码 |
| 商家资质 | `POST /api/miniapp/eco-applications/merchant-qualification/apply`，`GET /api/miniapp/eco-applications/merchant-qualification/status` | 无状态数据时无法回显已提交资质 | 返回审核状态、商家信息、资质图片、驳回原因、更新时间 |
| 消息 | `GET /api/miniapp/messages`、`GET /api/miniapp/messages/{messageId}`、`POST /api/miniapp/messages/{messageId}/read`、`GET /api/miniapp/messages/unread-count` | 未读数接口当前被前端转成空数组；消息 ID 字段必须一致 | 返回消息 ID、标题、内容、类型、已读状态、跳转业务 ID；未读数返回数量和分类型统计 |
| 内容页 | `GET /api/miniapp/content-pages/{pageCode}` | 协议、隐私、售后保障、版权等缺内容会空白 | 返回标题、富文本内容、更新时间、启用状态；不存在时返回业务错误和空态原因 |

## P2：当前明确缺口或应隐藏入口

| 模块 | 当前前端状态 | 建议处理 |
| --- | --- | --- |
| 配送方式 | `getDelivery` 直接返回“快递和自提都可用”的默认数据 | 在订单预览返回真实配送能力、运费、自提点、不可配送原因；不要单独依赖前端默认值 |
| 充值套餐 | `rechargeTemplate` 直接返回 `暂无推荐充值套餐` | 如果有充值套餐，新增套餐接口；如果没有，产品确认隐藏推荐充值金额入口 |
| 签到列表 | `getSignList` 基于积分账户生成 7 天默认数据 | 提供签到规则接口，返回每日奖励、连续天数、今日是否已签 |
| 签到提交 | `userSign` 基于积分账户模拟 `签到成功`，且标记 `fallback: true` | 新增真实签到提交接口，返回获得积分、连续天数、账户余额和重复签到错误 |
| 搜索历史清空 | `clearSearch` 直接 `Promise.resolve({ code: 1, data: [] })` | 若搜索历史需要云端同步，提供清空接口；否则明确为纯本地功能 |
| 拼团队伍校验 | `teamCheck` 返回 `拼团队伍校验接口暂未开放` | 提供队伍状态、参团资格、人数、过期时间；未完成则隐藏拼团入口 |
| 砍价发起 | `launchBargain` 返回 `后端暂未提供发起砍价接口` | 提供发起砍价接口，返回砍价单号、当前价、剩余时间 |
| 砍价帮砍 | `helpBargain` 返回 `后端暂未提供帮砍接口` | 提供帮砍接口，返回帮砍金额、是否已帮砍、剩余金额 |
| 砍价关闭 | `closeBargainOrder` 返回 `后端暂未提供关闭砍价订单接口` | 提供关闭/过期处理接口；当前功能开关已禁用砍价路由 |
| 活动兑换 | 功能开关标记活动中心/兑换流程未闭环 | 如果后端未做，继续隐藏入口；如果要上线，补活动兑换、库存、订单、领取记录接口 |
| 独立客服 | 当前客服从生态应用里猜字段并有默认电话/微信 | 建议新增 `GET /api/miniapp/customer-service`，返回电话、微信、二维码、服务时间、在线客服链接 |
| 独立抽奖记录 | 中奖记录复用 `GET /api/miniapp/messages?bizType=LOTTERY` | 建议补 `GET /api/miniapp/lottery/records`，避免消息和业务记录混用 |

## 需要后端统一的接口规范

| 规范项 | 当前风险 | 建议统一 |
| --- | --- | --- |
| 鉴权 | 前端同时传 `token` 和 `Authorization`，部分接口仍附加 `userId` | 登录后接口优先通过 token 识别用户；确需 `userId` 时字段名固定为 `userId` |
| 成功码 | 前端多数按 `code == 1` 判断成功，同时上传兼容字符串 `"0"` | 统一成功返回 `code: 1`；失败返回明确 `code/msg/message` |
| 分页 | 前端兼容 `list/records/items/rows/content` | 建议固定 `list/total/pageNo/pageSize/hasNext` |
| 图片 | 前端会给相对图片拼 `baseURL` | 后端优先返回完整公网 URL；上传和业务图字段统一为 `url/fileUrl/imageUrl` |
| 金额 | 前端直接展示数字，没有统一分转元逻辑 | 金额单位固定，建议元为单位；如果用分，字段名必须明确 |
| 状态 | 订单、支付、提现、KYC、活动状态字段各处兼容很多写法 | 输出稳定枚举，并提供状态说明表 |
| 空数据 | 多个接口失败后前端显示空数组或默认对象 | 真实无数据也要返回稳定空结构和 `emptyReason`，不要让前端误判为接口失败 |
| 未开放功能 | 当前部分前端函数直接模拟失败或成功 | 未完成时返回明确业务错误；产品确认隐藏入口，不要暴露半成品流程 |

## 建议联调顺序

1. 先验证路由存在：`user/profile`、`eco-applications`、`points/account`、`files/upload`、`addresses`，确保不再返回 `A0108`。
2. 再固定登录和鉴权：微信登录、绑定手机号、token 续期、未登录错误码、`userId` 返回字段。
3. 再跑交易主链路：商品详情、SKU、购物车、订单预览、创建订单、支付创建、支付查询、订单详情。
4. 再跑资金链路：钱包余额、流水、提现、支付密码、转账、充值。
5. 再跑资质和用户能力：KYC、商家资质、反馈、图片回显、消息已读/未读。
6. 最后处理低优先级活动：积分签到、抽奖、拼团、砍价、活动兑换；没做完的入口继续隐藏。

## 验收口径

- 任何当前前端调用的 `/api/miniapp/*` 都不能返回静态资源错误。
- 核心页面不能依赖前端默认数据才能看起来完整。
- 下单、支付、提现、KYC、商家资质必须用真实账号完整跑通。
- 后端返回空数据时必须有稳定空结构，页面能展示明确空态。
- 新发现的接口报错继续补充到本文档或 `docs/README.md`，直到 P0/P1 清零。
