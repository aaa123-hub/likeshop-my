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

补充说明：

- `data` 里可能直接返回对象、数组或分页对象，前端不要假设固定结构
- 字段缺失时优先按 `null` / `''` / `[]` 兜底，不要直接报错
- 接口文档里只写字段名的，下面都尽量补成前端可直接渲染的对象结构

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

### 0.5 常见字段别名

不同页面历史字段命名不完全一致，前端找不到字段时可以按下面顺序兜底：

| 业务含义 | 优先字段 | 兼容字段 | 说明 |
| --- | --- | --- | --- |
| 商品 ID | spuId | productId、id | 商品详情、购物车、订单明细里优先用 `spuId` |
| SKU ID | skuId | itemSkuId | 下单必须传 `skuId` |
| 商品名称 | spuName | productName、title | 列表标题可用 |
| 商品主图 | mainImageUrl | cover、imageUrl、picUrl、images[0] | 轮播图为空时用主图 |
| 店铺 ID | shopId | merchantShopId | 店铺维度统计、下单拆单使用 |
| 店铺名称 | shopName | storeName | 展示用 |
| 价格 | salePrice | minPrice、payAmount、amount | 金额字段建议统一转 number 后展示 |
| 原价 | marketPrice | originPrice | 没有原价时不展示划线价 |
| 图片数组 | images | imageUrls、albumUrls | 若返回字符串，先按逗号或 JSON 解析 |
| 创建时间 | createdAt | createTime | ISO 字符串或 `yyyy-MM-dd HH:mm:ss` |
| 更新时间 | updatedAt | updateTime | ISO 字符串或 `yyyy-MM-dd HH:mm:ss` |
| 地址 ID | addressId | id | 地址列表里可能是 `id` |
| 是否默认地址 | isDefault | defaultFlag | 布尔值 |

### 0.6 空值和类型处理

| 后端值 | 前端建议 |
| --- | --- |
| `null` | 文本显示为空，数组按 `[]`，对象按 `{}` |
| 金额字符串 | 用 `Number(value || 0)` 转为 number 后格式化 |
| JSON 字符串 | `try { JSON.parse(value) } catch {}` 兜底 |
| 图片字段为空 | 使用默认占位图 |
| 状态码未知 | 展示后端原始状态文案或兜底为“处理中” |

### 0.7 文件上传

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

Banner 字段：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| bannerId | number | Banner ID |
| title | string | 标题 |
| imageUrl | string | Banner 图片地址 |
| jumpType | string | 跳转类型，如 `ACTIVITY`、`COUPON`、`CHANNEL` |
| jumpUrl | string | 跳转目标地址或业务路径 |
| sortNo | number | 排序号，越小越靠前 |
| startTime | string | 生效时间 |
| endTime | string | 失效时间 |
| bannerStatus | string | 状态，`ONLINE` 表示上线 |

快捷入口 `quickEntries` 字段：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| code | string | 入口编码，如 `CATEGORY`、`ORDER`、`MESSAGE`、`COUPON`、`WALLET` |
| title | string | 展示文字 |
| iconKey | string | 图标标识，前端也可以用它映射本地图标 |
| iconUrl | string | 默认图标地址 |
| pagePath | string | 小程序页面路径 |

当前快捷入口默认值：

| code | title | iconKey | pagePath | iconUrl |
| --- | --- | --- | --- | --- |
| CATEGORY | 分类 | category | `/pages/category/index` | `/static/icons/home-category.png` |
| ORDER | 订单 | order | `/pages/order/list` | `/static/icons/home-order.png` |
| MESSAGE | 消息 | message | `/pages/message/list` | `/static/icons/home-message.png` |
| COUPON | 优惠券 | coupon | `/pages/coupon/list` | `/static/icons/home-coupon.png` |
| WALLET | 钱包 | wallet | `/pages/wallet/index` | `/static/icons/home-wallet.png` |

如果后台已经配置了快捷入口，`/api/miniapp/home/index` 会优先返回数据库配置，不再使用上面的默认值。

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

后台配置入口：

- 后台页面：`平台运营管理 -> 类目与属性`
- 路由：`/platform/category`
- 支持多级类目：一级类目下可继续新增子类目，最深支持到当前业务配置的层级

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

测试说明：

- `spuId` 必须使用真实存在且已上架的商品 ID
- `GET /api/miniapp/product/1` 报 `product not found`，通常表示测试 ID 不存在或商品未上架
- 建议先调用 `GET /api/miniapp/search/products`，或在后台商品列表中复制真实 `spuId` 再调详情接口

