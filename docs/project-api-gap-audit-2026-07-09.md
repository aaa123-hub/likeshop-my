# 项目接口与功能缺口总审计

更新时间：2026-07-09

本次重新检索范围：

- `api/*.js`
- `pages/`
- `bundle/`
- `bundle_user/`
- `bundle_order/`
- `business/`
- `bundle_misc/`
- `bundle_finance/`
- `bundle_poster/`
- `activity/`
- `utils/request.js`
- `docs/*.md`

说明：本文只汇总“还差什么、后端需要补什么、前端需要注意什么”。已经完成的 UI 修复不再作为待处理问题展开。

## 总体结论

当前主链路前端已经具备兜底和兼容能力，但仍有几类后端数据链没有完全闭环：

- `miniapp/kyc/status`、`miniapp/cart/items`、`miniapp/user/profile` 曾出现 `A0108 No static resource`，需要后端确认接口真实可用。
- 订单预览、待付款、支付创建之间的积分、优惠券、运费、店铺分组金额必须由后端统一计算并返回。
- 角色申请从 KYC、押金、待审核、审核通过、角色生效、工作台、吸粉绑定到积分账本仍需要后端完整状态链。
- 售后列表的 `normal/apply/finish` 分类需要后端按业务类型过滤，不能返回同一批数据。
- 钱包、提现、转账、支付密码、营销活动、抽奖、砍价、旧分销页面仍需真实接口联调或继续入口管控。
- 支付目前等同只支持微信 JSAPI；若要多支付方式，需要前后端重新确认支付方式列表和创建支付参数。

## 优先级总表

| 优先级 | 模块 | 当前问题 | 后端需要补充 | 前端注意 |
| --- | --- | --- | --- | --- |
| P0 | 用户基础 | `kyc/status`、`cart/items`、`user/profile` 曾返回 `A0108` | 补齐接口并返回稳定结构 | 不要长期依赖本地兜底数据 |
| P0 | 确认订单 | 积分不能可靠勾选，金额需要后端试算 | `orders/preview` 返回积分、优惠券、运费、店铺分组和最终金额 | 前端不能按固定比例自行算积分 |
| P0 | 支付 | 支付金额必须以后端为准 | `payments/create` 校验订单金额、优惠券、积分、幂等键 | 当前固定微信 JSAPI |
| P0 | 角色申请 | 押金后待审核、审核通过生效链路需后端状态一致 | `roles`、`role-applications`、押金支付、审核状态闭环 | `PENDING_AUDIT` 不能当正式角色 |
| P1 | 待付款 | 后置换券/积分需要重算 | 提供待付款订单重算接口或支付创建时重算 | 已创建订单不能只看前端传金额 |
| P1 | 售后 | 列表分类和状态仍需真实数据验证 | `after-sales` 按 `type` 过滤；撤销/物流路径确认 | 旧组件字段需要归一化覆盖 |
| P1 | 多店铺 | 多商品订单店铺信息依赖后端字段 | `shopOrders` 或商品项店铺字段 | 无店铺字段只能兜底商城自营 |
| P1 | 吸粉推广 | 绑定关系、粉丝列表、积分账本未闭环 | 独立绑定接口、工作台统计、账本来源字段 | 小程序码 scene 要可追溯 |
| P1 | 自动领取积分 | 后端如只存总开关，三项设置会丢失 | 返回三个细分开关 | 本地缓存只能当前设备兜底 |
| P2 | 钱包资金 | 提现、转账、支付密码、流水需联调 | 钱包余额、流水、提现、转账、支付密码接口稳定 | 金额类必须以后端为准 |
| P2 | 营销活动 | 活动兑换、砍价、抽奖部分流程未闭环 | 活动详情、发起、助力、中奖、核销接口 | 未闭环入口继续禁用或提示 |
| P2 | 客服/内容 | 客服资料、内容页来源不稳定 | 内容页和客服配置接口 | 不要在页面写死客服数据 |

## 后端接口与字段要求

### 1. 用户基础接口

#### `GET /api/miniapp/user/profile`

用途：

- 用户中心
- 待付款页用户资料
- 手机号、头像、昵称、角色标签
- 推广和 KYC 资料兜底

必须返回：

