# 前端功能链风险、未完成与待优化排查

更新时间：2026-07-09

本次已按要求清空 `docs/` 旧文档，仅保留本文作为新的前端排查结果。排查范围覆盖主要页面、业务入口、接口调用、支付/扫码、订单、购物车、商品详情、待付款、角色申请、吸粉、KYC、售后、积分、门店、自提、消息、钱包、活动等前端链路。

## 1. 本轮已处理的前端问题

### 1.1 `business/pages/business_pages/face_pay` 线下付款链路

实际页面文件：

```text
business/pages/business_pages/face_pay.vue
```

该文件只是包装页，真实 UI 和逻辑在：

```text
business/pages/business_scene/scene-shell.vue
```

本轮已修复：

- 输入框提示从“付款单号”调整为“付款码/付款单号”，减少用户理解偏差。
- `扫一扫` 后不再直接把整段二维码内容提交，而是先解析二维码内容。
- 支持从以下二维码内容中提取付款码/付款单号：
  - 普通单号文本。
  - URL query，例如 `?payOrderNo=xxx`、`?paymentNo=xxx`、`?orderNo=xxx`。
  - 小程序码 `scene`，例如 `scene=payOrderNo=xxx`。
  - 紧凑格式，例如 `payOrderNo:xxx`、`orderNo=xxx`。
- 提交前增加门店 ID 校验。
- 如果缺少 `shopId`，页面会提示“缺少门店ID，请从门店详情进入付款”，避免静默请求失败。

### 1.2 `bundle/pages/payment/payment` 面对面付款模式

该页面原来存在一块面对面付款 UI，但输入框没有 `v-model`，扫码按钮没有事件，确认付款也没有线下付款逻辑。

本轮已修复：

- 面对面付款输入框已绑定 `facePayCode`。
- `扫一扫` 已接入 `uni.scanCode`。
- 扫码结果会复用付款码解析逻辑。
- 面对面付款模式下点击底部按钮会调用线下付款接口。
- 页面支持从 URL 参数接收：
  - `shopId/shop_id`
  - `payOrderNo/pay_order_no`
  - `paymentNo/payment_no`
  - `code`
- 面对面付款模式不再依赖普通订单支付倒计时。

### 1.3 线下付款接口入参兼容

接口函数：

```text
api/user.js -> scanOfflinePayment()
```

本轮已增强入参兼容。前端会同时提交：

```json
{
  "shopId": "门店ID",
  "qrCode": "付款码或付款单号",
  "qr_code": "付款码或付款单号",
  "payOrderNo": "付款码或付款单号",
  "pay_order_no": "付款码或付款单号",
  "paymentNo": "付款码或付款单号",
  "payment_no": "付款码或付款单号",
  "orderNo": "付款码或付款单号",
  "order_no": "付款码或付款单号",
  "bizOrderNo": "付款码或付款单号",
  "biz_order_no": "付款码或付款单号",
  "payMethod": "WECHAT_JSAPI"
}
```

这样可以降低后端实际字段名和前端字段名不一致导致的支付失败风险。

## 2. `face_pay` 专项说明

### 2.1 “扫一扫”扫哪里的二维码

当前前端逻辑支持扫描以下二维码：

- 平台或商家生成的线下付款二维码。
- 二维码内容是纯付款码/付款单号。
- 二维码内容是带参数的链接，例如：

```text
https://shengyuan.store/xxx?payOrderNo=PAY202607090001
```

- 二维码内容是小程序码 scene，例如：

```text
payOrderNo=PAY202607090001&shopId=12
```

当前前端会提取这些字段作为付款码：

- `payOrderNo`
- `pay_order_no`
- `paymentNo`
- `payment_no`
- `paymentId`
- `payment_id`
- `orderNo`
- `order_no`
- `bizOrderNo`
- `biz_order_no`
- `code`
- `qrCode`
- `qr_code`

### 2.2 当前仍存在的产品/后端链路疑问

线下付款链路还需要明确“谁扫谁”的业务模型：

- 如果是用户扫商家收款码：二维码应包含 `shopId`，用户输入金额后创建付款单，再拉起微信支付。
- 如果是商家扫用户付款码：页面应是商家端核销/收款页面，二维码应包含用户付款授权码或付款单号。
- 如果是用户输入付款单号支付：后端必须能通过付款单号查到金额、门店、订单状态，再创建或确认支付。

当前页面文案是“面对面付款”，但接口名是：

```http
POST /api/miniapp/offline-payments/scan
```

这更像“扫码确认线下付款/核销”，不是完整的“创建付款单 -> 拉起微信支付 -> 支付成功确认”的链路。

### 2.3 后端建议补充

