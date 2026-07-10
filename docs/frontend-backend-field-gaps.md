# 前端预留字段与后端返回字段缺口清单

更新时间：2026-07-10

说明：本清单基于当前小程序前端实际页面渲染和 API 归一化代码整理。这里列的是“前端已经使用或为兼容旧字段预留读取，但后端缺少时会影响展示/业务闭环”的字段，不包含已经从页面去除、不展示给用户看的字段。

## 商品评价列表

接口：`GET /miniapp/product/{spuId}/comments`

使用页面：
- `bundle_order/pages/all_comments/all_comments`
- `bundle/pages/goods_details/goods_details` 的评价兜底首条评价

前端当前需要字段：

| 字段 | 用途 | 缺少影响 |
| --- | --- | --- |
| `total` | 评价总数 | 页面只能按当前列表数量显示，无法显示真实总评价数 |
| `percent` | 好评率 | 页面不显示好评率 |
| `comment` | 评价分类数组，元素建议含 `id/name/count` | 页面不显示评价分类筛选 |
| `list` | 评价列表 | 没有评价内容可渲染 |
| `list[].nickname` | 用户昵称 | 非匿名评价只能显示默认匿名用户 |
| `list[].avatar` | 用户头像 | 非匿名评价只能显示默认头像 |
| `list[].is_anonymous` | 匿名状态 | 无法正确隐藏头像和昵称 |
| `list[].score` 或 `list[].goods_comment` | 商品评分 | 星级只能按默认 5 分展示 |
| `list[].create_time` | 评价时间 | 页面显示“刚刚”兜底 |
| `list[].spec_value_str` | 下单规格 | 规格不展示 |
| `list[].comment` 或 `list[].content` | 评价正文 | 页面显示“用户未填写文字评价” |
| `list[].image` | 晒图数组 | 晒图不展示 |
| `list[].append_comment` | 追评正文 | 追评不展示 |
| `list[].append_time` | 追评时间 | 追评时间不展示 |
| `list[].append_image` | 追评晒图 | 追评图片不展示 |
| `list[].description_comment` | 描述相符评分 | 评分细项不展示 |
| `list[].service_comment` | 服务态度评分 | 评分细项不展示 |
| `list[].express_comment` | 配送服务评分 | 评分细项不展示 |
| `list[].reply` | 商家回复 | 商家回复不展示 |
| `list[].reply_time` | 商家回复时间 | 回复时间不展示 |
| `list[].like_count` | 点赞数 | 点赞数不展示 |

建议后端返回结构：

```json
{
  "total": 10,
  "percent": "98%",
  "comment": [{ "id": "GOOD", "name": "好评", "count": 8 }],
  "list": [{
    "id": 1,
    "nickname": "用户昵称",
    "avatar": "https://...",
    "is_anonymous": 0,
    "score": 5,
    "create_time": "2026-07-10 10:00:00",
    "spec_value_str": "红色 / XL",
    "comment": "评价内容",
    "image": ["https://..."],
    "append_comment": "",
    "append_time": "",
    "append_image": [],
    "description_comment": 5,
    "service_comment": 5,
    "express_comment": 5,
    "reply": "",
    "reply_time": "",
    "like_count": 0
  }]
}
```

## 商品详情

接口：`GET /miniapp/product/{spuId}`

使用页面：
- `bundle/pages/goods_details/goods_details`

前端当前需要字段：