```json
{
  "userId": 51,
  "nickname": "用户昵称",
  "avatarUrl": "https://example.com/avatar.png",
  "mobile": "13800000000",
  "roles": ["MERCHANT"],
  "isMerchant": true,
  "merchantId": 1001,
  "shopId": 2001,
  "availablePoints": 1200,
  "promoterCode": "P51A8",
  "kycStatus": "APPROVED"
}
```

注意：

- 不要返回 `A0108 No static resource`。
- 用户 ID 字段建议统一为 `userId`，兼容 `user_id/id`。
- 图片必须是公网完整 URL 或可由前端拼接的相对路径。

#### `GET /api/miniapp/kyc/status`

用途：

- 实名认证页面
- 角色申请前置判断
- 角色申请资料回填

必须返回：

```json
{
  "kycStatus": "APPROVED",
  "realName": "张三",
  "certType": "ID_CARD",
  "certNo": "330************1234",
  "certFrontUrl": "https://example.com/front.png",
  "certBackUrl": "https://example.com/back.png",
  "auditMessage": "",
  "rejectReasonMessage": "",
  "lastSubmitTime": "2026-07-09 10:00:00"
}
```

状态要求：

- 未提交：`NOT_SUBMITTED`
- 待审核：`PENDING_AUDIT`
- 已通过：`APPROVED`
- 已拒绝：`REJECTED`

#### `GET /api/miniapp/cart/items`

用途：

- 购物车页
- 商品详情加购后刷新数量
- 购物车多商品结算到确认订单

必须返回：

```json
{
  "list": [
    {
      "cartItemId": 1,
      "skuId": 101,
      "goodsId": 1001,
      "goodsName": "商品A",
      "image": "https://example.com/goods.png",
      "specValue": "默认规格",
      "quantity": 2,
      "checked": true,
      "goodsPrice": 19.90,
      "shopId": 1,
      "shopName": "门店A",
      "shopLogo": "https://example.com/shop.png"
    }
  ],
  "cartCount": 2,
  "totalAmount": 39.80
}
```

相关接口：

- `POST /api/miniapp/cart/items`
- `PUT /api/miniapp/cart/items/{cartItemId}`
- `DELETE /api/miniapp/cart/items/{cartItemId}`

注意：

- `POST` 必须接受 `skuId`、`quantity`、`checked`。
- `PUT` 必须支持修改数量和选中状态。
- 多店铺结算必须保留 `shopId/shopName`。

### 2. 商品、分类、商街与店铺

已接入接口：

- `GET /api/miniapp/home/index`
- `GET /api/miniapp/category/tree`
- `GET /api/miniapp/search/products`
- `GET /api/miniapp/product/{spuId}`
- `GET /api/miniapp/product/{spuId}/comments`
- `GET /api/miniapp/street/index`
- `GET /api/miniapp/street/products`
- `GET /api/miniapp/shop/{shopId}`
- `GET /api/miniapp/shop/{shopId}/group-buy`
- `POST /api/miniapp/shop/{shopId}/subscribe`

商品详情必须返回：

```json
{
  "spuId": 1001,
  "name": "商品A",
  "image": "https://example.com/main.png",
  "images": ["https://example.com/1.png"],
  "minPrice": 19.90,
  "maxPrice": 29.90,
  "marketPrice": 39.90,
  "stock": 100,
  "shopId": 1,
  "shopName": "门店A",
  "shopLogo": "https://example.com/shop.png",
  "goodsItem": [
    {
      "skuId": 101,
      "skuName": "默认规格",
      "price": 19.90,
      "salePrice": 19.90,
      "marketPrice": 39.90,
      "stock": 100,
      "image": "https://example.com/sku.png"
    }
  ],
  "comments": {
    "count": 10,
    "goodRate": "98%"
  }
}
```

注意：

- 商品详情到确认订单现在会带本地价格兜底，但后端商品详情仍应稳定返回 SKU 价格。
- 店铺详情、商街列表需要稳定返回营业状态、地址、经纬度、评分、相册、团购商品。
- 商品和店铺二维码参数建议统一为商品 `id/spuId/skuId`、店铺 `shopId`。

### 3. 确认订单与待付款

#### `POST /api/miniapp/orders/preview`

必须返回：