### 4.3 商品详情

- 方法：`GET`
- 路径：`/api/miniapp/product/{spuId}`

响应字段：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| spuId | number | 商品 ID |
| spuName | string | 商品名称 |
| spuNo | string | 商品编码 |
| shopId | number | 店铺 ID |
| shopName | string | 店铺名称 |
| categoryId | number | 类目 ID |
| productType | string | 商品类型 |
| brandName | string | 品牌名称 |
| mainImageUrl | string | 主图 |
| images | array | 轮播图 |
| video | string | 视频地址 |
| detailJson | string/object | 商品详情结构，前端可转为多个文案区块 |
| serviceTags | string | 服务标签，通常是逗号分隔或 JSON 字符串 |
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

商品详情建议字段：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| highlight | string | 商品卖点/一句话卖点 |
| description | string | 详情说明 |
| afterSale | string | 售后说明 |
| usageHint | string | 使用提示 |

常见渲染规则：

- `mainImageUrl` 用作首屏封面
- `images` 用作轮播图，若为空则回退到 `mainImageUrl`
- `detailJson` 若是字符串，前端先 `JSON.parse` 再渲染
- `freightType = TEMPLATE` 时优先用 `freightTemplateId` 查模板

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

SKU 里如果只有单规格商品，也仍然会返回 `skuList`，前端不要假设只有一个 SKU。

后台类目配置说明：

- 平台后台已经有多级类目管理页
- 入口：`平台运营管理 -> 类目与属性`
- 页面支持新增一级类目、子类目、编辑类目、绑定属性
- 商品发布页选择类目时，会读取这套类目树

### 4.4 商街首页聚合

- 方法：`GET`
- 路径：`/api/miniapp/street/index`

查询参数：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| keyword | string | 否 | 商街页搜索框当前关键词 |

响应字段：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| searchBox | object | 搜索框配置 |
| searchBox.keyword | string | 当前关键词 |
| searchBox.placeholder | string | 搜索框占位文案 |
| recommendedCategories | array | 推荐分类，前端可直接渲染分类入口 |
| recommendedShops | array | 推荐商家列表 |

推荐商家字段：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| shopId | number | 店铺 ID |
| shopName | string | 店铺名 |
| shopLogo | string | 店铺 logo |
| shopScore | number | 店铺评分 |
| detailAddress | string | 详细地址 |
| openStatus | string | 营业状态 |

说明：

- 该接口用于商街首页首屏聚合，方便一次性拿到搜索框、推荐分类和推荐商家
- `recommendedCategories` 当前实现可直接复用类目树数据，前端若只想展示首屏入口，可只取前几项
- `recommendedShops` 可直接用于商街店铺卡片展示

### 4.5 店铺详情

- 方法：`GET`
- 路径：`/api/miniapp/shop/{shopId}`

响应字段：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| shopBase | object | 店铺基础信息 |
| shopBase.shopId | number | 店铺 ID |
| shopBase.shopName | string | 店铺名 |
| shopBase.shopLogo | string | 店铺 logo |
| shopBase.shopScore | number | 店铺评分 |
| shopBase.businessHours | string | 营业时间 |
| shopBase.detailAddress | string | 详细地址 |
| shopBase.openStatus | string | 营业状态 |
| albums | array | 相册 |
| videos | array | 视频 |
| coupons | array | 优惠券 |
| groupBuyProducts | array | 团购商品 |
| qrcodeInfo | object | 店铺二维码信息 |

建议前端直接使用的店铺展示字段：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| avatarUrl | string | 店铺头像/门店封面 |
| contactPhone | string | 联系电话 |
| provinceName | string | 省 |
| cityName | string | 市 |
| districtName | string | 区 |

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

模板列表建议字段：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| templateId | number | 模板 ID |
| templateName | string | 模板名称 |
| deliveryType | string | 配送方式 |
| freightType | string | 运费方式 |
| freightAmount | number | 金额 |
| pickupAddress | string | 自提地址 |
| templateStatus | string | 状态 |

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
| userId | number | 建议 | 用户 ID，可放 query 参数，也可放 body。若走 token 且后端能解析用户身份，后续可不传 |
| skuId | number | 是 | SKU ID |
| quantity | number | 是 | 数量 |
| checked | boolean | 否 | 是否选中 |

请求示例：

```json
{
  "userId": 10001,
  "skuId": 20001,
  "quantity": 1,
  "checked": true
}
```

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

