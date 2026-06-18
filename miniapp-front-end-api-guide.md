# 前台小程序接口对接说明

本文档整理前台小程序接口、统一响应结构和主要字段说明，供小程序前端联调使用。

## 0. 通用约定

### 0.1 网关地址

- 所有接口统一走网关前缀：`/api`
- 示例：`GET /api/miniapp/category/tree`
- 不要绕过网关直接访问后端微服务端口

### 0.2 统一响应结构

后端统一返回：

```json
{
  "code": "0",
  "message": "SUCCESS",
  "data": {}
}
```

字段说明：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| code | string | 是 | 业务状态码，`0` 表示成功 |
| message | string | 是 | 提示信息 |
| data | any | 否 | 业务数据 |

前端判断建议：

```js
if (res.data.code === '0') {
  const data = res.data.data
}
```

### 0.3 认证请求头

登录后需要在后续接口中携带：

```http
Authorization: Bearer <accessToken>
```

### 0.4 分页字段

分页接口通常返回：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| list | array | 当前页数据 |
| pageNo | number | 当前页码 |
| pageSize | number | 每页数量 |
| total | number | 总数 |
| hasNext | boolean | 是否还有下一页 |

### 0.5 文件上传

- 方法：`POST`
- 路径：`/api/miniapp/files/upload`
- 请求体：`multipart/form-data`
- 表单字段：`file`

响应 `data` 字段：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| fileUrl | string | 文件访问地址 |
| fileName | string | 原始文件名 |
| contentType | string | MIME 类型 |
| size | number | 文件大小，单位字节 |

文件访问：直接 `GET fileUrl`。

## 1. 登录配置

后台管理系统已支持维护小程序登录参数，配置分组为 `WECHAT_MINIAPP`。

配置项：

| 配置项 | 说明 |
| --- | --- |
| APP_ID | 微信小程序 AppId |
| APP_SECRET | 微信小程序 AppSecret |
| CODE2SESSION_URL | 微信 code2Session 接口地址 |

生效方式：

- 小程序调用 `wx.login` 获取 `code`
- 前端把 `code` 传给后端登录接口
- 后端读取后台配置中的 `APP_ID`、`APP_SECRET`
- 后端调用微信 `code2Session` 完成登录

## 2. 认证与登录

### 2.1 小程序登录

- 方法：`POST`
- 路径：`/api/miniapp/auth/wechat-login`
- 说明：使用微信 `code` 换取登录态

请求示例：

```json
{
  "loginCode": "wx-code",
  "deviceId": "device-001",
  "channelCode": "wechat-miniapp"
}
```

请求字段：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| loginCode | string | 是 | `wx.login` 返回的 code |
| deviceId | string | 否 | 设备 ID，用于风控和登录记录 |
| channelCode | string | 否 | 渠道编码，建议固定 `wechat-miniapp` |

响应 `data` 字段：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| accessToken | string | 访问令牌 |
| refreshToken | string | 刷新令牌 |
| expireIn | number | accessToken 有效期，秒 |
| userId | number | 用户 ID |
| openId | string | 微信 openId |
| sessionKey | string | 微信 sessionKey，前端通常不直接使用 |
| userStatus | string | 账号状态，如 `NORMAL` |
| needBindMobile | boolean | 是否需要绑定手机号 |
| needKyc | boolean | 是否需要实名 |

兼容旧路径：`POST /api/miniapp/auth/login`。

### 2.2 绑定手机号

- 方法：`POST`
- 路径：`/api/miniapp/auth/bind-mobile`

请求字段：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| mobile | string | 是 | 手机号 |
| smsCode | string | 是 | 短信验证码 |

响应字段：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| bindStatus | string | 绑定状态 |
| userId | number | 用户 ID |

### 2.3 刷新 Token

- 方法：`POST`
- 路径：`/api/miniapp/auth/refresh-token`

请求字段：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| refreshToken | string | 是 | 刷新令牌 |

响应字段：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| accessToken | string | 新访问令牌 |
| expireIn | number | 有效期，秒 |

## 3. 首页与内容

### 3.1 首页聚合

- 方法：`GET`
- 路径：`/api/miniapp/home/index`

查询参数：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| lat | number | 否 | 纬度 |
| lng | number | 否 | 经度 |
| userRole | string | 否 | 用户角色 |
| pageScene | string | 否 | 页面场景 |

