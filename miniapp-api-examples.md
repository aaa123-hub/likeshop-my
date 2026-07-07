# 小程序端接口调用文档

基础地址：`https://shengyuan.store/api`

需要登录态的接口建议带：

```http
Authorization: Bearer <accessToken>
token: <accessToken>
Content-Type: application/json
```

接口返回统一结构：

```json
{
  "code": "0",
  "message": "SUCCESS",
  "traceId": "req_xxx",
  "data": {},
  "timestamp": "2026-07-07T10:00:00Z"
}
```

## 登录与用户

| 方法 | 路径 | 登录 | 说明 |
| --- | --- | --- | --- |
| POST | `/miniapp/auth/login` | 否 | 通用登录 |
| POST | `/miniapp/auth/wechat-login` | 否 | 微信小程序登录 |
| POST | `/miniapp/auth/bind-mobile` | 是 | 绑定手机号 |
| POST | `/miniapp/auth/refresh-token` | 否 | 刷新 token |
| GET | `/miniapp/user/profile` | 是 | 用户资料 |
| PUT | `/miniapp/user/profile` | 是 | 修改资料 |
| GET | `/miniapp/user/assets` | 是 | 用户资产汇总 |
| POST | `/miniapp/kyc/submit` | 是 | 实名提交 |
| GET | `/miniapp/kyc/status` | 是 | 实名状态 |
| POST | `/miniapp/kyc/face-auth/start` | 是 | 发起人脸核验 |
| GET | `/miniapp/kyc/platform/status` | 是 | 平台实名认证状态 |
| POST | `/miniapp/kyc/platform/submit` | 是 | 平台实名认证提交 |

## 首页、文件与静态资源

| 方法 | 路径 | 登录 | 说明 |
| --- | --- | --- | --- |
| GET | `/miniapp/home/index` | 否 | 首页聚合数据 |
| GET | `/miniapp/home/recent-visits` | 是 | 最近访问 |
| GET | `/miniapp/home/identity-options` | 否 | 首页身份入口 |
| GET | `/miniapp/street/index` | 否 | 商业街首页 |
| POST | `/miniapp/files/upload` | 是 | 上传文件，`multipart/form-data` |
| GET | `/miniapp/files/resources` | 否 | 文件资源列表 |
| GET | `/miniapp/files/**` | 否 | 访问文件 |
| GET | `/miniapp/share/qrcode` | 否 | 分享码/二维码资源 |

## 商品、店铺与搜索

| 方法 | 路径 | 登录 | 说明 |
| --- | --- | --- | --- |
| GET | `/miniapp/category/tree` | 否 | 商品类目树 |
| GET | `/miniapp/categories/tree` | 否 | 商品类目树兼容路径 |
| GET | `/miniapp/search/products` | 否 | 商品搜索 |
| GET | `/miniapp/search/suggest` | 否 | 搜索建议 |
| GET | `/miniapp/product/{spuId}` | 否 | 商品详情，返回 `couponList`、`activityList`、`pointsMarketing` |
| GET | `/miniapp/products/{spuId}` | 否 | 商品详情兼容路径 |
| GET | `/miniapp/product/detail?spuId=63` | 否 | 商品详情 query 兼容路径 |
| POST | `/miniapp/product/{spuId}/subscribe` | 是 | 商品订阅/取消订阅 |
| GET | `/miniapp/product/{spuId}/comments` | 否 | 商品评价列表 |
| POST | `/miniapp/product/comments` | 是 | 发布商品评价 |
| GET | `/miniapp/shop/{shopId}` | 否 | 店铺详情 |
| GET | `/miniapp/shop/detail?shopId=18` | 否 | 店铺详情兼容路径 |
| GET | `/miniapp/shop/{shopId}/group-buy` | 否 | 店铺团购商品 |
| GET | `/miniapp/shop/{shopId}/qrcode` | 否 | 店铺二维码 |
| GET | `/miniapp/street/shop/{shopId}/qrcode` | 否 | 商业街店铺二维码 |