`shopOrders` 常见字段：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| shopId | number | 店铺 ID |
| shopName | string | 店铺名称 |
| itemList | array | 该店铺下的商品明细 |
| shopGoodsAmount | string/number | 店铺商品金额 |
| shopFreightAmount | string/number | 店铺运费 |
| shopDiscountAmount | string/number | 店铺优惠 |
| shopPayAmount | string/number | 店铺应付 |

`itemList` 常见字段：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| spuId | number | 商品 ID |
| skuId | number | SKU ID |
| spuName | string | 商品名 |
| skuName | string | SKU 名称 |
| imageUrl | string | 图片 |
| quantity | number | 数量 |
| salePrice | string/number | 单价 |
| totalAmount | string/number | 小计 |
| freightType | string | 运费类型 |

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

补充说明：

- `submitToken` 一次性使用，提交成功后不要重复复用
- `idempotentKey` 必须保持唯一，建议前端用 UUID
- 订单创建成功后，前端先根据 `payOrderNo` 发起支付，再轮询支付结果

### 6.4 查询订单列表

- 方法：`GET`
- 路径：`/api/miniapp/orders`
- 查询参数：`status`, `pageNo`, `pageSize`

### 6.5 查询订单详情

- 方法：`GET`
- 路径：`/api/miniapp/orders/{orderNo}`

响应字段：`baseInfo`, `itemList`, `amountInfo`, `statusFlow`, `refundInfo`, `verifyInfo`。

`baseInfo` 常见字段：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| orderNo | string | 订单号 |
| orderStatus | string | 订单状态 |
| payStatus | string | 支付状态 |
| deliveryStatus | string | 发货状态 |
| verifyStatus | string | 核销状态 |
| receiverName | string | 收货人 |
| receiverMobile | string | 收货手机号 |
| addressText | string | 完整地址 |
| createdAt | string | 创建时间 |
| paidAt | string | 支付时间 |
| shippedAt | string | 发货时间 |

`amountInfo` 常见字段：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| goodsAmount | number | 商品金额 |
| freightAmount | number | 运费 |
| discountAmount | number | 优惠金额 |
| payAmount | number | 应付金额 |

`itemList` 常见字段：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| spuName | string | 商品名 |
| skuName | string | SKU 名称 |
| quantity | number | 数量 |
| unitPrice | number | 单价 |
| realAmount | number | 实付小计 |

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

列表页常用补充字段：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | number | 消息 ID |
| title | string | 列表标题 |
| content | string | 摘要内容 |
| readFlag | boolean | 是否已读 |
| sendTime | string | 发送时间 |
| bizType | string | 业务类型 |

### 8.5 消息详情

- 方法：`GET`
- 路径：`/api/miniapp/messages/{messageId}`
- 查询参数：`userId`

详情页一般会比列表多返回 `readTime`，前端可用于展示“已读时间”。

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

地址对象建议完整字段：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | number | 地址 ID |
| receiverName | string | 收件人 |
| mobile | string | 手机号 |
| provinceCode | string | 省编码 |
| provinceName | string | 省名称 |
| cityCode | string | 市编码 |
| cityName | string | 市名称 |
| districtCode | string | 区编码 |
| districtName | string | 区名称 |
| detailAddress | string | 详细地址 |
| isDefault | boolean | 默认地址 |

## 9. 对接建议

- 登录只传 `wx.login` 的 `code`，不要前台直传 `AppId` / `AppSecret`
- `channelCode` 固定使用 `wechat-miniapp`
- 支付、下单、提现类接口建议全部带 `idempotentKey`
- 图片、证件、商品图先走 `/api/miniapp/files/upload`，再把 `fileUrl` 传给业务接口
- 所有接口都从 `res.data.data` 读取业务数据
- 遇到 `code !== '0'` 时展示 `message`，不要自行拼接后端技术错误

## 10. 商家资质申请

### 10.1 提交商家资质申请

- 方法：`POST`
- 路径：`/api/miniapp/eco-applications/merchant-qualification/apply`

请求字段：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| userId | number | 是 | 当前用户 ID |
| merchantName | string | 是 | 商家名称 |
| merchantType | string | 否 | 商家类型，默认 `PERSONAL` |
| contactMobile | string | 是 | 联系手机号 |
| legalPerson | string | 否 | 法人/经营者姓名 |
| settlementAccountNo | string | 否 | 结算账号 |
| qualificationType | string | 否 | 资质类型，默认 `BUSINESS_LICENSE` |
| qualificationNo | string | 否 | 资质编号 |
| qualificationUrl | string | 是 | 资质图片 URL |
| remark | string | 否 | 备注 |