响应字段：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| banners | array | 首页 Banner 列表 |
| quickEntries | array | 快捷入口 |
| walletCard | object | 钱包卡片 |
| recentVisits | array | 最近访问 |
| hotActivities | array | 热门活动 |
| recommendedProducts | array | 推荐商品 |
| recommendedShops | array | 推荐店铺 |

### 3.2 最近访问

- 方法：`GET`
- 路径：`/api/miniapp/home/recent-visits`

响应字段：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| visitType | string | 访问类型，如商品、店铺、活动 |
| targetId | number | 目标 ID |
| title | string | 标题 |
| cover | string | 封面图 |
| visitTime | string | 访问时间 |

### 3.3 活动列表

- 方法：`GET`
- 路径：`/api/miniapp/activity/list`

查询参数：`activityType`, `pageNo`, `pageSize`。

## 4. 类目、搜索、商品、店铺

### 4.1 类目树

- 方法：`GET`
- 路径：`/api/miniapp/category/tree`
- 兼容路径：`/api/miniapp/categories/tree`

响应字段：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| categoryId | number | 类目 ID |
| parentId | number/null | 父级类目 ID |
| categoryName | string | 类目名称 |
| iconUrl | string | 图标地址 |
| categoryLevel | number | 层级 |
| sortNo | number | 排序 |
| categoryStatus | string | 状态，如 `ACTIVE`、`ENABLED` |
| children | array | 子类目 |

### 4.2 搜索商品

- 方法：`GET`
- 路径：`/api/miniapp/search/products`

查询参数：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| keyword | string | 否 | 搜索关键词 |
| categoryId | number | 否 | 类目 ID |
| shopId | number | 否 | 店铺 ID |
| sortType | string | 否 | 排序方式 |
| pageNo | number | 否 | 页码 |
| pageSize | number | 否 | 每页数量 |

商品列表项字段：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| spuId | number | 商品 ID |
| spuName | string | 商品名称 |
| cover | string | 封面图 |
| salePrice | string/number | 售价 |
| originPrice | string/number | 原价 |
| salesCount | number | 销量 |
| shopName | string | 店铺名 |
| tags | array | 标签 |

### 4.3 商品详情

- 方法：`GET`
- 路径：`/api/miniapp/product/{spuId}`

响应字段：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| spuId | number | 商品 ID |
| spuName | string | 商品名称 |
| images | array | 轮播图 |
| video | string | 视频地址 |
| minPrice | string/number | 最低价 |
| maxPrice | string/number | 最高价 |
| couponList | array | 可用优惠券 |
| commentSummary | object | 评价汇总 |
| shopInfo | object | 店铺信息 |
| skuList | array | SKU 列表 |
| groupBuyActivity | object | 拼团活动 |
| freightType | string | 运费类型，如 `FREE`、`FIXED`、`TEMPLATE`、`PICKUP` |
| freightAmount | number | 运费金额 |
| freightTemplateId | number | 运费模板 ID |

SKU 字段：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| skuId | number | SKU ID |
| skuCode | string | SKU 编码 |
| skuName | string | SKU 名称 |
| specJson | string/object | 规格信息 |
| salePrice | number | 售价 |
| marketPrice | number | 市场价 |
| stockQty | number | 库存 |
| imageUrls | array | SKU 图片 |

### 4.4 店铺详情

- 方法：`GET`
- 路径：`/api/miniapp/shop/{shopId}`

响应字段：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| shopBase | object | 店铺基础信息 |
| albums | array | 相册 |
| videos | array | 视频 |
| coupons | array | 优惠券 |
| groupBuyProducts | array | 团购商品 |
| qrcodeInfo | object | 店铺二维码信息 |

## 5. 运费模板

### 5.1 运费模板对象

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| templateId | number | 模板 ID |
| merchantId | number | 商家 ID |
| templateName | string | 模板名称 |
| deliveryType | string | 履约方式，`DELIVERY` 快递配送、`PICKUP` 线下自提、`MIXED` 配送加自提 |
| freightType | string | 运费类型，`FREE` 包邮、`FIXED` 固定运费 |
| freightAmount | number | 固定运费金额 |
| pickupAddress | string | 自提地址或说明 |
| templateStatus | string | 模板状态，`ACTIVE`、`INACTIVE`、`DELETED` |