商品详情示例：

```http
GET /miniapp/product/63?userId=30
```

领取商品详情页优惠券：

```http
POST /miniapp/coupons/1001/receive
```

```json
{
  "userId": 30,
  "receiveScene": "PRODUCT_DETAIL"
}
```

## 地址

| 方法 | 路径 | 登录 | 说明 |
| --- | --- | --- | --- |
| GET | `/miniapp/addresses` | 是 | 地址列表 |
| GET | `/miniapp/addresses/{id}` | 是 | 地址详情 |
| POST | `/miniapp/addresses` | 是 | 新增地址 |
| PUT | `/miniapp/addresses/{id}` | 是 | 修改地址 |
| DELETE | `/miniapp/addresses/{id}` | 是 | 删除地址 |
| POST | `/miniapp/addresses/{id}/default` | 是 | 设置默认地址 |

## 购物车

| 方法 | 路径 | 登录 | 说明 |
| --- | --- | --- | --- |
| POST | `/miniapp/cart/items` | 是 | 加入购物车 |
| GET | `/miniapp/cart/items` | 是 | 购物车列表 |
| GET | `/miniapp/cart/items/summary` | 是 | 购物车汇总 |
| PUT | `/miniapp/cart/items/{cartItemId}` | 是 | 修改数量/选中状态 |
| DELETE | `/miniapp/cart/items/{cartItemId}` | 是 | 删除购物车项 |

加入购物车：

```json
{
  "userId": 30,
  "skuId": 524,
  "quantity": 1,
  "checked": true
}
```

删除购物车项：

```http
DELETE /miniapp/cart/items/27?userId=30
```

## 订单

| 方法 | 路径 | 登录 | 说明 |
| --- | --- | --- | --- |
| POST | `/miniapp/orders/preview` | 是 | 订单预览/待支付页数据 |
| POST | `/miniapp/orders` | 是 | 提交订单 |
| GET | `/miniapp/orders` | 是 | 订单列表 |
| GET | `/miniapp/orders/{orderNo}` | 是 | 订单详情 |
| POST | `/miniapp/orders/{orderNo}/cancel` | 是 | 取消订单 |
| POST | `/miniapp/orders/{orderNo}/confirm-receipt` | 是 | 确认收货 |
| DELETE | `/miniapp/orders/{orderNo}` | 是 | 删除已结束订单 |

订单预览示例：

```json
{
  "userId": 30,
  "source": "CART",
  "cartItemIds": [22, 25],
  "addressId": 1,
  "couponIds": [],
  "pointsDeductAmount": 0,
  "remark": ""
}
```

订单预览会返回以下待支付页字段：

```json
{
  "shopOrders": [],
  "goods_lists": [],
  "goodsAmount": 12.80,
  "freightAmount": 0,
  "payAmount": 12.80,
  "availableCoupons": [],
  "usable_coupon": [],
  "availablePoints": 100,
  "user_integral": 100,
  "maxDeductAmount": 0.80,
  "pointsDeductAmount": 0,
  "integral_switch": true,
  "pointsDeductNotice": "积分抵扣后不退"
}
```

提交订单示例：

```json
{
  "userId": 30,
  "source": "BUY_NOW",
  "skuId": 524,
  "quantity": 1,
  "addressId": 1,
  "couponIds": [1001],
  "pointsDeductAmount": 0.8,
  "idempotentKey": "order-20260707-001"
}
```

## 支付、钱包与余额

