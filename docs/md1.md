# 待付款积分与角色申请未完成事项汇总

### 待付款订单积分后置选择

当前前端只能展示订单详情已返回的积分抵扣结果，并在支付页透传该结果。若产品要求“待付款页还能临时勾选/取消积分抵扣”，前端还需要接入后端订单重算接口。

前端需要后端先提供：

- 待付款订单重算接口。
- 重算后返回新的应付金额、积分抵扣金额、优惠券抵扣金额、运费和最终支付金额。
- 明确支付前修改积分是否会锁定订单金额。

### 角色申请完整链路联调

前端已经按 `applicationStatus = PENDING_AUDIT` 展示待审核，`APPROVED` 才认定角色正式生效。但完整链路还需要后端接口稳定返回角色配置、押金单、申请状态、审核状态和正式角色。

前端待联调点：

- 未实名时是否阻止角色申请。
- 押金支付成功后是否稳定显示“待审核”。
- 审核通过后顶部角色标签是否只展示已生效角色。
- 审核拒绝后是否展示拒绝原因并允许重新申请。
- 多角色申请时，商家和推广者状态是否互不覆盖。

### 吸粉和推广工作台

目前角色申请通过后，吸粉数据、邀请码、二维码、粉丝列表、积分账本还依赖后端补齐。前端页面可展示基础结构，但无法保证完整业务闭环。

前端待联调点：

- 推广者邀请码、二维码生成和分享落参。
- 扫码进入后的绑定关系是否落库。
- 粉丝列表、商家列表、收益/积分账本分页加载。
- 售后退款后积分扣回记录是否展示。

## 后端未处理问题

### 缺失接口

以下接口曾返回 `A0108 No static resource`，前端只能兜底，完整功能需要后端补齐：

- `GET /api/miniapp/kyc/status`
- `GET /api/miniapp/cart/items`
- `GET /api/miniapp/user/profile`

影响：

- 角色申请无法可靠判断实名认证状态。
- 首页/商品页进入购物车或购物车数据刷新可能失败。
- 待付款页无法可靠读取用户资料、手机号、积分账户等基础信息。

### 确认订单积分试算

确认订单页只有后端返回本单明确抵扣金额时才允许勾选积分。当前不能由前端按固定比例计算，因为缺少兑换比例、封顶规则、可抵扣范围、优惠券叠加顺序和退款规则。

后端必须返回：

- 积分功能是否开启。
- 用户可用积分。
- 本单最多可用积分。
- 本单积分抵扣金额。
- 积分使用门槛。
- 积分和优惠券、运费、商品金额共同计算后的最终应付金额。

### 待付款订单积分结果

待付款页需要订单详情返回已计算好的积分抵扣结果。如果订单创建时已经使用积分，订单详情必须能回显本单使用了多少积分、抵扣了多少钱、赠送多少积分。

后端必须返回：

- 订单创建时是否使用积分。
- 本单实际使用积分数量。
- 本单实际抵扣金额。
- 订单完成后预计赠送积分。
- 退款时积分退回/扣回规则对应字段。

### 角色申请状态链

角色申请完整链路需要后端保证状态不可混淆：

- 押金未支付：`PENDING_DEPOSIT`
- 押金已支付待审核：`PENDING_AUDIT`
- 审核通过：`APPROVED`
- 审核拒绝：`REJECTED`
- 取消或关闭：`CANCELLED/CLOSED`

关键要求：

- 支付押金成功后不能继续返回 `PENDING_DEPOSIT`。
- `PENDING_AUDIT` 不能出现在正式角色列表里。
- 只有 `APPROVED` 才能写入用户正式角色。
- 申请记录和用户角色列表要保持一致。

### 多店铺订单结构

购物车多商品结算、待付款页、订单详情都需要后端返回店铺分组。若只返回平铺商品列表，商品也必须带店铺字段。

后端必须返回：

- `shopOrders/shop_orders` 分组结构，或每个商品项都有 `shopId/shop_id`、`shopName/shop_name`。
- 店铺 logo、店铺名称、商品列表、商品数量、商品价格。
- 多店铺订单的运费、优惠券、积分抵扣金额归属规则。

### 售后列表分类

售后申请、处理中、已完成三个 tab 需要后端按类型返回不同数据，不能所有 tab 返回同一批售后单。

后端必须保证：

- `type=normal` 返回可申请售后的订单商品。
- `type=apply` 返回待商家处理、处理中、待买家退货的数据。
- `type=finish` 返回已拒绝、退款成功、已撤销、已关闭的数据。
- 已创建售后的订单商品不能继续出现在可申请列表中，除非该商品仍有可再次申请的数量。

### 吸粉和推广数据

角色申请通过后，推广功能需要后端补齐邀请码、二维码、绑定关系、粉丝列表和积分账本。

后端必须支持：