建议后端明确提供或确认以下接口之一。

方案 A：扫码后创建线下支付单

```http
POST /api/miniapp/offline-payments/create
```

请求：

```json
{
  "shopId": 12,
  "amount": 99.9,
  "payMethod": "WECHAT_JSAPI",
  "scene": "FACE_PAY"
}
```

返回：

```json
{
  "bizOrderNo": "OFF202607090001",
  "payOrderNo": "PAY202607090001",
  "amount": 99.9,
  "shopId": 12,
  "shopName": "门店A"
}
```

然后前端调用统一支付：

```http
POST /api/miniapp/payments/create
```

方案 B：扫码确认已有付款单

```http
POST /api/miniapp/offline-payments/scan
```

请求：

```json
{
  "shopId": 12,
  "payOrderNo": "PAY202607090001",
  "qrCode": "PAY202607090001",
  "payMethod": "WECHAT_JSAPI"
}
```

返回必须明确：

```json
{
  "payStatus": "PAID",
  "payOrderNo": "PAY202607090001",
  "bizOrderNo": "OFF202607090001",
  "amount": 99.9,
  "shopId": 12,
  "shopName": "门店A"
}
```

## 3. 当前前端风险汇总

### 3.1 支付链路风险

- `face_pay` 目前没有金额确认、订单详情确认、门店名称确认，只能提交付款码/付款单号。
- 如果后端要求金额或付款单号状态，当前页面没有完整展示。
- `bundle/pages/payment/payment` 虽然已补面对面付款逻辑，但该入口是否被正式使用还需要确认路由规范。
- 普通订单支付依赖 `miniapp/payments/create`，如果后端缺少 `openId` 或登录态异常，会提示“缺少微信支付授权信息”。
- 支付成功后依赖 `GET /api/miniapp/payments/{payOrderNo}` 二次确认，如果后端支付状态异步延迟，前端会提示“支付状态确认中”。

### 3.2 门店与自提链路风险

- `face_pay` 需要 `shopId`，建议只从门店详情或带 `shopId` 的二维码进入。
- 门店自提、地图选点、门店列表此前已多次调整，仍需真机验证定位权限、门店选择、确认订单回填地址三段链路。
- 小程序定位权限文案长度曾超限，后续新增权限描述必须控制在微信限制内。

### 3.3 商品详情和优惠券链路风险

- 商品详情优惠券领取已做前端兜底，但最终状态必须以后端用户维度领取状态为准。
- 如果商品详情接口不返回 `receiveStatus/isGet/canReceive`，换设备或清缓存后仍可能显示“可领取”。
- 优惠券 ID 必须在详情和领取接口中保持一致，否则领取后无法准确回填状态。
- 商品详情订阅、拼团等活动能力仍存在“暂不可用”提示，说明后端活动链路不完整或前端仍需联调。

### 3.4 待付款/确认订单链路风险

- 积分抵扣功能存在明确调试输出，说明仍在联调状态。
- 积分是否可用依赖订单预览、用户积分账户、积分规则多个来源，后端缺任一字段都会导致页面不展示或不可用。
- 多商品购物车进入确认订单时店铺信息、优惠券、积分、自提地址都依赖订单预览返回的结构稳定。

### 3.5 角色申请和吸粉链路风险

- 角色申请链路已兼容 `PENDING_DEPOSIT/PENDING_AUDIT/APPROVED/REJECTED`。
- 工作台、吸粉码、粉丝绑定已接入新 `promotion` 接口并保留旧接口兜底。
- 仍需后端保证 `roles` 只返回审核通过角色，不能把 `PENDING_AUDIT` 当正式角色。
- 吸粉绑定必须按 `userId + roleCode + inviteCode` 隔离，避免多角色数据混淆。

### 3.6 KYC 和商家资质链路风险

- KYC 状态字段已做多字段兼容。
- 证件照片展示已改为自适应，但仍需真机检查横向证件和竖向图片的显示效果。
- 商家资质接口如果缺状态或返回旧字段，页面仍可能进入兜底状态。

### 3.7 售后和订单详情链路风险

- 售后列表和售后详情已有多状态兼容，但售后申请、处理中、退款成功等状态需要后端明确枚举。
- 如果后端同一售后单同时出现在申请和处理中列表，前端只能通过状态归类，不能彻底解决重复数据来源。
- 订单详情展示字段很多，仍需按真实订单类型验证：普通配送、自提、核销、售后、退款、支付记录。

### 3.8 活动链路风险

以下活动接口仍有明显未完成提示：

- 发起砍价。
- 帮砍。
- 关闭砍价订单。
- 部分拼团/秒杀入口仍存在暂不可用兜底。

