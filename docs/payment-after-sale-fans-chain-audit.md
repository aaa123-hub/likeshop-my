# 支付、售后、吸粉功能链检查汇总

检查日期：2026-07-09

## 本次已修正

- 首页扫一扫从“扫码后仅提示成功”改为解析商家二维码并跳转商家详情页。
  - 支持 `/business/pages/business_pages/store_detail?...`
  - 支持 URL/query 中的 `shopId`、`shop_id`、`merchantShopId`、`merchant_shop_id`、`storeId`、`merchantId`、`id`
  - 支持 `scene` 内嵌上述参数
  - 纯数字内容按 `shopId` 处理
- 角色申请页当前角色改为小标签展示。
  - 普通用户显示“普通用户”
  - 成为商家显示“商家”
  - 成为推广者且仍是商家时显示“商家”“推广者”两个标签
- 角色申请页申请角色选择器强制使用前端中文映射，避免后端英文 label 显示到页面。
- 售后列表撤销申请成功后补充关闭确认弹窗。

## 支付链路现状

主要页面和接口：

- 确认订单：`bundle/pages/confirm_order/confirm_order.vue`
- 支付页：`bundle/pages/payment/payment.vue`
- 待付款页：`business/pages/business_pages/pending_payment.vue`
- 面对面付款：`business/pages/business_pages/face_pay.vue`
- 支付 API：`api/app.js`
  - `prepay()` -> `POST miniapp/payments/create`
  - `queryPayment()` -> `GET miniapp/payments/{payOrderNo}`
  - `getPayway()` -> 当前按订单详情归一化支付信息

已具备能力：

- 确认订单提交后跳支付页。
- 支付页固定使用微信 JSAPI 支付。
- 支付成功后会调用支付状态查询确认。
- 0 元订单会直接跳支付结果。
- 待付款页可以继续跳支付页。

存在问题和缺口：

- 支付方式 UI 只保留微信支付。后端即使返回余额、支付宝等支付方式，前端也会过滤掉。
- `prepay()` 固定 `payMethod: "WECHAT_JSAPI"`，页面传入其它支付方式也不会生效。
- `clientIp` 固定为 `127.0.0.1`，生产环境如后端强校验真实 IP，会有风险。
- `idempotentKey` 默认带 `Date.now()`，重复点击或网络重试会生成不同幂等键，严格幂等能力不足。
- 支付失败/取消后只回退或跳结果页，没有明确保留“继续支付”入口状态。
- 面对面付款和普通订单支付共用部分 API，但缺少统一的支付结果落库确认说明，需要后端确认 `bizType`、`bizOrderNo` 是否完全一致。

建议优先级：

1. 明确产品是否只支持微信支付。如果是，隐藏所有多支付方式代码分支；如果不是，需要放开 `paywayList`。
2. 将 `idempotentKey` 固定为业务单号维度，例如 `pay-${bizOrderNo}-WECHAT_JSAPI`。
3. 后端确认 `miniapp/payments/create` 对 `clientIp`、`openId`、`bizType` 的必填规则。

## 售后链路现状

主要页面和接口：

- 售后列表：`bundle_order/pages/post_sale/post_sale.vue`
- 售后列表组件：`bundle_order/components/after-sales-list/after-sales-list.vue`
- 申请退款：`bundle_order/pages/apply_refund/apply_refund.vue`
- 售后详情：`bundle_order/pages/after_sales_detail/after_sales_detail.vue`
- 填写物流：`bundle_order/pages/input_express_info/input_express_info.vue`
- 订单详情入口：`bundle/pages/order_details/order_details.vue`
- 售后 API：`api/user.js`
  - `getAfterSaleList()` -> `GET miniapp/after-sales`
  - `applyAfterSale()` -> `POST miniapp/orders/{orderNo}/refunds`
  - `getGoodsInfo()` -> `GET miniapp/orders/{orderNo}`
  - `afterSaleDetail()` -> `GET miniapp/after-sales/{id}`
  - `cancelApply()` -> `POST miniapp/after-sales/cancel`
  - `inputExpressInfo()` -> `POST miniapp/after-sales/express`

已具备能力：