| 字段 | 用途 | 缺少影响 |
| --- | --- | --- |
| `id` / `spuId` / `productId` | 商品 ID、跳转评价列表 | 评价列表跳转和下单参数可能缺失 |
| `name` / `spuName` / `productName` | 商品标题 | 商品主标题为空 |
| `subtitle` / `remark` | 商品副标题 | 商品说明不展示 |
| `image` / `mainImageUrl` / `goods_image` / `images` | 主图和轮播图 | 商品主图只能用占位图 |
| `price` / `minPrice` / `salePrice` | 售价 | 价格显示错误或为 0 |
| `marketPrice` / `originPrice` / `linePrice` | 划线价 | 原价不展示 |
| `salesCount` / `sales_sum` | 销量 | 销量/抢购人数不展示 |
| `stock` / `stockQty` | 库存 | 库存信息不准 |
| `skuList` / `goods_item` | SKU 列表 | 规格弹窗、下单 SKU 可能异常 |
| `shopInfo` / `shop` / `shop_id` / `shopName` | 店铺信息 | 店铺入口、店铺名、店铺头像不完整 |
| `couponList` / `couponInfo` | 商品优惠券 | 商品详情优惠券入口不展示 |
| `pointsInfo` / `integralInfo` | 商品积分权益 | 商品详情积分权益不展示 |
| `activity` / `activityList` | 秒杀、拼团等活动信息 | 活动价、倒计时、跟团记录不展示 |
| `content` / `description` / `detailImages` | 商品详情富文本/详情图 | 商品详情区域为空 |

评价数据说明：
- 商品详情页会优先读取详情接口里的 `commentSummary` 或 `comment`。
- 如果详情接口没有首条评价内容，前端现在会兜底调用 `GET /miniapp/product/{spuId}/comments?pageNo=1&pageSize=1` 获取首条评价。
- 如果希望减少一次接口请求，建议详情接口返回 `commentSummary`，字段至少包含评价列表清单里的首条评价字段和 `total/percent`。

## 订单预览/待付款积分抵扣

接口：`POST /miniapp/orders/preview`

使用页面：
- `bundle/pages/confirm_order/confirm_order`

前端当前需要字段：

| 字段 | 用途 | 缺少影响 |
| --- | --- | --- |
| `shopOrders` 或 `goods_lists` | 待付款商品分组和商品列表 | 商品列表展示不全 |
| `goodsAmount` / `goods_amount` / `total_goods_price` | 商品总价 | 价格汇总只能前端估算 |
| `freightAmount` / `shipping_price` | 运费 | 运费显示不准 |
| `payAmount` / `pay_amount` / `order_amount` / `actualAmount` | 后端最终应付金额 | 前端只能试算，容易出现优惠/积分重复扣减 |
| `availableCoupons` / `usableCoupon` | 可用优惠券 | 优惠券入口数量不准 |
| `unavailableCoupons` / `unusableCoupon` | 不可用优惠券 | 不可用原因列表不完整 |
| `receivableCoupons` / `claimableCoupons` | 可领取优惠券 | 可领取优惠券不展示 |
| `couponId` / `coupon_id` | 当前命中的优惠券 | 默认优惠券选中状态不准 |
| `availablePoints` / `user_integral` | 用户可用积分 | 当前积分显示错误，无法判断是否可抵扣 |
| `pointsAmount` / `points_amount` / `integral_num` | 本单预计使用积分 | “预计使用”显示为 0 |
| `pointsDeductAmount` / `points_deduct_amount` / `integral_amount` | 本单实际抵扣金额 | 无法展示“已抵扣”，提交支付时积分参数不准 |
| `maxDeductAmount` / `max_deduct_amount` / `maxUsableAmount` / `max_usable_amount` | 本单最多抵扣金额 | “最多抵扣”显示不准 |
| `integralSwitch` / `integral_switch` / `pointsEnabled` | 是否支持积分抵扣 | 积分开关状态不准 |
| `integralLimit` / `integral_limit` | 最低使用门槛 | 不满足抵扣条件的提示不准 |
| `submitToken` | 提交订单令牌 | 下单提交可能失败或重复提交风险增加 |

## 订单详情/自提核销

接口：`GET /miniapp/orders/{orderNo}`

使用页面：
- `bundle/pages/order_details/order_details`
- `business/pages/business_pages/merchant_verify`

前端当前需要字段：