### 5.2 商品使用运费模板

商品详情会返回 `freightTemplateId`。前端展示商品运费时优先按模板解析：

- `deliveryType = DELIVERY`：展示快递配送
- `deliveryType = PICKUP`：展示线下自提和自提地址
- `deliveryType = MIXED`：展示配送和自提两种方式
- `freightType = FREE`：展示包邮
- `freightType = FIXED`：展示固定运费金额

## 6. 购物车与订单

### 6.1 加入购物车

- 方法：`POST`
- 路径：`/api/miniapp/cart/items`

请求字段：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| skuId | number | 是 | SKU ID |
| quantity | number | 是 | 数量 |
| checked | boolean | 否 | 是否选中 |

响应字段：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| cartItemId | number | 购物车条目 ID |
| cartCount | number | 购物车数量 |

### 6.2 订单预览

- 方法：`POST`
- 路径：`/api/miniapp/orders/preview`

请求字段：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| source | string | 是 | 来源，`CART` 或 `BUY_NOW` |
| cartItemIds | array | 否 | 购物车条目 ID |
| addressId | number | 否 | 地址 ID |
| couponIds | array | 否 | 优惠券 ID |
| remark | string | 否 | 买家备注 |

响应字段：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| shopOrders | array | 按店铺拆分的订单预览 |
| goodsAmount | string/number | 商品金额 |
| discountAmount | string/number | 优惠金额 |
| freightAmount | string/number | 运费金额 |
| payAmount | string/number | 应付金额 |
| availableCoupons | array | 可用优惠券 |

### 6.3 提交订单

- 方法：`POST`
- 路径：`/api/miniapp/orders`

请求字段：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| submitToken | string | 是 | 订单提交令牌 |
| source | string | 是 | 来源 |
| cartItemIds | array | 否 | 购物车条目 |
| addressId | number | 否 | 地址 ID |
| couponIds | array | 否 | 优惠券 ID |
| payScene | string | 否 | 支付场景 |
| idempotentKey | string | 是 | 幂等键 |

响应字段：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| orderNo | string | 订单号 |
| payOrderNo | string | 支付单号 |
| orderStatus | string | 订单状态 |
| payStatus | string | 支付状态 |
| expireTime | string | 支付过期时间 |

### 6.4 查询订单列表

- 方法：`GET`
- 路径：`/api/miniapp/orders`
- 查询参数：`status`, `pageNo`, `pageSize`

### 6.5 查询订单详情

- 方法：`GET`
- 路径：`/api/miniapp/orders/{orderNo}`

响应字段：`baseInfo`, `itemList`, `amountInfo`, `statusFlow`, `refundInfo`, `verifyInfo`。

## 7. 支付与钱包

### 7.1 创建支付单

- 方法：`POST`
- 路径：`/api/miniapp/payments/create`

请求字段：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| bizType | string | 是 | 业务类型，如 `ORDER` |
| bizOrderNo | string | 是 | 业务单号 |
| payMethod | string | 是 | 支付方式，如 `BALANCE`、`WECHAT_JSAPI` |
| clientIp | string | 否 | 客户端 IP |
| idempotentKey | string | 是 | 幂等键 |

响应字段：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| payOrderNo | string | 支付单号 |
| payStatus | string | 支付状态 |
| bizOrderNo | string | 业务单号 |
| channelPayInfo | object | 渠道支付参数，微信 JSAPI 时用于调起支付 |

### 7.2 查询支付结果

- 方法：`GET`
- 路径：`/api/miniapp/payments/{payOrderNo}`

响应字段：`payOrderNo`, `payStatus`, `bizOrderNo`, `paidAmount`, `failCode`, `failMessage`。

### 7.3 查询余额

- 方法：`GET`
- 路径：`/api/miniapp/wallet/balance`

响应字段：`balance`, `frozenAmount`, `currency`, `withdrawableAmount`。

### 7.4 钱包流水

- 方法：`GET`
- 路径：`/api/miniapp/wallet/ledger`
- 查询参数：`bizType`, `startTime`, `endTime`, `pageNo`, `pageSize`

### 7.5 礼品卡充值