```json
{
  "submitToken": "TOKEN_xxx",
  "shopOrders": [
    {
      "shopId": 1,
      "shopName": "门店A",
      "shopLogo": "https://example.com/shop.png",
      "itemList": [
        {
          "orderItemId": 11,
          "skuId": 101,
          "goodsId": 1001,
          "goodsName": "商品A",
          "image": "https://example.com/goods.png",
          "specValue": "默认规格",
          "quantity": 2,
          "goodsPrice": 19.90,
          "shopId": 1,
          "shopName": "门店A"
        }
      ]
    }
  ],
  "availableCoupons": [],
  "unavailableCoupons": [],
  "receivableCoupons": [],
  "pointsInfo": {
    "enabled": true,
    "availablePoints": 1200,
    "maxUsablePoints": 100,
    "usedPoints": 100,
    "deductAmount": 1.00,
    "integralLimit": 0,
    "exchangeRate": 100
  },
  "amountInfo": {
    "goodsAmount": 99.00,
    "shippingAmount": 0.00,
    "couponDiscountAmount": 5.00,
    "pointsDeductAmount": 1.00,
    "payAmount": 93.00
  }
}
```

必须注意：

- `payAmount` 必须是后端最终金额。
- `pointsInfo.deductAmount` 或 `amountInfo.pointsDeductAmount` 必须明确返回，否则前端禁用积分勾选。
- 优惠券、积分、配送方式、自提地址变化后，预览接口必须重新计算。
- 多店铺订单必须返回 `shopOrders`；如果只返回平铺商品，每个商品也必须带 `shopId/shopName`。
- `submitToken` 用于下单防重，建议后端返回并校验。

#### `POST /api/miniapp/orders`

必须接收：

```json
{
  "submitToken": "TOKEN_xxx",
  "source": "CART",
  "cartItemIds": [1, 2],
  "skuId": 101,
  "quantity": 1,
  "addressId": 10,
  "deliveryType": 1,
  "couponIds": ["CP_xxx"],
  "noCoupon": false,
  "usePoints": true,
  "pointsAmount": 100,
  "pointsDeductAmount": 1.00,
  "selffetchShopId": "S1",
  "pickupLatitude": 30.1,
  "pickupLongitude": 120.1,
  "pickupAddress": "自提地址",
  "consignee": "张三",
  "mobile": "13800000000",
  "idempotentKey": "order-xxx"
}
```

返回建议：

```json
{
  "orderNo": "O202607090001",
  "payAmount": 93.00,
  "orderStatus": "WAIT_PAY"
}
```

#### `GET /api/miniapp/orders/{orderNo}`

待付款和订单详情必须返回：

- 订单基础：`orderNo/orderStatus/payStatus/createTime/expireTime`
- 商品分组：`shopOrders/itemList`
- 金额：`goodsAmount/shippingAmount/couponDiscountAmount/pointsDeductAmount/payAmount`
- 积分：`usedPoints/deductAmount/givePoints`
- 优惠券：已用券、可用券、不可用券、不可用原因
- 自提：自提门店或地图选点地址、联系人、手机号
- 售后：每个订单商品的 `afterSaleId/afterSaleStatus/ableApply`
- 操作权限：取消、支付、确认收货、申请售后、核销等按钮权限

### 4. 支付

已接入接口：

- `POST /api/miniapp/payments/create`
- `GET /api/miniapp/payments/{payOrderNo}`
- `GET /api/miniapp/payments/records`

`payments/create` 必须接收并校验：

```json
{
  "bizType": "ORDER",
  "bizOrderNo": "O202607090001",
  "amount": 93.00,
  "payMethod": "WECHAT_JSAPI",
  "payScene": "MINIAPP",
  "openId": "openid",
  "couponId": "CP_xxx",
  "couponIds": ["CP_xxx"],
  "noCoupon": false,
  "usePoints": true,
  "pointsAmount": 100,
  "pointsDeductAmount": 1.00,
  "idempotentKey": "pay-O202607090001-WECHAT_JSAPI"
}
```

返回建议：

```json
{
  "payOrderNo": "P202607090001",
  "bizOrderNo": "O202607090001",
  "payAmount": 93.00,
  "payStatus": "PENDING",
  "payMethod": "WECHAT_JSAPI",
  "channelPayInfo": {
    "timeStamp": "1720000000",
    "nonceStr": "xxx",
    "package": "prepay_id=xxx",
    "signType": "RSA",
    "paySign": "xxx"
  }
}
```

注意：