- 订单详情可按商品展示“申请退款”。
- 申请页支持仅退款/退货退款、原因、说明和图片。
- 重复申请售后时有兼容处理，会尝试查已有售后并跳详情。
- 售后列表分为申请、处理中、完成三个状态页签。
- 售后详情支持撤销、再次申请、填写物流入口。

存在问题和缺口：

- 售后列表组件仍沿用旧 Likeshop 字段：`items.after_sale.able_apply`、`items.after_sale.after_sale_id`、`items.order_goods`。虽然 API 有归一化，但需要用真实后端数据再确认字段完全覆盖。
- `getAfterSaleList()` 对 `apply/finish` 的筛选使用数字状态 `[0,1,2]`、`[4,5,6]`，如果后端返回字符串状态，可能分组不准确。
- 退货物流接口固定 `miniapp/after-sales/express`，如果后端要求 REST 路径如 `miniapp/after-sales/{id}/express`，当前会失败。
- 撤销售后接口固定 `miniapp/after-sales/cancel`，同样需要确认后端是否要求路径参数。
- 售后详情里的“平台退款”按钮目前 `v-show="false"`，没有平台介入/客服处理功能。
- 售后图片上传依赖申请页现有上传逻辑，需真机确认上传结果字段是 URL 字符串还是对象数组。

建议优先级：

1. 用真实后端返回跑一遍 `getAfterSaleList()`，确认 `normalizeAfterSaleItem` 输出能满足旧组件字段。
2. 状态分组改成同时支持数字和字符串，例如 `PENDING/APPROVED/RETURNING/REFUNDED`。
3. 后端确认撤销、填写物流、再次申请的接口路径和参数。

## 吸粉链路现状

主要页面和接口：

- 角色工作台：`business/pages/business_pages/role_workbench.vue`
- 角色申请页：`business/pages/business_pages/promoter_apply.vue`
- 首页扫码/落地页：`pages/index/index.vue`
- App 启动绑定：`App.vue`
- 登录后补绑：`utils/login.js`
- 接口：
  - `getRoleWorkbench()` -> `GET miniapp/roles/workbench`
  - `getShareMnQrcode()` -> `POST miniapp/share/qrcode`
  - `inputInviteCode()` -> `GET miniapp/alliance/card`

已具备能力：

- 角色工作台可以生成专属吸粉码/海报。
- 分享路径使用 `pages/index/index?scene=...`。
- `App.vue` 会解析 `scene` 中的 `invite_code`、`uid_`、`role` 并调用 `inputInviteCode()`。
- 未登录时会把邀请码写入缓存，登录后 `utils/login.js` 会补绑。

存在问题和缺口：

- `inputInviteCode()` 使用 `GET miniapp/alliance/card` 做绑定，语义上像获取名片，不确定后端是否真的执行绑定。需要后端确认。
- 吸粉码 scene 当前是 `uid_{userId}&role={roleCode}&invite_code={code}`，没有区分粉丝绑定、商家绑定、扫码来源、渠道层级。
- 角色工作台只展示“生成海报”，缺少已绑定粉丝/商家数量、今日新增、绑定记录入口。
- 小程序码生成失败时只有“后端未返回吸粉码图片”，没有兜底用前端二维码组件生成可扫路径。
- 首页扫码当前已按“商家二维码”跳商家页处理，不负责吸粉码绑定；吸粉码绑定依赖小程序打开 `scene`。

建议优先级：

1. 后端确认吸粉绑定接口，建议独立接口：`POST miniapp/alliance/bind`。
2. scene 增加 `sceneType=FANS_BIND` 或 `target=merchant/fan`，避免和普通商家码混淆。
3. 角色工作台补充数据接口字段：`fansCount`、`merchantCount`、`todayFans`、`todayMerchant`、`bindRecords`。
4. 小程序码生成失败时可前端生成路径二维码，但正式投放仍应以后端小程序码为准。

## 总体结论

- 支付主链路可跑，但当前等同于“只支持微信支付”。真正多支付方式还没闭环。
- 售后主链路基本齐，但旧组件字段和新后端字段之间仍需要真实数据验证，状态分组和 REST 路径是主要风险。
- 吸粉码生成、分享、打开后绑定已有基础闭环，但绑定接口语义和数据看板还不完整。
- 首页扫一扫已调整为商家二维码入口，扫码后直接打开商家详情页。