### 10.2 查询商家资质申请状态

- 方法：`GET`
- 路径：`/api/miniapp/eco-applications/merchant-qualification/status`
- 查询参数：`userId`

返回字段：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| merchantId | number | 商家 ID |
| merchantNo | string | 商家编号 |
| merchantName | string | 商家名称 |
| merchantType | string | 商家类型 |
| qualificationType | string | 资质类型 |
| qualificationNo | string | 资质编号 |
| qualificationUrl | string | 资质图片 |
| auditStatus | string | 审核状态 |
| auditRemark | string | 审核备注 |
| updatedAt | string | 更新时间 |

## 10. 小程序接口清单

| 模块 | 方法 | 路径 | 说明 |
| --- | --- | --- | --- |
| 登录 | POST | `/api/miniapp/auth/wechat-login` | 微信 code 登录 |
| 登录 | POST | `/api/miniapp/auth/bind-mobile` | 绑定手机号 |
| 登录 | POST | `/api/miniapp/auth/refresh-token` | 刷新 token |
| 用户 | GET | `/api/miniapp/user/profile` | 用户资料 |
| 用户 | PUT | `/api/miniapp/user/profile` | 修改用户资料 |
| 文件 | POST | `/api/miniapp/files/upload` | 上传图片/文件 |
| 首页 | GET | `/api/miniapp/home/index` | 首页聚合 |
| 首页 | GET | `/api/miniapp/home/recent-visits` | 最近访问 |
| 类目 | GET | `/api/miniapp/category/tree` | 类目树 |
| 搜索 | GET | `/api/miniapp/search/products` | 搜索商品 |
| 商品 | GET | `/api/miniapp/product/{spuId}` | 商品详情 |
| 商品 | GET | `/api/miniapp/product/{spuId}/comments` | 商品评价 |
| 店铺 | GET | `/api/miniapp/shop/{shopId}` | 店铺详情 |
| 购物车 | POST | `/api/miniapp/cart/items` | 加入购物车 |
| 购物车 | GET | `/api/miniapp/cart/items` | 购物车列表 |
| 订单 | POST | `/api/miniapp/orders/preview` | 订单预览 |
| 订单 | POST | `/api/miniapp/orders` | 提交订单 |
| 订单 | GET | `/api/miniapp/orders` | 订单列表 |
| 订单 | GET | `/api/miniapp/orders/{orderNo}` | 订单详情 |
| 退款 | POST | `/api/miniapp/orders/{orderNo}/refunds` | 申请退款 |
| 支付 | POST | `/api/miniapp/payments/create` | 创建支付单 |
| 支付 | GET | `/api/miniapp/payments/{payOrderNo}` | 查询支付结果 |
| 钱包 | GET | `/api/miniapp/wallet/balance` | 钱包余额 |
| 钱包 | GET | `/api/miniapp/wallet/ledger` | 钱包流水 |
| 钱包 | POST | `/api/miniapp/wallet/recharge/gift-card` | 礼品卡充值 |
| 钱包 | POST | `/api/miniapp/wallet/withdraw/apply` | 提现申请 |
| 优惠券 | POST | `/api/miniapp/coupons/{couponId}/receive` | 领取优惠券 |
| 积分 | GET | `/api/miniapp/points/account` | 积分账户 |
| 积分 | POST | `/api/miniapp/points/settings/auto-receive` | 自动领取积分设置 |
| 消息 | GET | `/api/miniapp/messages` | 消息列表 |
| 消息 | GET | `/api/miniapp/messages/{messageId}` | 消息详情 |
| 消息 | POST | `/api/miniapp/messages/{messageId}/read` | 标记已读 |
| KYC | POST | `/api/miniapp/kyc/submit` | 提交实名 |
| KYC | GET | `/api/miniapp/kyc/status` | 查询实名状态 |
| 地址 | GET | `/api/miniapp/addresses` | 地址列表 |
| 地址 | POST | `/api/miniapp/addresses` | 新增地址 |
| 地址 | PUT | `/api/miniapp/addresses/{id}` | 修改地址 |
| 地址 | DELETE | `/api/miniapp/addresses/{id}` | 删除地址 |
| 商家资质 | POST | `/api/miniapp/eco-applications/merchant-qualification/apply` | 提交商家资质申请 |
| 商家资质 | GET | `/api/miniapp/eco-applications/merchant-qualification/status` | 查询商家资质申请状态 |