| 字段 | 用途 | 缺少影响 |
| --- | --- | --- |
| `orderNo` / `order_no` / `id` | 订单标识 | 详情操作、确认收货、售后跳转异常 |
| `orderStatus` / `order_status` / `order_status_desc` | 订单状态 | 状态展示和按钮判断错误 |
| `payStatus` / `pay_status` | 支付状态 | 待支付/已支付判断不准 |
| `deliveryType` / `delivery_type` | 快递/自提判断 | 自提二维码或物流入口展示错误 |
| `verifyInfo.pickupCode` / `verifyInfo.verifyCode` / `pickup_code` | 真实自提核销码 | 自提二维码不展示；不能用订单号代替 |
| `verification_status` | 是否已核销 | 核销状态展示不准 |
| `selffetchShop` / `pickupShop` | 自提门店信息 | 自提地址、门店电话、营业时间缺失 |
| `order_goods` / `goods_lists` | 订单商品 | 商品列表不展示 |
| `expressName` / `trackingNo` / `shipping_time` | 物流信息 | 物流详情展示不完整 |
| `receiver` / `consignee` / `mobile` / `delivery_address` | 收货信息 | 收货地址和联系人不展示 |
| `refund_info` / `afterSale` | 售后状态 | 售后入口和状态判断不准 |

## 物流详情

接口：`GET /miniapp/orders/{orderNo}`

使用页面：
- `bundle_order/pages/goods_logistics/goods_logistics`

前端当前需要字段：

| 字段 | 用途 | 缺少影响 |
| --- | --- | --- |
| `expressName` / `express_name` / `shippingName` | 物流公司 | 公司名不展示或无法映射 |
| `trackingNo` / `tracking_no` / `invoice_no` / `expressNo` | 物流单号 | 单号不展示 |
| `traces` / `logisticsTraces` / `expressTraces` | 物流轨迹数组 | 页面只能展示“暂无轨迹” |
| `receiver` / `delivery_address` | 收货信息 | 地址区不完整 |
| `shipping_time` | 发货时间 | 发货节点不展示 |

## 售后列表/售后删除

接口：
- `GET /miniapp/after-sales`
- `DELETE /miniapp/after-sales/{afterSaleId}`

使用页面：
- `bundle_order/pages/post_sale/post_sale`

前端当前需要字段：

| 字段 | 用途 | 缺少影响 |
| --- | --- | --- |
| `list` / `records` / `items` | 售后列表 | 列表为空 |
| `afterSaleId` / `after_sale_id` / `refundNo` | 删除记录和详情跳转 | 删除后无法精确移除该记录 |
| `status` / `statusText` / `refundStatusText` | 分类和状态展示 | 已处理/处理中分类错误 |
| `goods` / `orderItem` | 商品信息 | 售后商品卡片不完整 |
| DELETE 返回成功状态 | 删除后刷新/本地移除 | 删除成功但页面仍展示旧记录 |

## 推广码/扫一扫吸粉

接口：
- `GET /miniapp/alliance/card`
- `POST /miniapp/promotion/invite-bind`

使用页面：
- `business/pages/business_pages/intro_card`
- `pages/index/index`

前端当前需要字段：

| 字段 | 用途 | 缺少影响 |
| --- | --- | --- |
| `inviteCode` / `invite_code` / `promotionCode` | 推广码二维码内容 | 首页扫码无法绑定推广关系 |
| `ownerUserId` / `promoterUserId` | 推广人用户 ID | 没有邀请码时无法绑定 |
| `qrCode` / `qr_code` / `qrcode` | 后端生成二维码图片 | 推广码页面无法展示二维码图片 |
| `scene` | 区分推广码和商家码 | 首页扫一扫无法准确分流 |

## 店铺详情/商家二维码

接口：
- `GET /miniapp/shop/{shopId}`
- `POST /miniapp/share/qrcode`

使用页面：
- `business/pages/business_pages/store_detail`
- 首页扫一扫入口

前端当前需要字段：

| 字段 | 用途 | 缺少影响 |
| --- | --- | --- |
| `shopId` / `shop_id` / `merchantShopId` | 店铺 ID | 首页扫码不能进入店铺详情 |
| `shopName` / `shop_name` / `name` | 店铺名称 | 店铺详情标题为空 |
| `shopLogo` / `logo` | 店铺头像 | 店铺头像为空 |
| `address` / `detailAddress` | 店铺地址 | 地址不展示 |
| `mobile` / `phone` | 联系电话 | 联系/线下核销入口信息不完整 |
| 二维码 path/scene 只包含 `shopId` | 首页扫码解析 | 参数过多或缺 shopId 会导致扫码跳转失败 |