这些属于后端接口或活动规则未完全接通的风险。

## 4. 未完成事项

### 4.1 线下支付

- 明确 `face_pay` 是用户扫商家收款码，还是商家扫用户付款码。
- 明确二维码内容规范。
- 明确 `offline-payments/scan` 是创建支付、确认支付，还是核销支付。
- 页面需要展示门店名称、付款金额、订单状态后再确认，避免用户误付。
- 如需微信支付，后端应返回可用于统一支付的 `bizOrderNo/payOrderNo/amount`。

### 4.2 积分抵扣

- 后端需要稳定返回用户可用积分、抵扣比例、最大抵扣积分、最大抵扣金额、是否支持当前订单。
- 前端需要在联调稳定后移除控制台积分调试输出。
- 确认订单页应明确展示不可用原因，而不是直接隐藏。

### 4.3 活动能力

- 砍价、帮砍、关闭砍价订单接口需要后端补齐。
- 商品详情中的拼团/订阅暂不可用需要继续联调。

### 4.4 付款记录筛选

- 当前筛选 UI 里时间选择更像静态列展示，后续应接真实日期选择、状态筛选和接口参数。
- 付款记录需要确认是否展示普通订单支付、线下付款、充值、退款等所有支付流水。

## 5. 待优化事项

### 5.1 控制台输出清理

当前仍检索到多处 `console.log`，建议后续清理生产无关输出。重点包括：

- `bundle/pages/confirm_order/confirm_order.vue` 积分调试输出。
- `bundle/pages/goods_details/goods_details.vue` 优惠券空数据输出。
- `bundle_misc/pages/user_fans/user_fans.vue` 搜索关键词输出。
- 多个活动页面和售后核销页面的调试输出。

### 5.2 页面样式一致性

- Lanhu 已覆盖的页面应继续以 Lanhu 为准，逐步替换旧 Likeshop 样式。
- 旧活动页、分销页、核销页仍有明显旧结构和调试痕迹。
- 长文本、金额、订单号、二维码 scene 等字段应统一做换行或省略策略。

### 5.3 路由入口统一

- `face_pay` 现在有两个可能入口：`business/pages/business_pages/face_pay` 和 `bundle/pages/payment/payment?mode=facepay`。
- 建议确认只保留一个正式入口，另一个作为兼容入口，避免后续逻辑重复。
- 所有进入 `face_pay` 的地方都应携带 `shopId`。

### 5.4 错误提示统一

- 当前多个页面仍直接展示接口 `msg`。
- 建议统一封装业务错误文案，尤其是支付、优惠券、积分、KYC、角色申请。

## 6. 后端需重点补充的数据

### 6.1 线下支付

必须明确返回：

- `shopId`
- `shopName`
- `payOrderNo`
- `bizOrderNo`
- `amount`
- `payStatus`
- `payMethod`
- `createTime`
- `paidAt`
- `failureReason`

如果二维码由后端生成，二维码内容建议包含：

```text
shopId=12&payOrderNo=PAY202607090001
```

或：

```text
shopId=12&bizOrderNo=OFF202607090001
```

### 6.2 积分抵扣

确认订单预览建议返回：

- `pointsEnabled`
- `availablePoints`
- `maxUsablePoints`
- `pointsDeductAmount`
- `pointsExchangeRate`
- `pointsUnavailableReason`
- `supportPoints`

### 6.3 角色和吸粉

后端需保证：

- `applicationStatus=PENDING_AUDIT` 表示待审核。
- `APPROVED` 才算正式角色。
- `roles` 只返回正式角色。
- 工作台统计按 `roleCode` 隔离。
- 粉丝绑定按 `promoterUserId + roleCode + inviteCode` 隔离。

### 6.4 优惠券

商品详情优惠券必须返回：

- `couponTemplateId`
- `couponId`
- `receiveStatus`
- `isGet/is_get`
- `canReceive`
- `receivedAt`
- `receiveLimit`
- `receivedCount`

## 7. 本次改动文件

```text
api/user.js
business/pages/business_scene/scene-shell.vue
bundle/pages/payment/payment.vue
docs/frontend-risk-unfinished-optimization-audit-2026-07-09.md
```

## 8. 建议下一步

1. 后端确认线下支付业务模型和二维码内容规范。
2. 真机验证 `business/pages/business_pages/face_pay?shopId=xxx` 扫码和输入付款单号。
3. 真机验证 `bundle/pages/payment/payment?from=facepay&mode=facepay&shopId=xxx` 兼容入口。
4. 联调积分抵扣完整字段，稳定后清理调试输出。
5. 清理生产无关 `console.log`。
6. 对活动、售后、付款记录筛选继续做专项联调。