- 按角色返回推广工作台数据。
- 生成带 `roleCode/userId/inviteCode` 的小程序码。
- 扫码进入后绑定粉丝关系。
- 查询粉丝列表、商家绑定列表。
- 查询吸粉收益、积分发放、退款扣回明细。

### 自动领取积分设置

`business/pages/business_pages/auto_points.vue` 页面有三个独立开关：线上订单支付后、线上订单确认收货后、线下订单支付后。后端文档当前只明确 `autoReceiveFlag` 一个总开关，无法完整保存三个开关的独立状态。

后端必须返回：

- `onlinePay/online_pay/onlineAfterPay/online_after_pay`：线上订单支付后是否自动领取积分。
- `onlineReceive/online_receive/onlineAfterReceive/online_after_receive`：线上订单确认收货后是否自动领取积分。
- `offlinePay/offline_pay/offlineAfterPay/offline_after_pay`：线下订单支付后是否自动领取积分。
- `autoReceiveFlag/auto_receive_flag/enabled`：总开关，三个细分开关任意一个开启时为 `true`。

如果后端只返回 `autoReceiveFlag`，前端只能推导“线上支付后”和“线下支付后”的默认状态，无法判断“线上确认收货后”的真实保存值。当前前端已增加本地缓存兜底，但跨设备、清缓存、换账号后的真实回显仍依赖后端保存细分字段。

## 后端接口和字段详细要求

### 订单预览接口

建议接口：

- `POST /api/miniapp/orders/preview`

请求建议：

```json
{
  "action": "info",
  "goods": [
    {
      "skuId": 101,
      "goodsId": 1001,
      "quantity": 2
    }
  ],
  "deliveryType": 1,
  "couponId": "CP_xxx",
  "usePoints": true,
  "addressId": 10,
  "storeId": ""
}
```

响应建议：