| 方法 | 路径 | 登录 | 说明 |
| --- | --- | --- | --- |
| POST | `/miniapp/payments/preview` | 是 | 支付预览 |
| POST | `/miniapp/payments/create` | 是 | 创建支付单 |
| GET | `/miniapp/payments/{payOrderNo}` | 是 | 支付单查询 |
| POST | `/miniapp/payments/wechat/notify` | 否 | 微信回调，服务端使用 |
| POST | `/miniapp/offline-payments/scan` | 是 | 线下扫码支付 |
| GET | `/miniapp/wallet/balance` | 是 | 钱包余额 |
| GET | `/miniapp/wallet/ledger` | 是 | 钱包流水 |
| POST | `/miniapp/wallet/withdraw/apply` | 是 | 提现申请 |
| POST | `/miniapp/wallet/recharge/gift-card` | 是 | 礼品卡充值 |
| GET | `/miniapp/wallet/pay-password/status` | 是 | 支付密码状态 |
| GET | `/miniapp/wallet/transfer/receiver` | 是 | 查询转账接收人 |
| POST | `/miniapp/wallet/transfer` | 是 | 钱包转账 |

支付创建示例：

```json
{
  "bizType": "ORDER",
  "bizOrderNo": "SO202607070001",
  "payMethod": "WECHAT_JSAPI",
  "idempotentKey": "SO202607070001-WECHAT"
}
```

## 售后

| 方法 | 路径 | 登录 | 说明 |
| --- | --- | --- | --- |
| POST | `/miniapp/orders/{orderNo}/refunds` | 是 | 申请退款/售后 |
| GET | `/miniapp/orders/{orderNo}/refunds` | 是 | 订单退款记录 |
| GET | `/miniapp/after-sales` | 是 | 售后列表 |
| GET | `/miniapp/after-sales/{refundNo}` | 是 | 售后详情 |
| POST | `/miniapp/after-sales/express` | 是 | 填写退货物流 |
| POST | `/miniapp/after-sales/cancel` | 是 | 取消售后 |

## 优惠券、积分与活动

| 方法 | 路径 | 登录 | 说明 |
| --- | --- | --- | --- |
| GET | `/miniapp/points/account` | 是 | 积分账户 |
| GET | `/miniapp/points/ledger` | 是 | 积分明细 |
| GET | `/miniapp/integral/ledger` | 是 | 积分明细兼容路径 |
| POST | `/miniapp/points/settings/auto-receive` | 是 | 自动领取积分设置 |
| GET | `/miniapp/points/settings/auto-receive` | 是 | 自动领取积分设置查询 |
| GET | `/miniapp/points/sign/rules` | 是 | 签到规则 |
| POST | `/miniapp/points/sign` | 是 | 每日签到 |
| GET | `/miniapp/recharge/templates` | 是 | 充值模板 |
| GET | `/miniapp/coupons` | 是 | 优惠券列表 |
| POST | `/miniapp/coupons/{couponId}/receive` | 是 | 领取优惠券 |
| GET | `/miniapp/activity/list` | 否 | 活动列表 |
| GET | `/miniapp/lottery` | 是 | 抽奖配置 |
| GET | `/miniapp/lottery/records` | 是 | 抽奖记录 |
| POST | `/miniapp/lottery/draw` | 是 | 抽奖 |
| GET | `/miniapp/group-buy/team/check` | 是 | 拼团检查 |
| POST | `/miniapp/bargain/launch` | 是 | 发起砍价 |
| POST | `/miniapp/bargain/help` | 是 | 帮砍 |
| POST | `/miniapp/bargain/close` | 是 | 关闭砍价 |
| POST | `/miniapp/activity/exchange` | 是 | 活动兑换 |

## 角色入驻、推广码、粉丝与积分收益

角色编码：

| roleCode | 说明 |
| --- | --- |
| `PROMOTER` | 推广者 |
| `OPERATION_CENTER` | 区域代理 |
| `SUBSIDIARY` | 子公司 |
| `HEADQUARTERS` | 总部/总代理 |

| 方法 | 路径 | 登录 | 说明 |
| --- | --- | --- | --- |
| POST | `/miniapp/role-applications` | 是 | 申请推广者/区域代理/子公司/总部 |
| GET | `/miniapp/role-applications` | 是 | 我的角色申请 |
| GET | `/miniapp/roles` | 是 | 我的角色标识、押金、推广码摘要 |
| GET | `/miniapp/promotion/invite-code` | 是 | 获取角色推广码 |
| POST | `/miniapp/promotion/invite-bind` | 是 | 扫码绑定粉丝 |
| GET | `/miniapp/promotion/fans` | 是 | 粉丝列表 |
| GET | `/miniapp/promotion/profit-ledgers` | 是 | 推广积分收益明细 |
| POST | `/miniapp/role-deposits/{depositNo}/refund` | 是 | 角色押金退款申请 |