- 后端必须重新校验金额，不能信任前端 `amount/pointsDeductAmount`。
- 当前前端固定 `WECHAT_JSAPI`，如果要支持余额、支付宝，需要补支付方式配置接口和前端 UI。
- 当前 `clientIp` 前端默认 `127.0.0.1`，后端如果强校验真实 IP，需要由服务端自行获取或提供规则。
- 支付成功后，`GET /payments/{payOrderNo}` 必须返回最终状态，支付结果页和订单详情金额要一致。

### 5. KYC、商家资质与角色申请

已接入接口：

- `POST /api/miniapp/kyc/submit`
- `GET /api/miniapp/kyc/status`
- `POST /api/miniapp/eco-applications/merchant-qualification/apply`
- `GET /api/miniapp/eco-applications/merchant-qualification/status`
- `GET /api/miniapp/roles`
- `GET /api/miniapp/role-applications`
- `POST /api/miniapp/role-applications`
- `GET /api/miniapp/roles/workbench`

角色状态链必须一致：

| 场景 | 申请状态 | 押金状态 | 是否正式生效 |
| --- | --- | --- | --- |
| 未支付押金 | `PENDING_DEPOSIT` | `UNPAID` | 否 |
| 已支付待审核 | `PENDING_AUDIT` | `PAID` | 否 |
| 审核通过 | `APPROVED` | `PAID/WAIVED` | 是 |
| 审核拒绝 | `REJECTED` | `PAID/REFUNDED` | 否 |
| 取消/关闭 | `CANCELLED/CLOSED` | 任意 | 否 |

`GET /api/miniapp/roles` 建议返回：

```json
{
  "roles": [
    {
      "roleCode": "MERCHANT",
      "roleName": "商家"
    }
  ],
  "applyRoles": [
    {
      "roleCode": "PROMOTER",
      "roleName": "推广者",
      "depositRequired": true,
      "depositAmount": 100.00,
      "auditRequired": true,
      "description": "缴纳押金后等待平台审核"
    }
  ]
}
```

`GET /api/miniapp/role-applications` 建议返回：

```json
{
  "applications": [
    {
      "applicationNo": "APP202607090001",
      "roleCode": "PROMOTER",
      "roleName": "推广者",
      "applicationStatus": "PENDING_AUDIT",
      "auditStatus": "PENDING_AUDIT",
      "depositNo": "DEP202607090001",
      "depositAmount": 100.00,
      "depositStatus": "PAID",
      "payStatus": "PAID",
      "auditRemark": "",
      "appliedAt": "2026-07-09 11:20:00",
      "paidAt": "2026-07-09 11:22:00",
      "auditedAt": ""
    }
  ]
}
```

注意：

- `roles` 只放正式生效角色，不放 `PENDING_AUDIT`。
- 角色申请页已移除“管辖区域”选择，新申请不再要求区域字段。
- 后端如果仍需要区域字段，应改为后台配置或审核时补充，不能阻断前端提交。
- 押金支付方式目前通过 `payments/create`，`bizType=ROLE_DEPOSIT`。

### 6. 推广吸粉与积分账本

已接入接口：

- `GET /api/miniapp/roles/workbench`
- `POST /api/miniapp/share/qrcode`
- `GET /api/miniapp/alliance/card`
- `GET /api/miniapp/points/ledger`

当前缺口：

- `GET /miniapp/alliance/card` 被用于邀请码绑定，语义不清。
- 缺少独立粉丝绑定接口。
- 缺少粉丝/商家绑定列表。
- 缺少吸粉收益、区域提成、退款扣回的统一账本字段。

建议新增或确认：

- `POST /api/miniapp/alliance/bind`
- `GET /api/miniapp/promoter/fans`
- `GET /api/miniapp/promoter/merchants`
- `GET /api/miniapp/points/ledger`

`roles/workbench` 建议返回：

```json
{
  "roleCode": "PROMOTER",
  "inviteCode": "P51A8",
  "qrcodeUrl": "https://example.com/qrcode.png",
  "posterUrl": "https://example.com/poster.png",
  "fansCount": 20,
  "merchantCount": 3,
  "todayFans": 2,
  "todayMerchant": 1,
  "todayProfit": 12.50,
  "availablePoints": 1200,
  "frozenPoints": 100
}
```

`points/ledger` 建议返回：

```json
{
  "list": [
    {
      "sourceType": "FAN_COMMISSION",
      "roleCode": "PROMOTER",
      "fanName": "用户A",
      "merchantName": "门店A",
      "orderNo": "O202607090001",
      "changeAmount": 100,
      "balance": 1200,
      "createTime": "2026-07-09 11:20:00"
    },
    {
      "sourceType": "AFTER_SALE_REFUND",
      "roleCode": "PROMOTER",
      "orderNo": "O202607090001",
      "changeAmount": -100,
      "balance": 1100,
      "createTime": "2026-07-09 12:20:00"
    }
  ]
}
```