```json
{
  "shopOrders": [
    {
      "shopId": 1,
      "shopName": "门店A",
      "shopLogo": "https://example.com/logo.png",
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
  "pointsInfo": {
    "enabled": true,
    "availablePoints": 1200,
    "maxUsablePoints": 100,
    "usedPoints": 100,
    "deductAmount": 1.00,
    "integralLimit": 0,
    "exchangeRate": 100,
    "desc": "100积分抵扣1元"
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

字段要求：

- `pointsInfo.deductAmount` 或 `amountInfo.pointsDeductAmount` 必须返回明确金额。
- `payAmount` 必须是后端最终计算结果。
- 切换积分、优惠券、配送方式后，预览接口必须重新计算并返回全量金额。

### 待付款订单详情接口

建议接口：

- `GET /api/miniapp/orders/{orderNo}`

响应必须包含：

```json
{
  "orderNo": "O202607090001",
  "orderStatus": "WAIT_PAY",
  "shopOrders": [],
  "pointsInfo": {
    "enabled": true,
    "usedPoints": 100,
    "deductAmount": 1.00,
    "givePoints": 20
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

字段要求：

- 已创建订单不能只返回用户总积分，必须返回本订单实际使用积分。
- 如果订单没有使用积分，也建议返回 `usedPoints=0`、`deductAmount=0`，避免前端误判为字段缺失。

### 支付创建接口

建议接口：

- `POST /api/miniapp/payments/create`

请求建议：

```json
{
  "orderNo": "O202607090001",
  "payWay": "WECHAT_JSAPI",
  "usePoints": true,
  "pointsAmount": 100,
  "pointsDeductAmount": 1.00
}
```

后端要求：

- 必须以后端订单金额为准，不能信任前端传入金额。
- 如果支付前允许修改积分，支付接口需要先重算订单金额或拒绝不一致的请求。
- 返回支付参数前，应返回最终 `payAmount` 供前端校验展示。

### 角色申请接口

建议接口：

- `GET /api/miniapp/roles/options`
- `GET /api/miniapp/role-applications`
- `POST /api/miniapp/role-applications`
- `POST /api/miniapp/role-applications/{applicationNo}/deposit/prepay`
- `GET /api/miniapp/roles`

角色配置响应建议：

```json
{
  "roles": [
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

申请记录响应建议：

```json
{
  "userId": 51,
  "kycStatus": "APPROVED",
  "roles": ["MERCHANT"],
  "applications": [
    {
      "applicationNo": "APP202607090001",
      "roleCode": "PROMOTER",
      "roleName": "推广者",
      "applicationStatus": "PENDING_AUDIT",
      "auditStatus": "PENDING_AUDIT",
      "depositAmount": 100.00,
      "depositNo": "DEP202607090001",
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

字段要求：

- `roleCode` 必须稳定，不要混用中文名称做状态判断。
- `applicationStatus` 必须表示申请状态。
- `depositStatus/payStatus` 必须表示押金支付状态。
- `auditStatus` 必须表示平台审核状态。
- `roles` 只放已生效角色，不放待审核角色。

### 售后列表接口

建议接口：

- `GET /api/miniapp/after-sales?type=normal`
- `GET /api/miniapp/after-sales?type=apply`
- `GET /api/miniapp/after-sales?type=finish`

响应字段建议：

```json
{
  "list": [
    {
      "orderId": 10001,
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
          "itemId": 11,
          "goodsName": "商品A",
          "image": "https://example.com/goods.png",
          "goodsPrice": 19.90,
          "goodsNum": 1,
          "afterSaleId": 20001,
          "ableApply": 0
        }
      ]
    }
  ]
}
```

字段要求：

- 可申请列表的商品必须有 `ableApply=1`。
- 已经存在 `afterSaleId/refundNo` 的商品不要返回到 `type=normal`。
- `type=apply` 和 `type=finish` 必须按售后状态过滤。

### 推广吸粉接口

建议接口：

- `GET /api/miniapp/roles/workbench?roleCode=PROMOTER`
- `POST /api/miniapp/share/qrcode`
- `POST /api/miniapp/promoter/fans/bind`
- `GET /api/miniapp/promoter/fans`
- `GET /api/miniapp/points/ledger`

工作台响应建议：

```json
{
  "roleCode": "PROMOTER",
  "inviteCode": "P51A8",
  "qrcodeUrl": "https://example.com/qrcode.png",
  "posterUrl": "https://example.com/poster.png",
  "fansCount": 20,
  "merchantCount": 3,
  "todayProfit": 12.50,
  "availablePoints": 1200
}
```

小程序码请求建议：

```json
{
  "userId": 51,
  "roleCode": "PROMOTER",
  "inviteCode": "P51A8",
  "path": "pages/index/index",
  "scene": "uid=51&role=PROMOTER&invite_code=P51A8"
}
```

积分账本字段建议：

```json
{
  "list": [
    {
      "sourceType": "FAN_COMMISSION",
      "fanName": "用户A",
      "orderNo": "O202607090001",
      "changeAmount": 100,
      "balance": 1200,
      "createTime": "2026-07-09 11:20:00"
    },
    {
      "sourceType": "AFTER_SALE_REFUND",
      "orderNo": "O202607090001",
      "changeAmount": -100,
      "balance": 1100,
      "createTime": "2026-07-09 12:20:00"
    }
  ]
}
```

### 自动领取积分设置接口

建议接口：

- `GET /api/miniapp/points/settings/auto-receive`
- `POST /api/miniapp/points/settings/auto-receive`

请求建议：

```json
{
  "autoReceiveFlag": true,
  "onlinePay": true,
  "onlineReceive": false,
  "offlinePay": true
}
```

响应建议：

```json
{
  "autoReceiveFlag": true,
  "onlinePay": true,
  "onlineReceive": false,
  "offlinePay": true,
  "updatedAt": "2026-07-09 15:30:00"
}
```

字段要求：

- `GET` 必须返回上次保存的三个细分开关。
- `POST` 保存成功后建议返回保存后的完整配置。
- 布尔值建议使用 `true/false`，不要混用 `"0"`、`"1"`、`ON/OFF`。
- 如果未来按角色或店铺维度配置，需要额外返回 `roleCode/shopId/userId`，避免不同身份互相覆盖。

## 存在风险汇总

- 积分金额如果前后端分别计算，可能出现待付款金额、支付金额、订单详情金额不一致。
- 角色状态如果押金状态和审核状态混用，用户可能误以为角色已生效。
- `PENDING_AUDIT` 如果进入正式角色列表，会导致推广权限提前开放。
- 多店铺订单如果缺少店铺分组，优惠券、积分、运费归属可能展示错误。
- 售后列表如果后端不按 `type` 过滤，会继续出现“可申请”和“处理中”重复数据。
- 吸粉链路如果只生成二维码但不落库绑定关系，后续粉丝数、收益和积分账本无法追溯。
- 支付接口如果信任前端传入的积分抵扣金额，存在金额篡改风险。
- 自动领取积分如果后端只保存总开关，三项独立设置会跨设备丢失，只能依赖当前设备本地缓存回显。

## 后续补充汇总

- 后端接口补齐后，需要用真实用户 `userId=51` 走一遍：实名认证、角色申请、押金支付、待审核、审核通过、角色生效。
- 用购物车多店铺多商品走一遍：确认订单、优惠券、积分、提交订单、待付款、支付。
- 用已使用积分的订单走一遍：订单详情、待付款、支付页、退款退积分。
- 用售后订单走一遍：可申请、处理中、已完成三个 tab 的数据边界。
- 用推广者账号走一遍：生成二维码、扫码绑定粉丝、粉丝下单、积分入账、售后扣回。
- 用自动领取积分设置走一遍：分别关闭/开启三个开关，保存后退出页面、重新进入、换设备登录确认是否一致。
- 联调完成后移除或降级确认订单页 `[confirm_order][points]` 诊断日志，避免生产控制台长期输出过多数据。