申请角色示例：

```json
{
  "userId": 30,
  "roleCode": "PROMOTER",
  "provinceCode": "440000",
  "cityCode": "440100",
  "districtCode": "440106",
  "applicantName": "张三",
  "mobile": "19195063622",
  "username": "channel_master_gz",
  "password": "ChannelMaster@2026",
  "remark": "申请成为推广者",
  "materialUrls": ["https://shengyuan.store/uploads/material-1.jpg"],
  "realnameVerified": true,
  "agreementAccepted": true
}
```

获取推广码：

```http
GET /miniapp/promotion/invite-code?userId=30&roleCode=PROMOTER
```

绑定消费者粉丝：

```json
{
  "userId": 88,
  "inviteCode": "PR000030A1B2C3",
  "fanType": "CONSUMER"
}
```

绑定商家粉丝：

```json
{
  "userId": 30,
  "inviteCode": "PR000030A1B2C3",
  "fanType": "MERCHANT",
  "merchantId": 48
}
```

## 收藏、反馈、生态应用与内容

| 方法 | 路径 | 登录 | 说明 |
| --- | --- | --- | --- |
| POST | `/miniapp/favorites` | 是 | 收藏商品或店铺 |
| POST | `/miniapp/favorites/cancel` | 是 | 取消收藏 |
| GET | `/miniapp/favorites` | 是 | 收藏列表 |
| POST | `/miniapp/feedback` | 是 | 意见反馈 |
| POST | `/miniapp/service/tickets` | 是 | 创建客服工单 |
| GET | `/miniapp/customer-service` | 否 | 客服联系方式 |
| GET | `/miniapp/eco-applications` | 是 | 生态应用入口列表 |
| POST | `/miniapp/eco-applications/merchant-qualification/apply` | 是 | 商户资质申请 |
| GET | `/miniapp/eco-applications/merchant-qualification/status` | 是 | 商户资质状态 |
| GET | `/miniapp/content-pages/{pageCode}` | 否 | 内容页 |
| GET | `/miniapp/alliance/card` | 是 | 联盟名片 |
| GET | `/miniapp/alliance/orders` | 是 | 联盟订单 |

## 消息与短信

| 方法 | 路径 | 登录 | 说明 |
| --- | --- | --- | --- |
| GET | `/miniapp/messages` | 是 | 消息列表 |
| GET | `/miniapp/messages/list` | 是 | 消息列表兼容路径 |
| GET | `/miniapp/messages/unread-count` | 是 | 未读数 |
| GET | `/miniapp/messages/{messageId}` | 是 | 消息详情 |
| POST | `/miniapp/messages/{messageId}/read` | 是 | 标记单条已读 |
| POST | `/miniapp/messages/read/batch` | 是 | 批量已读 |
| POST | `/miniapp/sms/send` | 是 | 发送短信验证码 |
| POST | `/miniapp/wechat/official-account/bind` | 是 | 绑定公众号 |

## 必填校验

| 接口 | 必填 |
| --- | --- |
| `/miniapp/product/{spuId}` | `spuId` 不能为 `undefined/null/NaN` |
| `/miniapp/shop/{shopId}` | `shopId` 不能为 `undefined/null/NaN` |
| `POST /miniapp/cart/items` | `skuId`, `quantity` |
| `POST /miniapp/orders/preview` | `source` |
| `POST /miniapp/payments/create` | `bizType`, `bizOrderNo`, `payMethod`, `idempotentKey` |
| `/miniapp/coupons/{couponId}/receive` | `couponId` |
| `/miniapp/messages/{messageId}` | `messageId` |
| `/miniapp/orders/{orderNo}` | `orderNo` |