### 7. 自动领取积分

已接入接口：

- `GET /api/miniapp/points/settings/auto-receive`
- `POST /api/miniapp/points/settings/auto-receive`

页面有三个独立开关：

- 线上订单支付后
- 线上订单确认收货后
- 线下订单支付后

后端必须返回：

```json
{
  "autoReceiveFlag": true,
  "onlinePay": true,
  "onlineReceive": false,
  "offlinePay": true,
  "updatedAt": "2026-07-09 15:30:00"
}
```

注意：

- 如果只返回 `autoReceiveFlag`，前端只能当前设备本地缓存兜底，跨设备会丢失细分开关。

### 8. 售后

已接入接口：

- `GET /api/miniapp/after-sales?type=normal`
- `GET /api/miniapp/after-sales?type=apply`
- `GET /api/miniapp/after-sales?type=finish`
- `POST /api/miniapp/orders/{orderNo}/refunds`
- `GET /api/miniapp/after-sales/{afterSaleId}`
- `POST /api/miniapp/after-sales/cancel`
- `POST /api/miniapp/after-sales/express`

列表分类要求：

- `type=normal`：只返回可申请售后的订单商品。
- `type=apply`：返回待商家处理、处理中、待买家退货。
- `type=finish`：返回已拒绝、退款成功、已撤销、已关闭。

售后记录建议返回：

```json
{
  "orderNo": "O202607090001",
  "shopId": 1,
  "shopName": "门店A",
  "afterSale": {
    "afterSaleId": 20001,
    "refundNo": "R202607090001",
    "status": 1,
    "statusText": "处理中",
    "type": "REFUND",
    "typeText": "仅退款",
    "refundAmount": 19.90,
    "refundReason": "不想要了",
    "applyTime": "2026-07-09 11:20:00"
  },
  "orderGoods": [
    {
      "orderItemId": 11,
      "goodsName": "商品A",
      "image": "https://example.com/goods.png",
      "goodsPrice": 19.90,
      "goodsNum": 1,
      "afterSaleId": 20001,
      "ableApply": 0
    }
  ]
}
```

注意：

- 如果后端使用 REST 路径 `after-sales/{id}/cancel` 或 `after-sales/{id}/express`，需要同步前端接口。
- 当前前端仍兼容旧 Likeshop 字段，真实数据必须验证归一化是否覆盖。
- 状态建议同时提供数字和文本，避免前端按数字分组误判字符串状态。

### 9. 钱包、提现、转账、支付密码

已接入接口：

- `GET /api/miniapp/wallet/balance`
- `GET /api/miniapp/wallet/ledger`
- `POST /api/miniapp/wallet/withdraw/apply`
- `POST /api/miniapp/wallet/recharge`
- `POST /api/miniapp/wallet/recharge/gift-card`
- `POST /api/miniapp/wallet/pay-password/set`
- `POST /api/miniapp/wallet/pay-password/change`
- `POST /api/miniapp/wallet/pay-password/retrieve`
- `GET /api/miniapp/wallet/pay-password/status`
- `POST /api/miniapp/wallet/transfer`
- `GET /api/miniapp/wallet/transfer/receiver`

后端需要确认：

- 余额字段：`availableAmount/frozenAmount/totalAmount`
- 流水字段：`sourceType/changeAmount/balance/createTime/status`
- 提现字段：`withdrawNo/amount/accountType/accountNo/auditStatus/payStatus/rejectReason`
- 转账字段：收款人校验、转账单号、手续费、支付密码校验
- 支付密码状态字段：`hasPayPassword`

注意：

- 金额类操作必须使用服务端最终金额和状态。
- 前端存在多个旧页面入口，建议优先联调钱包首页、提现、支付密码、流水，再开放转账。

### 10. 营销活动、抽奖、砍价

已接入或部分接入接口：

- `GET /api/miniapp/activity/list`
- `GET /api/miniapp/lottery`
- `GET /api/miniapp/lottery/records`
- `POST /api/miniapp/lottery/draw`
- `POST /api/miniapp/coupons/{couponId}/receive`

当前前端已禁用或兜底的功能：