- 方法：`POST`
- 路径：`/api/miniapp/wallet/recharge/gift-card`

请求字段：`cardNo`, `cardSecret`, `idempotentKey`。

响应字段：`rechargeAmount`, `balanceAfter`。

### 7.6 提现申请

- 方法：`POST`
- 路径：`/api/miniapp/wallet/withdraw/apply`

请求字段：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| amount | number | 是 | 提现金额 |
| accountType | string | 是 | 账户类型 |
| accountNo | string | 是 | 收款账号 |
| accountName | string | 是 | 收款人姓名 |
| idempotentKey | string | 是 | 幂等键 |

响应字段：`withdrawNo`, `status`, `auditStatus`。

### 7.7 面对面付款扫码

- 方法：`POST`
- 路径：`/api/miniapp/offline-payments/scan`

请求字段：`shopId`, `qrCode`, `amount`, `payMethod`, `idempotentKey`。

响应字段：`paymentNo`, `payStatus`。

## 8. 优惠券、积分、消息、KYC、地址

### 8.1 领取优惠券

- 方法：`POST`
- 路径：`/api/miniapp/coupons/{couponId}/receive`
- 请求字段：`receiveScene`
- 响应字段：`couponId`, `receiveStatus`

### 8.2 查询积分账户

- 方法：`GET`
- 路径：`/api/miniapp/points/account`
- 响应字段：`availablePoints`, `frozenPoints`, `totalPoints`

### 8.3 自动领取积分设置

- 方法：`POST`
- 路径：`/api/miniapp/points/settings/auto-receive`
- 请求字段：`autoReceiveFlag`
- 响应字段：`success`

### 8.4 消息列表

- 方法：`GET`
- 路径：`/api/miniapp/messages`
- 查询参数：`userId`, `bizType`, `keyword`, `pageNo`, `pageSize`, `readFlag`

消息字段：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | number | 消息 ID |
| bizType | string | 业务类型 |
| channelType | string | 渠道类型 |
| title | string | 标题 |
| content | string | 内容 |
| readFlag | boolean | 是否已读 |
| sendStatus | string | 发送状态 |
| sendTime | string | 发送时间 |

### 8.5 消息详情

- 方法：`GET`
- 路径：`/api/miniapp/messages/{messageId}`
- 查询参数：`userId`

### 8.6 标记消息已读

- 方法：`POST`
- 路径：`/api/miniapp/messages/{messageId}/read`
- 查询参数：`userId`

### 8.7 提交 KYC

- 方法：`POST`
- 路径：`/api/miniapp/kyc/submit`

请求字段：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| realName | string | 是 | 真实姓名 |
| certType | string | 是 | 证件类型 |
| certNo | string | 是 | 证件号码 |
| certFrontUrl | string | 是 | 证件正面图 |
| certBackUrl | string | 是 | 证件背面图 |
| requestNo | string | 是 | 请求号，建议唯一 |

响应字段：`kycStatus`, `auditMessage`, `nextAction`。

### 8.8 查询 KYC 状态

- 方法：`GET`
- 路径：`/api/miniapp/kyc/status`
- 响应字段：`kycStatus`, `auditMessage`, `rejectReasonCode`, `rejectReasonMessage`, `lastSubmitTime`

### 8.9 地址管理

- `GET /api/miniapp/addresses`
- `POST /api/miniapp/addresses`
- `PUT /api/miniapp/addresses/{id}`
- `DELETE /api/miniapp/addresses/{id}`

地址对象字段：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| receiverName | string | 收件人姓名 |
| mobile | string | 手机号 |
| provinceCode | string | 省编码 |
| cityCode | string | 市编码 |
| districtCode | string | 区编码 |
| detailAddress | string | 详细地址 |
| isDefault | boolean | 是否默认地址 |

## 9. 对接建议

- 登录只传 `wx.login` 的 `code`，不要前台直传 `AppId` / `AppSecret`
- `channelCode` 固定使用 `wechat-miniapp`
- 支付、下单、提现类接口建议全部带 `idempotentKey`
- 图片、证件、商品图先走 `/api/miniapp/files/upload`，再把 `fileUrl` 传给业务接口
- 所有接口都从 `res.data.data` 读取业务数据
- 遇到 `code !== '0'` 时展示 `message`，不要自行拼接后端技术错误
