# 接口问题大白话清单

更新时间：2026-06-29

这份文档只讲结论：哪些接口现在报错、哪些接口缺、哪些接口虽然有但数据不靠谱。详细字段和联调标准看 `docs/README.md` 和 `docs/api-gap-list.md`。

## 一、现在明确报错的接口

| 优先级 | 接口 | 现在的问题 | 要怎么处理 |
| --- | --- | --- | --- |
| P0 | `GET /api/miniapp/user/profile` | 用户资料接口曾返回 `A0108 No static resource`，页面拿不到用户信息 | 后端补查询用户资料接口，登录后优先用 token 找用户 |
| P0 | `PUT /api/miniapp/user/profile` | 保存头像、昵称、性别等资料需要这个接口，必须确认可用 | 后端补保存资料接口，保存后返回最新用户资料 |
| P0 | `GET /api/miniapp/eco-applications` | 生态应用接口曾返回 `A0108 No static resource`，生态应用和客服信息都拿不到 | 后端补接口，返回生态应用列表和客服配置 |
| P0 | `GET /api/miniapp/points/account` | 积分账户接口曾返回 `A0108 No static resource`，积分、签到、等级都受影响 | 后端补积分账户接口，返回可用积分、冻结积分、累计积分 |
| P0 | `POST /api/miniapp/auth/bind-mobile` | 绑定手机号曾报缺 `userId, mobile and smsCode`，但前端不应该到处手传 `userId` | 后端优先从 token 识别用户，缺参时明确告诉缺哪个字段 |
| P0 | `POST /api/miniapp/files/upload` | 头像、退款、评论、提现收款码、KYC、商家资质都依赖上传；当前需要重点验证失败问题 | 后端确认上传路由、字段名 `file`、鉴权方式和返回图片 URL |

## 二、现在缺的接口或功能没闭环

| 优先级 | 缺口 | 现在前端怎么处理 | 后端要补什么 |
| --- | --- | --- | --- |
| P0 | 地址详情接口 | 编辑地址时前端从地址列表里找单条，不是真正详情接口 | 建议补 `GET /api/miniapp/addresses/{id}`，返回完整省市区名称和 code |
| P0 | 真实配送方式 | 前端默认认为快递和自提都可用 | 订单预览返回真实配送方式、运费、自提点、不可配送原因 |
| P1 | 独立客服接口 | 前端从生态应用里猜客服信息，猜不到就用默认电话和微信 | 建议补 `GET /api/miniapp/customer-service` |
| P1 | 售后列表/售后详情接口 | 现在售后列表和详情复用订单接口，售后字段不完整 | 补售后列表、售后详情，返回售后单号、状态、退款金额、凭证、物流 |
| P1 | 充值套餐接口 | 前端直接显示“暂无推荐充值套餐” | 如果有充值业务，补充值套餐接口；没有就隐藏入口 |
| P1 | 真实签到接口 | 签到列表是前端生成的，签到提交是前端模拟成功 | 补签到规则接口和签到提交接口 |
| P2 | 搜索历史清空接口 | 前端直接当清空成功 | 如果搜索历史要存在后端，补清空接口；否则明确为本地功能 |
| P2 | 拼团队伍校验接口 | 前端直接返回“拼团队伍校验接口暂未开放” | 补拼团队伍状态、参团资格、人数、过期时间 |
| P2 | 砍价发起接口 | 前端直接返回“后端暂未提供发起砍价接口” | 补发起砍价接口，返回砍价单号、当前价、剩余时间 |
| P2 | 砍价帮砍接口 | 前端直接返回“后端暂未提供帮砍接口” | 补帮砍接口，返回帮砍金额、是否已帮砍、剩余金额 |
| P2 | 砍价关闭接口 | 前端直接返回“后端暂未提供关闭砍价订单接口” | 补关闭/过期处理接口；没做完就继续隐藏入口 |
| P2 | 独立抽奖记录接口 | 中奖记录现在复用消息接口 `GET /api/miniapp/messages?bizType=LOTTERY` | 建议补 `GET /api/miniapp/lottery/records` |
| P2 | 活动兑换接口 | 功能开关里已经标记活动兑换未闭环 | 补活动兑换、库存、订单、领取记录；没做完就隐藏入口 |