- 活动中心后端兑换/营销流程未闭环
- 活动兑换未闭环
- 砍价发起、帮砍、关闭订单未提供完整接口
- 找回密码短信流程未闭环

后端如要开放，需要补：

- 活动详情、活动状态、活动商品、库存、开始/结束时间。
- 砍价：发起、帮砍、进度、关闭、转订单。
- 抽奖：奖品配置、中奖记录、抽奖次数、核销码。
- 活动兑换：积分/券/商品兑换、库存扣减、订单或核销码生成。

### 11. 内容、客服、消息

已接入接口：

- `GET /api/miniapp/content-pages/{pageCode}`
- `GET /api/miniapp/messages`
- `GET /api/miniapp/messages/{messageId}`
- `POST /api/miniapp/messages/{messageId}/read`
- `GET /api/miniapp/messages/unread-count`

仍需补充：

- 客服配置接口：电话、微信、QQ、二维码、在线客服链接、服务时间。
- 内容页稳定 pageCode：协议、隐私政策、售后保障、版权信息等。
- 消息类型字段：`bizType/title/content/readFlag/sendTime/linkUrl`。

## 前端需要注意的点

- `utils/request.js` 会自动给部分 `miniapp/*` 接口补 `userId`，后端 GET/POST 都要能接受 `userId`。
- `utils/request.js` 会拦截缺失关键参数，例如 `orders/preview` 要有 `source`，`payments/create` 要有 `bizType/bizOrderNo/payMethod/idempotentKey`。
- 图片字段会按字段名自动补全域名，后端返回相对路径可用，但推荐直接返回完整公网 URL。
- 已有 `A0108 No static resource` 兜底只适合开发期，后端应返回明确业务状态，不应让前端长期识别静态资源错误。
- 商品、订单、售后、钱包金额不要由前端最终决定，前端只负责展示和提交用户选择。
- 小程序地理位置权限还需要真机验证，微信开发者工具权限状态不能作为最终结论。
- 角色申请页面已移除管辖区域选择，后端如果仍强制区域字段会导致提交失败。
- 自动领取积分本地缓存只能解决当前设备回显，后端必须保存细分字段。

## 主要风险汇总

- 支付金额风险：优惠券、积分、运费如果前后端分别计算，会出现确认页、待付款页、支付页金额不一致。
- 权限提前开放风险：`PENDING_AUDIT` 如果进入正式 `roles`，推广者权限会提前生效。
- 多店铺展示风险：没有 `shopOrders` 或商品店铺字段时，购物车多商品订单无法正确展示店铺。
- 售后重复风险：后端不按 `type` 分类，处理中售后会重复出现在可申请列表。
- 吸粉追溯风险：只有二维码没有绑定落库，粉丝数、商家数、收益、退款扣回无法核对。
- 资金安全风险：支付、提现、转账如果信任前端金额或幂等键不稳定，会有重复支付和金额篡改风险。
- 跨设备设置风险：自动领取积分只保存总开关会导致三项独立配置丢失。
- 旧分包风险：`bundle_misc`、`bundle_finance`、`activity` 仍有旧 Likeshop 页面和字段，需要逐条真实数据验证后再开放入口。

## 建议联调顺序

1. 用户基础：登录、`user/profile`、`cart/items`、`kyc/status`。
2. 商品购物车：分类、搜索、商品详情、加购、购物车多商品结算。
3. 确认订单：订单预览、优惠券、积分、自提地址、店铺分组。
4. 支付：创建订单、继续支付、支付查询、支付结果、订单详情金额一致。
5. 售后：可申请、申请中、已完成、撤销、填写物流、再次申请。
6. KYC 与角色：实名、角色申请、押金、待审核、审核通过、工作台。
7. 吸粉：生成码、扫码进入、绑定、粉丝列表、积分账本、售后扣回。
8. 钱包资金：余额、流水、提现、支付密码、转账。
9. 营销活动：抽奖、活动兑换、砍价、拼团、优惠券领取。
10. 真机能力：地理位置、地图选点、微信支付、小程序码识别、图片上传。

## 需要后续补充到本文的内容

- 后端确认后的真实接口响应示例。
- 真实用户 `userId=51` 的完整联调结果。
- 每个模块的接口错误码和前端展示文案。
- 生产环境是否只支持微信支付。
- 微信公众平台的小程序码、URL Scheme、地理位置权限配置结果。