## 三、接口有，但现在有问题

| 优先级 | 接口 | 大白话问题 | 后端要统一什么 |
| --- | --- | --- | --- |
| P0 | `POST /api/miniapp/orders/preview` | 确认订单页靠它算金额、运费、优惠券、配送方式，缺字段就会显示不准 | 返回 `submitToken`、商品、地址、运费、优惠券、配送能力、不可下单原因 |
| P0 | `POST /api/miniapp/orders` | 创建订单必须防重复、校验库存和价格 | 返回 `orderNo`、`payOrderNo`、订单状态、支付状态 |
| P0 | `POST /api/miniapp/payments/create` | 真正支付要靠它返回微信支付参数，字段不对就无法支付 | 返回 `payOrderNo`、`timeStamp`、`nonceStr`、`package`、`signType`、`paySign` |
| P0 | `GET /api/miniapp/payments/{payOrderNo}` | 支付后需要查状态，状态字段不统一页面不知道成功还是失败 | 统一支付状态，例如 `PAID`、`PENDING`、`FAILED` |
| P1 | `GET /api/miniapp/home/index` | 首页很多东西都从这里拿，失败时前端会显示空首页 | 返回轮播图、菜单、推荐商品、推荐店铺、分享标题和图片 |
| P1 | `GET /api/miniapp/home/recent-visits` | 最近访问失败时前端直接当没有数据 | 返回最近访问的商品/店铺、访问时间、图片、用户信息 |
| P1 | `GET /api/miniapp/street/index` | 商街首页失败时分类和推荐店铺为空 | 返回商街分类、推荐店铺、推荐商品、广告位 |
| P1 | `GET /api/miniapp/search/products` | 商街商品、商品搜索都依赖它；现在前端还会用店铺数据兜底，容易混乱 | 固定返回商品列表，不要商品和店铺字段混用 |
| P1 | `GET /api/miniapp/shop/{shopId}` | 店铺详情现在前端会试好几个兜底路径，说明正式接口不稳定 | 固定一个正式店铺详情接口，返回店铺、相册、视频、商品、评价、二维码 |
| P1 | `POST /api/miniapp/shop/{shopId}/subscribe` | 店铺订阅还有备用接口，容易状态不一致 | 保留一个正式订阅接口，返回是否已订阅 |
| P1 | `GET /api/miniapp/product/{spuId}` | 商品详情缺字段时前端会补默认 SKU、默认库存、默认详情 | 返回真实 SKU、规格、库存、价格、详情图、优惠券、评价摘要 |
| P1 | `GET /api/miniapp/product/{spuId}/comments` | 评价失败时前端显示空评价 | 返回评价列表、总数、好评率、图片、规格、商家回复 |
| P1 | `GET/POST/PUT/DELETE /api/miniapp/cart/items` | 购物车失败时前端显示空购物车，用户会以为没商品 | 返回购物车商品、选中状态、数量、总价、失效原因 |
| P1 | `GET /api/miniapp/orders` | 订单列表需要稳定状态和按钮权限 | 返回订单状态、按钮权限、商品、金额、时间 |
| P1 | `GET /api/miniapp/orders/{orderNo}` | 订单详情需要物流、自提、核销、售后等字段 | 返回订单完整详情、状态流、物流、自提码、售后信息 |
| P1 | `POST /api/miniapp/orders/{orderNo}/cancel` | 取消订单要判断订单状态，不能只返回通用失败 | 返回明确成功或失败原因 |
| P1 | `POST /api/miniapp/orders/{orderNo}/confirm-receipt` | 确认收货需要校验订单是否可收货 | 返回明确成功或失败原因 |
| P1 | `POST /api/miniapp/orders/{orderNo}/verify` | 核销流程要有明确订单和核销状态 | 返回核销结果、失败原因 |
| P1 | `GET /api/miniapp/wallet/balance` | 钱包、提现、支付方式都靠它；字段缺失时前端会显示默认提现方式 | 返回余额、可提现、冻结、手续费、提现开关、提现方式 |
| P1 | `GET /api/miniapp/wallet/ledger` | 账单、充值、提现、转账记录都复用它，筛选字段要稳定 | 支持分页、类型筛选、时间筛选，返回金额变动和余额 |
| P1 | `POST /api/miniapp/wallet/withdraw/apply` | 提现需要手续费、到账方式、审核状态 | 返回提现单号、审核状态、失败原因 |
| P1 | `GET /api/miniapp/wallet/pay-password/status` | 字段不稳定会导致用户重复设置支付密码 | 固定返回布尔值 `hasPayPassword` |
| P1 | `POST /api/miniapp/wallet/transfer` | 转账需要校验收款人和支付密码 | 返回转账单号、转账状态、失败原因 |
| P1 | `GET /api/miniapp/wallet/transfer/receiver` | 收款人信息不全时，前端只能显示“转账用户” | 返回收款人编号、昵称、头像、手机号脱敏、是否可转账 |
| P1 | `POST /api/miniapp/kyc/submit` | 实名认证提交后要能查审核结果 | 返回提交结果和申请单号 |
| P1 | `GET /api/miniapp/kyc/status` | 查询失败时前端会当成未提交，可能重复提交 | 返回真实审核状态、驳回原因、证件图片 |
| P1 | `POST /api/miniapp/eco-applications/merchant-qualification/apply` | 商家资质提交后要能回显和审核 | 返回提交结果、资质 ID |
| P1 | `GET /api/miniapp/eco-applications/merchant-qualification/status` | 没数据时前端无法回显已提交资料 | 返回审核状态、驳回原因、已提交资料、资质图片 |
| P1 | `GET /api/miniapp/messages` | 消息列表需要分页、类型、已读状态 | 返回消息 ID、标题、内容、类型、已读状态、跳转业务 ID |
| P1 | `GET /api/miniapp/messages/unread-count` | 现在前端可能把它转成空数组，未读数不准 | 返回未读总数和分类未读数 |
| P1 | `POST /api/miniapp/messages/{messageId}/read` | 标记已读需要消息 ID 一致 | 统一 `messageId` 字段，返回已读结果 |
| P1 | `GET /api/miniapp/content-pages/{pageCode}` | 协议、隐私、售后保障、版权等内容缺失会空白 | 返回标题、富文本内容、更新时间、启用状态 |

## 四、先处理顺序

1. 先处理明确报错：用户资料、生态应用、积分账户、绑定手机号、图片上传。
2. 再处理交易主链路：商品详情、购物车、订单预览、创建订单、支付、订单详情。
3. 再处理资金链路：钱包余额、提现、流水、支付密码、转账。
4. 再处理资料审核：KYC、商家资质、反馈、上传回显。
5. 最后处理活动和低频功能：签到、抽奖、拼团、砍价、活动兑换。

## 五、统一要求

- 接口不能再返回 `A0108 No static resource`。
- 登录后的接口尽量用 token 找用户，不要要求前端每个接口都传 `userId`。
- 成功统一返回 `code: 1` 和 `data`。
- 失败要告诉具体原因，尤其是缺哪个参数、库存不足、订单状态不允许、支付失败。
- 列表统一返回 `list`、`total`、`pageNo`、`pageSize`、`hasNext`。
- 图片 URL 必须能直接访问。
- 没数据也要返回稳定空结构，不要让前端靠假数据撑页面。
